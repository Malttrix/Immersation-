-- Requires manual independent evidence and a successful server-side provider check.
begin;
create table public.mira_media_absence_decisions (
 id bigint generated always as identity primary key,
 request_key text not null references public.mira_media_uploads(request_key),
 actor uuid not null,
 evidence text not null check (length(evidence) between 40 and 2000),
 created_at timestamptz not null default now()
);
alter table public.mira_media_absence_decisions enable row level security;
revoke all on public.mira_media_absence_decisions from public,anon,authenticated;
create or replace function public.mira_media_complete(p_key text,p_result jsonb) returns jsonb
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
 if u.state not in ('reserved','uncertain') then raise exception 'Upload no longer active'; end if;
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

create function public.mira_media_mark_absent(p_key text,p_actor uuid,p_evidence text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u public.mira_media_uploads; sub public.mira_submissions; a public.articles;
begin
 if not exists(select 1 from security_admins where user_id=p_actor) then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_evidence is null or length(trim(p_evidence))<40 or length(p_evidence)>2000 then raise exception 'Detailed evidence required'; end if;
 select * into u from mira_media_uploads where request_key=p_key;
 if not found then raise exception 'Upload not found'; end if;
 select * into sub from mira_submissions where submission_id=u.submission_id;
 select * into a from articles where id=sub.article_id for update;
 select * into sub from mira_submissions where submission_id=u.submission_id for update;
 select * into u from mira_media_uploads where request_key=p_key for update;
 if u.state='failed' then return jsonb_build_object('state','failed'); end if;
 if u.state not in ('reserved','uncertain') then raise exception 'Upload cannot be marked absent'; end if;
 if u.created_at > now()-interval '10 minutes' then raise exception 'Upload cooling-off period not elapsed'; end if;
 if sub.review_status='published' then raise exception 'Submission is locked'; end if;
 insert into mira_media_absence_decisions(request_key,actor,evidence) values(p_key,p_actor,trim(p_evidence));
 update mira_media_uploads set state='failed' where request_key=p_key;
 insert into mira_audit(submission_id,action,actor,revision) values(u.submission_id,'media_absence_confirmed',p_actor::text,a.studio_revision);
 return jsonb_build_object('state','failed');
end $$;
revoke all on function public.mira_media_mark_absent(text,uuid,text) from public,anon,authenticated;
grant execute on function public.mira_media_mark_absent(text,uuid,text) to service_role;
create function public.mira_media_status(p_id text,p_role text,p_key text) returns jsonb
language sql stable security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('state',state,'operationId',operation_id) from mira_media_uploads where submission_id=p_id and role=p_role and request_key=p_key
$$;
revoke all on function public.mira_media_status(text,text,text) from public,anon,authenticated;
grant execute on function public.mira_media_status(text,text,text) to service_role;
commit;
