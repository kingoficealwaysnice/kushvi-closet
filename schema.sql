-- SQL migration script for Kushvi Closet

-- 0. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers/tables if they exist (for clean setup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('tops', 'dresses', 'co-ords', 'bottoms', 'ethnic', 'accessories');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'customer'::user_role NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    gst_number TEXT,
    bank_details JSONB DEFAULT '{}'::jsonb,
    pincode_serviceable TEXT[] DEFAULT '{}'::TEXT[],
    rating NUMERIC DEFAULT 5.0,
    total_orders_fulfilled INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category product_category NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    sizes TEXT[] DEFAULT '{}'::TEXT[],
    colors JSONB DEFAULT '[]'::JSONB, -- Array of {name, hex}
    images TEXT[] DEFAULT '{}'::TEXT[],
    ai_avatar_image TEXT,
    stock_count INTEGER DEFAULT 0,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    pinterest_inspired BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Cart Table
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id, size, color)
);

ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- 5. Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    items JSONB NOT NULL, -- Array of [{product_id, name, size, color, qty, price}]
    subtotal NUMERIC NOT NULL,
    shipping_fee NUMERIC DEFAULT 0 NOT NULL,
    total_amount NUMERIC NOT NULL,
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    payment_id TEXT,
    payment_status payment_status DEFAULT 'pending'::payment_status NOT NULL,
    shipping_address JSONB NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    images TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 8. Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES --

-- 1. Users policies
CREATE POLICY "Users can view their own profiles" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do everything on users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'::user_role
        )
    );

-- 2. Vendors policies
CREATE POLICY "Anyone can view approved vendors" ON public.vendors
    FOR SELECT USING (is_approved = true OR auth.uid() = id);

CREATE POLICY "Vendors can update their own details" ON public.vendors
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all vendors" ON public.vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'::user_role
        )
    );

-- 3. Products policies
CREATE POLICY "Anyone can select active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can manage their own products" ON public.products
    FOR ALL USING (
        auth.uid() = vendor_id OR 
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'::user_role
        )
    );

-- 4. Cart policies
CREATE POLICY "Users can manage their own cart" ON public.cart
    FOR ALL USING (auth.uid() = user_id);

-- 5. Wishlist policies
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
    FOR ALL USING (auth.uid() = user_id);

-- 6. Orders policies
CREATE POLICY "Users can select their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can view/manage orders for their shop" ON public.orders
    FOR ALL USING (
        auth.uid() = vendor_id OR
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'::user_role
        )
    );

-- 7. Reviews policies
CREATE POLICY "Anyone can select reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Addresses policies
CREATE POLICY "Users can manage their own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);


-- PROFILE SYNCHRONIZATION FUNCTION --
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, avatar_url, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Valued Customer'),
    'customer'::user_role,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- OPTIONAL: SEED DATA FOR KUSHVI CLOSET
-- Run the following statements in the SQL Editor to populate initial products and vendors.
-- ==========================================

-- 1. Insert seed users (vendors)
INSERT INTO public.users (id, email, full_name, role, avatar_url, phone)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'vendor1@kushvicloset.com', 'Maison de Luxe', 'vendor', null, null),
  ('00000000-0000-0000-0000-000000000002', 'vendor2@kushvicloset.com', 'Atelier Velvet', 'vendor', null, null),
  ('00000000-0000-0000-0000-000000000003', 'vendor3@kushvicloset.com', 'Chic Wardrobe', 'vendor', null, null)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert seed vendors details
