import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser, loginSchema } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthResponse = {
  user: SelectUser;
  token: string;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  token: string | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, InsertUser>;
};

type LoginData = z.infer<typeof loginSchema>;

// Token management
const TOKEN_KEY = "auth_token";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Enhanced API request with auth headers
async function authenticatedApiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return apiRequest(method, endpoint, body);
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    setToken(storedToken);
  }, []);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      if (!token) return undefined;
      
      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        // Token is invalid, remove it
        removeStoredToken();
        setToken(null);
        return undefined;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return response.json();
    },
    enabled: !!token,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<AuthResponse> => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (authResponse: AuthResponse) => {
      setStoredToken(authResponse.token);
      setToken(authResponse.token);
      queryClient.setQueryData(["/api/user"], authResponse.user);
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${authResponse.user.username}`,
      });
      // Auto-redirect to dashboard
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser): Promise<AuthResponse> => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (authResponse: AuthResponse) => {
      setStoredToken(authResponse.token);
      setToken(authResponse.token);
      queryClient.setQueryData(["/api/user"], authResponse.user);
      toast({
        title: "Account created!",
        description: `Welcome to Buy Sell Prompt, ${authResponse.user.username}!`,
      });
      // Auto-redirect to dashboard
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // With JWT, logout is client-side
      removeStoredToken();
      setToken(null);
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        token,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}