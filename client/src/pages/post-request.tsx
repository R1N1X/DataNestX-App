import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  DollarSign, 
  Calendar,
  Tag,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';

const categories = [
  'Computer Vision',
  'NLP',
  'Finance',
  'Healthcare', 
  'E-commerce',
  'Social Media',
  'IoT & Sensors',
  'Transportation',
  'Education',
  'Government',
  'Weather & Climate',
  'Sports',
  'Entertainment'
];

const requestSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budgetMin: z.number().min(1, 'Minimum budget must be at least $1'),
  budgetMax: z.number().min(1, 'Maximum budget must be at least $1'),
  deadline: z.string().min(1, 'Deadline is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"],
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function PostRequest() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      tags: [],
    },
    mode: 'onChange',
  });

  const postRequestMutation = useMutation({
    mutationFn: (data: RequestFormData) => apiRequest('POST', '/api/requests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/requests'] });
      toast({
        title: 'Request Posted Successfully',
        description: 'Your dataset request is now live. Sellers can start submitting proposals.',
      });
      navigate('/buyer-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Post Request',
        description: error.message || 'Failed to post dataset request',
        variant: 'destructive',
      });
    },
  });

  // Check if user is a buyer
  React.useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to post dataset requests.',
        variant: 'destructive',
      });
      navigate('/auth');
    } else if (user.role !== 'buyer') {
      toast({
        title: 'Access Denied',
        description: 'Only buyers can post dataset requests.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        setValue('tags', newTags);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: RequestFormData) => {
    postRequestMutation.mutate(data);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (!user || user.role !== 'buyer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Post Dataset Request</h1>
          <p className="text-muted-foreground">
            Describe the dataset you need and let expert sellers create it for you
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Request Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g., Need Cryptocurrency Trading Data for ML Model"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    {...register('description')}
                    placeholder="Provide detailed requirements for your dataset:
- What type of data do you need?
- What format would you prefer?
- How will you use this data?
- Any specific requirements or constraints?
- Quality standards and expectations?
- Timeline considerations?"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Be as specific as possible to attract the right sellers and get accurate proposals
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Budget & Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Budget & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Minimum Budget (USD)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      step="1"
                      min="1"
                      {...register('budgetMin', { valueAsNumber: true })}
                      placeholder="500"
                    />
                    {errors.budgetMin && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.budgetMin.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Maximum Budget (USD)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      step="1"
                      min="1"
                      {...register('budgetMax', { valueAsNumber: true })}
                      placeholder="1500"
                    />
                    {errors.budgetMax && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.budgetMax.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Project Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={today}
                    {...register('deadline')}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.deadline.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    When do you need the dataset to be delivered?
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">Budget Guidelines</h4>
                      <div className="text-sm text-blue-700 mt-1">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Simple data collection: $100-$500</li>
                          <li>Complex datasets with annotations: $500-$2000</li>
                          <li>Large-scale or specialized data: $2000+</li>
                          <li>Consider data quality, volume, and complexity</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags & Keywords
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Add Tags</Label>
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type a tag and press Enter (e.g., machine-learning, finance, real-time)"
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {tag}
                          <X 
                            className="w-3 h-3 ml-1" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.tags && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.tags.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Add relevant tags to help sellers understand your requirements and find your request
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Tag className="w-5 h-5 text-amber-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-amber-800">Suggested Tags</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {['machine-learning', 'computer-vision', 'nlp', 'finance', 'healthcare', 'real-time', 'labeled', 'image-classification', 'time-series', 'api'].map((suggestion) => (
                          <Button
                            key={suggestion}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              if (!tags.includes(suggestion)) {
                                const newTags = [...tags, suggestion];
                                setTags(newTags);
                                setValue('tags', newTags);
                              }
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/buyer-dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!isValid || postRequestMutation.isPending}
            >
              {postRequestMutation.isPending ? (
                <>Posting...</>
              ) : (
                <>
                  <Plus className="w-4 w-4 mr-2" />
                  Post Request
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
