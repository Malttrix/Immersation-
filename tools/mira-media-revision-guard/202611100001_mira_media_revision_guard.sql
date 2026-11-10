begin;
-- Store revision only on new guarded operations; legacy reservations remain compatible.
alter table public.mira_media_uploads add column expected_article_revision integer;
create function public.mira_media_start_at_revision(p_id text,p_key text,p_role text,p_hash text,p_filename text,p_original_hash text,p_expected_revision integer) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare sub public.mira_submissions; a public.articles; result jsonb; stored_revision integer;
begin
 if p_expected_revision is null or p_expected_revision < 1 then raise exception 'Expected revision is required' using errcode='22023'; end if;
 -- Keep the original reservation's lock order, including the per-key lock.
 perform pg_advisory_xact_lock(hashtext('mira-media-key:'||p_key));
 select * into sub from public.mira_submissions where submission_id=p_id;
 if not found then raise exception 'Submission not found' using errcode='42501'; end if;
 select * into a from public.articles where id=sub.article_id for update;
 if not found then raise exception 'Article not found' using errcode='42501'; end if;
 select * into sub from public.mira_submissions where submission_id=p_id for update;
 if not found or sub.article_id<>a.id then raise exception 'Submission changed' using errcode='40001'; end if;
 if a.studio_revision is distinct from p_expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
 if coalesce(a.studio->>'status','')<>'Draft' or sub.review_status<>'collecting_assets' then raise exception 'Submission is locked' using errcode='42501'; end if;
 result:=public.mira_media_start(p_id,p_key,p_role,p_hash,p_filename,p_original_hash);
 if result->>'state'='new' then
   update public.mira_media_uploads set expected_article_revision=p_expected_revision where request_key=p_key;
 else
   select expected_article_revision into stored_revision from public.mira_media_uploads where request_key=p_key;
   if stored_revision is distinct from p_expected_revision then raise exception 'Operation revision mismatch' using errcode='23505'; end if;
 end if;
 return result;
end $$;
revoke all on function public.mira_media_start_at_revision(text,text,text,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.mira_media_start_at_revision(text,text,text,text,text,text,integer) to service_role;
create function public.mira_media_complete_at_revision(p_id text,p_key text,p_role text,p_expected_revision integer,p_result jsonb) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u public.mira_media_uploads; sub public.mira_submissions; a public.articles;
begin
 select * into u from public.mira_media_uploads where request_key=p_key;
 if not found or u.submission_id<>p_id or u.role<>p_role or u.expected_article_revision is distinct from p_expected_revision then raise exception 'Operation identity mismatch' using errcode='42501'; end if;
 select * into sub from public.mira_submissions where submission_id=p_id;
 if not found then raise exception 'Submission not found'; end if;
 select * into a from public.articles where id=sub.article_id for update;
 if not found then raise exception 'Article not found'; end if;
 select * into sub from public.mira_submissions where submission_id=p_id for update;
 select * into u from public.mira_media_uploads where request_key=p_key for update;
 if not found or u.submission_id<>p_id or u.role<>p_role or u.expected_article_revision is distinct from p_expected_revision or sub.article_id<>a.id then raise exception 'Operation identity mismatch' using errcode='40001'; end if;
 if u.state='completed' then return u.result; end if;
 if u.state not in ('reserved','uncertain') then raise exception 'Upload no longer active'; end if;
 if jsonb_typeof(p_result)<>'object' or (p_result->>'id') !~ '^[0-9]+$' or (p_result->>'url') !~ '^https://' then raise exception 'Invalid media result'; end if;
 if a.studio_revision is distinct from p_expected_revision or coalesce(a.studio->>'status','')<>'Draft' or sub.review_status<>'collecting_assets' then
   update public.mira_media_uploads set state='uncertain', result=p_result where request_key=p_key;
   insert into public.mira_audit(submission_id,action,actor,revision) values(p_id,'media_stale_after_upload','mira',a.studio_revision);
   return jsonb_build_object('reconciliation_required',true);
 end if;
 return public.mira_media_complete(p_key,p_result);
end $$;
revoke all on function public.mira_media_complete_at_revision(text,text,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.mira_media_complete_at_revision(text,text,text,integer,jsonb) to service_role;
create function public.mira_media_guard_status(p_id text) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('submissionId',s.submission_id,'articleId',a.id,'articleStatus',a.studio->>'status','revision',a.studio_revision,'reviewStatus',s.review_status,'blockingCoverOperations',(select count(*) from public.mira_media_uploads u where u.submission_id=s.submission_id and u.role='cover' and u.state in ('reserved','uncertain','completed')))
 from public.mira_submissions s join public.articles a on a.id=s.article_id where s.submission_id=p_id
$$;
revoke all on function public.mira_media_guard_status(text) from public,anon,authenticated;
grant execute on function public.mira_media_guard_status(text) to service_role;
commit;
