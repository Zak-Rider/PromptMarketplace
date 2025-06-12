import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromptWithDetails } from "@shared/schema";
import { 
  DollarSign, 
  FileText, 
  Heart, 
  ShoppingCart, 
  User, 
  Settings,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Download,
  Trash2
} from "lucide-react";
import { useState } from "react";

type TabType = "overview" | "prompts" | "purchases" | "favorites" | "settings";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Fetch user's prompts
  const { data: userPrompts = [], isLoading: promptsLoading } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/prompts/my-prompts"],
  });

  // Fetch user's purchases
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/purchases"],
  });

  // Fetch user's favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/favorites"],
  });

  const totalEarnings = userPrompts.reduce((sum, prompt) => {
    return sum + (parseFloat(prompt.price) * (prompt.salesCount || 0));
  }, 0);

  const stats = [
    {
      title: "My Prompts",
      value: userPrompts.length,
      description: "Total prompts created",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Total Sales",
      value: userPrompts.reduce((sum, prompt) => sum + (prompt.salesCount || 0), 0),
      description: "Prompts sold",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      description: "Total revenue",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Favorites",
      value: favorites.length,
      description: "Liked prompts",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  const sidebarTabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "prompts", label: "My Prompts", icon: FileText },
    { id: "purchases", label: "Purchases", icon: ShoppingCart },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Recent Activity</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your latest prompts and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userPrompts.slice(0, 3).map((prompt) => (
                    <div key={prompt.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white">{prompt.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{prompt.category.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">${prompt.price}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{prompt.salesCount || 0} sales</p>
                      </div>
                    </div>
                  ))}
                  {userPrompts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400">No prompts created yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "prompts":
        return (
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">My Prompts</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Manage and track your published prompts
                </CardDescription>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create New Prompt
              </Button>
            </CardHeader>
            <CardContent>
              {promptsLoading ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">Loading your prompts...</p>
                </div>
              ) : userPrompts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">You haven't created any prompts yet.</p>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Prompt
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPrompts.map((prompt) => (
                    <div key={prompt.id} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{prompt.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{prompt.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-4">{prompt.category.name}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-6 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${prompt.price}
                          </span>
                          <span className="flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {prompt.salesCount || 0} sales
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "purchases":
        return (
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Purchase History</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Prompts you've purchased from other creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchasesLoading ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">Loading your purchases...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">You haven't made any purchases yet.</p>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Browse Prompts
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((prompt) => (
                    <div key={prompt.id} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{prompt.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{prompt.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-4">{prompt.category.name}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-6 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${prompt.price}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            By {prompt.author.username}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "favorites":
        return (
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Favorite Prompts</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Prompts you've saved for later
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">Loading your favorites...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">You haven't added any favorites yet.</p>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Discover Prompts
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((prompt) => (
                    <div key={prompt.id} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{prompt.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{prompt.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-4">{prompt.category.name}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-6 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${prompt.price}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            By {prompt.author.username}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "settings":
        return (
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Account Settings</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Manage your account preferences and profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Profile Information</h4>
                <div className="grid gap-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                      <p className="text-slate-900 dark:text-white mt-1">{user?.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                      <p className="text-slate-900 dark:text-white mt-1">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Member Since</label>
                      <p className="text-slate-900 dark:text-white mt-1">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Account Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{user?.username}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarTabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {sidebarTabs.find(tab => tab.id === activeTab)?.label}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {activeTab === "overview" && "Overview of your account and recent activity"}
                {activeTab === "prompts" && "Manage and track your published prompts"}
                {activeTab === "purchases" && "View your purchase history and downloaded prompts"}
                {activeTab === "favorites" && "Access your saved favorite prompts"}
                {activeTab === "settings" && "Configure your account settings and preferences"}
              </p>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}