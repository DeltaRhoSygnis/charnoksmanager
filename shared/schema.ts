import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'owner' or 'worker'
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  items: json("items").notNull(), // Array of sale items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'card', 'digital'
  workerId: integer("worker_id").notNull(),
  workerEmail: text("worker_email").notNull(),
  isVoiceTransaction: boolean("is_voice_transaction").default(false),
  voiceInput: text("voice_input"),
  status: text("status").notNull().default("completed"), // 'completed', 'pending', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  workerId: integer("worker_id").notNull(),
  workerEmail: text("worker_email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sales: many(sales),
  expenses: many(expenses),
  createdByUser: one(users, {
    fields: [users.createdBy],
    references: [users.id],
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  worker: one(users, {
    fields: [sales.workerId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  worker: one(users, {
    fields: [expenses.workerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  createdBy: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  price: true,
  stock: true,
  category: true,
  imageUrl: true,
  description: true,
  isActive: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  items: true,
  totalAmount: true,
  amountPaid: true,
  change: true,
  paymentMethod: true,
  workerId: true,
  workerEmail: true,
  isVoiceTransaction: true,
  voiceInput: true,
  status: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  category: true,
  notes: true,
  workerId: true,
  workerEmail: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
