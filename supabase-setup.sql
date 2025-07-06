-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  imageUrl TEXT,
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table (transactions)
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  amountPaid DECIMAL(10, 2) NOT NULL,
  change DECIMAL(10, 2) NOT NULL,
  paymentMethod TEXT NOT NULL,
  workerId TEXT NOT NULL,
  workerEmail TEXT NOT NULL,
  isVoiceTransaction BOOLEAN DEFAULT false,
  voiceInput TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  workerId TEXT NOT NULL,
  workerEmail TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sales_timestamp ON sales(timestamp);
CREATE INDEX idx_sales_worker ON sales(workerEmail);
CREATE INDEX idx_expenses_timestamp ON expenses(timestamp);
CREATE INDEX idx_expenses_worker ON expenses(workerEmail);
CREATE INDEX idx_products_category ON products(category);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to perform all operations
CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON sales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON expenses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policies for anonymous users (if needed for demo mode)
CREATE POLICY "Allow read for anonymous users" ON products
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow read for anonymous users" ON sales
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow read for anonymous users" ON expenses
  FOR SELECT TO anon USING (true);