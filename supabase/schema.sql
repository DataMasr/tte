-- =============================================================================
-- NA2LAX | نَقْلِكس — قاعدة البيانات وسياسات الأمان
--
-- طريقة التشغيل:
--   Supabase Dashboard ← SQL Editor ← New query ← الصق الملف كله ← Run
--
-- آمن للتشغيل أكثر من مرة، ولا يحذف أي طلبات موجودة.
--
-- ماذا يفعل؟
--   • الزوار يقدرون يسجلوا طلبات جديدة فقط (بدون قراءة أو تعديل أو حذف).
--   • تتبع الطلب يرجّع بيانات عامة فقط (بدون اسم العميل أو رقمه).
--   • عدّاد عرض الخصم يرجّع رقمًا فقط (عدد الطلبات منذ بداية العرض).
--   • قراءة وتعديل وحذف الطلبات للمسؤولين المسجّلين في admin_users فقط.
-- =============================================================================


-- 1) جدول الطلبات --------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null,
  client_name text not null,
  phone text not null,
  whatsapp text,
  from_area text not null,
  to_area text not null,
  rooms_count text,
  floor_from integer default 1,
  floor_to integer default 1,
  has_winch boolean default false,
  has_packaging boolean default false,
  has_carpentry boolean default false,
  has_ac boolean default false,
  services text[] default '{}',
  move_date date,
  estimated_price numeric default 0,
  status text not null default 'جديد'
    check (status in ('جديد', 'جاري التواصل', 'مؤكد', 'مكتمل', 'ملغي')),
  notes text,
  created_at timestamptz not null default now()
);

-- لو الجدول موجود من قبل: إضافة أي أعمدة ناقصة يستخدمها الموقع الجديد
alter table public.orders add column if not exists whatsapp text;
alter table public.orders add column if not exists rooms_count text;
alter table public.orders add column if not exists floor_from integer default 1;
alter table public.orders add column if not exists floor_to integer default 1;
alter table public.orders add column if not exists has_winch boolean default false;
alter table public.orders add column if not exists has_packaging boolean default false;
alter table public.orders add column if not exists has_carpentry boolean default false;
alter table public.orders add column if not exists has_ac boolean default false;
alter table public.orders add column if not exists services text[] default '{}';
alter table public.orders add column if not exists move_date date;
alter table public.orders add column if not exists estimated_price numeric default 0;
alter table public.orders add column if not exists notes text;

-- القيم الافتراضية القديمة كانت تسجّل خدمات لم يطلبها العميل
alter table public.orders alter column rooms_count drop default;
alter table public.orders alter column has_packaging set default false;
alter table public.orders alter column has_carpentry set default false;

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);


-- 2) المسؤولون -----------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- مقفول بالكامل من الـ API (بدون أي policies)
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ⚠️ غيّر الإيميل التالي لإيميل حساب الأدمن (المستخدم لازم يكون موجود في Authentication → Users)
insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@na2lax.com'
on conflict do nothing;


-- 3) سياسات الأمان (RLS) -------------------------------------------------------
alter table public.orders enable row level security;

-- حذف كل السياسات القديمة (منها سياسة كانت تسمح لأي زائر بقراءة وحذف كل الطلبات)
do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'orders'
  loop
    execute format('drop policy if exists %I on public.orders', p.policyname);
  end loop;
end $$;

create policy "visitors can create new orders"
  on public.orders for insert
  to anon, authenticated
  with check (status = 'جديد');

create policy "admins can create orders"
  on public.orders for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admins can read orders"
  on public.orders for select
  to authenticated
  using ((select public.is_admin()));

create policy "admins can update orders"
  on public.orders for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins can delete orders"
  on public.orders for delete
  to authenticated
  using ((select public.is_admin()));


-- 4) تتبع الطلب برقم الطلب (بيانات عامة فقط) -----------------------------------
create or replace function public.track_order(p_code text)
returns table (booking_code text, status text, move_date date, from_area text, to_area text)
language sql
stable
security definer
set search_path = ''
as $$
  select o.booking_code, o.status, o.move_date, o.from_area, o.to_area
  from public.orders o
  where o.booking_code = upper(trim(p_code))
  limit 1;
$$;

revoke all on function public.track_order(text) from public;
grant execute on function public.track_order(text) to anon, authenticated;


-- 5) عدّاد عرض الخصم (رقم فقط، بدون أي بيانات عملاء) ----------------------------
-- الطلبات الملغية لا تُحسب، والرقم محدود بـ 100 حتى لا يكشف حجم الطلبات
create or replace function public.offer_orders_count(p_since timestamptz)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select least(count(*), 100)::integer
  from public.orders o
  where o.created_at >= p_since
    and o.status <> 'ملغي';
$$;

revoke all on function public.offer_orders_count(timestamptz) from public;
grant execute on function public.offer_orders_count(timestamptz) to anon, authenticated;


-- 6) تحقق سريع ------------------------------------------------------------------
-- يجب أن يظهر إيميل الأدمن هنا، وإلا لن تظهر الطلبات في لوحة الإدارة:
select u.email as admin_email
from public.admin_users a
join auth.users u on u.id = a.user_id;
