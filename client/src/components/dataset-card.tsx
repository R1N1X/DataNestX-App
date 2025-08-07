import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ShoppingCart, Download, Eye } from "lucide-react";
import { Link } from "wouter";
import { Dataset } from '@/types';
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface DatasetCardProps {
  dataset: Dataset;
  index?: number;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({ dataset, index = 0 }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const isOwner = user && dataset.seller && user.id === dataset.seller.id;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden rounded-lg border shadow-sm hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{dataset.category}</Badge>
              <Badge variant="outline">{dataset.format}</Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {dataset.price === 0 ? 'Free' : `$${dataset.price}`}
              </div>
              <div className="text-sm text-muted-foreground">one-time</div>
            </div>
          </div>
          <CardTitle className="pt-2 text-lg font-semibold line-clamp-2">
            <Link href={`/dataset/${dataset.id}`}>
              <span className="hover:underline cursor-pointer">{dataset.title}</span>
            </Link>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col p-4 pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
            {dataset.description}
          </p>

          <div className="grid grid-cols-3 text-center gap-4 my-4 py-3 border-t border-b">
            <div>
              <p className="font-semibold">{dataset.downloads || 0}</p>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
            <div>
              <p className="font-semibold flex items-center justify-center">
                <Star className="h-4 w-4 mr-1 text-amber-400 fill-amber-400" />
                {dataset.seller?.rating || 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="font-semibold">
                {Math.round((dataset.fileSize || 0) / (1024 * 1024))}MB
              </p>
              <p className="text-xs text-muted-foreground">Size</p>
            </div>
          </div>

          {dataset.seller && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={dataset.seller.avatarUrl || ""} />
                <AvatarFallback>{dataset.seller.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{dataset.seller.name}</p>
                <p className="text-xs text-muted-foreground">{dataset.seller.totalDatasets || 0} datasets</p>
              </div>
            </div>
          )}

          <div className="mt-auto flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dataset/${dataset.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            {isOwner ? (
              <Button variant="outline" onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            ) : (
              <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
                <Link href={`/checkout/${dataset.id}`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
