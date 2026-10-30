-- Review in staging first. Existing product prices, articles and purchase rows are not changed.
begin;
revoke create on schema public from public, anon, authenticated;
create table public.security_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.security_admins enable row level security;
create function public.is_security_admin() returns boolean language sql stable security definer
set search_path = public, pg_temp as $$ select exists(select 1 from public.security_admins where user_id = auth.uid()) $$;
revoke all on public.security_admins from anon, authenticated;
grant select on public.security_admins to authenticated;
create policy admin_self on public.security_admins for select to authenticated using (user_id = auth.uid());

alter table public.products add column if not exists active boolean not null default true;
alter table public.products add column if not exists currency text not null default 'usd';
-- Existing source code charged USD; retain the original price column unchanged.
create table if not exists public.book_chapters (
 product_id text primary key references public.products(id), chapters jsonb not null default '[]'
);
create table public.commerce_orders (
 id uuid primary key, user_id uuid references auth.users(id), guest_hash text,
 request_key text not null, owner_key text not null,
 customer_email text, stripe_session_id text unique, stripe_payment_intent_id text unique,
 status text not null default 'pending' check (status in ('pending','paid','failed','expired','refunded')),
 currency text not null check (currency = 'usd'), amount bigint not null check (amount > 0),
 refunded_amount bigint not null default 0 check (refunded_amount >= 0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), paid_at timestamptz,
 unique(owner_key, request_key), check(user_id is not null or guest_hash is not null)
);
create table public.commerce_order_items (
 order_id uuid not null references public.commerce_orders(id), product_id text not null references public.products(id),
 title text not null, unit_amount bigint not null check(unit_amount > 0), quantity integer not null check(quantity = 1),
 primary key(order_id,product_id)
);
create table public.commerce_entitlements (
 order_id uuid not null references public.commerce_orders(id), product_id text not null references public.products(id),
 user_id uuid references auth.users(id), active boolean not null default true, granted_at timestamptz not null default now(),
 primary key(order_id,product_id)
);
create index commerce_entitlements_user on public.commerce_entitlements(user_id,product_id) where active;
create table public.commerce_webhook_events (
 event_id text primary key, event_type text not null, order_id uuid references public.commerce_orders(id),
 status text not null check(status='processed'), processed_at timestamptz not null default now()
);
-- Reconciled pre-hardening purchases are kept out of new financial order reporting.
create table public.commerce_legacy_grants (
 user_id uuid not null references auth.users(id), product_id text not null references public.products(id),
 stripe_session_id text not null, stripe_payment_intent_id text not null,
 active boolean not null default true, reviewed_at timestamptz not null default now(),
 primary key(stripe_session_id,product_id)
);
create table public.commerce_assets (
 product_id text primary key references public.products(id), object_path text not null unique,
 check (object_path !~ '(^/|\.\.|://)')
);

-- Replace permissive legacy policies; a new restrictive policy alone cannot fix grants inherited elsewhere.
do $$ declare t text; p record; begin
 foreach t in array array['products','articles','newsletters','newsletter_subscriptions','purchases','coupons','book_chapters',
 'commerce_orders','commerce_order_items','commerce_entitlements','commerce_webhook_events','commerce_assets','commerce_legacy_grants'] loop
  if to_regclass('public.'||t) is null then continue; end if;
  execute format('alter table public.%I enable row level security',t);
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
   execute format('drop policy %I on public.%I',p.policyname,t);
  end loop;
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant all on public.%I to service_role',t);
  if t in ('products','articles','newsletters','coupons','book_chapters') then
   execute format('grant select, insert, update, delete on public.%I to authenticated',t);
   execute format('create policy admin_access on public.%I for all to authenticated using (public.is_security_admin()) with check (public.is_security_admin())',t);
  else
   execute format('grant select on public.%I to authenticated',t);
   execute format('create policy admin_read on public.%I for select to authenticated using (public.is_security_admin())',t);
  end if;
 end loop;
end $$;
grant select on public.articles, public.newsletters to anon;
create policy public_articles on public.articles for select to anon, authenticated using (true);
create policy public_newsletters on public.newsletters for select to anon, authenticated using (lower(status) in ('sent','published'));
-- Subscription inserts use the server. Old purchases are retained but never used as payment evidence.
create policy own_orders on public.commerce_orders for select to authenticated using(user_id=auth.uid());
create policy own_entitlements on public.commerce_entitlements for select to authenticated using(user_id=auth.uid());
create policy own_items on public.commerce_order_items for select to authenticated using(exists(select 1 from public.commerce_orders o where o.id=order_id and o.user_id=auth.uid()));
grant all on public.security_admins,public.commerce_orders,public.commerce_order_items,public.commerce_entitlements,public.commerce_webhook_events,public.commerce_assets to service_role;

