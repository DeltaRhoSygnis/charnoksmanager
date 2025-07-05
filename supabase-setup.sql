
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  description TEXT,
  imageUrl TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  amountPaid DECIMAL(10,2) NOT NULL,
  change DECIMAL(10,2) NOT NULL,
  paymentMethod TEXT NOT NULL,
  workerId TEXT,
  workerEmail TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  isVoiceTransaction BOOLEAN DEFAULT false,
  voiceInput TEXT,
  status TEXT DEFAULT 'completed'
);

-- Create users table (for worker management)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'worker',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize based on your needs)
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access to transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all access to users" ON users FOR ALL USING (true);
