-- Forward-only hardening. Existing records are preserved, with unknown mode denied
-- until an operator re-verifies their Stripe session. Never infer live mode from status.
begin;
alter table public.commerce_orders add column livemode boolean;
alter table public.commerce_legacy_grants add column livemode boolean;
create index commerce_orders_mode on public.commerce_orders(livemode,user_id);

-- Retire signatures that cannot express deployment mode. Old callers fail closed.
drop function public.commerce_library(uuid,text);
drop function public.commerce_access(text,uuid,text);
drop function public.commerce_prepare_order(uuid,uuid,text,text,jsonb,bigint,text);
drop function public.commerce_claim(uuid,text);
drop function public.commerce_revoke_legacy(text,text,text);
drop function public.commerce_apply_payment(uuid,text,text,text,text,text,text,bigint);

create function public.commerce_prepare_order(p_id uuid,p_user uuid,p_guest text,p_key text,p_items jsonb,p_amount bigint,p_currency text,p_live boolean)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_order commerce_orders; v_owner text; v_actual jsonb; begin
 if p_live is null then raise exception 'Payment mode required'; end if;
 v_owner := case when p_live then 'live:' else 'test:' end || coalesce(p_user::text,p_guest);
 perform pg_advisory_xact_lock(hashtext(v_owner));
 if not exists(select 1 from commerce_orders where owner_key=v_owner and request_key=p_key)
 and (select count(*) from commerce_orders where owner_key=v_owner and created_at>now()-interval '10 minutes')>=5 then
 raise exception 'Checkout rate exceeded'; end if;
 insert into commerce_orders(id,user_id,guest_hash,owner_key,request_key,amount,currency,livemode)
 values(p_id,p_user,p_guest,v_owner,p_key,p_amount,p_currency,p_live) on conflict(owner_key,request_key) do nothing;
 select * into strict v_order from commerce_orders where owner_key=v_owner and request_key=p_key for update;
 if v_order.id=p_id then
  insert into commerce_order_items(order_id,product_id,title,unit_amount,quantity)
  select p_id,x.product_id,x.title,x.unit_amount,x.quantity from jsonb_to_recordset(p_items) as x(product_id text,title text,unit_amount bigint,quantity int);
 end if;
 select jsonb_agg(jsonb_build_object('product_id',product_id,'title',title,'unit_amount',unit_amount,'quantity',quantity) order by product_id) into v_actual from commerce_order_items where order_id=v_order.id;
 if v_actual is distinct from p_items or v_order.amount<>p_amount or v_order.currency<>p_currency or v_order.livemode is distinct from p_live then raise exception 'Idempotency conflict'; end if;
 return v_order.id;
end $$;
create function public.commerce_apply_payment(p_order_id uuid,p_session_id text,p_intent_id text,p_status text,p_email text,p_event_id text,p_event_type text,p_refunded bigint,p_live boolean)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare o commerce_orders; begin
 select * into strict o from commerce_orders where id=p_order_id for update;
 if p_live is null or o.livemode is distinct from p_live or o.stripe_session_id is distinct from p_session_id then raise exception 'Session or mode mismatch'; end if;
 if p_event_id is not null and exists(select 1 from commerce_webhook_events where event_id=p_event_id) then return; end if;
 if o.status='refunded' then p_status:='refunded';
 elsif o.status='paid' and p_status<>'refunded' then p_status:='paid'; end if;
 update commerce_orders set status=p_status,stripe_payment_intent_id=coalesce(p_intent_id,stripe_payment_intent_id),
 customer_email=case when p_status='paid' then coalesce(lower(p_email),customer_email) else customer_email end,updated_at=now(),refunded_amount=greatest(refunded_amount,p_refunded),
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
create function public.commerce_claim(p_user uuid,p_email text,p_live boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_live is null then raise exception 'Payment mode required'; end if;
 update commerce_orders set user_id=p_user,guest_hash=null,updated_at=now()
 where user_id is null and lower(customer_email)=lower(p_email) and status='paid' and livemode=p_live;
 update commerce_entitlements e set user_id=p_user from commerce_orders o where e.order_id=o.id and o.user_id=p_user and o.livemode=p_live and e.user_id is null;
end $$;
create function public.commerce_revoke_legacy(p_intent text,p_event text,p_type text,p_live boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_live is null then raise exception 'Payment mode required'; end if;
 update commerce_legacy_grants set active=false where stripe_payment_intent_id=p_intent and livemode=p_live;
 insert into commerce_webhook_events(event_id,event_type,status) values(p_event,p_type,'processed') on conflict do nothing;
end $$;
create function public.commerce_access(p_product text,p_user uuid,p_guest text,p_live boolean) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from products where id=p_product and id not like '\_\_%' and (price=0 or exists(select 1 from security_admins where user_id=p_user)))
 or exists(select 1 from commerce_legacy_grants where user_id=p_user and product_id=p_product and active and livemode=p_live)
 or exists(select 1 from commerce_entitlements e join commerce_orders o on o.id=e.order_id where e.product_id=p_product and e.active and o.status='paid' and o.livemode=p_live and (o.user_id=p_user or (o.user_id is null and o.guest_hash=p_guest)))
$$;
create function public.commerce_library(p_user uuid,p_guest text,p_live boolean) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(id),'[]') from products where id not like '\_\_%' and commerce_access(id,p_user,p_guest,p_live)
$$;
-- Only a trusted operator that has re-verified Stripe may label a previous record.
create function public.commerce_assign_mode(p_order uuid,p_session text,p_live boolean,p_email text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_live is null then raise exception 'Payment mode required'; end if;
 update commerce_orders set livemode=p_live, customer_email=case when status='paid' then lower(p_email) else customer_email end, owner_key=case when owner_key like 'live:%' or owner_key like 'test:%' then owner_key else (case when p_live then 'live:' else 'test:' end)||owner_key end, updated_at=now()
 where id=p_order and stripe_session_id=p_session and (livemode is null or livemode=p_live);
 if not found then raise exception 'Mode assignment conflict'; end if;
end $$;
create or replace function public.commerce_health() returns jsonb language sql security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('orders',(select count(*)>=0 from commerce_orders),
 'unclassified_orders',(select count(*) from commerce_orders where livemode is null),
 'unclassified_legacy_grants',(select count(*) from commerce_legacy_grants where livemode is null),
 'assets_configured',(select count(*) from commerce_assets),
 'private_bucket',exists(select 1 from storage.buckets where id='paid-books' and not public))
$$;
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'commerce_%' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
commit;
