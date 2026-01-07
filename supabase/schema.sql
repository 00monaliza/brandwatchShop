-- ============================================
-- SUPABASE DATABASE SCHEMA FOR BRAND WATCH SHOP
-- ============================================
-- Run these SQL commands in Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PRODUCTS TABLE (Товары/Часы)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  old_price DECIMAL(12, 2),
  description TEXT,
  specifications JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  gender VARCHAR(20) CHECK (gender IN ('men', 'women', 'unisex')),
  is_new BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster searches
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- ============================================
-- 2. PROFILES TABLE (Профили пользователей)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  addresses JSONB DEFAULT '[]',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. ORDERS TABLE (Заказы)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  items JSONB NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  shipping_cost DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  payment_method VARCHAR(50) DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- ============================================
-- 4. FAVORITES TABLE (Избранное)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- ============================================
-- 5. CART ITEMS TABLE (Корзина)
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- ============================================
-- 6. TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read, only admins can modify
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Orders: Users can view/create their own orders, admins can view all
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Cart: Users can manage their own cart
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to cart"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update cart"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from cart"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. INSERT SAMPLE PRODUCTS
-- ============================================
INSERT INTO products (name, brand, price, old_price, description, specifications, images, category, gender, is_new, in_stock, stock_quantity)
VALUES
  (
    'Seamaster Aqua Terra',
    'OMEGA',
    5500000,
    6200000,
    'Элегантные часы Seamaster Aqua Terra воплощают морское наследие OMEGA. Модель оснащена мастер-хронометром калибра 8900.',
    '{"Механизм": "Автоматический, Калибр 8900", "Корпус": "Нержавеющая сталь 316L", "Диаметр": "41 мм", "Водозащита": "150 метров", "Стекло": "Сапфировое"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
    'classic',
    'men',
    true,
    true,
    5
  ),
  (
    'Speedmaster Moonwatch',
    'OMEGA',
    7200000,
    8000000,
    'Легендарные часы, побывавшие на Луне. Speedmaster Professional Moonwatch с ручным заводом.',
    '{"Механизм": "Ручной завод, Калибр 1861", "Корпус": "Нержавеющая сталь", "Диаметр": "42 мм", "Водозащита": "50 метров", "Стекло": "Hesalite"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600'],
    'sport',
    'men',
    false,
    true,
    3
  ),
  (
    'Datejust 41',
    'Rolex',
    9500000,
    NULL,
    'Классические часы Rolex Datejust 41 с механизмом Calibre 3235 и запасом хода 70 часов.',
    '{"Механизм": "Автоматический, Calibre 3235", "Корпус": "Oystersteel", "Диаметр": "41 мм", "Водозащита": "100 метров", "Стекло": "Сапфировое с циклопом"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600'],
    'classic',
    'men',
    true,
    true,
    2
  ),
  (
    'Carrera Chronograph',
    'TAG Heuer',
    4200000,
    4800000,
    'Спортивный хронограф TAG Heuer Carrera с тахиметрической шкалой и тремя субциферблатами.',
    '{"Механизм": "Автоматический, Calibre Heuer 02", "Корпус": "Нержавеющая сталь", "Диаметр": "44 мм", "Водозащита": "100 метров", "Запас хода": "80 часов"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600'],
    'sport',
    'men',
    false,
    true,
    7
  ),
  (
    'Constellation',
    'OMEGA',
    4800000,
    NULL,
    'Изысканные женские часы OMEGA Constellation с бриллиантовым безелем.',
    '{"Механизм": "Кварцевый", "Корпус": "Нержавеющая сталь с золотом", "Диаметр": "28 мм", "Водозащита": "100 метров", "Стекло": "Сапфировое"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600'],
    'luxury',
    'women',
    true,
    true,
    4
  ),
  (
    'Navitimer B01',
    'Breitling',
    6800000,
    7500000,
    'Культовые авиационные часы Breitling Navitimer с логарифмической линейкой.',
    '{"Механизм": "Автоматический, B01", "Корпус": "Нержавеющая сталь", "Диаметр": "43 мм", "Водозащита": "30 метров", "Запас хода": "70 часов"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600'],
    'pilot',
    'men',
    false,
    true,
    3
  ),
  (
    'Submariner Date',
    'Rolex',
    12500000,
    NULL,
    'Легендарные дайверские часы Rolex Submariner Date с керамическим безелем Cerachrom.',
    '{"Механизм": "Автоматический, Calibre 3235", "Корпус": "Oystersteel", "Диаметр": "41 мм", "Водозащита": "300 метров", "Стекло": "Сапфировое"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600'],
    'diver',
    'men',
    true,
    true,
    1
  ),
  (
    'Tank Française',
    'Cartier',
    8200000,
    NULL,
    'Элегантные часы Cartier Tank Française с характерной прямоугольной формой.',
    '{"Механизм": "Кварцевый", "Корпус": "Нержавеющая сталь", "Размер": "Средний", "Водозащита": "30 метров", "Стекло": "Сапфировое"}'::jsonb,
    ARRAY['https://images.unsplash.com/photo-1587925358603-c2eea5305bbc?w=600'],
    'luxury',
    'women',
    false,
    true,
    2
  );

