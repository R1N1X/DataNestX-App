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
  Upload, 
  Database, 
  FileText, 
  DollarSign, 
  Tag,
  AlertCircle,
  CheckCircle,
  X
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

const formats = [
  'CSV',
  'JSON',
  'XML',
  'SQL',
  'Excel',
  'Parquet',
  'API'
];

const dataTypes = [
  'Training',
  'Testing',
  'Validation',
  'Raw',
  'Processed',
  'Labeled',
  'Unlabeled'
];

const licenses = [
  'Commercial',
  'Academic',
  'Open Source',
  'Creative Commons',
  'Custom'
];

const uploadSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  category: z.string().min(1, 'Category is required'),
  format: z.string().min(1, 'Format is required'),
  dataType: z.string().min(1, 'Data type is required'),
  license: z.string().min(1, 'License is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function UploadDataset() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      tags: [],
    },
    mode: 'onChange',
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => apiRequest('POST', '/api/datasets', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/datasets'] });
      toast({
        title: 'Dataset Uploaded Successfully',
        description: 'Your dataset is now available in the marketplace.',
      });
      navigate('/seller-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload dataset',
        variant: 'destructive',
      });
    },
  });

  // Check if user is a seller
  React.useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to upload datasets.',
        variant: 'destructive',
      });
      navigate('/auth');
    } else if (user.role !== 'seller') {
      toast({
        title: 'Access Denied',
        description: 'Only sellers can upload datasets.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

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

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      toast({
        title: 'File Required',
        description: 'Please select a dataset file to upload.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('dataset', selectedFile);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('category', data.category);
    formData.append('format', data.format);
    formData.append('dataType', data.dataType);
    formData.append('license', data.license);
    formData.append('tags', JSON.stringify(data.tags));

    uploadMutation.mutate(formData);
  };

  if (!user || user.role !== 'seller') {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Dataset</h1>
          <p className="text-muted-foreground">
            Share your high-quality datasets with the community and earn revenue
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Dataset File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : selectedFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Database className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          Drop your dataset file here
                        </p>
                        <p className="text-muted-foreground">
                          or click to browse files
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".csv,.json,.xlsx,.xls,.txt,.xml,.zip,.jpg,.jpeg,.png,.wav,.mp3,.mp4"
                      />
                      <label htmlFor="file-upload">
                        <Button type="button" variant="outline" asChild>
                          <span className="cursor-pointer">Choose File</span>
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: CSV, JSON, Excel, XML, ZIP, Images, Audio, Video (Max 500MB)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Dataset Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g., Medical X-Ray Images for Pneumonia Detection"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    placeholder="Provide a detailed description of your dataset, including what it contains, how it was collected, potential use cases, and any important details buyers should know..."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select onValueChange={(value) => setValue('format', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format} value={format}>
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.format && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.format.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataType">Data Type</Label>
                    <Select onValueChange={(value) => setValue('dataType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.dataType && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.dataType.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license">License</Label>
                    <Select onValueChange={(value) => setValue('license', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select license" />
                      </SelectTrigger>
                      <SelectContent>
                        {licenses.map((license) => (
                          <SelectItem key={license} value={license}>
                            {license}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.license && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.license.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing & Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.price.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Set to 0 for free datasets. Recommended pricing: $0.10-$0.50 per MB
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type a tag and press Enter"
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
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
                    Add relevant tags to help buyers find your dataset (e.g., machine-learning, computer-vision, nlp)
                  </p>
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
              onClick={() => navigate('/seller-dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!isValid || !selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Dataset
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
