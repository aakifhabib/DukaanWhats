-- Additive store growth features: stock/variants, delivery, language/SEO and orders.
-- Apply in the Supabase SQL Editor after taking a database backup.

alter table public.profiles
  add column if not exists store_language text not null default 'en',
  add column if not exists delivery_enabled boolean not null default false,
  add column if not exists delivery_fee integer not null default 0,
  add column if not exists delivery_areas text[] not null default '{}',
  add column if not exists pickup_enabled boolean not null default true,
  add column if not exists cod_enabled boolean not null default true,
  add column if not exists cod_details text not null default 'Cash on delivery details are confirmed on WhatsApp.',
  add column if not exists seo_title text,
  add column if not exists seo_description text;

alter table public.products
  add column if not exists stock integer default 100,
  add column if not exists sizes text[] not null default '{}',
  add column if not exists colors text[] not null default '{}';

-- Remove legacy permissive policies and column grants that let anonymous callers mutate profiles/products.
do $$
declare column_name text;
begin
  for column_name in
    select attname from pg_attribute where attrelid = 'public.profiles'::regclass and attnum > 0 and not attisdropped
  loop
    execute format('revoke all privileges (%I) on table public.profiles from public, anon, authenticated', column_name);
  end loop;
  for column_name in
    select attname from pg_attribute where attrelid = 'public.products'::regclass and attnum > 0 and not attisdropped
  loop
    execute format('revoke all privileges (%I) on table public.products from public, anon, authenticated', column_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
revoke all privileges on table public.profiles, public.products from public, anon, authenticated;
grant select (id, business_name, store_slug, whatsapp_number, store_theme, current_plan, premium_custom,
  store_language, delivery_enabled, delivery_fee, delivery_areas, pickup_enabled, cod_enabled, cod_details,
  seo_title, seo_description) on table public.profiles to anon;
grant select on table public.profiles to authenticated;
grant insert (id, business_name, whatsapp_number, store_slug, store_theme) on table public.profiles to authenticated;
grant update (id, business_name, whatsapp_number, store_slug, store_theme, premium_custom, store_language,
  delivery_enabled, delivery_fee, delivery_areas, pickup_enabled, cod_enabled, cod_details, seo_title,
  seo_description) on table public.profiles to authenticated;

grant select (id, user_id, name, price, stock, image_url, image_urls, created_at, description, category,
  sizes, colors, original_price) on table public.products to anon;
grant select on table public.products to authenticated;
grant insert (user_id, name, price, stock, image_url, image_urls, description, category, sizes, colors, original_price)
  on table public.products to authenticated;
grant update (name, price, stock, image_url, image_urls, description, category, sizes, colors, original_price)
  on table public.products to authenticated;
grant delete on table public.products to authenticated;

drop policy if exists "Allow all" on public.profiles;
drop policy if exists "Allow all for now" on public.profiles;
drop policy if exists "Public can view stores" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Public can view stores" on public.profiles for select to anon using (true);
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Allow all" on public.products;
drop policy if exists "Allow all for now" on public.products;
drop policy if exists "Public can view products" on public.products;
drop policy if exists "Users can view own products" on public.products;
drop policy if exists "Users can insert own products" on public.products;
drop policy if exists "Users can update own products" on public.products;
drop policy if exists "Users can delete own products" on public.products;
create policy "Public can view products" on public.products for select to anon using (true);
create policy "Users can view own products" on public.products for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own products" on public.products for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own products" on public.products for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own products" on public.products for delete to authenticated using (auth.uid() = user_id);

-- Payment rows are written only by the validated server endpoint and reviewed by the server admin API.
alter table public.plan_payments enable row level security;
revoke all privileges on table public.plan_payments from public, anon, authenticated;
grant select on table public.plan_payments to authenticated;
drop policy if exists "Admin can update" on public.plan_payments;
drop policy if exists "Admin can view all" on public.plan_payments;
drop policy if exists "Users can manage own plan payments" on public.plan_payments;
drop policy if exists "Users can insert own payment" on public.plan_payments;
drop policy if exists "users can insert own payments" on public.plan_payments;
drop policy if exists "Users can view own payments" on public.plan_payments;
drop policy if exists "users can view own payments" on public.plan_payments;
create policy "Users can view own payments" on public.plan_payments
  for select to authenticated using (auth.uid() = user_id);

-- These legacy tables/views are unused by the app; block direct client access to avoid leaking or forging records.
alter table public.orders enable row level security;
revoke all privileges on table public.orders from public, anon, authenticated;
drop policy if exists "Allow all for orders" on public.orders;
drop policy if exists "Allow all to insert orders" on public.orders;
drop policy if exists "Allow all to update orders" on public.orders;
drop policy if exists "Allow all to view orders" on public.orders;

alter table public.plan_purchases enable row level security;
revoke all privileges on table public.plan_purchases from public, anon, authenticated;
drop policy if exists "Allow all for plan_purchases" on public.plan_purchases;

revoke all privileges on table public.daily_store_stats from public, anon, authenticated;

alter table public.plans enable row level security;
revoke all privileges on table public.plans from public, anon, authenticated;
grant select on table public.plans to anon, authenticated;
drop policy if exists "Allow public read plans" on public.plans;
create policy "Allow public read plans" on public.plans for select to anon, authenticated using (true);

-- Analytics writes are server-mediated; store owners may read their own events only.
alter table public.store_analytics enable row level security;
revoke all privileges on table public.store_analytics from public, anon, authenticated;
grant select on table public.store_analytics to authenticated;
drop policy if exists "Allow public insert" on public.store_analytics;
drop policy if exists "Owners can read own analytics" on public.store_analytics;
create policy "Owners can read own analytics" on public.store_analytics
  for select to authenticated using (store_owner_id = auth.uid());

-- Public image access remains read-only. Upload/update/delete require a path scoped to the caller's auth UID.
alter table storage.objects enable row level security;
revoke all privileges on table storage.objects from public, anon, authenticated;
grant select on table storage.objects to anon, authenticated;
grant insert, update, delete on table storage.objects to authenticated;
drop policy if exists "Allow all" on storage.objects;
drop policy if exists "Allow all storage" on storage.objects;
drop policy if exists "Public read product images" on storage.objects;
drop policy if exists "Users can upload product images" on storage.objects;
drop policy if exists "Users can update own product images" on storage.objects;
drop policy if exists "Users can delete own product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "Users can upload own product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  store_owner_id uuid not null references auth.users(id) on delete cascade,
  store_slug text not null,
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  customer_phone text not null check (char_length(customer_phone) between 7 and 20),
  delivery_method text not null check (delivery_method in ('delivery', 'pickup')),
  delivery_area text,
  delivery_address text,
  notes text,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  payment_method text not null default 'cod' check (payment_method in ('cod', 'other')),
  total integer not null check (total >= 0),
  language text not null default 'en' check (language in ('en', 'ur')),
  status text not null default 'new' check (status in ('new', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_orders
  add column if not exists payment_method text not null default 'cod' check (payment_method in ('cod', 'other'));

create index if not exists store_orders_owner_created_idx
  on public.store_orders (store_owner_id, created_at desc);
create index if not exists store_orders_store_created_idx
  on public.store_orders (store_slug, created_at desc);

alter table public.store_orders enable row level security;
revoke all on public.store_orders from public, anon, authenticated;
grant select, update(status) on public.store_orders to authenticated;

 drop policy if exists "Store owners read their orders" on public.store_orders;
create policy "Store owners read their orders" on public.store_orders
  for select to authenticated using (auth.uid() = store_owner_id);

drop policy if exists "Store owners update order status" on public.store_orders;
create policy "Store owners update order status" on public.store_orders
  for update to authenticated
  using (auth.uid() = store_owner_id)
  with check (auth.uid() = store_owner_id);

create or replace function public.touch_store_order_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.touch_store_order_updated_at() from public;

drop trigger if exists store_orders_touch_updated_at on public.store_orders;
create trigger store_orders_touch_updated_at
  before update on public.store_orders
  for each row execute function public.touch_store_order_updated_at();

drop function if exists public.create_store_order(text, text, text, text, text, text, text, jsonb, text);

create or replace function public.create_store_order(
  p_store_slug text,
  p_customer_name text,
  p_customer_phone text,
  p_delivery_method text,
  p_delivery_area text,
  p_delivery_address text,
  p_notes text,
  p_items jsonb,
  p_language text default 'en',
  p_payment_method text default 'cod'
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_profile record;
  v_product record;
  v_input jsonb;
  v_order_items jsonb := '[]'::jsonb;
  v_order public.store_orders%rowtype;
  v_product_id text;
  v_quantity integer;
  v_size text;
  v_color text;
  v_subtotal integer := 0;
  v_fee integer := 0;
begin
  if p_store_slug is null or p_store_slug !~ '^[a-z0-9-]{3,63}$' then
    raise exception 'Invalid store.' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(p_customer_name, ''))) not between 1 and 100 then
    raise exception 'Enter a valid customer name.' using errcode = '22023';
  end if;
  if p_customer_phone is null or p_customer_phone !~ '^[0-9+() -]{7,20}$'
     or length(regexp_replace(p_customer_phone, '\D', '', 'g')) not between 7 and 15 then
    raise exception 'Enter a valid phone number.' using errcode = '22023';
  end if;
  if char_length(coalesce(p_notes, '')) > 500 then
    raise exception 'Order notes must be 500 characters or fewer.' using errcode = '22023';
  end if;
  if p_delivery_method is null or p_delivery_method not in ('delivery', 'pickup') then
    raise exception 'Choose delivery or pickup.' using errcode = '22023';
  end if;
  if p_language is distinct from 'en' and p_language is distinct from 'ur' then
    raise exception 'Unsupported language.' using errcode = '22023';
  end if;
  if p_payment_method is distinct from 'cod' and p_payment_method is distinct from 'other' then
    raise exception 'Unsupported payment method.' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Your order must contain between 1 and 20 product lines.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'Your order must contain between 1 and 20 product lines.' using errcode = '22023';
  end if;

  select id, business_name, store_slug, current_plan, delivery_enabled, delivery_fee,
         delivery_areas, pickup_enabled, cod_enabled, cod_details
    into v_profile
    from public.profiles
    where store_slug = p_store_slug
    for update;
  if not found then raise exception 'Store not found.' using errcode = 'P0002'; end if;
  if coalesce(v_profile.current_plan, 'basic') not in ('advanced', 'premium') then
    raise exception 'Online order requests are available on Advanced and Premium plans.' using errcode = '42501';
  end if;
  if p_delivery_method = 'delivery' then
    if not coalesce(v_profile.delivery_enabled, false) then
      raise exception 'This store has not enabled delivery.' using errcode = '22023';
    end if;
    if char_length(trim(coalesce(p_delivery_area, ''))) not between 1 and 80 then
      raise exception 'Choose a delivery area.' using errcode = '22023';
    end if;
    if coalesce(array_length(v_profile.delivery_areas, 1), 0) > 0
       and not (trim(coalesce(p_delivery_area, '')) = any(v_profile.delivery_areas)) then
      raise exception 'Delivery is not available in that area.' using errcode = '22023';
    end if;
    if char_length(trim(coalesce(p_delivery_address, ''))) not between 5 and 300 then
      raise exception 'Enter a delivery address.' using errcode = '22023';
    end if;
    v_fee := greatest(0, coalesce(v_profile.delivery_fee, 0));
  elsif not coalesce(v_profile.pickup_enabled, false) then
    raise exception 'Pickup is not available for this store.' using errcode = '22023';
  end if;
  if p_payment_method = 'cod' and not coalesce(v_profile.cod_enabled, false) then
    raise exception 'Cash on delivery is not available for this store.' using errcode = '22023';
  end if;

  for v_input in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := v_input->>'product_id';
    v_quantity := (v_input->>'quantity')::integer;
    v_size := nullif(trim(v_input->>'size'), '');
    v_color := nullif(trim(v_input->>'color'), '');
    if v_product_id is null or v_quantity not between 1 and 99 then
      raise exception 'Invalid product or quantity.' using errcode = '22023';
    end if;
    select id, name, price, stock, sizes, colors, image_url
      into v_product
      from public.products
      where id::text = v_product_id and user_id = v_profile.id
      for update;
    if not found then raise exception 'A product in this order is unavailable.' using errcode = 'P0002'; end if;
    if v_product.stock is not null and v_product.stock < v_quantity then
      raise exception 'There is not enough stock for %.', v_product.name using errcode = '22023';
    end if;
    if coalesce(array_length(v_product.sizes, 1), 0) > 0
       and (v_size is null or not (v_size = any(v_product.sizes))) then
      raise exception 'Choose an available size for %.', v_product.name using errcode = '22023';
    end if;
    if coalesce(array_length(v_product.colors, 1), 0) > 0
       and (v_color is null or not (v_color = any(v_product.colors))) then
      raise exception 'Choose an available colour for %.', v_product.name using errcode = '22023';
    end if;
    v_subtotal := v_subtotal + (round(v_product.price)::integer * v_quantity);
    v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id::text,
      'name', v_product.name,
      'unit_price', round(v_product.price)::integer,
      'quantity', v_quantity,
      'size', v_size,
      'color', v_color,
      'image_url', v_product.image_url
    ));
    if v_product.stock is not null then
      update public.products set stock = stock - v_quantity where id::text = v_product_id;
    end if;
  end loop;

  insert into public.store_orders (
    store_owner_id, store_slug, customer_name, customer_phone, delivery_method,
    delivery_area, delivery_address, notes, items, subtotal, delivery_fee,
    payment_method, total, language
  ) values (
    v_profile.id, v_profile.store_slug, trim(p_customer_name), trim(p_customer_phone),
    p_delivery_method, nullif(trim(coalesce(p_delivery_area, '')), ''),
    nullif(trim(coalesce(p_delivery_address, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''), v_order_items, v_subtotal, v_fee,
    p_payment_method, v_subtotal + v_fee, p_language
  ) returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

revoke all on function public.create_store_order(text, text, text, text, text, text, text, jsonb, text, text) from public;
grant execute on function public.create_store_order(text, text, text, text, text, text, text, jsonb, text, text) to anon, authenticated, service_role;
