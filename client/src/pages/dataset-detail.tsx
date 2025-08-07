import React from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  ShoppingCart, 
  Star, 
  Calendar, 
  Database, 
  FileText, 
  Shield, 
  Users,
  Eye,
  MessageSquare 
} from 'lucide-react';

export default function DatasetDetail() {
  const [match] = useRoute('/dataset/:id');
  const { user } = useAuth();
  const { toast } = useToast();
  const datasetId = match?.id;

  const { data: dataset, isLoading } = useQuery({
    queryKey: [`/api/datasets/${datasetId}`],
    enabled: !!datasetId,
  });

  const isOwner = user && dataset?.seller && user.id === dataset.seller.id;

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ 
          title: 'Authentication Required', 
          description: 'Please sign in to download datasets.',
          variant: 'destructive' 
        });
        return;
      }

      toast({ 
        title: 'Downloading...', 
        description: `Preparing ${dataset.fileName} for download.` 
      });

      const response = await fetch(`/api/datasets/download/${dataset.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = dataset.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ 
        title: 'Download Successful', 
        description: `${dataset.fileName} has been downloaded.` 
      });
    } catch (err: any) {
      toast({ 
        title: 'Download Failed', 
        description: err.message, 
        variant: 'destructive' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border p-8">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg border p-6">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Dataset not found</h2>
          <p className="text-muted-foreground mb-4">The dataset you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/marketplace">Browse Datasets</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/marketplace" className="hover:text-primary">Marketplace</Link>
            <span>/</span>
            <span className="text-foreground">{dataset.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border overflow-hidden"
            >
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{dataset.category}</Badge>
                  <Badge variant="outline">{dataset.format}</Badge>
                  <Badge variant="outline">{dataset.license}</Badge>
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {dataset.title}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{dataset.downloads} downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Updated {new Date(dataset.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {Math.round(dataset.fileSize / (1024 * 1024))}MB
                    </span>
                  </div>
                </div>

                <div className="prose max-w-none mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {dataset.description}
                  </p>
                </div>

                {dataset.tags && dataset.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {dataset.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="hover:bg-primary/10">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground">{dataset.format}</div>
                    <div className="text-xs text-muted-foreground">Format</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Database className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground">
                      {Math.round(dataset.fileSize / (1024 * 1024))}MB
                    </div>
                    <div className="text-xs text-muted-foreground">Size</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground">{dataset.license}</div>
                    <div className="text-xs text-muted-foreground">License</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-sm font-medium text-foreground">{dataset.downloads}</div>
                    <div className="text-xs text-muted-foreground">Downloads</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      {dataset.price === 0 ? 'Free' : `$${dataset.price}`}
                    </div>
                    <div className="text-sm text-muted-foreground">One-time purchase</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isOwner ? (
                    <Button onClick={handleDownload} className="w-full" size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download Your File
                    </Button>
                  ) : (
                    <>
                      <Button asChild className="w-full bg-primary hover:bg-primary/90" size="lg">
                        <Link href={`/checkout/${dataset.id}`}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now
                        </Link>
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Instant download after purchase
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Seller Info */}
            {dataset.seller && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seller Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={dataset.seller.avatarUrl || ""} />
                        <AvatarFallback>{dataset.seller.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">{dataset.seller.name}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                          {dataset.seller.rating || 'N/A'} rating
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total datasets:</span>
                        <span className="font-medium">{dataset.seller.totalDatasets || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Member since:</span>
                        <span className="font-medium">2024</span>
                      </div>
                    </div>

                    {!isOwner && user && (
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" className="w-full" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Seller
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Security & Trust */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary" />
                    Security & Trust
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Secure payment processing
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Verified seller
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Quality guaranteed
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Instant download
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
