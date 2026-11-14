-- Keep MIRA review and audit records while removing articles from public view.
begin;
create or replace function public.studio_article_visible(a jsonb) returns boolean language plpgsql stable as $$
declare state text := coalesce(a->'studio'->>'status',a->>'status',case when a->>'published'='false' then 'Draft' else 'Published' end); due text;
begin
 if nullif(a->'studio'->>'archivedAt','') is not null then return false; end if;
 if lower(state)='published' then return true; end if;
 if lower(state)<>'scheduled' then return false; end if;
 due := coalesce(a->'studio'->>'scheduledDate',a->>'scheduledDate');
 if due is null or due='' then return false; end if;
 return (case when due ~ '(Z|[+-][0-9]{2}:[0-9]{2})$' then due::timestamptz else due::timestamp at time zone 'Asia/Singapore' end)<=now();
exception when others then return false;
end $$;

create function public.studio_archive_article(p_article text,p_expected_revision integer) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare a public.articles; submission text; old_review_status text; old_approved_revision integer;
begin
 if auth.uid() is null or public.is_security_admin() is not true then raise exception 'Administrator access required' using errcode='42501'; end if;
 if p_article is null or p_expected_revision is null or p_expected_revision<0 then raise exception 'Article and revision required'; end if;
 select * into a from public.articles where id=p_article for update;
 if not found then raise exception 'Article not found'; end if;
 if a.studio_revision is distinct from p_expected_revision then raise exception 'Article revision conflict' using errcode='40001'; end if;
 if nullif(a.studio->>'archivedAt','') is not null then raise exception 'Article already archived'; end if;
 select submission_id,review_status,approved_revision into submission,old_review_status,old_approved_revision from public.mira_submissions where article_id=p_article for update;
 update public.articles set studio=jsonb_set(coalesce(studio,'{}'::jsonb),'{archivedAt}',to_jsonb(now())),studio_revision=studio_revision+1 where id=p_article;
 if submission is not null then
   -- The article guard may invalidate review on updates; archiving does not
   -- change the historical review decision or its approved revision.
   update public.mira_submissions set review_status=old_review_status,approved_revision=old_approved_revision where submission_id=submission;
   insert into public.mira_audit(submission_id,action,actor,revision) values(submission,'archived',auth.uid()::text,p_expected_revision+1);
 end if;
 return jsonb_build_object('id',p_article,'archived',true,'revision',p_expected_revision+1);
end $$;
revoke all on function public.studio_archive_article(text,integer) from public,anon,service_role;
grant execute on function public.studio_archive_article(text,integer) to authenticated;
commit;
