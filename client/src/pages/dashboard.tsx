import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Edit,
  Eye,
  Heart,
  Star
} from "lucide-react";
import { PromptWithDetails } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's prompts
  const { data: userPrompts = [] } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/prompts/my-prompts"],
    enabled: !!user,
  });

  // Fetch user's purchases
  const { data: purchases = [] } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/purchases"],
    enabled: !!user,
  });

  // Fetch user's favorites
  const { data: favorites = [] } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  // Calculate stats
  const totalEarnings = userPrompts.reduce((sum, prompt) => {
    return sum + (prompt.salesCount || 0) * parseFloat(prompt.price);
  }, 0);

  const totalSales = userPrompts.reduce((sum, prompt) => sum + (prompt.salesCount || 0), 0);

  if (!user) {
    return null; // This should be protected by the route guard
  }

  return (
    <div className="min-h-screen bg-soft-gray">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-oxford-blue text-white text-xl">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-oxford-blue">Welcome back, {user.username}!</h1>
              <p className="text-dark-gray">Manage your prompts and track your marketplace activity</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-prompts">My Prompts</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userPrompts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Prompts you've created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    Prompts sold
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Revenue generated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Purchases</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{purchases.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Prompts purchased
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Prompts</CardTitle>
                  <CardDescription>Your latest created prompts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userPrompts.slice(0, 3).map((prompt) => (
                      <div key={prompt.id} className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{prompt.title}</p>
                          <p className="text-xs text-muted-foreground">{prompt.category.name}</p>
                        </div>
                        <Badge variant="secondary">${prompt.price}</Badge>
                      </div>
                    ))}
                    {userPrompts.length === 0 && (
                      <p className="text-sm text-muted-foreground">No prompts created yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchases</CardTitle>
                  <CardDescription>Your latest bought prompts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchases.slice(0, 3).map((prompt) => (
                      <div key={prompt.id} className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{prompt.title}</p>
                          <p className="text-xs text-muted-foreground">by {prompt.author.username}</p>
                        </div>
                        <Badge variant="outline">${prompt.price}</Badge>
                      </div>
                    ))}
                    {purchases.length === 0 && (
                      <p className="text-sm text-muted-foreground">No purchases yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Prompts Tab */}
          <TabsContent value="my-prompts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-oxford-blue">My Prompts</h2>
                <p className="text-dark-gray">Create and manage your prompts for sale</p>
              </div>
              <Button className="bg-ut-orange hover:bg-ut-orange/90">
                <Plus className="w-4 h-4 mr-2" />
                Create New Prompt
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPrompts.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{prompt.category.name}</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {prompt.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-ut-orange">${prompt.price}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {prompt.rating || "0"}
                        </span>
                        <span>{prompt.salesCount || 0} sales</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {userPrompts.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
                    <p className="text-muted-foreground mb-4">Start creating prompts to sell in the marketplace</p>
                    <Button className="bg-ut-orange hover:bg-ut-orange/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Prompt
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-oxford-blue">Purchase History</h2>
              <p className="text-dark-gray">Prompts you've bought from the marketplace</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">{prompt.category.name}</Badge>
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <CardDescription>by {prompt.author.username}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-bold text-ut-orange">${prompt.price}</div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {purchases.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                    <p className="text-muted-foreground">Start exploring the marketplace to find prompts</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-oxford-blue">Favorite Prompts</h2>
              <p className="text-dark-gray">Prompts you've saved for later</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">{prompt.category.name}</Badge>
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <CardDescription>by {prompt.author.username}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-bold text-ut-orange">${prompt.price}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Heart className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {favorites.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Heart className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground">Save prompts you like for quick access later</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-oxford-blue">Account Settings</h2>
              <p className="text-dark-gray">Manage your profile and account preferences</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-oxford-blue text-white text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Avatar</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-lg">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline">Edit Profile</Button>
                  <Button variant="outline">Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}