-- Stage 3, additive content-only migration. Review and apply in staging first.
-- Does not change commerce, authentication membership, existing content, or storage.
begin;
alter table public.articles add column if not exists studio jsonb not null default '{}'::jsonb;
alter table public.articles add column if not exists studio_revision integer not null default 0;

create or replace function public.studio_article_visible(a jsonb) returns boolean language plpgsql stable as $$
declare state text := coalesce(a->'studio'->>'status',a->>'status',case when a->>'published'='false' then 'Draft' else 'Published' end); due text;
begin
 if lower(state)='published' then return true; end if;
 if lower(state)<>'scheduled' then return false; end if;
 due := coalesce(a->'studio'->>'scheduledDate',a->>'scheduledDate');
 if due is null or due='' then return false; end if;
 -- Legacy datetime-local values used no zone. Interpret them explicitly as Singapore.
 return (case when due ~ '(Z|[+-][0-9]{2}:[0-9]{2})$' then due::timestamptz else due::timestamp at time zone 'Asia/Singapore' end)<=now();
exception when others then return false;
end $$;
drop policy if exists public_articles on public.articles;
create policy public_articles on public.articles for select to anon,authenticated using(public.is_security_admin() or public.studio_article_visible(to_jsonb(articles)));

-- Legacy direct updates must not silently overwrite revisioned Studio 2 records.
create or replace function public.studio_guard_revision() returns trigger language plpgsql as $$
begin
 if old.studio->>'version'='2' and new.studio_revision<>old.studio_revision+1 then
   raise exception 'Use revision-based Content Studio save' using errcode='40001';
 end if;
 if new.studio_revision<=old.studio_revision then new.studio_revision:=old.studio_revision+1; end if;
 return new;
end $$;
drop trigger if exists studio_revision_guard on public.articles;
create trigger studio_revision_guard before update on public.articles for each row execute function public.studio_guard_revision();

create or replace function public.studio_save_article(p_article jsonb,p_expected_revision integer) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare previous public.articles; saved public.articles; merged jsonb; target text:=p_article->>'id'; slug text:=coalesce(p_article->'studio'->>'slug',p_article->>'slug'); found_row boolean; setters text; result jsonb; columns_list text; projection_list text;
begin
 if not public.is_security_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 if p_expected_revision is null or p_expected_revision<0 then raise exception 'Expected revision is required'; end if;
 if target is null or target='' or slug is null or slug='' or jsonb_typeof(p_article->'title') is distinct from 'object' then raise exception 'Invalid article'; end if;
 if coalesce(p_article->'studio'->>'status','') not in ('Draft','Published','Scheduled') then raise exception 'Invalid publication status'; end if;
 perform pg_advisory_xact_lock(hashtext('studio-slug:'||slug));
 perform pg_advisory_xact_lock(hashtext('studio-id:'||target));
 select * into previous from articles where id=target for update; found_row:=found;
 if coalesce(previous.studio_revision,0)<>p_expected_revision or (not found_row and p_expected_revision<>0) then raise exception 'Article revision conflict' using errcode='40001'; end if;
 if exists(select 1 from articles a where a.id<>target and coalesce(nullif(a.studio->>'slug',''),nullif(to_jsonb(a)->>'slug',''),a.id)=slug) then raise exception 'Article slug already exists' using errcode='23505'; end if;
 merged:=(case when found_row then to_jsonb(previous) else '{}'::jsonb end)||p_article||jsonb_build_object('id',target,'created_at',coalesce(previous.created_at,now()),'studio_revision',p_expected_revision+1);
 -- jsonb_populate_record preserves all existing columns and ignores metadata without columns.
 saved:=jsonb_populate_record(null::public.articles,merged);
 if found_row then
   select string_agg(format('%I = ($1).%I',attname,attname),', ') into setters from pg_attribute where attrelid='public.articles'::regclass and attnum>0 and not attisdropped and attname<>'id' and attgenerated='';
   execute format('update public.articles set %s where id=$2 returning to_jsonb(articles)',setters) into result using saved,target;
 else
   -- Omit absent and generated columns so database defaults/expressions remain authoritative.
   select string_agg(format('%I',attname),', '),string_agg(format('r.%I',attname),', ')
   into columns_list,projection_list from pg_attribute where attrelid='public.articles'::regclass and attnum>0 and not attisdropped and attgenerated='' and attidentity='' and merged ? attname::text;
   execute format('insert into public.articles (%s) select %s from jsonb_populate_record(null::public.articles,$1) r returning to_jsonb(articles)',columns_list,projection_list) into result using merged;
 end if;
 return result;
end $$;
revoke all on function public.studio_save_article(jsonb,integer) from public,anon;
grant execute on function public.studio_save_article(jsonb,integer) to authenticated;
commit;
