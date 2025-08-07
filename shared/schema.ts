import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<"buyer" | "seller">(),
  avatarUrl: text("avatar_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalDatasets: integer("total_datasets").default(0),
  totalPurchases: integer("total_purchases").default(0),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  isVerified: boolean("is_verified").default(false),
  otpCode: text("otp_code"),
  otpExpires: timestamp("otp_expires"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Datasets table
export const datasets = pgTable("datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  format: text("format").notNull(),
  dataType: text("data_type").notNull(),
  license: text("license").notNull(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  downloads: integer("downloads").default(0),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Dataset requests table
export const datasetRequests = pgTable("dataset_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }).notNull(),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }).notNull(),
  deadline: timestamp("deadline").notNull(),
  status: text("status").notNull().$type<"open" | "in_progress" | "fulfilled" | "cancelled">().default("open"),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  acceptedProposalId: varchar("accepted_proposal_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Proposals table
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => datasetRequests.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  deliveryTime: integer("delivery_time").notNull(), // in days
  coverLetter: text("cover_letter").notNull(),
  status: text("status").notNull().$type<"pending" | "accepted" | "rejected">().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  datasetId: varchar("dataset_id").notNull().references(() => datasets.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().$type<"pending" | "completed" | "failed">().default("pending"),
  purchasedAt: timestamp("purchased_at").default(sql`CURRENT_TIMESTAMP`),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  datasetId: varchar("dataset_id").references(() => datasets.id),
  requestId: varchar("request_id").references(() => datasetRequests.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  totalDatasets: true,
  totalPurchases: true,
  totalEarnings: true,
  isVerified: true,
  otpCode: true,
  otpExpires: true,
  stripeCustomerId: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloads: true,
  isAvailable: true,
});

export const insertDatasetRequestSchema = createInsertSchema(datasetRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  acceptedProposalId: true,
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchasedAt: true,
  status: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Dataset = typeof datasets.$inferSelect;
export type DatasetRequest = typeof datasetRequests.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type InsertDatasetRequest = z.infer<typeof insertDatasetRequestSchema>;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
