import { creatorProfiles, generatedContent, marketplaceItems, type InsertCreatorProfile, type InsertGeneratedContent, type InsertMarketplaceItem } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Creator Profiles
  getCreator(userId: string): Promise<typeof creatorProfiles.$inferSelect | undefined>;
  createCreator(profile: InsertCreatorProfile): Promise<typeof creatorProfiles.$inferSelect>;
  updateCreator(userId: string, updates: Partial<InsertCreatorProfile>): Promise<typeof creatorProfiles.$inferSelect>;

  // Content
  getContent(id: number): Promise<typeof generatedContent.$inferSelect | undefined>;
  listContent(userId?: string, type?: string): Promise<(typeof generatedContent.$inferSelect)[]>;
  createContent(content: InsertGeneratedContent): Promise<typeof generatedContent.$inferSelect>;
  updateContent(id: number, updates: Partial<InsertGeneratedContent>): Promise<typeof generatedContent.$inferSelect>;

  // Marketplace
  getMarketplaceItems(): Promise<(typeof marketplaceItems.$inferSelect)[]>;
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<typeof marketplaceItems.$inferSelect>;
}

export class DatabaseStorage implements IStorage {
  // Stripe queries (reads from stripe schema managed by stripe-replit-sync)
  async getStripeProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async listStripeProducts(active = true) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active}`
    );
    return result.rows;
  }

  async listStripeProductsWithPrices(active = true) {
    const result = await db.execute(
      sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = ${active}
        ORDER BY p.id, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getStripeSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }


  async getCreator(userId: string) {
    const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId));
    return profile;
  }

  async createCreator(profile: InsertCreatorProfile) {
    const [newProfile] = await db.insert(creatorProfiles).values(profile).returning();
    if (!newProfile) throw new Error("createCreator: insert returned no row");
    return newProfile;
  }

  async updateCreator(userId: string, updates: Partial<InsertCreatorProfile>) {
    const [updated] = await db.update(creatorProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(creatorProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getContent(id: number) {
    const [content] = await db.select().from(generatedContent).where(eq(generatedContent.id, id));
    return content;
  }

  async listContent(userId?: string, type?: string) {
    const conditions = [];
    if (userId) conditions.push(eq(generatedContent.userId, userId));
    if (type) conditions.push(eq(generatedContent.type, type));
    const base = db.select().from(generatedContent);
    const query = conditions.length > 0 ? base.where(and(...conditions)) : base;
    return query.orderBy(desc(generatedContent.createdAt));
  }

  async createContent(content: InsertGeneratedContent) {
    const [newContent] = await db.insert(generatedContent).values(content).returning();
    if (!newContent) throw new Error("createContent: insert returned no row");
    return newContent;
  }

  async updateContent(id: number, updates: Partial<InsertGeneratedContent>) {
    const [updated] = await db.update(generatedContent)
      .set(updates)
      .where(eq(generatedContent.id, id))
      .returning();
    return updated;
  }

  async getMarketplaceItems() {
    return db.select().from(marketplaceItems).where(eq(marketplaceItems.isActive, true)).orderBy(desc(marketplaceItems.createdAt));
  }

  async createMarketplaceItem(item: InsertMarketplaceItem) {
    const [newItem] = await db.insert(marketplaceItems).values(item).returning();
    if (!newItem) throw new Error("createMarketplaceItem: insert returned no row");
    return newItem;
  }
}

export const storage = new DatabaseStorage();
