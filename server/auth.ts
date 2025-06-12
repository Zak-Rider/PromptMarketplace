import { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema, loginSchema } from "@shared/schema";

interface JwtPayload {
  userId: number;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SelectUser;
    }
  }
}

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-change-in-production";

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateToken(user: SelectUser): string {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: "7d",
    issuer: "buy-sell-prompt",
    audience: "buy-sell-prompt-users"
  });
}

// JWT Authentication middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Get full user data
    storage.getUser(decoded.userId).then(user => {
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      req.user = user;
      next();
    }).catch(error => {
      console.error("Auth middleware error:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    storage.getUser(decoded.userId).then(user => {
      if (user) {
        req.user = user;
      }
      next();
    }).catch(error => {
      console.error("Optional auth error:", error);
      next();
    });
  } catch (error) {
    // Invalid token, but don't fail the request
    next();
  }
}

export function setupAuth(app: Express) {
  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const token = generateToken(user);
      
      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user || !(await comparePasswords(validatedData.password, user.password))) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = generateToken(user);
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Logout endpoint (client-side token removal)
  app.post("/api/logout", (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    // For server-side logout, you'd need a token blacklist
    res.json({ message: "Logged out successfully" });
  });

  // Get current user endpoint
  app.get("/api/user", authenticateToken, (req, res) => {
    const user = req.user!;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  });
}