-- A founder can approve a complete saved draft without waiting for an agent handoff.
begin;
create or replace function public.mira_review(p_article text,p_revision integer,p_action text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare a public.articles; r public.mira_submissions; next_status text;
begin
 if auth.uid() is null or public.is_security_admin() is not true then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into a from public.articles where id=p_article for update;
 if not found then raise exception 'Article not found'; end if;
 select * into r from public.mira_submissions where article_id=p_article for update;
 if not found then raise exception 'Submission unavailable'; end if;
 if a.studio_revision is distinct from p_revision then raise exception 'Article revision conflict' using errcode='40001'; end if;
 if p_action='approve' and r.review_status='approved' and r.approved_revision=p_revision then
   return jsonb_build_object('submissionId',r.submission_id,'status','approved','revision',p_revision,'replayed',true);
 end if;
 if (r.review_status <> 'pending_review' and not (r.review_status='collecting_assets' and p_action='approve')) or coalesce(a.studio->>'status','') <> 'Draft' or p_action not in ('approve','request_revision','reject') then raise exception 'Review action unavailable' using errcode='42501'; end if;
 if p_action='approve' and not public.mira_publication_complete(a,r) then raise exception 'Required bilingual content or verified cover is incomplete'; end if;
 if r.review_status='collecting_assets' then
   insert into public.mira_audit(submission_id,action,actor,revision) values(r.submission_id,'submitted_for_review',auth.uid()::text,p_revision);
 end if;
 next_status:=case p_action when 'approve' then 'approved' when 'request_revision' then 'revision_requested' else 'rejected' end;
 update public.mira_submissions set review_status=next_status,approved_revision=case when p_action='approve' then p_revision else null end where submission_id=r.submission_id;
 insert into public.mira_audit(submission_id,action,actor,revision) values(r.submission_id,p_action,auth.uid()::text,p_revision);
 return jsonb_build_object('submissionId',r.submission_id,'status',next_status,'revision',p_revision,'replayed',false);
end $$;
revoke all on function public.mira_review(text,integer,text) from public,anon,service_role;
grant execute on function public.mira_review(text,integer,text) to authenticated;
commit;
