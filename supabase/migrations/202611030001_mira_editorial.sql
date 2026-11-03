-- Proposed only: review, test and apply to isolated staging before any production use.
begin;
create table public.mira_submissions (
  submission_id text primary key,
  article_id text not null unique references public.articles(id) on delete restrict,
  review_status text not null default 'collecting_assets' check (review_status in ('collecting_assets','pending_review','revision_requested','rejected','approved','published')),
  approved_revision integer,
  editorial jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table public.mira_requests (
  idempotency_key text primary key,
  submission_id text not null references public.mira_submissions(submission_id),
  fingerprint text not null,
  created_at timestamptz not null default now()
);
create table public.mira_audit (
  id bigint generated always as identity primary key,
  submission_id text not null references public.mira_submissions(submission_id),
  action text not null,
  actor text not null,
  revision integer not null,
  created_at timestamptz not null default now()
);
alter table public.mira_submissions enable row level security;
alter table public.mira_requests enable row level security;
alter table public.mira_audit enable row level security;
revoke all on public.mira_submissions, public.mira_requests, public.mira_audit from public, anon, authenticated;

-- Every update, including direct table updates, is checked. The review row is
-- private and cannot be changed by an authenticated caller. Lock ordering is
-- article then review throughout the workflow.
create function public.mira_guard_article() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare review public.mira_submissions; before_content jsonb; after_content jsonb; next_status text;
begin
 select * into review from mira_submissions where article_id=old.id for update;
 if not found then return new; end if;
 next_status:=new.studio->>'status';
 if next_status is null or next_status not in ('Draft','Published','Scheduled') then raise exception 'Invalid MIRA article status'; end if;
 if next_status in ('Published','Scheduled') then
   if next_status='Scheduled' then raise exception 'MIRA articles cannot be scheduled'; end if;
   before_content:=to_jsonb(old)-'studio_revision'-'studio';
   after_content:=to_jsonb(new)-'studio_revision'-'studio';
   if review.review_status <> 'approved' or review.approved_revision is distinct from old.studio_revision
      or before_content is distinct from after_content
      or (old.studio - 'status') is distinct from (new.studio - 'status') then
     raise exception 'An exact approved revision is required' using errcode='42501';
   end if;
   update mira_submissions set review_status='published' where submission_id=review.submission_id;
   insert into mira_audit(submission_id,action,actor,revision) values(review.submission_id,'published',coalesce(auth.uid()::text,'server'),old.studio_revision);
 else
   if review.review_status='published' then raise exception 'Published MIRA articles require a separate revision workflow'; end if;
   update mira_submissions set review_status=case when review.review_status='collecting_assets' then 'collecting_assets' else 'pending_review' end, approved_revision=null where submission_id=review.submission_id;
   insert into mira_audit(submission_id,action,actor,revision) values(review.submission_id,'edited',coalesce(auth.uid()::text,'server'),new.studio_revision);
 end if;
 return new;
end $$;
create trigger mira_article_review_guard before update on public.articles for each row execute function public.mira_guard_article();

-- Only the backend service role can invoke this function; it cannot select a
-- publication state or a different article. Retries are serialized by key.
create function public.mira_submit(p_id text,p_key text,p_fingerprint text,p_package jsonb) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare existing public.mira_submissions; prior public.mira_requests; a public.articles; aid text:='mira-'||p_id; s jsonb;
begin
 if p_id !~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$' or p_key !~ '^[A-Za-z0-9_-]{16,128}$' or p_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'Invalid request'; end if;
 if p_package->>'submissionId' is distinct from p_id then raise exception 'Invalid submission'; end if;
 perform pg_advisory_xact_lock(hashtext('mira-key:'||p_key));
 select * into prior from mira_requests where idempotency_key=p_key;
 if found then
   if prior.submission_id<>p_id or prior.fingerprint<>p_fingerprint then raise exception 'Idempotency conflict' using errcode='23505'; end if;
   return jsonb_build_object('submissionId',p_id,'replayed',true);
 end if;
 perform pg_advisory_xact_lock(hashtext('mira-id:'||p_id));
 select * into existing from mira_submissions where submission_id=p_id;
 if found then
   select * into a from articles where id=existing.article_id for update;
   select * into existing from mira_submissions where submission_id=p_id for update;
   if existing.review_status in ('approved','published','rejected') then raise exception 'Submission is locked for review' using errcode='42501'; end if;
   if coalesce(a.studio->>'status','Draft') <> 'Draft' then raise exception 'Article is not a draft'; end if;
   perform pg_advisory_xact_lock(hashtext('studio-slug:'||(p_package->>'slug')));
   if exists(select 1 from articles x where x.id<>a.id and coalesce(nullif(x.studio->>'slug',''),nullif(to_jsonb(x)->>'slug',''),x.id)=p_package->>'slug') then raise exception 'Slug already exists' using errcode='23505'; end if;
   update articles set title=p_package->'title', excerpt=p_package->'excerpt',content=p_package->'content',category=p_package->'category',pillar=p_package->>'pillar',
     studio=(studio || jsonb_build_object('slug',p_package->>'slug','status','Draft','tags',coalesce(p_package->'tags','[]'::jsonb),'seo',coalesce(p_package->'seo','{}'::jsonb),'coverAlt',coalesce(p_package->'alt'->'cover','{}'::jsonb))),
     studio_revision=studio_revision+1 where id=a.id;
   update mira_submissions set editorial=p_package - 'title' - 'excerpt' - 'content' where submission_id=p_id;
 else
   perform pg_advisory_xact_lock(hashtext('studio-slug:'||(p_package->>'slug')));
   if exists(select 1 from articles x where coalesce(nullif(x.studio->>'slug',''),nullif(to_jsonb(x)->>'slug',''),x.id)=p_package->>'slug') then raise exception 'Slug already exists' using errcode='23505'; end if;
   s:=jsonb_build_object('version',2,'slug',p_package->>'slug','status','Draft','miraSubmissionId',p_id,'tags',coalesce(p_package->'tags','[]'::jsonb),'seo',coalesce(p_package->'seo','{}'::jsonb),'coverAlt',coalesce(p_package->'alt'->'cover','{}'::jsonb));
   insert into articles(id,title,excerpt,content,category,pillar,studio,studio_revision)
   values(aid,p_package->'title',p_package->'excerpt',p_package->'content',p_package->'category',p_package->>'pillar',s,1);
   insert into mira_submissions(submission_id,article_id,editorial) values(p_id,aid,p_package - 'title' - 'excerpt' - 'content');
   insert into mira_audit(submission_id,action,actor,revision) values(p_id,'submitted','mira',1);
 end if;
 insert into mira_requests(idempotency_key,submission_id,fingerprint) values(p_key,p_id,p_fingerprint);
 return jsonb_build_object('submissionId',p_id,'replayed',false);
end $$;
revoke all on function public.mira_submit(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.mira_submit(text,text,text,jsonb) to service_role;

create function public.mira_review(p_article text,p_revision integer,p_action text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare a public.articles; r public.mira_submissions;
begin
 if not public.is_security_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into a from articles where id=p_article for update;
 if not found then raise exception 'Article not found'; end if;
 select * into r from mira_submissions where article_id=p_article for update;
 if not found or r.review_status='published' then raise exception 'Submission unavailable'; end if;
 if a.studio_revision is distinct from p_revision then raise exception 'Article revision conflict' using errcode='40001'; end if;
 if r.review_status='collecting_assets' then raise exception 'Required assets are incomplete'; end if;
 if coalesce(a.studio->>'status','Draft') <> 'Draft' or p_action not in ('approve','request_revision','reject') then raise exception 'Invalid review action'; end if;
 update mira_submissions set review_status=case p_action when 'approve' then 'approved' when 'request_revision' then 'revision_requested' else 'rejected' end,
 approved_revision=case when p_action='approve' then p_revision else null end where submission_id=r.submission_id;
 insert into mira_audit(submission_id,action,actor,revision) values(r.submission_id,p_action,auth.uid()::text,p_revision);
 return jsonb_build_object('submissionId',r.submission_id,'status',case p_action when 'approve' then 'approved' when 'request_revision' then 'revision_requested' else 'rejected' end,'revision',p_revision);
end $$;
revoke all on function public.mira_review(text,integer,text) from public,anon;
grant execute on function public.mira_review(text,integer,text) to authenticated;

create function public.mira_review_details(p_article text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.mira_submissions;
begin
 if not public.is_security_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into r from mira_submissions where article_id=p_article;
 if not found then raise exception 'Submission unavailable'; end if;
 return jsonb_build_object('editorial',r.editorial,'status',r.review_status,'approvedRevision',r.approved_revision);
end $$;
revoke all on function public.mira_review_details(text) from public,anon;
grant execute on function public.mira_review_details(text) to authenticated;

create function public.mira_update_editorial(p_article text,p_revision integer,p_patch jsonb) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare a public.articles; r public.mira_submissions;
begin
 if not public.is_security_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if jsonb_typeof(p_patch) <> 'object' or octet_length(p_patch::text)>30000 or exists(select 1 from jsonb_object_keys(p_patch) k where k not in ('editorialNotes','references','qa','alt')) then raise exception 'Invalid editorial metadata'; end if;
 if (p_patch ? 'editorialNotes' and jsonb_typeof(p_patch->'editorialNotes')<>'string') or (p_patch ? 'references' and jsonb_typeof(p_patch->'references')<>'array') or (p_patch ? 'qa' and jsonb_typeof(p_patch->'qa')<>'object') or (p_patch ? 'alt' and jsonb_typeof(p_patch->'alt')<>'object') then raise exception 'Invalid editorial metadata'; end if;
 select * into a from articles where id=p_article for update;
 if not found or a.studio_revision is distinct from p_revision then raise exception 'Article revision conflict' using errcode='40001'; end if;
 select * into r from mira_submissions where article_id=p_article for update;
 if not found or r.review_status='published' then raise exception 'Submission unavailable'; end if;
 update articles set studio=case when p_patch ? 'alt' then jsonb_set(studio,'{coverAlt}',coalesce(p_patch->'alt'->'cover','{}'::jsonb),true) else studio end,studio_revision=studio_revision+1 where id=p_article returning * into a;
 update mira_submissions set editorial=editorial||p_patch where submission_id=r.submission_id;
 insert into mira_audit(submission_id,action,actor,revision) values(r.submission_id,'editorial_updated',auth.uid()::text,a.studio_revision);
 return to_jsonb(a);
end $$;
revoke all on function public.mira_update_editorial(text,integer,jsonb) from public,anon;
grant execute on function public.mira_update_editorial(text,integer,jsonb) to authenticated;

create function public.mira_publish(p_article text,p_revision integer) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare a public.articles;
begin
 if not public.is_security_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into a from articles where id=p_article for update;
 if not found or a.studio_revision is distinct from p_revision then raise exception 'Article revision conflict' using errcode='40001'; end if;
 update articles set studio=jsonb_set(studio,'{status}','"Published"'::jsonb),studio_revision=studio_revision+1 where id=p_article returning * into a;
 return to_jsonb(a);
end $$;
revoke all on function public.mira_publish(text,integer) from public,anon;
grant execute on function public.mira_publish(text,integer) to authenticated;

create function public.mira_status(p_id text) returns jsonb language sql security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('submissionId',s.submission_id,'status',s.review_status,'revision',a.studio_revision)
 from mira_submissions s join articles a on a.id=s.article_id where s.submission_id=p_id
$$;
revoke all on function public.mira_status(text) from public,anon,authenticated;
grant execute on function public.mira_status(text) to service_role;
create table public.mira_rate_limits (bucket text primary key, hits integer not null, expires_at timestamptz not null);
alter table public.mira_rate_limits enable row level security;
revoke all on public.mira_rate_limits from public,anon,authenticated;
create function public.mira_rate_limit(p_bucket text) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;
begin
 insert into mira_rate_limits(bucket,hits,expires_at) values(p_bucket,1,now()+interval '1 minute')
 on conflict(bucket) do update set hits=case when mira_rate_limits.expires_at<=now() then 1 else mira_rate_limits.hits+1 end,
 expires_at=case when mira_rate_limits.expires_at<=now() then now()+interval '1 minute' else mira_rate_limits.expires_at end returning hits into n;
 return n<=30;
end $$;
revoke all on function public.mira_rate_limit(text) from public,anon,authenticated;
grant execute on function public.mira_rate_limit(text) to service_role;
commit;
