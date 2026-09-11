-- ==============================================================================
-- NAQLX | نَقْلِكس - Supabase Database Schema
-- شغّل هذا الكود في Supabase SQL Editor لإنشاء جدول الطلبات وتفعيل سياسات الأمان
-- ==============================================================================

-- 1. إنشاء جدول الطلبات orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    from_area TEXT NOT NULL,
    to_area TEXT NOT NULL,
    rooms_count TEXT DEFAULT '2 غرف',
    floor_from INTEGER DEFAULT 1,
    floor_to INTEGER DEFAULT 1,
    has_winch BOOLEAN DEFAULT false,
    has_packaging BOOLEAN DEFAULT true,
    has_carpentry BOOLEAN DEFAULT true,
    has_ac BOOLEAN DEFAULT false,
    move_date DATE DEFAULT CURRENT_DATE,
    estimated_price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'جديد' CHECK (status IN ('جديد', 'جاري التواصل', 'مؤكد', 'مكتمل', 'ملغي')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. تفعيل Row Level Security (RLS) لحماية البيانات
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. سياسة السماح للزوار والعملاء بإرسال طلبات جديدة (INSERT) بدون تسجيل دخول
DROP POLICY IF EXISTS "Allow anonymous insert orders" ON public.orders;
CREATE POLICY "Allow anonymous insert orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 4. سياسة السماح بقراءة وتعديل وحذف الطلبات للأدمن (أو عبر المفتاح السري والمصرح لهم)
DROP POLICY IF EXISTS "Allow full access for service_role and anon reading" ON public.orders;
CREATE POLICY "Allow full access for service_role and anon reading" 
ON public.orders 
FOR ALL 
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- 5. إنشاء فهرس لتسريع البحث والفرز حسب التاريخ والحالة
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_booking_code ON public.orders (booking_code);

-- 6. تفعيل Realtime للطلبات لمتابعتها لحظياً في لوحة تحكم الأدمن
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 7. إضافة طلب تجريبي مبدئي للتأكد من عمل النظام
INSERT INTO public.orders (
    booking_code,
    client_name,
    phone,
    whatsapp,
    from_area,
    to_area,
    rooms_count,
    floor_from,
    floor_to,
    has_winch,
    has_packaging,
    has_carpentry,
    move_date,
    estimated_price,
    status,
    notes
) VALUES (
    'NQ-7821',
    'م. أحمد عبد الرحمن',
    '01007245515',
    '01006672783',
    'التجمع الخامس (حي النرجس)',
    'الشيخ زايد (الخمائل)',
    '3 غرف',
    3,
    5,
    true,
    true,
    true,
    CURRENT_DATE + INTERVAL '2 days',
    3800,
    'جديد',
    'يرجى توفير ونش هيدروليكي للأدوار المرتفعة، عفش فاخر مودرن ويحتاج تغليف بابلز مضاعف.'
) ON CONFLICT (booking_code) DO NOTHING;
