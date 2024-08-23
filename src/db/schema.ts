import {
  // serial,
  pgTable,
  varchar,
  text,
  uuid,
  boolean,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const purchase = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("userId", { length: 100 }),
  purchaseName: varchar("itemName", { length: 256 }).notNull(),
  datePurchased: date("datePurchased").notNull(),
  priceTotal: integer("purchasePrice").notNull(),
  priceTax: integer("priceTax").notNull(),
  priceShipping: integer("priceShipping").notNull(),
  priceFees: integer("priceFees").notNull(),
  soldTotals: integer("soldTotals").default(0).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 100 }),
  purchaseNotes: varchar("purchaseNotes", { length: 5000 }),
});

export const listing = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("userId", { length: 100 }),
  listingName: varchar("listingName", { length: 256 }).notNull(),
  listingDate: date("listingDate").notNull(),
  listingPrice: integer("listingPrice"),
  listingSource: varchar("listingSource", { length: 100 }),
  listingSourceUrl: varchar("listingSourceUrl", { length: 100 }),
  listingSold: boolean("listingSold").default(false).notNull(),
  listingSoldPrice: integer("listingSoldPrice").default(0).notNull(),
  listingSoldShipping: integer("listingSoldShipping").default(0).notNull(),
  listingSoldFees: integer("listingSoldFees").default(0).notNull(),
  listingSoldDate: date("listingSoldDate"),
  listingNotes: varchar("listingNotes", { length: 5000 }),
});

export const item = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("userId", { length: 100 }),
  itemName: varchar("itemName", { length: 256 }).notNull(),
  purchaseId: uuid("purchaseId").references(() => purchase.id),
  listingId: uuid("listingId").references(() => listing.id),
  soldPriceTotal: integer("soldPriceTotal").notNull(),
  soldPriceShipping: integer("soldPriceShipping").notNull(),
  soldPriceFees: integer("soldPriceFees").notNull(),
  soldDate: date("soldDate"),
  isSold: boolean("isSold").default(false).notNull(),
  isListed: boolean("isListed").default(false).notNull(),
  listedSource: varchar("listedSource", { length: 100 }),
  listedSourceUrl: varchar("listedSourceUrl", { length: 100 }),
  itemNotes: varchar("itemNotes", { length: 5000 }),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("userId", { length: 100 }),
  emailAddress: varchar("emailAddress", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  primaryEmailAddressId: text("primaryEmailAddressId").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  // Square things
  isSubscribed: boolean("isSubscribed").default(false).notNull(),
  squareId: text("squareId"),
  subscriptionId: text("subscriptionId"),
  subscriptionCreatedAt: text("subscriptionCreatedAt"),
  subscriptionStatus: text("subscriptionStatus"),
  subscriptionCanceledDate: text("subscriptionCanceledDate"),
});

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("userId", { length: 100 }),
  sourceName: text("sourceName"),
  sourceLabel: text("sourceLabel"),
});

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  settingsId: uuid("settingsId"),
  userId: varchar("userId", { length: 100 }),
  theme: varchar("theme", { length: 100 }).default("light").notNull(),
});

export const sourceRelations = relations(sources, ({ one }) => ({
  users: one(users, {
    fields: [sources.userId],
    references: [users.userId],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  users: one(users, {
    fields: [settings.userId],
    references: [users.userId],
  }),
}));

export const purchaseRelations = relations(purchase, ({ one, many }) => ({
  items: many(item),
  users: one(users, {
    fields: [purchase.userId],
    references: [users.userId],
  }),
}));

export const listingRelations = relations(listing, ({ one, many }) => ({
  items: many(item),
  users: one(users, {
    fields: [listing.userId],
    references: [users.userId],
  }),
}));

export const itemRelations = relations(item, ({ one }) => ({
  purchase: one(purchase, {
    fields: [item.purchaseId],
    references: [purchase.id],
  }),
  listing: one(listing, {
    fields: [item.listingId],
    references: [listing.id],
  }),
  users: one(users, {
    fields: [item.userId],
    references: [users.userId],
  }),
}));

// ── Zod types ───────────────────────────────────────────────────────
export const selectPurchaseFormSchema = createSelectSchema(purchase);
export const insertPurchaseFormSchema = createInsertSchema(purchase);
export const selectListingFormSchema = createSelectSchema(listing);
export const insertListingFormSchema = createInsertSchema(listing);
export const selectItemFormSchema = createSelectSchema(item);
export const insertItemFormSchema = createInsertSchema(item);
export const selectUserSettingsSchema = createSelectSchema(settings);

// ── Typescript types ─────────────────────────────────────────
export type DbPurchaseSelect = InferSelectModel<typeof purchase>;
export type DbPurchaseInsert = InferInsertModel<typeof purchase>;
export type DbListingSelect = InferSelectModel<typeof listing>;
export type DbListingInsert = InferInsertModel<typeof listing>;
export type DbItemSelect = InferSelectModel<typeof item>;
export type DbItemInsert = InferInsertModel<typeof item>;
export type DbUserSettings = InferSelectModel<typeof settings>;
export type DbSources = InferSelectModel<typeof sources>;
