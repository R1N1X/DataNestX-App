import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatasetCard } from '@/components/dataset-card';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const categories = [
  'All Categories',
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
  'All Formats',
  'CSV',
  'JSON',
  'XML',
  'SQL',
  'Excel',
  'Parquet',
  'API'
];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');
  const [showFilters, setShowFilters] = useState(false);

  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ['/api/datasets', { 
      category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
      format: selectedFormat !== 'All Formats' ? selectedFormat : undefined,
      search: searchTerm || undefined
    }],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the query dependency
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Dataset Marketplace
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Discover high-quality datasets from trusted sellers worldwide
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search datasets, categories, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </motion.form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Category
                </h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-4">Format</h3>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== 'All Categories' || selectedFormat !== 'All Formats' || searchTerm) && (
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-4">Active Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory !== 'All Categories' && (
                      <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('All Categories')}>
                        {selectedCategory} ×
                      </Badge>
                    )}
                    {selectedFormat !== 'All Formats' && (
                      <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedFormat('All Formats')}>
                        {selectedFormat} ×
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                        "{searchTerm}" ×
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {isLoading ? 'Loading...' : `${datasets.length} datasets found`}
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : datasets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No datasets found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse different categories
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All Categories');
                    setSelectedFormat('All Formats');
                  }}
                  variant="outline"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset: any, index: number) => (
                  <DatasetCard key={dataset.id} dataset={dataset} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
