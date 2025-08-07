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
import { 
  Database, 
  DollarSign, 
  Star,
  Plus,
  TrendingUp,
  Users,
  FileText,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: datasets = [] } = useQuery({
    queryKey: ['/api/user/datasets'],
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['/api/user/proposals'],
  });

  const totalEarnings = parseFloat(user?.totalEarnings || '0');
  const totalDownloads = datasets.reduce((sum: number, d: any) => sum + (d.downloads || 0), 0);
  const pendingProposals = proposals.filter((p: any) => p.status === 'pending').length;
  const acceptedProposals = proposals.filter((p: any) => p.status === 'accepted').length;

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'fulfilled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">This dashboard is only available for sellers.</p>
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
            Manage your datasets, track earnings, and respond to proposals
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="datasets">My Datasets</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-foreground">
                        {datasets.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Datasets</div>
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
                        ${totalEarnings.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Earnings</div>
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
                      <TrendingUp className="w-6 h-6 text-accent-amber" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-foreground">
                        {totalDownloads}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Downloads</div>
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
                      <div className="text-sm text-muted-foreground">Average Rating</div>
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
                      <Link href="/upload-dataset">
                        <Upload className="w-6 h-6" />
                        Upload New Dataset
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col gap-2">
                      <Link href="/marketplace">
                        <Eye className="w-6 h-6" />
                        View Marketplace
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Proposals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Proposals</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#" onClick={() => setActiveTab('proposals')}>
                        View All
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {proposals.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No proposals yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Proposals from buyers will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {proposals.slice(0, 3).map((proposal: any) => (
                          <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">
                                  {proposal.request?.title || 'Dataset Request'}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getProposalStatusColor(proposal.status)}>
                                    {proposal.status}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    ${proposal.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                {proposal.deliveryTime} days
                              </div>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Performing Datasets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Top Performing Datasets</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#" onClick={() => setActiveTab('datasets')}>
                        View All
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {datasets.length === 0 ? (
                      <div className="text-center py-8">
                        <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No datasets yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Upload your first dataset to start earning
                        </p>
                        <Button size="sm" asChild>
                          <Link href="/upload-dataset">Upload Dataset</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {datasets
                          .sort((a: any, b: any) => (b.downloads || 0) - (a.downloads || 0))
                          .slice(0, 3)
                          .map((dataset: any) => (
                            <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Database className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground line-clamp-1">
                                    {dataset.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary">{dataset.category}</Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {dataset.downloads || 0} downloads
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-foreground">${dataset.price}</div>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/dataset/${dataset.id}`}>
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
            </div>
          </TabsContent>

          {/* Datasets Tab */}
          <TabsContent value="datasets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">My Datasets</h2>
              <Button asChild>
                <Link href="/upload-dataset">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload New Dataset
                </Link>
              </Button>
            </div>

            {datasets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No datasets uploaded</h3>
                  <p className="text-muted-foreground mb-6">
                    Start sharing your valuable datasets with the community and earn revenue.
                  </p>
                  <Button asChild>
                    <Link href="/upload-dataset">Upload Your First Dataset</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset: any, index: number) => (
                  <DatasetCard 
                    key={dataset.id} 
                    dataset={dataset} 
                    index={index}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Proposal Management</h2>
              <div className="flex gap-2">
                <Badge variant="outline">{pendingProposals} Pending</Badge>
                <Badge variant="outline">{acceptedProposals} Accepted</Badge>
              </div>
            </div>

            {proposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No proposals submitted</h3>
                  <p className="text-muted-foreground mb-6">
                    Browse dataset requests and submit proposals to start earning from custom projects.
                  </p>
                  <Button asChild>
                    <Link href="/marketplace">Browse Requests</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {proposals.map((proposal: any) => (
                  <Card key={proposal.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {proposal.request?.title || 'Dataset Request'}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getProposalStatusColor(proposal.status)}>
                              {proposal.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {proposal.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {proposal.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                              {proposal.status}
                            </Badge>
                            {proposal.request?.status && (
                              <Badge className={getRequestStatusColor(proposal.request.status)}>
                                Request: {proposal.request.status.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {proposal.coverLetter}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-foreground">${proposal.price}</div>
                          <div className="text-sm text-muted-foreground">{proposal.deliveryTime} days</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Request
                          </Button>
                          {proposal.status === 'pending' && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit Proposal
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Analytics & Performance</h2>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-foreground">${(totalEarnings * 0.3).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                    <p className="text-2xl font-bold text-foreground">{Math.floor(totalDownloads * 0.4)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    <p className="text-2xl font-bold text-foreground">{user.rating || 'N/A'}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Performance by Dataset */}
            <Card>
              <CardHeader>
                <CardTitle>Dataset Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {datasets.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Upload datasets to see performance analytics</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {datasets.map((dataset: any) => (
                      <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{dataset.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{dataset.downloads || 0} downloads</span>
                            <span>${dataset.price} price</span>
                            <span>{dataset.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            ${((dataset.downloads || 0) * parseFloat(dataset.price)).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total earned</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
