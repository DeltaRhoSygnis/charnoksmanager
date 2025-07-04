import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Package, Star, TrendingUp } from "lucide-react";
import { UniversalLayout } from "@/components/layout/UniversalLayout";
import { ImageUpload } from "./ImageUpload";
import { defaultFetcher, apiRequest } from "@/lib/queryClient";

const productFormSchema = insertProductSchema.extend({
  price: z.string().transform((val) => val),
  stock: z.string().transform((val) => parseInt(val, 10)),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export const Products = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      price: "",
      stock: "0",
      category: "",
      imageUrl: "",
      description: "",
      isActive: true,
    },
  });

  // Fetch products using TanStack Query
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => defaultFetcher("/api/products"),
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        ...data,
        price: data.price,
        stock: data.stock,
      };
      return apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductFormData> }) => {
      const productData = {
        ...data,
        price: data.price,
        stock: data.stock,
      };
      return apiRequest(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/products/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      price: product.price,
      stock: product.stock.toString(),
      category: product.category,
      imageUrl: product.imageUrl || "",
      description: product.description || "",
      isActive: product.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    form.reset({
      name: "",
      price: "",
      stock: "0",
      category: "",
      imageUrl: "",
      description: "",
      isActive: true,
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    form.setValue("imageUrl", imageUrl);
  };

  if (error) {
    return (
      <UniversalLayout>
        <div className="container mx-auto p-6">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-6">
              <h2 className="text-white text-xl mb-2">Error Loading Products</h2>
              <p className="text-red-300">Failed to load products. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 charnoks-text">
              Products & Inventory
            </h1>
            <p className="text-gray-300 text-lg">
              Manage your restaurant's menu and stock levels
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="charnoks-gradient hover:opacity-90 text-white font-bold h-14 px-8 rounded-xl transition-all duration-300 animate-pulse-glow"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-xl border-white/20 shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl font-bold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription className="text-gray-300 text-lg">
                  {editingProduct 
                    ? "Update the product details below" 
                    : "Enter the details for your new product"}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-lg">Product Name</Label>
                    <Input
                      {...form.register("name")}
                      className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 rounded-xl"
                      placeholder="Enter product name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-lg">Category</Label>
                    <Input
                      {...form.register("category")}
                      className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 rounded-xl"
                      placeholder="Enter category"
                    />
                    {form.formState.errors.category && (
                      <p className="text-red-400 text-sm">{form.formState.errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-lg">Price</Label>
                    <Input
                      {...form.register("price")}
                      type="number"
                      step="0.01"
                      className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 rounded-xl"
                      placeholder="0.00"
                    />
                    {form.formState.errors.price && (
                      <p className="text-red-400 text-sm">{form.formState.errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-lg">Stock Quantity</Label>
                    <Input
                      {...form.register("stock")}
                      type="number"
                      className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 rounded-xl"
                      placeholder="0"
                    />
                    {form.formState.errors.stock && (
                      <p className="text-red-400 text-sm">{form.formState.errors.stock.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-semibold text-lg">Description</Label>
                  <Input
                    {...form.register("description")}
                    className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 rounded-xl"
                    placeholder="Optional product description"
                  />
                </div>

                <ImageUpload
                  onImageUpload={handleImageUpload}
                  initialImage={form.watch("imageUrl")}
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                />

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    onClick={handleCloseDialog}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-white/30 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="flex-1 charnoks-gradient hover:opacity-90 text-white font-bold h-12 rounded-xl transition-all duration-300"
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending 
                      ? "Saving..." 
                      : editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid/Table */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl animate-slide-in-left rounded-2xl overflow-hidden">
          <CardHeader className="bg-black/20 border-b border-white/20">
            <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
              Product Inventory
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Manage your restaurant's menu items and stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-16">
                <Package className="h-24 w-24 text-gray-500 mx-auto mb-6 opacity-50 animate-pulse" />
                <h3 className="text-2xl font-bold text-white mb-4">Loading Products...</h3>
                <p className="text-gray-300 text-lg">Please wait while we fetch your inventory</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-24 w-24 text-gray-500 mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-4">No Products Yet</h3>
                <p className="text-gray-300 text-lg">
                  Start building your menu by adding your first product
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
                      <TableHead className="text-white font-bold text-lg">Name</TableHead>
                      <TableHead className="text-white font-bold text-lg">Category</TableHead>
                      <TableHead className="text-white font-bold text-lg">Price</TableHead>
                      <TableHead className="text-white font-bold text-lg">Stock</TableHead>
                      <TableHead className="text-white font-bold text-lg">Status</TableHead>
                      <TableHead className="text-white font-bold text-lg">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: Product) => (
                      <TableRow 
                        key={product.id} 
                        className="border-white/20 hover:bg-white/5 transition-colors duration-200"
                      >
                        <TableCell className="text-white font-medium text-lg">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-sm">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-400 font-bold text-lg">
                          ₱{parseFloat(product.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                            className={`text-sm ${
                              product.stock > 10 
                                ? "bg-green-500/20 text-green-300" 
                                : product.stock > 0 
                                  ? "bg-yellow-500/20 text-yellow-300" 
                                  : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {product.stock} units
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.isActive ? "default" : "secondary"}
                            className={product.isActive ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 text-sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              disabled={deleteProductMutation.isPending}
                              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UniversalLayout>
  );
};