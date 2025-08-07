import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { DatasetCard } from '@/components/dataset-card';
import { RequestCard } from '@/components/request-card';
import { Search, Upload, Database, Users, DollarSign, Star } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const { data: featuredDatasets = [] } = useQuery({
    queryKey: ['/api/datasets'],
    select: (data: any[]) => data.slice(0, 3),
  });

  const { data: activeRequests = [] } = useQuery({
    queryKey: ['/api/requests'],
    select: (data: any[]) => data.filter((r: any) => r.status === 'open').slice(0, 2),
  });

  const getRedirectPath = () => {
    if (!user) return '/auth';
    return user.role === 'buyer' ? '/buyer-dashboard' : '/seller-dashboard';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Premium Dataset<br />
              <span className="text-primary-100">Marketplace</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto"
            >
              Connect data creators with data seekers. Buy, sell, and request high-quality datasets for your AI and machine learning projects.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                className="bg-white text-primary px-8 py-4 text-lg font-semibold hover:bg-primary-50 transition-all transform hover:scale-105" 
                asChild
              >
                <Link href="/marketplace">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Datasets
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-primary transition-all"
                asChild
              >
                <Link href={user ? (user.role === 'seller' ? '/upload-dataset' : '/post-request') : '/auth'}>
                  <Upload className="w-5 h-5 mr-2" />
                  Start Selling
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="text-3xl font-bold">10,000+</div>
                <div className="text-primary-100">Datasets</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="text-3xl font-bold">5,000+</div>
                <div className="text-primary-100">Data Scientists</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="text-3xl font-bold">$2M+</div>
                <div className="text-primary-100">Transactions</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <div className="text-3xl font-bold">99.5%</div>
                <div className="text-primary-100">Satisfaction</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Datasets */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Datasets</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover high-quality, ready-to-use datasets from trusted sellers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDatasets.map((dataset: any, index: number) => (
              <DatasetCard key={dataset.id} dataset={dataset} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button className="bg-primary text-white px-8 py-3 font-medium hover:bg-primary/90" asChild>
              <Link href="/marketplace">
                View All Datasets
                <Search className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Custom Requests Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Custom Dataset Requests</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Can't find what you need? Post a request and let data experts create custom datasets for you
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {activeRequests.map((request: any, index: number) => (
              <RequestCard key={request.id} request={request} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Button className="bg-primary text-white px-8 py-3 font-medium hover:bg-primary/90" asChild>
              <Link href="/post-request">
                Post Your Request
                <Upload className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview for Authenticated Users */}
      {user && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Welcome back, {user.name}!</h2>
              <p className="text-xl text-muted-foreground">
                {user.role === 'buyer' 
                  ? 'Manage your purchases and dataset requests' 
                  : 'Track your dataset sales and earnings'
                }
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 bg-primary/5">
                <div className="flex items-center">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-foreground">
                      {user.role === 'buyer' ? user.totalPurchases : user.totalDatasets}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.role === 'buyer' ? 'Purchases' : 'Datasets'}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-accent-pink/5">
                <div className="flex items-center">
                  <div className="p-3 bg-accent-pink/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-accent-pink" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-foreground">
                      ${user.totalEarnings || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.role === 'buyer' ? 'Spent' : 'Earned'}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-accent-amber/5">
                <div className="flex items-center">
                  <div className="p-3 bg-accent-amber/10 rounded-lg">
                    <Star className="w-6 h-6 text-accent-amber" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-foreground">
                      {user.rating || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-green-50">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-foreground">
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center">
              <Button className="bg-primary text-white px-8 py-3 font-medium hover:bg-primary/90" asChild>
                <Link href={getRedirectPath()}>
                  Go to Dashboard
                  <Database className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
