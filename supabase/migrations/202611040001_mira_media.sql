-- Proposed staging migration. Never apply to production without separate review.
begin;
create table public.mira_media_uploads (
  request_key text primary key,
  submission_id text not null references public.mira_submissions(submission_id),
  role text not null check (role ~ '^(cover|background|pinterest[12]|instagram[1-9])$'),
  operation_id text not null unique,
  original_filename text not null default '',
  original_sha256 text not null,
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  state text not null check (state in ('reserved','uncertain','failed','completed')),
  result jsonb,
  created_at timestamptz not null default now()
);
create unique index mira_one_inflight_role on public.mira_media_uploads(submission_id,role) where state in ('reserved','uncertain');
alter table public.mira_media_uploads enable row level security;
revoke all on public.mira_media_uploads from public,anon,authenticated;

create function public.mira_media_start(p_id text,p_key text,p_role text,p_hash text,p_filename text default '',p_original_hash text default null) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare sub public.mira_submissions; prior public.mira_media_uploads; a public.articles;
begin
 if p_key !~ '^[A-Za-z0-9_-]{16,128}$' or p_role !~ '^(cover|background|pinterest[12]|instagram[1-9])$' or p_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid media request'; end if;
 perform pg_advisory_xact_lock(hashtext('mira-media-key:'||p_key));
 select * into prior from mira_media_uploads where request_key=p_key;
 if found then
   if prior.submission_id<>p_id or prior.role<>p_role or prior.sha256<>p_hash then raise exception 'Idempotency conflict' using errcode='23505'; end if;
   return jsonb_build_object('state',prior.state,'result',prior.result);
 end if;
 select * into sub from mira_submissions where submission_id=p_id;
 if not found then raise exception 'Submission not found'; end if;
 select * into a from articles where id=sub.article_id for update;
 select * into sub from mira_submissions where submission_id=p_id for update;
 if sub.review_status in ('approved','published','rejected') then raise exception 'Submission is locked' using errcode='42501'; end if;
 update mira_submissions set review_status='collecting_assets',approved_revision=null where submission_id=p_id;
 insert into mira_media_uploads(request_key,submission_id,role,sha256,state,operation_id,original_filename,original_sha256) values(p_key,p_id,p_role,p_hash,'reserved',md5(p_key),left(p_filename,200),coalesce(p_original_hash,p_hash));
 insert into mira_audit(submission_id,action,actor,revision) values(p_id,'media_reserved','mira',a.studio_revision);
 return jsonb_build_object('state','new');
end $$;
revoke all on function public.mira_media_start(text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.mira_media_start(text,text,text,text,text,text) to service_role;

create function public.mira_media_complete(p_key text,p_result jsonb) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u public.mira_media_uploads; sub public.mira_submissions; a public.articles; media jsonb; updated_studio jsonb;
begin
 select * into u from mira_media_uploads where request_key=p_key;
 if not found then raise exception 'Upload not found'; end if;
 select * into sub from mira_submissions where submission_id=u.submission_id;
 select * into a from articles where id=sub.article_id for update;
 select * into sub from mira_submissions where submission_id=u.submission_id for update;
 select * into u from mira_media_uploads where request_key=p_key for update;
 if u.state='completed' then return u.result; end if;
 if sub.review_status='published' or coalesce(a.studio->>'status','Draft')<>'Draft' then raise exception 'Submission is locked'; end if;
 if jsonb_typeof(p_result) <> 'object' or (p_result->>'id') !~ '^[0-9]+$' or (p_result->>'url') !~ '^https://' then raise exception 'Invalid media result'; end if;
 media:=coalesce(a.studio->'miraMedia','{}'::jsonb) || jsonb_build_object(u.role,p_result || jsonb_build_object('sha256',u.sha256));
 updated_studio:=jsonb_set(a.studio,'{miraMedia}',media,true);
 if u.role='pinterest1' then updated_studio:=jsonb_set(updated_studio,'{pinterestImageUrl}',to_jsonb(p_result->>'url'),true); end if;
 if u.role='background' then updated_studio:=jsonb_set(updated_studio,'{editorial}',coalesce(updated_studio->'editorial','{}'::jsonb)||jsonb_build_object('backgroundImage',p_result->>'url'),true); end if;
 update articles set cover=case when u.role='cover' then p_result->>'url' else cover end,
 studio=updated_studio, studio_revision=studio_revision+1 where id=a.id;
 update mira_media_uploads set state='completed',result=p_result where request_key=p_key;
 insert into mira_audit(submission_id,action,actor,revision) values(u.submission_id,'media_attached','mira',a.studio_revision+1);
 return p_result;
end $$;
revoke all on function public.mira_media_complete(text,jsonb) from public,anon,authenticated;
grant execute on function public.mira_media_complete(text,jsonb) to service_role;
create function public.mira_media_operations(p_article text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.is_security_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('requestKey',u.request_key,'operationId',u.operation_id,'role',u.role,'filename',u.original_filename,'state',u.state,'createdAt',u.created_at)) from mira_media_uploads u join mira_submissions s on s.submission_id=u.submission_id where s.article_id=p_article and u.state in ('reserved','uncertain')), '[]'::jsonb);
end $$;
revoke all on function public.mira_media_operations(text) from public,anon;
grant execute on function public.mira_media_operations(text) to authenticated;

