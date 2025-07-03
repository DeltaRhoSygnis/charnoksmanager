import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { UniversalLayout } from "@/components/layout/UniversalLayout";

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
}

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), data);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await addDoc(collection(db, "products"), data);
        toast({
          title: "Success",
          description: "Product added successfully",
        });
      }
      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    reset();
  };

  return (
    <UniversalLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-bounce-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                <Package className="w-full h-full text-orange-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold charnoks-text animate-slide-in-left">
              Product Inventory
            </h1>
            <p className="text-xl text-white font-medium animate-slide-in-right">
              Manage your restaurant menu and inventory
            </p>
          </div>

          {/* Add Product Button */}
          <div className="flex justify-center animate-bounce-in delay-300">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="charnoks-gradient hover:opacity-90 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg">
                  <Plus className="h-6 w-6 mr-3" />
                  Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 backdrop-blur-xl border-white/20 rounded-2xl max-w-2xl">
                <DialogHeader className="space-y-4">
                  <DialogTitle className="text-white text-2xl font-bold flex items-center gap-3">
                    <Star className="h-6 w-6 text-yellow-400" />
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300 text-lg">
                    {editingProduct
                      ? "Update your product information"
                      : "Add a delicious new item to your menu"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white font-semibold text-lg">
                        Product Name
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter product name..."
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-white font-semibold text-lg">
                        Price (₱)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register("price", { valueAsNumber: true })}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-white font-semibold text-lg">
                        Stock Quantity
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        {...register("stock", { valueAsNumber: true })}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                      {errors.stock && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {errors.stock.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white font-semibold text-lg">
                        Category
                      </Label>
                      <Input
                        id="category"
                        {...register("category")}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Fried Chicken, Beverages"
                      />
                      {errors.category && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white font-semibold text-lg">
                      Description (Optional)
                    </Label>
                    <Input
                      id="description"
                      {...register("description")}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Describe your delicious product..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-white font-semibold text-lg">
                      Image URL (Optional)
                    </Label>
                    <Input
                      id="imageUrl"
                      {...register("imageUrl")}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

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
              {products.length === 0 ? (
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
                      {products.map((product) => (
                        <TableRow
                          key={product.id}
                          className="border-white/10 hover:bg-white/5 transition-colors duration-200"
                        >
                          <TableCell className="font-semibold text-white text-lg">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-gray-300 text-lg">
                            {product.category}
                          </TableCell>
                          <TableCell className="font-bold text-green-400 text-lg">
                            ₱{product.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-white text-lg">
                            {product.stock}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-sm font-bold ${
                                product.stock > 10
                                  ? "bg-green-600 text-white"
                                  : product.stock > 0
                                  ? "bg-yellow-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {product.stock > 10
                                ? "In Stock"
                                : product.stock > 0
                                ? "Low Stock"
                                : "Out of Stock"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleEdit(product)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(product.id)}
                                size="sm"
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700"
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
      </div>
    </UniversalLayout>
  );
};