import { db } from './db';
import { users, products, sales, expenses } from '@shared/schema';

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database tables...');
    
    // Test connection first
    await db.select().from(users).limit(1);
    console.log('✅ Database connection successful');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    // Add sample data if tables are empty
    const existingProducts = await db.select().from(products).limit(1);
    
    if (existingProducts.length === 0) {
      console.log('🌱 Seeding database with sample data...');
      
      // Add sample products
      await db.insert(products).values([
        {
          name: 'Sample Product 1',
          price: '10.00',
          stock: 50,
          category: 'Food',
          description: 'Sample food item'
        },
        {
          name: 'Sample Product 2', 
          price: '5.50',
          stock: 30,
          category: 'Drink',
          description: 'Sample drink item'
        }
      ]);
      
      console.log('✅ Database seeded successfully');
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
}