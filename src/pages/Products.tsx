import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, X, Upload, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  description: string;
  specs?: Record<string, any>;
  categories?: number[];
  status: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: number;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    hasNextPage: false,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specs: {} as Record<string, any>,
    categories: [] as number[],
    status: 'active' as 'active' | 'inactive',
    images: [] as string[],
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.page, filterCategory, filterStatus]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      if (filterCategory && filterCategory !== 'all') {
        params.category = filterCategory;
      }
      
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const response = await api.get('/products', { params });
      setProducts(response.data.items || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.count || 0,
        hasNextPage: response.data.hasNextPage || false,
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedKeys: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await api.post('/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        uploadedKeys.push(response.data.key);
      } catch (error) {
        console.error('Failed to upload image:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    return uploadedKeys;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageKeys = [...formData.images];
      
      // Upload new image files if any
      if (imageFiles.length > 0) {
        const uploadedKeys = await uploadImages(imageFiles);
        imageKeys = [...imageKeys, ...uploadedKeys];
      }
      
      const productData = {
        ...formData,
        images: imageKeys,
      };
      
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', productData);
        toast.success('Product created successfully');
      }
      setOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      specs: product.specs || {},
      categories: product.categories || [],
      status: product.status as 'active' | 'inactive',
      images: product.images || [],
    });
    setImageFiles([]);
    setOpen(true);
  };

  const addSpec = () => {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specs: { ...formData.specs, [specKey]: specValue },
      });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpec = (key: string) => {
    const newSpecs = { ...formData.specs };
    delete newSpecs[key];
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      
      const validFiles = files.filter(file => {
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds 1MB limit`);
          return false;
        }
        return true;
      });
      
      if (validFiles.length > 0) {
        setImageFiles(validFiles);
        
        // Create previews
        const previews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
      }
    }
  };

  const removeNewImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const resetForm = () => {
    // Clean up preview URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    setFormData({
      name: '',
      description: '',
      specs: {},
      categories: [],
      status: 'active',
      images: [],
    });
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setSpecKey('');
    setSpecValue('');
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryNames = (categoryIds?: number[]): string => {
    if (!categoryIds || categoryIds.length === 0) return '-';
    return categoryIds
      .map(id => categories.find(c => c.id === id)?.name || id)
      .join(', ');
  };

  return (
    <DashboardLayout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 flex gap-3 flex-wrap">
            <div className="relative max-w-md flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] bg-muted/50 border-border/50">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-muted/50 border-border/50">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="max-h-[65vh] overflow-y-auto pr-3 space-y-4 custom-scrollbar">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categories</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      const categoryId = parseInt(value);
                      if (!formData.categories.includes(categoryId)) {
                        setFormData({ 
                          ...formData, 
                          categories: [...formData.categories, categoryId] 
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Add categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      {categories
                        .filter(category => !formData.categories.includes(category.id))
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.categories.map((catId) => {
                        const category = categories.find(c => c.id === catId);
                        return (
                          <Badge key={catId} variant="secondary" className="gap-1">
                            {category?.name || `Category ${catId}`}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setFormData({
                                ...formData,
                                categories: formData.categories.filter(id => id !== catId)
                              })}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Specifications</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Key (e.g., Color)"
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      className="bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                    />
                    <Input
                      placeholder="Value (e.g., Blue)"
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      className="bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                    />
                    <Button type="button" onClick={addSpec} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {Object.keys(formData.specs).length > 0 && (
                    <div className="space-y-2 mt-2">
                      {Object.entries(formData.specs).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                          <span className="text-sm">
                            <strong>{key}:</strong> {String(value)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpec(key)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Upload Images</Label>
                  <p className="text-xs text-muted-foreground">Maximum 1MB per image</p>
                  <div className="flex items-center gap-2">
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/30">
                      <Label className="text-sm font-medium mb-3 block">New Images to Upload:</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-colors">
                            <img
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              onClick={() => removeNewImage(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <span className="text-white text-xs font-medium">
                                {imageFiles[idx].name} • {(imageFiles[idx].size / 1024).toFixed(0)}KB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Existing Images */}
                  {formData.images.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/30">
                      <Label className="text-sm font-medium mb-3 block">Existing Images:</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-colors">
                            <img
                              src={img}
                              alt={`Existing ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              onClick={() => removeExistingImage(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <span className="text-white text-xs font-medium truncate block">
                                {img.split('/').pop() || img}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-border/50">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary" disabled={uploading}>
                    {uploading ? 'Uploading...' : editingProduct ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl border border-border/50 animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getCategoryNames(product.categories)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                          className="btn-glass"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {!loading && filteredProducts.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} • Total: {pagination.total} products
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn-glass"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNextPage}
                  className="btn-glass"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;
