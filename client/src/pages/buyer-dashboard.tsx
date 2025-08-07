import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { DatasetCard } from '@/components/dataset-card';
import { RequestCard } from '@/components/request-card';
import { 
  ShoppingBag, 
  FileText, 
  DollarSign, 
  Star,
  Plus,
  Download,
  Calendar,
  TrendingUp,
  Users
} from 'lucide-react';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: purchases = [] } = useQuery({
    queryKey: ['/api/user/purchases'],
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['/api/user/requests'],
  });

  const { data: featuredDatasets = [] } = useQuery({
    queryKey: ['/api/datasets'],
    select: (data: any[]) => data.slice(0, 6),
  });

  const completedPurchases = purchases.filter((p: any) => p.status === 'completed');
  const totalSpent = completedPurchases.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
  const activeRequests = requests.filter((r: any) => r.status === 'open');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'fulfilled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">This dashboard is only available for buyers.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-muted-foreground">
            Manage your dataset purchases and requests
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="browse">Browse</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-primary/5">
                  <div className="flex items-center">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-foreground">
                        {completedPurchases.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Datasets Purchased</div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-accent-pink/5">
                  <div className="flex items-center">
                    <div className="p-3 bg-accent-pink/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-accent-pink" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-foreground">
                        ${totalSpent.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-accent-amber/5">
                  <div className="flex items-center">
                    <div className="p-3 bg-accent-amber/10 rounded-lg">
                      <FileText className="w-6 h-6 text-accent-amber" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-foreground">
                        {activeRequests.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Requests</div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-green-50">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-foreground">
                        {user.rating || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Your Rating</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button asChild className="h-20 flex-col gap-2">
                      <Link href="/marketplace">
                        <TrendingUp className="w-6 h-6" />
                        Browse Datasets
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col gap-2">
                      <Link href="/post-request">
                        <Plus className="w-6 h-6" />
                        Post Request
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col gap-2">
                      <Link href="/messages">
                        <Users className="w-6 h-6" />
                        Messages
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Purchases</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="#" onClick={() => setActiveTab('purchases')}>
                      View All
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {completedPurchases.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No purchases yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start exploring our marketplace to find the perfect datasets for your projects
                      </p>
                      <Button asChild>
                        <Link href="/marketplace">Browse Datasets</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedPurchases.slice(0, 3).map((purchase: any) => (
                        <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Download className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {purchase.dataset?.title || 'Dataset'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">${purchase.amount}</div>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/dataset/${purchase.datasetId}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">My Purchases</h2>
              <Button asChild>
                <Link href="/marketplace">
                  <Plus className="w-4 h-4 mr-2" />
                  Browse More
                </Link>
              </Button>
            </div>

            {completedPurchases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't purchased any datasets yet. Explore our marketplace to find valuable data for your projects.
                  </p>
                  <Button asChild>
                    <Link href="/marketplace">Start Browsing</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedPurchases.map((purchase: any, index: number) => (
                  purchase.dataset && (
                    <DatasetCard 
                      key={purchase.id} 
                      dataset={purchase.dataset} 
                      index={index}
                    />
                  )
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">My Requests</h2>
              <Button asChild>
                <Link href="/post-request">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Request
                </Link>
              </Button>
            </div>

            {requests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No requests posted</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't posted any dataset requests yet. Create a request to get custom datasets created for your specific needs.
                  </p>
                  <Button asChild>
                    <Link href="/post-request">Post Your First Request</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {requests.map((request: any, index: number) => (
                  <div key={request.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {request.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">{request.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          ${request.budgetMin} - ${request.budgetMax}
                        </div>
                        <div className="text-sm text-muted-foreground">Budget</div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {request.proposalCount || 0} proposals
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due {new Date(request.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Recommended for You</h2>
              <Button variant="outline" asChild>
                <Link href="/marketplace">View All Datasets</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDatasets.map((dataset: any, index: number) => (
                <DatasetCard key={dataset.id} dataset={dataset} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