INSERT INTO public.vendors (id, shop_name, gst_number, bank_details, pincode_serviceable, rating, total_orders_fulfilled, is_approved)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Maison de Luxe', '27AAAAA1111A1Z1', '{}'::jsonb, '{400001, 110001, 560001}'::text[], 4.9, 230, true),
  ('00000000-0000-0000-0000-000000000002', 'Atelier Velvet', '27BBBBB2222B2Z2', '{}'::jsonb, '{400002, 110002, 560002}'::text[], 4.8, 145, true),
  ('00000000-0000-0000-0000-000000000003', 'Chic Wardrobe', '27CCCCC3333C3Z3', '{}'::jsonb, '{400003, 110003, 560003}'::text[], 4.7, 89, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert seed products
INSERT INTO public.products (id, name, description, price, original_price, category, tags, sizes, colors, images, ai_avatar_image, stock_count, vendor_id, is_active, is_featured, pinterest_inspired)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'Rose Whisper Silk Maxi Dress',
    'An elegant, flowy silk maxi dress with delicate spaghetti straps and a tiered skirt. Perfect for summer afternoons and sunset dinners. Sourced directly from Pinterest trends.',
    1899,
    2499,
    'dresses'::product_category,
    '{boho, pastel, summer, maxi, silk}'::text[],
    '{XS, S, M, L}'::text[],
    '[{"name": "Blush", "hex": "#F2A7BB"}, {"name": "Ivory", "hex": "#FFFFF0"}]'::jsonb,
    '{https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    8,
    '00000000-0000-0000-0000-000000000001',
    true,
    true,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'Sage Meadows Linen Co-ord',
    'Breathable pure linen two-piece co-ord set featuring a button-down shirt and relaxed-fit trousers. Unbelievably comfortable and chic for casual workspace and brunch.',
    2299,
    2999,
    'co-ords'::product_category,
    '{linen, co-ord, pastel, sage, summer}'::text[],
    '{S, M, L, XL}'::text[],
    '[{"name": "Sage", "hex": "#B8D8D8"}, {"name": "Ivory", "hex": "#FFFFF0"}]'::jsonb,
    '{https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    4,
    '00000000-0000-0000-0000-000000000002',
    true,
    true,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'Ivory Dream Satin Crop Top',
    'Luxurious heavy-weight satin top with a cowl neckline and crossover tie-back. Effortlessly catches the light, elevating any high-rise denim look.',
    999,
    1499,
    'tops'::product_category,
    '{crop, satin, ivory, chic}'::text[],
    '{XS, S, M}'::text[],
    '[{"name": "Ivory", "hex": "#FFFFF0"}, {"name": "Onyx", "hex": "#2C2C2C"}]'::jsonb,
    '{https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    12,
    '00000000-0000-0000-0000-000000000001',
    true,
    false,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'Peach Sorbet Tiered Skirt',
    'Flowy, high-waisted cotton tiered midi skirt with a soft elasticated waistband. Adds a whimsical, feminine touch to your day wear.',
    1499,
    1999,
    'bottoms'::product_category,
    '{skirt, tiered, pastel, cotton, boho}'::text[],
    '{S, M, L, XL}'::text[],
    '[{"name": "Blush", "hex": "#F2A7BB"}]'::jsonb,
    '{https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    2,
    '00000000-0000-0000-0000-000000000003',
    true,
    true,
    false
  ),
  (
    'e0000000-0000-0000-0000-000000000005',
    'Lavender Haze Georgette Anarkali',
    'Stunning georgette Anarkali suit set with heavy embroidery on the yoke and a matching organza dupatta. Ideal for festivals and pre-wedding events.',
    3499,
    4999,
    'ethnic'::product_category,
    '{ethnic, anarkali, lavender, embroidery, festive}'::text[],
    '{S, M, L, XL}'::text[],
    '[{"name": "Lavender", "hex": "#E6E6FA"}]'::jsonb,
    '{https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    15,
    '00000000-0000-0000-0000-000000000002',
    true,
    true,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000006',
    'Olive Garden Classic Blazer',
    'An oversized double-breasted blazer with structured shoulders and pockets. Styled perfectly for a business-casual Pinterest outfit.',
    2899,
    3799,
    'tops'::product_category,
    '{blazer, casual, olive, outerwear, autumn}'::text[],
    '{S, M, L}'::text[],
    '[{"name": "Olive", "hex": "#808000"}]'::jsonb,
    '{https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
    5,
    '00000000-0000-0000-0000-000000000001',
    true,
    false,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000007',
    'Onyx Nights Side Slit Slip Dress',
    'A premium bias-cut black slip dress made from heavy silk satin, featuring a cowl neckline and an adjustable thigh-high slit.',
    1999,
    2799,
    'dresses'::product_category,
    '{black, dress, satin, slip, night}'::text[],
    '{XS, S, M, L}'::text[],
    '[{"name": "Onyx", "hex": "#2C2C2C"}]'::jsonb,
    '{https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    3,
    '00000000-0000-0000-0000-000000000003',
    true,
    true,
    false
  ),
  (
    'e0000000-0000-0000-0000-000000000008',
    'Baroque Pearl Droplet Earrings',
    'Artisanal gold-plated statement earrings featuring dangling natural freshwater baroque pearls. Highly coveted on Pinterest mood boards.',
    499,
    799,
    'accessories'::product_category,
    '{pearl, earrings, jewelry, baroque, vintage}'::text[],
    '{One Size}'::text[],
    '[{"name": "Ivory", "hex": "#FFFFF0"}]'::jsonb,
    '{https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1590548784585-645d8b7f3a2a?w=800&auto=format&fit=crop&q=80}'::text[],
    null,
    20,
    '00000000-0000-0000-0000-000000000001',
    true,
    false,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000009',
    'Cotton Candy Linen Shorts',
    'Relaxed high-waisted shorts in a beautiful pastel rose hue. Features side pockets and a comfy soft gathered elastic waistband.',
    1199,
    1699,
    'bottoms'::product_category,
    '{linen, shorts, pink, pastel, summer}'::text[],
    '{S, M, L}'::text[],
    '[{"name": "Blush", "hex": "#F2A7BB"}]'::jsonb,
    '{https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    6,
    '00000000-0000-0000-0000-000000000002',
    true,
    false,
    false
  ),
  (
    'e0000000-0000-0000-0000-000000000010',
    'Classic Silk Slip Cami',
    'Feminine cowl neck slip cami top in a buttery cream color. Made from lightweight silk with adjustable back crossing straps.',
    899,
    1299,
    'tops'::product_category,
    '{cami, tops, silk, cream, chic}'::text[],
    '{XS, S, M, L}'::text[],
    '[{"name": "Ivory", "hex": "#FFFFF0"}]'::jsonb,
    '{https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    9,
    '00000000-0000-0000-0000-000000000001',
    true,
    false,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000011',
    'Desert Sands Linen Wide-Leg Pants',
    'Elegant, high-waisted linen wide-leg pants with a relaxed silhouette. A standard base layer for clean Pinterest fashion lookbooks.',
    1799,
    2499,
    'bottoms'::product_category,
    '{pants, linen, wide-leg, beige, minimalist}'::text[],
    '{S, M, L, XL}'::text[],
    '[{"name": "Ivory", "hex": "#FFFFF0"}]'::jsonb,
    '{https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80}'::text[],
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    3,
    '00000000-0000-0000-0000-000000000003',
    true,
    false,
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000012',
    'Gilded Petal Claw Clip',
    'Heavy-duty metal hair claw clip in a glossy rose gold flower design. Instantly styles your daily messy-bun in aesthetic perfection.',
    349,
    599,
    'accessories'::product_category,
    '{claw, clip, hair, accessories, rose-gold}'::text[],
    '{One Size}'::text[],
    '[{"name": "Blush", "hex": "#F2A7BB"}]'::jsonb,
    '{https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1590548784585-645d8b7f3a2a?w=800&auto=format&fit=crop&q=80}'::text[],
    null,
    25,
    '00000000-0000-0000-0000-000000000002',
    true,
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

