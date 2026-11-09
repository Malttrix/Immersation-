-- Production additive migration. Apply only after separate approval.
-- Order: database guard first (legacy finalization fails closed), then API release.
begin;
create or replace function public.mira_finalize(p_id text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  raise exception 'Expected revision is required' using errcode='22023';
end $$;
revoke all on function public.mira_finalize(text) from public,anon,authenticated;
grant execute on function public.mira_finalize(text) to service_role;

create function public.mira_finalize_at_revision(p_id text,p_expected_revision integer) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare sub public.mira_submissions; a public.articles;
begin
 if p_expected_revision is null or p_expected_revision < 1 then raise exception 'Expected revision is required' using errcode='22023'; end if;
 select * into sub from mira_submissions where submission_id=p_id;
 if not found then raise exception 'Submission not found'; end if;
 -- Same lock ordering as media, article editing and founder review.
 select * into a from articles where id=sub.article_id for update;
 if not found then raise exception 'Article not found'; end if;
 select * into sub from mira_submissions where submission_id=p_id for update;
 if not found or sub.article_id <> a.id then raise exception 'Submission changed' using errcode='40001'; end if;
 if a.studio_revision is distinct from p_expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
 if coalesce(a.studio->>'status','') <> 'Draft' then raise exception 'Article is not a draft' using errcode='42501'; end if;
 if sub.review_status not in ('collecting_assets','pending_review') then raise exception 'Submission is locked' using errcode='42501'; end if;
 if not (coalesce(a.studio->'miraMedia','{}'::jsonb) ?& array['cover','pinterest1','pinterest2']) then raise exception 'Required assets are incomplete'; end if;
 if exists(select 1 from mira_media_uploads where submission_id=p_id and state in ('reserved','uncertain')) then raise exception 'Uploads need reconciliation'; end if;
 if sub.review_status='pending_review' then return jsonb_build_object('status','pending_review','revision',a.studio_revision); end if;
 update mira_submissions set review_status='pending_review' where submission_id=p_id;
 insert into mira_audit(submission_id,action,actor,revision) values(p_id,'submitted_for_review','mira',a.studio_revision);
 return jsonb_build_object('status','pending_review','revision',a.studio_revision);
end $$;
revoke all on function public.mira_finalize_at_revision(text,integer) from public,anon,authenticated;
grant execute on function public.mira_finalize_at_revision(text,integer) to service_role;
commit;
