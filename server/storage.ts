import {
  users, categories, prompts, favorites, cartItems, reviews, purchases,
  type User, type InsertUser, type Category, type InsertCategory,
  type Prompt, type InsertPrompt, type Favorite, type InsertFavorite,
  type CartItem, type InsertCartItem, type Review, type InsertReview,
  type Purchase, type InsertPurchase, type PromptWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Prompts
  getAllPrompts(filters?: {
    categoryId?: number;
    authorId?: number;
    search?: string;
    featured?: boolean;
    trending?: boolean;
    isNew?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PromptWithDetails[]>;
  getPromptById(id: number): Promise<PromptWithDetails | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: number, updates: Partial<InsertPrompt>): Promise<Prompt | undefined>;

  // Favorites
  getUserFavorites(userId: number): Promise<PromptWithDetails[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: number, promptId: number): Promise<boolean>;
  isFavorited(userId: number, promptId: number): Promise<boolean>;

  // Cart
  getUserCart(userId: number): Promise<PromptWithDetails[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  removeFromCart(userId: number, promptId: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  isInCart(userId: number, promptId: number): Promise<boolean>;

  // Reviews
  getPromptReviews(promptId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getReviewCount(promptId: number): Promise<number>;

  // Purchases
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getUserPurchases(userId: number): Promise<PromptWithDetails[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private prompts: Map<number, Prompt>;
  private favorites: Map<number, Favorite>;
  private cartItems: Map<number, CartItem>;
  private reviews: Map<number, Review>;
  private purchases: Map<number, Purchase>;
  private currentIds: {
    users: number;
    categories: number;
    prompts: number;
    favorites: number;
    cartItems: number;
    reviews: number;
    purchases: number;
  };

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.prompts = new Map();
    this.favorites = new Map();
    this.cartItems = new Map();
    this.reviews = new Map();
    this.purchases = new Map();
    this.currentIds = {
      users: 1,
      categories: 1,
      prompts: 1,
      favorites: 1,
      cartItems: 1,
      reviews: 1,
      purchases: 1,
    };

    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoriesData = [
      { name: "Writing", slug: "writing", icon: "fas fa-pen-fancy", description: "Creative writing and content prompts" },
      { name: "Art & Design", slug: "art-design", icon: "fas fa-palette", description: "Visual art and design prompts" },
      { name: "Coding", slug: "coding", icon: "fas fa-code", description: "Programming and development prompts" },
      { name: "Business", slug: "business", icon: "fas fa-chart-line", description: "Business and marketing prompts" },
      { name: "Education", slug: "education", icon: "fas fa-graduation-cap", description: "Educational and learning prompts" },
      { name: "Gaming", slug: "gaming", icon: "fas fa-gamepad", description: "Game development and gaming prompts" },
    ];

    categoriesData.forEach(cat => {
      this.createCategory(cat);
    });

    // Seed users
    const usersData = [
      { username: "sarah_chen", email: "sarah@example.com", password: "password123", avatar: null },
      { username: "alex_rivera", email: "alex@example.com", password: "password123", avatar: null },
      { username: "mike_johnson", email: "mike@example.com", password: "password123", avatar: null },
    ];

    usersData.forEach(user => {
      this.createUser(user);
    });

    // Seed prompts
    const promptsData = [
      {
        title: "Master Blog Writer - SEO Optimized Content",
        description: "Create engaging, SEO-optimized blog posts that rank high on Google. Perfect for content marketers and bloggers.",
        content: "Write a comprehensive blog post about [TOPIC] that is optimized for SEO. Include relevant keywords, engaging headlines, and actionable content that provides value to readers...",
        price: "12.99",
        categoryId: 1,
        authorId: 1,
        rating: "4.9",
        salesCount: 847,
        featured: true,
        trending: false,
        isNew: false,
        tags: ["SEO", "Content Marketing", "Blogging"],
        previewImage: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      },
      {
        title: "Midjourney Art Master - Photorealistic Portraits",
        description: "Generate stunning photorealistic portraits with perfect lighting and composition. Ideal for artists and designers.",
        content: "Create a photorealistic portrait of [SUBJECT] with professional lighting, detailed facial features, and artistic composition...",
        price: "18.99",
        categoryId: 2,
        authorId: 2,
        rating: "4.7",
        salesCount: 523,
        featured: true,
        trending: true,
        isNew: false,
        tags: ["Midjourney", "Portraits", "Digital Art"],
        previewImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      },
      {
        title: "Full-Stack Developer Assistant",
        description: "Complete coding solutions from frontend to backend. Perfect for developers at all levels.",
        content: "Act as a senior full-stack developer and help create a [PROJECT TYPE] application with [TECHNOLOGIES]...",
        price: "24.99",
        categoryId: 3,
        authorId: 3,
        rating: "5.0",
        salesCount: 291,
        featured: true,
        trending: false,
        isNew: true,
        tags: ["Full-Stack", "Development", "Programming"],
        previewImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      }
    ];

    promptsData.forEach(prompt => {
      this.createPrompt(prompt);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Prompt methods
  async getAllPrompts(filters?: {
    categoryId?: number;
    authorId?: number;
    search?: string;
    featured?: boolean;
    trending?: boolean;
    isNew?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PromptWithDetails[]> {
    let prompts = Array.from(this.prompts.values());

    if (filters?.categoryId) {
      prompts = prompts.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters?.authorId) {
      prompts = prompts.filter(p => p.authorId === filters.authorId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      prompts = prompts.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters?.featured !== undefined) {
      prompts = prompts.filter(p => p.featured === filters.featured);
    }

    if (filters?.trending !== undefined) {
      prompts = prompts.filter(p => p.trending === filters.trending);
    }

    if (filters?.isNew !== undefined) {
      prompts = prompts.filter(p => p.isNew === filters.isNew);
    }

    // Sort by creation date (newest first)
    prompts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.offset) {
      prompts = prompts.slice(filters.offset);
    }

    if (filters?.limit) {
      prompts = prompts.slice(0, filters.limit);
    }

    return Promise.all(prompts.map(async prompt => await this.enrichPromptWithDetails(prompt)));
  }

  async getPromptById(id: number): Promise<PromptWithDetails | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;
    return this.enrichPromptWithDetails(prompt);
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.currentIds.prompts++;
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      createdAt: new Date(),
      rating: insertPrompt.rating || "0",
      salesCount: insertPrompt.salesCount || 0,
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async updatePrompt(id: number, updates: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;

    const updatedPrompt = { ...prompt, ...updates };
    this.prompts.set(id, updatedPrompt);
    return updatedPrompt;
  }

  private async enrichPromptWithDetails(prompt: Prompt): Promise<PromptWithDetails> {
    const category = await this.getCategoryById(prompt.categoryId);
    const author = await this.getUser(prompt.authorId);
    const reviewCount = await this.getReviewCount(prompt.id);

    return {
      ...prompt,
      category: category!,
      author: {
        id: author!.id,
        username: author!.username,
        avatar: author!.avatar,
      },
      reviewCount,
    };
  }

  // Favorites methods
  async getUserFavorites(userId: number): Promise<PromptWithDetails[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId);
    
    const prompts = await Promise.all(
      userFavorites.map(fav => this.getPromptById(fav.promptId))
    );
    
    return prompts.filter(Boolean) as PromptWithDetails[];
  }

  async addToFavorites(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentIds.favorites++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: number, promptId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values())
      .find(fav => fav.userId === userId && fav.promptId === promptId);
    
    if (favorite) {
      this.favorites.delete(favorite.id);
      return true;
    }
    return false;
  }

  async isFavorited(userId: number, promptId: number): Promise<boolean> {
    return Array.from(this.favorites.values())
      .some(fav => fav.userId === userId && fav.promptId === promptId);
  }

  // Cart methods
  async getUserCart(userId: number): Promise<PromptWithDetails[]> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    const prompts = await Promise.all(
      userCartItems.map(item => this.getPromptById(item.promptId))
    );
    
    return prompts.filter(Boolean) as PromptWithDetails[];
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentIds.cartItems++;
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      createdAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async removeFromCart(userId: number, promptId: number): Promise<boolean> {
    const cartItem = Array.from(this.cartItems.values())
      .find(item => item.userId === userId && item.promptId === promptId);
    
    if (cartItem) {
      this.cartItems.delete(cartItem.id);
      return true;
    }
    return false;
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    userCartItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }

  async isInCart(userId: number, promptId: number): Promise<boolean> {
    return Array.from(this.cartItems.values())
      .some(item => item.userId === userId && item.promptId === promptId);
  }

  // Review methods
  async getPromptReviews(promptId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.promptId === promptId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentIds.reviews++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewCount(promptId: number): Promise<number> {
    return Array.from(this.reviews.values())
      .filter(review => review.promptId === promptId).length;
  }

  // Purchase methods
  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentIds.purchases++;
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      createdAt: new Date(),
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async getUserPurchases(userId: number): Promise<PromptWithDetails[]> {
    const userPurchases = Array.from(this.purchases.values())
      .filter(purchase => purchase.userId === userId);
    
    const prompts = await Promise.all(
      userPurchases.map(purchase => this.getPromptById(purchase.promptId))
    );
    
    return prompts.filter(Boolean) as PromptWithDetails[];
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        avatar: insertUser.avatar || null
      })
      .returning();
    return user;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values({
        ...insertCategory,
        description: insertCategory.description || null
      })
      .returning();
    return category;
  }

  async getAllPrompts(filters?: {
    categoryId?: number;
    authorId?: number;
    search?: string;
    featured?: boolean;
    trending?: boolean;
    isNew?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PromptWithDetails[]> {
    let query = db.select().from(prompts);

    if (filters?.categoryId) {
      query = query.where(eq(prompts.categoryId, filters.categoryId));
    }

    if (filters?.authorId) {
      query = query.where(eq(prompts.authorId, filters.authorId));
    }

    const promptResults = await query;
    let filteredPrompts = promptResults;

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredPrompts = filteredPrompts.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters?.featured !== undefined) {
      filteredPrompts = filteredPrompts.filter(p => p.featured === filters.featured);
    }

    if (filters?.trending !== undefined) {
      filteredPrompts = filteredPrompts.filter(p => p.trending === filters.trending);
    }

    if (filters?.isNew !== undefined) {
      filteredPrompts = filteredPrompts.filter(p => p.isNew === filters.isNew);
    }

    // Sort by creation date (newest first)
    filteredPrompts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.offset) {
      filteredPrompts = filteredPrompts.slice(filters.offset);
    }

    if (filters?.limit) {
      filteredPrompts = filteredPrompts.slice(0, filters.limit);
    }

    return Promise.all(filteredPrompts.map(async prompt => await this.enrichPromptWithDetails(prompt)));
  }

  async getPromptById(id: number): Promise<PromptWithDetails | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    if (!prompt) return undefined;
    return this.enrichPromptWithDetails(prompt);
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db
      .insert(prompts)
      .values({
        ...insertPrompt,
        featured: insertPrompt.featured || null,
        trending: insertPrompt.trending || null,
        isNew: insertPrompt.isNew || null,
        tags: insertPrompt.tags || null,
        previewImage: insertPrompt.previewImage || null
      })
      .returning();
    return prompt;
  }

  async updatePrompt(id: number, updates: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const [prompt] = await db
      .update(prompts)
      .set(updates)
      .where(eq(prompts.id, id))
      .returning();
    return prompt || undefined;
  }

  private async enrichPromptWithDetails(prompt: Prompt): Promise<PromptWithDetails> {
    const category = await this.getCategoryById(prompt.categoryId);
    const author = await this.getUser(prompt.authorId);
    const reviewCount = await this.getReviewCount(prompt.id);

    return {
      ...prompt,
      category: category!,
      author: {
        id: author!.id,
        username: author!.username,
        avatar: author!.avatar,
      },
      reviewCount,
    };
  }

  async getUserFavorites(userId: number): Promise<PromptWithDetails[]> {
    const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, userId));
    
    const promptPromises = userFavorites.map(fav => this.getPromptById(fav.promptId));
    const promptResults = await Promise.all(promptPromises);
    
    return promptResults.filter(Boolean) as PromptWithDetails[];
  }

  async addToFavorites(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values(insertFavorite)
      .returning();
    return favorite;
  }

  async removeFromFavorites(userId: number, promptId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.promptId, promptId)));
    return (result.rowCount || 0) > 0;
  }

  async isFavorited(userId: number, promptId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.promptId, promptId)));
    return !!favorite;
  }

  async getUserCart(userId: number): Promise<PromptWithDetails[]> {
    const userCartItems = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    
    const promptPromises = userCartItems.map(item => this.getPromptById(item.promptId));
    const promptResults = await Promise.all(promptPromises);
    
    return promptResults.filter(Boolean) as PromptWithDetails[];
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }

  async removeFromCart(userId: number, promptId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.promptId, promptId)));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return true;
  }

  async isInCart(userId: number, promptId: number): Promise<boolean> {
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.promptId, promptId)));
    return !!cartItem;
  }

  async getPromptReviews(promptId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.promptId, promptId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...insertReview,
        comment: insertReview.comment || null
      })
      .returning();
    return review;
  }

  async getReviewCount(promptId: number): Promise<number> {
    const reviewResults = await db.select().from(reviews).where(eq(reviews.promptId, promptId));
    return reviewResults.length;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values(insertPurchase)
      .returning();
    return purchase;
  }

  async getUserPurchases(userId: number): Promise<PromptWithDetails[]> {
    const userPurchases = await db.select().from(purchases).where(eq(purchases.userId, userId));
    
    const promptPromises = userPurchases.map(purchase => this.getPromptById(purchase.promptId));
    const promptResults = await Promise.all(promptPromises);
    
    return promptResults.filter(Boolean) as PromptWithDetails[];
  }
}

export const storage = new DatabaseStorage();
