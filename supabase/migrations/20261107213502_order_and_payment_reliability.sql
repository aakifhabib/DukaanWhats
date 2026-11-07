-- Safer seller-side order progression, inventory restoration on cancellation,
-- and atomic review of a manually verified plan payment.

alter table public.store_orders
  drop constraint if exists store_orders_status_check;

alter table public.store_orders
  add constraint store_orders_status_check
  check (status in ('new', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'));

create or replace function public.guard_store_order_status_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_item jsonb;
  v_product_id text;
  v_quantity integer;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if old.status = 'new' and new.status not in ('confirmed', 'cancelled') then
    raise exception 'A new order must be confirmed or cancelled first.' using errcode = '22023';
  elsif old.status = 'confirmed' and new.status not in ('preparing', 'ready', 'completed', 'cancelled') then
    raise exception 'A confirmed order can move to preparing, ready, completed, or cancelled.' using errcode = '22023';
  elsif old.status = 'preparing' and new.status not in ('ready', 'completed', 'cancelled') then
    raise exception 'An order being prepared can move to ready, completed, or cancelled.' using errcode = '22023';
  elsif old.status = 'ready' and new.status not in ('out_for_delivery', 'completed', 'cancelled') then
    raise exception 'A ready order can move to out for delivery, completed, or cancelled.' using errcode = '22023';
  elsif old.status = 'out_for_delivery' and new.status not in ('completed', 'cancelled') then
    raise exception 'An order out for delivery can move to completed or cancelled.' using errcode = '22023';
  elsif old.status in ('completed', 'cancelled') then
    raise exception 'Completed and cancelled orders are final.' using errcode = '22023';
  end if;

  -- Order creation reserves tracked stock. A one-way cancellation returns it once.
  if new.status = 'cancelled' then
    for v_item in select value from jsonb_array_elements(old.items)
    loop
      v_product_id := v_item->>'product_id';
      v_quantity := (v_item->>'quantity')::integer;
      update public.products
         set stock = stock + v_quantity
       where id::text = v_product_id
         and user_id = old.store_owner_id
         and stock is not null;
    end loop;
  end if;

  return new;
end;
$$;

revoke all on function public.guard_store_order_status_update() from public, anon, authenticated;
drop trigger if exists store_orders_guard_status_update on public.store_orders;
create trigger store_orders_guard_status_update
  before update of status on public.store_orders
  for each row execute function public.guard_store_order_status_update();

create or replace function public.review_plan_payment(p_payment_id text, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_payment public.plan_payments%rowtype;
begin
  if p_status is null or p_status not in ('approved', 'rejected') then
    raise exception 'Choose approved or rejected.' using errcode = '22023';
  end if;

  select * into v_payment
    from public.plan_payments
   where id::text = p_payment_id
   for update;

  if not found then
    raise exception 'Payment not found.' using errcode = 'P0002';
  end if;
  if v_payment.status is distinct from 'pending' then
    raise exception 'This payment has already been reviewed.' using errcode = '23505';
  end if;
  if v_payment.plan_id is null or v_payment.plan_id not in ('advanced', 'premium') then
    raise exception 'The payment has an invalid plan.' using errcode = '22023';
  end if;

  if p_status = 'approved' then
    update public.profiles
       set current_plan = v_payment.plan_id
     where id = v_payment.user_id;
    if not found then
      raise exception 'The customer profile was not found.' using errcode = 'P0002';
    end if;
  end if;

  update public.plan_payments
     set status = p_status
   where id = v_payment.id
   returning * into v_payment;

  return to_jsonb(v_payment);
end;
$$;

revoke all on function public.review_plan_payment(text, text) from public, anon, authenticated;
grant execute on function public.review_plan_payment(text, text) to service_role;
