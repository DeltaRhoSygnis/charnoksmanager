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
import { Edit, Trash2, Plus } from "lucide-react";
import { ResponsiveLayout } from "@/components/dashboard/ResponsiveLayout";

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
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
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
    setIsLoading(true);
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

      reset();
      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("price", product.price);
    setValue("stock", product.stock);
    setValue("category", product.category);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
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
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    reset();
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  {editingProduct
                    ? "Update product information"
                    : "Add a new product to your inventory"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Product Name</Label>
                  <Input 
                    id="name" 
                    {...register("name")} 
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400" 
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price" className="text-white">Price (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stock" className="text-white">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Input
                    id="category"
                    {...register("category")}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.category && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="imageUrl" className="text-white">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    {...register("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.imageUrl.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                  <Input
                    id="description"
                    {...register("description")}
                    placeholder="Product description"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isLoading
                      ? "Saving..."
                      : editingProduct
                        ? "Update Product"
                        : "Add Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Product Inventory</CardTitle>
            <CardDescription className="text-gray-300">Manage your product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Price</TableHead>
                  <TableHead className="text-gray-300">Stock</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-400"
                    >
                      No products found. Add your first product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="border-white/20">
                      <TableCell className="font-medium text-white">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-gray-300">{product.category}</TableCell>
                      <TableCell className="text-white">₱{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-300">{product.stock}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.stock > 0 ? "default" : "destructive"
                          }
                          className={product.stock > 0 ? "bg-green-600" : "bg-red-600"}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="border-white/20 text-white hover:bg-white/10"
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
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};
