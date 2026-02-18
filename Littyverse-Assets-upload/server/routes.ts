import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { processContentGeneration } from "./contentGeneration";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === AUTHENTICATION ===
  await setupAuth(app);
  registerAuthRoutes(app);

  // === INTEGRATIONS ===
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === APP ROUTES ===

  // Creator Profiles
  app.get(api.creator.get.path, async (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }
    const profile = await storage.getCreator(userId);
    if (!profile) {
      return res.status(404).json({ message: "Creator profile not found" });
    }
    res.json(profile);
  });

  app.post(api.creator.create.path, async (req, res) => {
    try {
      const input = api.creator.create.input.parse(req.body);
      const profile = await storage.createCreator(input);
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({ message: first?.message ?? "Validation failed" });
      }
      throw err;
    }
  });

  app.put(api.creator.update.path, async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ message: "Missing userId" });
      }
      const input = api.creator.update.input.parse(req.body);
      const profile = await storage.updateCreator(userId, input);
      if (!profile) {
        return res.status(404).json({ message: "Creator profile not found" });
      }
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({ message: first?.message ?? "Validation failed" });
      }
      throw err;
    }
  });

  // Content (Video/Image)
  app.get(api.content.list.path, async (req, res) => {
    const userId = req.query.userId as string;
    const type = req.query.type as string;
    const content = await storage.listContent(userId, type);
    res.json(content);
  });

  app.post(api.content.create.path, async (req, res) => {
    try {
      const input = api.content.create.input.parse(req.body);
      const content = await storage.createContent(input);
      processContentGeneration(content.id).catch((err) =>
        console.error(`Background generation error for content ${content.id}:`, err)
      );
      res.status(201).json(content);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({ message: first?.message ?? "Validation failed" });
      }
      throw err;
    }
  });

  app.get(api.content.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      return res.status(400).json({ message: "Invalid content id" });
    }
    const content = await storage.getContent(id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(content);
  });

  // Marketplace
  app.get(api.marketplace.list.path, async (req, res) => {
    const items = await storage.getMarketplaceItems();
    res.json(items);
  });

  app.post(api.marketplace.create.path, async (req, res) => {
    try {
      const input = api.marketplace.create.input.parse(req.body);
      const item = await storage.createMarketplaceItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({ message: first?.message ?? "Validation failed" });
      }
      throw err;
    }
  });

  // === STRIPE ROUTES ===

  app.get('/api/stripe/publishable-key', async (_req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (err) {
      res.status(500).json({ message: "Failed to get Stripe key" });
    }
  });

  app.get('/api/stripe/products', async (_req, res) => {
    try {
      const rows = await storage.listStripeProductsWithPrices();
      const productsMap = new Map<string, any>();
      for (const row of rows) {
        if (!productsMap.has(row.product_id as string)) {
          productsMap.set(row.product_id as string, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          const product = productsMap.get(row.product_id as string);
          if (product) product.prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
          });
        }
      }
      res.json({ data: Array.from(productsMap.values()) });
    } catch (err) {
      res.status(500).json({ message: "Failed to list products" });
    }
  });

  app.post('/api/stripe/checkout', async (req, res) => {
    try {
      const { priceId, customerId, customerEmail } = req.body as { priceId?: string; customerId?: string; customerEmail?: string };
      if (!priceId) {
        return res.status(400).json({ message: "priceId is required" });
      }
      const host = req.get("host") || "localhost";
      const base = `${req.protocol}://${host}`;
      const session = await stripeService.createCheckoutSession(
        customerId || undefined,
        priceId,
        `${base}/checkout/success`,
        `${base}/checkout/cancel`,
        customerEmail
      );
      if (!session.url) {
        return res.status(502).json({ message: "Checkout session has no URL" });
      }
      res.json({ url: session.url });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      res.status(500).json({ message });
    }
  });

  return httpServer;
}
