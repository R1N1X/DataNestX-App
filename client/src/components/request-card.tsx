import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Users,
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Eye
} from 'lucide-react';
import { DatasetRequest } from '@/types';
import { Link } from 'wouter';

interface RequestCardProps {
  request: DatasetRequest;
  index?: number;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, index = 0 }) => {
  const proposalCount = request.proposalCount || 0;

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(request.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );
  const isUrgent = daysLeft <= 7 && request.status === 'open';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'fulfilled': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
    >
      <Card className="h-full border-0 shadow-soft hover:shadow-hover transition-all duration-500 group-hover:border-primary/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {request.category}
                </Badge>
                <Badge className={`text-xs capitalize ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ')}
                </Badge>
                {proposalCount > 10 && (
                  <Badge variant="outline" className="text-xs border-accent-amber text-accent-amber">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {request.title}
              </h3>
            </div>
            {isUrgent && (
              <Badge className="bg-red-100 text-red-600 border-red-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="text-lg font-bold text-foreground">
                ${request.budgetMin?.toLocaleString()} - ${request.budgetMax?.toLocaleString()}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {request.description}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-t border-b border-border">
            <div className="text-center">
              <div className="flex items-center justify-center text-accent-pink mb-2">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-foreground">{proposalCount}</div>
              <div className="text-xs text-muted-foreground">proposals</div>
            </div>
            <div className="text-center">
              <div className={`flex items-center justify-center mb-2 ${isUrgent ? 'text-red-600' : 'text-accent-teal'}`}>
                <Clock className="h-4 w-4" />
              </div>
              <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
                {daysLeft}
              </div>
              <div className="text-xs text-muted-foreground">days left</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-accent-amber mb-2">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-foreground">
                {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground">posted</div>
            </div>
          </div>

          {request.buyer && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={request.buyer.avatarUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent-pink/20 text-primary font-medium">
                    {request.buyer.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {request.buyer.name}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-accent-amber text-accent-amber" />
                    <span>{request.buyer.rating || '-'}</span>
                    <span>•</span>
                    <span>Verified buyer</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {request.tags && request.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {request.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {request.tags.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{request.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button className="flex-1 bg-primary hover:bg-primary/90" size="sm" asChild>
              <Link href={`/request/${request.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-accent-teal/10 hover:text-accent-teal hover:border-accent-teal"
              asChild
            >
              <Link href={`/request/${request.id}#propose`}>
                Submit Proposal
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