-- ============================================
-- 10. STORE SETTINGS TABLE (Настройки магазина)
-- ============================================
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Только одна запись
  store_name VARCHAR(255) DEFAULT 'brandwatch',
  logo_url TEXT,
  currency VARCHAR(10) DEFAULT '$',
  
  -- Контактная информация
  whatsapp VARCHAR(50),
  telegram VARCHAR(100),
  email VARCHAR(255),
  address TEXT,
  working_hours VARCHAR(255),
  instagram VARCHAR(255),
  
  -- Способы оплаты
  payment_methods JSONB DEFAULT '[{"id": 1, "name": "Kaspi", "enabled": true}, {"id": 2, "name": "Карта", "enabled": true}, {"id": 3, "name": "Наличные", "enabled": true}]',
  bank_details TEXT,
  
  -- Настройки уведомлений
  notifications JSONB DEFAULT '{"telegramBotToken": "", "telegramChatId": "", "onNewOrder": true, "onOrderStatusChange": false, "onLowStock": false}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO store_settings (id, store_name, whatsapp, telegram, email)
VALUES (1, 'brandwatch', '+77778115151', '@baikadamov_a', 'info@brandwatch.kz')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Settings are viewable by everyone"
  ON store_settings FOR SELECT
  USING (true);

-- Allow upsert for settings (needed for initial insert)
CREATE POLICY "Allow settings upsert"
  ON store_settings FOR INSERT
  WITH CHECK (true);

-- Allow update settings (для простоты разрешаем всем, в продакшене можно ограничить)
-- В будущем можно ограничить только для админов через auth.uid()
CREATE POLICY "Allow settings update"
  ON store_settings FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. CREATE STORAGE BUCKETS FOR IMAGES
-- ============================================
-- Run this in Supabase Dashboard -> Storage -> New Bucket

-- Bucket 1: product-images
-- Bucket name: product-images
-- Public: Yes
-- Description: Хранилище изображений товаров

-- Bucket 2: store-assets
-- Bucket name: store-assets
-- Public: Yes
-- Description: Хранилище логотипа и других ассетов магазина

-- ВАЖНО: После создания бакетов в Supabase Dashboard, 
-- добавьте политики доступа через SQL Editor:

-- Storage Policy для store-assets (публичное чтение, загрузка для всех)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('store-assets', 'store-assets', true);

-- Политика: любой может читать файлы из store-assets
-- CREATE POLICY "Public Access store-assets" ON storage.objects FOR SELECT USING (bucket_id = 'store-assets');

-- Политика: любой может загружать файлы в store-assets
-- CREATE POLICY "Allow uploads store-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-assets');

-- Политика: любой может удалять файлы из store-assets
-- CREATE POLICY "Allow deletes store-assets" ON storage.objects FOR DELETE USING (bucket_id = 'store-assets');

-- Политика: любой может обновлять файлы в store-assets
-- CREATE POLICY "Allow updates store-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'store-assets');
