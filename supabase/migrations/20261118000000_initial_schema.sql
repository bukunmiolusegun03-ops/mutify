
-- MUTIFY MARKETPLACE DATABASE
-- Initial database migration

create extension if not exists pgcrypto;

-- 1. User profiles
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text,
    role text not null default 'customer'
        check (role in ('customer', 'seller', 'admin')),
    created_at timestamptz default now()
);

-- 2. Shops and seller applications
create table public.shops (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references public.profiles(id) on delete cascade,
    shop_name text not null,
    slug text unique not null,
    description text,
    logo_url text,
    contact_email text,
    status text not null default 'pending'
        check (status in ('pending', 'approved', 'rejected', 'suspended')),
    created_at timestamptz default now()
);

-- 3. Products
create table public.products (
    id uuid primary key default gen_random_uuid(),
    shop_id uuid not null references public.shops(id) on delete cascade,
    name text not null,
    description text,
    price numeric(12,2) not null check (price >= 0),
    currency text not null default 'NGN',
    category text not null,
    image_url text,
    stock_quantity integer not null default 0
        check (stock_quantity >= 0),
    is_active boolean not null default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Indexes
create index shops_owner_idx on public.shops(owner_id);
create index products_shop_idx on public.products(shop_id);
create index products_category_idx on public.products(category);

-- Automatically create a customer profile at registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, full_name, email)
    values (
        new.id,
        new.raw_user_meta_data ->> 'full_name',
        new.email
    );
    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Admin verification helper
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles
        where id = (select auth.uid())
        and role = 'admin'
    );
$$;

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;

-- Profile permissions
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or public.is_admin());

create policy "Admins can manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Shop permissions
create policy "Anyone can view approved shops"
on public.shops for select
using (status = 'approved' or owner_id = (select auth.uid()) or public.is_admin());

create policy "Users can apply to open a shop"
on public.shops for insert
to authenticated
with check (
    owner_id = (select auth.uid())
    and status = 'pending'
);

create policy "Owners can edit pending shops"
on public.shops for update
to authenticated
using (owner_id = (select auth.uid()) and status = 'pending')
with check (owner_id = (select auth.uid()) and status = 'pending');

create policy "Admins can manage shops"
on public.shops for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Product permissions
create policy "Anyone can view active products from approved shops"
on public.products for select
using (
    is_active = true
    and exists (
        select 1 from public.shops
        where shops.id = products.shop_id
        and shops.status = 'approved'
    )
    or exists (
        select 1 from public.shops
        where shops.id = products.shop_id
        and shops.owner_id = (select auth.uid())
    )
    or public.is_admin()
);

create policy "Approved sellers can add products"
on public.products for insert
to authenticated
with check (
    exists (
        select 1 from public.shops
        where shops.id = products.shop_id
        and shops.owner_id = (select auth.uid())
        and shops.status = 'approved'
    )
);

create policy "Sellers can update their products"
on public.products for update
to authenticated
using (
    exists (
        select 1 from public.shops
        where shops.id = products.shop_id
        and shops.owner_id = (select auth.uid())
        and shops.status = 'approved'
    )
)
with check (
    exists (
        select 1 from public.shops
        where shops.id = products.shop_id
        and shops.owner_id = (select auth.uid())
        and shops.status = 'approved'
    )
);

create policy "Sellers can delete their products"
on public.products for delete
to authenticated
using (
    exists (
        select 1 from public.shops
        where shops.id = products.shop_id
        and shops.owner_id = (select auth.uid())
        and shops.status = 'approved'
    )
);

create policy "Admins can manage products"
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Allow authenticated users to read their own profile
grant select on public.profiles to authenticated;
grant select, insert, update on public.shops to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select on public.shops, public.products to anon;