create function public.commerce_prepare_order(p_id uuid,p_user uuid,p_guest text,p_key text,p_items jsonb,p_amount bigint,p_currency text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_order commerce_orders; v_owner text := coalesce(p_user::text,p_guest); v_actual jsonb; begin
 perform pg_advisory_xact_lock(hashtext(v_owner));
 if not exists(select 1 from commerce_orders where owner_key=v_owner and request_key=p_key)
 and (select count(*) from commerce_orders where owner_key=v_owner and created_at>now()-interval '10 minutes')>=5 then
 raise exception 'Checkout rate exceeded'; end if;
 insert into commerce_orders(id,user_id,guest_hash,owner_key,request_key,amount,currency)
 values(p_id,p_user,p_guest,v_owner,p_key,p_amount,p_currency) on conflict(owner_key,request_key) do nothing;
 select * into strict v_order from commerce_orders where owner_key=v_owner and request_key=p_key for update;
 if v_order.id=p_id then
  insert into commerce_order_items(order_id,product_id,title,unit_amount,quantity)
  select p_id,x.product_id,x.title,x.unit_amount,x.quantity from jsonb_to_recordset(p_items) as x(product_id text,title text,unit_amount bigint,quantity int);
 end if;
 select jsonb_agg(jsonb_build_object('product_id',product_id,'title',title,'unit_amount',unit_amount,'quantity',quantity) order by product_id) into v_actual from commerce_order_items where order_id=v_order.id;
 if v_actual is distinct from p_items or v_order.amount<>p_amount or v_order.currency<>p_currency then raise exception 'Idempotency conflict'; end if;
 return v_order.id;
end $$;
create function public.commerce_attach_session(p_order uuid,p_session text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update commerce_orders set stripe_session_id=p_session,updated_at=now() where id=p_order and (stripe_session_id is null or stripe_session_id=p_session);
 if not found then raise exception 'Session conflict'; end if;
end $$;
create function public.commerce_apply_payment(p_order_id uuid,p_session_id text,p_intent_id text,p_status text,p_email text,p_event_id text,p_event_type text,p_refunded bigint)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare o commerce_orders; begin
 select * into strict o from commerce_orders where id=p_order_id for update;
 if o.stripe_session_id is distinct from p_session_id then raise exception 'Session mismatch'; end if;
 if p_event_id is not null and exists(select 1 from commerce_webhook_events where event_id=p_event_id) then return; end if;
 -- Monotonic transitions: old/unpaid events cannot undo a confirmed payment or refund.
 if o.status='refunded' then p_status:='refunded';
 elsif o.status='paid' and p_status<>'refunded' then p_status:='paid'; end if;
 update commerce_orders set status=p_status,stripe_payment_intent_id=coalesce(p_intent_id,stripe_payment_intent_id),
 customer_email=coalesce(customer_email,lower(p_email)),updated_at=now(),refunded_amount=greatest(refunded_amount,p_refunded),
 paid_at=case when p_status='paid' then coalesce(paid_at,now()) else paid_at end where id=p_order_id;
 if p_status='paid' then
  insert into commerce_entitlements(order_id,product_id,user_id)
  select o.id,product_id,o.user_id from commerce_order_items where order_id=o.id on conflict do nothing;
 elsif p_status='refunded' then
  update commerce_entitlements set active=false where order_id=o.id;
 end if;
 if p_event_id is not null then
  insert into commerce_webhook_events(event_id,event_type,order_id,status) values(p_event_id,p_event_type,o.id,'processed');
 end if;
end $$;
create function public.commerce_claim(p_user uuid,p_email text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 -- Caller obtains p_email from Supabase getUser, never from the request body.
 update commerce_orders set user_id=p_user,guest_hash=null,updated_at=now() where user_id is null and lower(customer_email)=lower(p_email) and status='paid';
 update commerce_entitlements e set user_id=p_user from commerce_orders o where e.order_id=o.id and o.user_id=p_user and e.user_id is null;
end $$;
create function public.commerce_revoke_legacy(p_intent text,p_event text,p_type text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update commerce_legacy_grants set active=false where stripe_payment_intent_id=p_intent;
 insert into commerce_webhook_events(event_id,event_type,status) values(p_event,p_type,'processed') on conflict do nothing;
end $$;
create function public.commerce_access(p_product text,p_user uuid,p_guest text) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from products where id=p_product and id not like '\_\_%' and (price=0 or exists(select 1 from security_admins where user_id=p_user)))
 or exists(select 1 from commerce_legacy_grants where user_id=p_user and product_id=p_product and active)
 or exists(select 1 from commerce_entitlements e join commerce_orders o on o.id=e.order_id where e.product_id=p_product and e.active and o.status='paid' and (o.user_id=p_user or (o.user_id is null and o.guest_hash=p_guest)))
$$;
create function public.commerce_library(p_user uuid,p_guest text) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(id),'[]') from products where id not like '\_\_%' and commerce_access(id,p_user,p_guest)
$$;
create function public.commerce_health() returns jsonb language sql security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('orders', (select count(*)>=0 from commerce_orders),'assets_configured',(select count(*) from commerce_assets),'private_bucket',exists(select 1 from storage.buckets where id='paid-books' and not public))
$$;
-- RPCs accept trusted server identity; NEVER callable directly from the browser.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'commerce_%' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
-- New private bucket. Never silently change an existing public bucket to private.
insert into storage.buckets(id,name,public) values('paid-books','paid-books',false) on conflict do nothing;
-- Restrictive policies close legacy catch-all asset writes without changing public media reads.
create policy stage1_storage_insert on storage.objects as restrictive for insert to anon,authenticated with check(public.is_security_admin());
create policy stage1_storage_update on storage.objects as restrictive for update to anon,authenticated using(public.is_security_admin()) with check(public.is_security_admin());
create policy stage1_storage_delete on storage.objects as restrictive for delete to anon,authenticated using(public.is_security_admin());
create policy stage1_paid_read on storage.objects as restrictive for select to anon,authenticated using(bucket_id<>'paid-books' or public.is_security_admin());
create policy stage1_admin_storage on storage.objects for all to authenticated using(public.is_security_admin()) with check(public.is_security_admin());
commit;
