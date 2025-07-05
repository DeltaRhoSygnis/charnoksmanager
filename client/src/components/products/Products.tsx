import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OfflineState } from "@/lib/offlineState";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";
import { ImageUpload } from "./ImageUpload";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock must be positive"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product extends ProductFormData {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      category: "",
      imageUrl: "",
      description: "",
    },
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Check if Firebase is accessible
      if (OfflineState.hasFirebaseAccess()) {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Product[];
        setProducts(productsData);
      } else {
        // Fallback to local storage
        const localProducts = LocalStorageDB.getProducts();
        setProducts(localProducts.map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })));
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Using local storage.",
        variant: "destructive",
      });
      
      // Fallback to local storage on error
      const localProducts = LocalStorageDB.getProducts();
      setProducts(localProducts.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
        ...data,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (editingProduct) {
        // Update existing product
        if (OfflineState.hasFirebaseAccess()) {
          await updateDoc(doc(db, "products", editingProduct.id), {
            ...data,
            updatedAt: new Date(),
          });
        } else {
          LocalStorageDB.updateProduct(editingProduct.id, {
            ...data,
            updatedAt: new Date(),
          });
        }
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        if (OfflineState.hasFirebaseAccess()) {
          await addDoc(collection(db, "products"), productData);
        } else {
          LocalStorageDB.addProduct(productData);
        }
        
        toast({
          title: "Success", 
          description: "Product created successfully",
        });
      }

      await loadProducts();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || "",
      description: product.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      if (OfflineState.hasFirebaseAccess()) {
        await deleteDoc(doc(db, "products", product.id));
      } else {
        LocalStorageDB.deleteProduct(product.id);
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      await loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    form.reset({
      name: "",
      price: 0,
      stock: 0,
      category: "",
      imageUrl: "",
      description: "",
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    form.setValue("imageUrl", imageUrl);
  };

  return (
    <OptimizedLayout>
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
                      {...form.register("price", { valueAsNumber: true })}
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
                      {...form.register("stock", { valueAsNumber: true })}
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
                  currentImageUrl={form.watch("imageUrl")}
                  disabled={false}
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
                    className="flex-1 charnoks-gradient hover:opacity-90 text-white font-bold h-12 rounded-xl transition-all duration-300"
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
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
            {loading ? (
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
                      <TableHead className="text-white font-bold text-lg">Image</TableHead>
                      <TableHead className="text-white font-bold text-lg">Name</TableHead>
                      <TableHead className="text-white font-bold text-lg">Category</TableHead>
                      <TableHead className="text-white font-bold text-lg">Price</TableHead>
                      <TableHead className="text-white font-bold text-lg">Stock</TableHead>
                      <TableHead className="text-white font-bold text-lg">Status</TableHead>
                      <TableHead className="text-white font-bold text-lg">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow 
                        key={product.id} 
                        className="border-white/20 hover:bg-white/5 transition-colors duration-200"
                      >
                        <TableCell className="p-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Package className="h-8 w-8 text-orange-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-medium text-lg">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-sm">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-400 font-bold text-lg">
                          ₱{product.price.toFixed(2)}
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
                              onClick={() => handleDelete(product)}
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
    </OptimizedLayout>
  );
};