import { db } from "./db";
import { users, categories, prompts } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed categories
  const categoriesData = [
    { name: "Writing", slug: "writing", icon: "fas fa-pen-fancy", description: "Creative writing and content prompts" },
    { name: "Art & Design", slug: "art-design", icon: "fas fa-palette", description: "Visual art and design prompts" },
    { name: "Coding", slug: "coding", icon: "fas fa-code", description: "Programming and development prompts" },
    { name: "Business", slug: "business", icon: "fas fa-chart-line", description: "Business and marketing prompts" },
    { name: "Education", slug: "education", icon: "fas fa-graduation-cap", description: "Educational and learning prompts" },
    { name: "Gaming", slug: "gaming", icon: "fas fa-gamepad", description: "Game development and gaming prompts" },
  ];

  console.log("Inserting categories...");
  const insertedCategories = await db.insert(categories).values(categoriesData).returning();
  console.log(`Inserted ${insertedCategories.length} categories`);

  // Seed users
  const usersData = [
    { username: "sarah_chen", email: "sarah@example.com", password: "password123", avatar: null },
    { username: "alex_rivera", email: "alex@example.com", password: "password123", avatar: null },
    { username: "mike_johnson", email: "mike@example.com", password: "password123", avatar: null },
  ];

  console.log("Inserting users...");
  const insertedUsers = await db.insert(users).values(usersData).returning();
  console.log(`Inserted ${insertedUsers.length} users`);

  // Seed prompts
  const promptsData = [
    {
      title: "Master Blog Writer - SEO Optimized Content",
      description: "Create engaging, SEO-optimized blog posts that rank high on Google. Perfect for content marketers and bloggers.",
      content: "Write a comprehensive blog post about [TOPIC] that is optimized for SEO. Include relevant keywords, engaging headlines, and actionable content that provides value to readers...",
      price: "12.99",
      categoryId: insertedCategories[0].id, // Writing
      authorId: insertedUsers[0].id,
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
      categoryId: insertedCategories[1].id, // Art & Design
      authorId: insertedUsers[1].id,
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
      categoryId: insertedCategories[2].id, // Coding
      authorId: insertedUsers[2].id,
      rating: "5.0",
      salesCount: 291,
      featured: true,
      trending: false,
      isNew: true,
      tags: ["Full-Stack", "Development", "Programming"],
      previewImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      title: "Social Media Marketing Guru",
      description: "Create viral social media content that drives engagement and converts followers to customers.",
      content: "Develop a comprehensive social media strategy for [PLATFORM] focusing on [NICHE]. Include content ideas, posting schedule, and engagement tactics...",
      price: "15.99",
      categoryId: insertedCategories[3].id, // Business
      authorId: insertedUsers[0].id,
      rating: "4.8",
      salesCount: 642,
      featured: false,
      trending: true,
      isNew: false,
      tags: ["Social Media", "Marketing", "Engagement"],
      previewImage: "https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      title: "Interactive Learning Designer",
      description: "Design engaging educational content that makes complex topics easy to understand and remember.",
      content: "Create an interactive learning module about [SUBJECT] that includes visual aids, quizzes, and hands-on activities...",
      price: "19.99",
      categoryId: insertedCategories[4].id, // Education
      authorId: insertedUsers[1].id,
      rating: "4.6",
      salesCount: 356,
      featured: false,
      trending: false,
      isNew: true,
      tags: ["Education", "Interactive", "Learning"],
      previewImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    },
    {
      title: "Game Narrative Architect",
      description: "Craft compelling storylines and character development for immersive gaming experiences.",
      content: "Develop a complete narrative structure for a [GAME GENRE] game including main story arc, character backstories, and dialogue systems...",
      price: "22.99",
      categoryId: insertedCategories[5].id, // Gaming
      authorId: insertedUsers[2].id,
      rating: "4.9",
      salesCount: 189,
      featured: false,
      trending: true,
      isNew: true,
      tags: ["Game Design", "Storytelling", "Characters"],
      previewImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    }
  ];

  console.log("Inserting prompts...");
  const insertedPrompts = await db.insert(prompts).values(promptsData).returning();
  console.log(`Inserted ${insertedPrompts.length} prompts`);

  console.log("Database seeded successfully!");
}

seed().catch(console.error);