-- Service-only transition after a provider failure; no automatic retry.
create function public.mira_media_uncertain(p_key text) returns void language sql security definer set search_path=public,pg_temp as $$
 update mira_media_uploads set state='uncertain' where request_key=p_key and state='reserved'
$$;
revoke all on function public.mira_media_uncertain(text) from public,anon,authenticated;
grant execute on function public.mira_media_uncertain(text) to service_role;

-- Only the server calls this after authenticating an administrator and verifying
-- the operation-specific filename and full SHA-256 of the remote media bytes.
create function public.mira_media_reconcile(p_key text,p_result jsonb,p_actor uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u public.mira_media_uploads; sub public.mira_submissions; result jsonb; rev integer;
begin
 if not exists(select 1 from security_admins where user_id=p_actor) then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into u from mira_media_uploads where request_key=p_key;
 if not found then raise exception 'Upload not found'; end if;
 select * into sub from mira_submissions where submission_id=u.submission_id;
 perform 1 from articles where id=sub.article_id for update;
 perform 1 from mira_submissions where submission_id=u.submission_id for update;
 select * into u from mira_media_uploads where request_key=p_key for update;
 if u.state='completed' then
   if u.result is distinct from p_result then raise exception 'Candidate mismatch'; end if;
   return u.result;
 end if;
 if u.state not in ('reserved','uncertain') then raise exception 'Upload cannot be reconciled'; end if;
 result:=mira_media_complete(p_key,p_result);
 select a.studio_revision into rev from articles a join mira_submissions s on s.article_id=a.id where s.submission_id=u.submission_id;
 insert into mira_audit(submission_id,action,actor,revision) values(u.submission_id,'media_reconciled',p_actor::text,rev);
 return result;
end $$;
revoke all on function public.mira_media_reconcile(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.mira_media_reconcile(text,jsonb,uuid) to service_role;

create function public.mira_finalize(p_id text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare sub public.mira_submissions; a public.articles;
begin
 select * into sub from mira_submissions where submission_id=p_id;
 if not found then raise exception 'Submission not found'; end if;
 select * into a from articles where id=sub.article_id for update;
 select * into sub from mira_submissions where submission_id=p_id for update;
 if sub.review_status='pending_review' then return jsonb_build_object('status','pending_review','revision',a.studio_revision); end if;
 if sub.review_status<>'collecting_assets' then raise exception 'Submission is locked'; end if;
 if not (coalesce(a.studio->'miraMedia','{}'::jsonb) ?& array['cover','pinterest1','pinterest2']) then raise exception 'Required assets are incomplete'; end if;
 if exists(select 1 from mira_media_uploads where submission_id=p_id and state in ('reserved','uncertain')) then raise exception 'Uploads need reconciliation'; end if;
 update mira_submissions set review_status='pending_review' where submission_id=p_id;
 insert into mira_audit(submission_id,action,actor,revision) values(p_id,'submitted_for_review','mira',a.studio_revision);
 return jsonb_build_object('status','pending_review','revision',a.studio_revision);
end $$;
revoke all on function public.mira_finalize(text) from public,anon,authenticated;
grant execute on function public.mira_finalize(text) to service_role;
commit;
