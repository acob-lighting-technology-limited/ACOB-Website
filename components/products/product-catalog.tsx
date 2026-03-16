'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Hero } from '@/components/ui/hero';
import { Container } from '@/components/ui/container';
import { Search, X } from 'lucide-react';
import { QUERY_KEYS } from '@/lib/query-keys';
import {
  CardSkeleton,
  QueryError,
  EmptyState,
} from '@/components/ui/query-states';

interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  sku: string;
  availability: string;
  description: string;
  productImage: {
    asset?: {
      url: string;
    };
    alt?: string;
  };
  category?: string;
}

interface ProductCatalogProps {
  breadcrumbItems: Array<{ label: string; href?: string }>;
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export function ProductCatalog({ breadcrumbItems }: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.products(),
    queryFn: fetchProducts,
  });

  const filteredProducts = useMemo(
    () =>
      products.filter(product => {
        return (
          searchQuery === '' ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.sku &&
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }),
    [products, searchQuery],
  );

  // Generate hero images from filtered products
  const productImages = useMemo(() => {
    return filteredProducts
      .filter((product: Product) => product.productImage?.asset?.url)
      .map((product: Product) => ({
        src: product.productImage!.asset!.url,
        alt: product.productImage!.alt || product.title,
        href: `/products/${product.slug.current}`,
      }));
  }, [filteredProducts]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (isError) {
    return (
      <Container className="px-4 py-8">
        <QueryError
          message="Could not load products."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  return (
    <>
      <Hero
        image={productImages}
        title="Product Catalog"
        description="Comprehensive range of high-quality solar equipment and components"
      />
      <Container className="px-4 py-8">
        {/* Breadcrumb with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="relative w-full sm:w-96">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-11 pl-10 pr-10 bg-background border-2 focus:border-primary transition-all duration-300"
              disabled={isLoading}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && !isLoading && (
          <div className="mb-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-medium">
                      {filteredProducts.length}
                    </span>{' '}
                    product{filteredProducts.length !== 1 ? 's' : ''} found for{' '}
                    <span className="font-medium">"{searchQuery}"</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <CardSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          searchQuery ? (
            <Card className="!border-t-2 !border-t-primary border border-border">
              <CardContent className="p-4 sm:p-6 xl:p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p>Try adjusting your search terms or browse all products.</p>
                </div>
                <Button variant="outline" onClick={handleClearSearch}>
                  View All Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <EmptyState message="No products found." />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
