begin;
-- Social assets are optional. A completed cover must belong to this submission
-- and match the image recorded on the article, including its verified digest.
create or replace function public.mira_publication_complete(a public.articles, s public.mira_submissions) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(
   jsonb_typeof(a.title->'en')='string' and jsonb_typeof(a.title->'zh')='string'
   and jsonb_typeof(a.excerpt->'en')='string' and jsonb_typeof(a.excerpt->'zh')='string'
   and jsonb_typeof(a.category->'en')='string' and jsonb_typeof(a.category->'zh')='string'
   and jsonb_typeof(a.content->'en')='string' and jsonb_typeof(a.content->'zh')='string'
   and nullif(btrim(a.title->>'en'),'') is not null and nullif(btrim(a.title->>'zh'),'') is not null
   and nullif(btrim(a.excerpt->>'en'),'') is not null and nullif(btrim(a.excerpt->>'zh'),'') is not null
   and nullif(btrim(a.category->>'en'),'') is not null and nullif(btrim(a.category->>'zh'),'') is not null
   and nullif(btrim(a.content->>'en'),'') is not null and nullif(btrim(a.content->>'zh'),'') is not null
   and (a.studio->'seo' is null or jsonb_typeof(a.studio->'seo')='object')
   and (a.studio->'seo'->'titleEN' is null or jsonb_typeof(a.studio->'seo'->'titleEN')='string')
   and (a.studio->'seo'->'titleZH' is null or jsonb_typeof(a.studio->'seo'->'titleZH')='string')
   and (a.studio->'seo'->'descEN' is null or jsonb_typeof(a.studio->'seo'->'descEN')='string')
   and (a.studio->'seo'->'descZH' is null or jsonb_typeof(a.studio->'seo'->'descZH')='string')
   and nullif(btrim(coalesce(a.studio->'seo'->>'titleEN',a.title->>'en')),'') is not null
   and nullif(btrim(coalesce(a.studio->'seo'->>'titleZH',a.title->>'zh')),'') is not null
   and nullif(btrim(coalesce(a.studio->'seo'->>'descEN',a.excerpt->>'en')),'') is not null
   and nullif(btrim(coalesce(a.studio->'seo'->>'descZH',a.excerpt->>'zh')),'') is not null
   and nullif(a.cover,'') is not null and a.cover = a.studio->'miraMedia'->'cover'->>'url'
   and not exists(select 1 from public.mira_media_uploads u where u.submission_id=s.submission_id and u.state in ('reserved','uncertain'))
   and exists (select 1 from public.mira_media_uploads u
       where u.submission_id=s.submission_id and u.role='cover' and u.state='completed'
         and u.result->>'id'=a.studio->'miraMedia'->'cover'->>'id'
         and u.result->>'url'=a.studio->'miraMedia'->'cover'->>'url'
         and u.result->>'mime'=a.studio->'miraMedia'->'cover'->>'mime'
         and u.result->>'mime' in ('image/jpeg','image/png','image/webp')
         and u.result->>'width'=a.studio->'miraMedia'->'cover'->>'width'
         and u.result->>'height'=a.studio->'miraMedia'->'cover'->>'height'
         and (u.result->>'width') ~ '^[1-9][0-9]{2,5}$' and (u.result->>'height') ~ '^[1-9][0-9]{2,5}$'
         and (u.result->>'id') ~ '^[1-9][0-9]*$'
         and u.sha256=a.studio->'miraMedia'->'cover'->>'sha256'
         and u.sha256 ~ '^[a-f0-9]{64}$'
         and nullif(u.result->>'url','') is not null), false)
$$;
revoke all on function public.mira_publication_complete(public.articles,public.mira_submissions) from public,anon,authenticated,service_role;

create or replace function public.mira_finalize_at_revision(p_id text,p_expected_revision integer) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare sub public.mira_submissions; a public.articles;
begin
 if p_expected_revision is null or p_expected_revision < 1 then raise exception 'Expected revision is required' using errcode='22023'; end if;
 select * into sub from public.mira_submissions where submission_id=p_id;
 if not found then raise exception 'Submission not found'; end if;
 select * into a from public.articles where id=sub.article_id for update;
 if not found then raise exception 'Article not found'; end if;
 select * into sub from public.mira_submissions where submission_id=p_id for update;
 if not found or sub.article_id <> a.id then raise exception 'Submission changed' using errcode='40001'; end if;
 if a.studio_revision is distinct from p_expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
 if coalesce(a.studio->>'status','') <> 'Draft' then raise exception 'Article is not a draft' using errcode='42501'; end if;
 if sub.review_status not in ('collecting_assets','pending_review') then raise exception 'Submission is locked' using errcode='42501'; end if;
 if not public.mira_publication_complete(a,sub) then raise exception 'Bilingual content, metadata or verified cover is incomplete'; end if;
 if sub.review_status='pending_review' then return jsonb_build_object('status','pending_review','revision',a.studio_revision); end if;
 update public.mira_submissions set review_status='pending_review' where submission_id=p_id;
 insert into public.mira_audit(submission_id,action,actor,revision) values(p_id,'submitted_for_review','mira',a.studio_revision);
 return jsonb_build_object('status','pending_review','revision',a.studio_revision);
end $$;
revoke all on function public.mira_finalize_at_revision(text,integer) from public,anon,authenticated;
grant execute on function public.mira_finalize_at_revision(text,integer) to service_role;
commit;
