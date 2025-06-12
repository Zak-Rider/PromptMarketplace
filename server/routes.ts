import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFavoriteSchema, insertCartItemSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, authenticateToken, optionalAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware and routes
  setupAuth(app);
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Prompts
  app.get("/api/prompts", async (req, res) => {
    try {
      const { categoryId, search, featured, trending, isNew, limit, offset } = req.query;
      
      const filters = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        trending: trending === 'true' ? true : trending === 'false' ? false : undefined,
        isNew: isNew === 'true' ? true : isNew === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const prompts = await storage.getAllPrompts(filters);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prompt = await storage.getPromptById(id);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prompt" });
    }
  });

  // Favorites - requires authentication
  app.get("/api/favorites", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertFavoriteSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if already favorited
      const isFavorited = await storage.isFavorited(userId, validatedData.promptId);
      if (isFavorited) {
        return res.status(400).json({ message: "Already in favorites" });
      }
      
      const favorite = await storage.addToFavorites(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:promptId", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const promptId = parseInt(req.params.promptId);
      
      const removed = await storage.removeFromFavorites(userId, promptId);
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Cart
  app.get("/api/cart", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const cartItems = await storage.getUserCart(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if already in cart
      const isInCart = await storage.isInCart(userId, validatedData.promptId);
      if (isInCart) {
        return res.status(400).json({ message: "Already in cart" });
      }
      
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.delete("/api/cart/:promptId", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const promptId = parseInt(req.params.promptId);
      
      const removed = await storage.removeFromCart(userId, promptId);
      if (!removed) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      
      res.json({ message: "Removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Reviews
  app.get("/api/prompts/:id/reviews", async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      const reviews = await storage.getPromptReviews(promptId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/prompts/:id/reviews", async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      const userId = 1; // Mock user ID
      
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        promptId,
        userId
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const allPrompts = await storage.getAllPrompts();
      const allCategories = await storage.getAllCategories();
      
      const stats = {
        totalPrompts: allPrompts.length,
        activeUsers: 8924, // Mock data
        categoriesCount: allCategories.length,
        totalEarnings: "2000000", // Mock data
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
