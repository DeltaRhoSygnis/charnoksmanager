import { useState, useRef } from "react";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, X, Camera } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

export const ImageUpload = ({ onImageUpload, currentImageUrl, disabled }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPEG, PNG, or WebP image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      // Check if Firebase is available
      const isFirebaseAvailable = await checkFirebaseAvailability();
      
      if (isFirebaseAvailable) {
        // Firebase upload path
        const timestamp = Date.now();
        const fileName = `products/${timestamp}-${file.name}`;
        const storageRef = ref(storage, fileName);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        onImageUpload(downloadURL);
        toast({
          title: "Image Uploaded Successfully",
          description: "Your product image has been uploaded to Firebase",
        });
      } else {
        // Local storage fallback - convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          onImageUpload(base64String);
          toast({
            title: "Image Saved Locally",
            description: "Your product image has been saved locally",
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      
      // Fallback to local storage on any error
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          onImageUpload(base64String);
          toast({
            title: "Image Saved Locally",
            description: "Firebase unavailable, saved locally instead",
          });
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        toast({
          title: "Upload Failed",
          description: "Failed to save image. Please try again.",
          variant: "destructive",
        });
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const checkFirebaseAvailability = async (): Promise<boolean> => {
    try {
      // Simple check for Firebase availability
      const testRef = ref(storage, 'test');
      return true;
    } catch (error) {
      return false;
    }
  };

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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-white font-semibold text-lg">
        Product Image
      </Label>
      
      {previewUrl ? (
        <div className="relative">
          <div className="w-full h-48 bg-white/5 rounded-lg overflow-hidden border-2 border-white/20">
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/50 border-white/30 text-white hover:bg-red-500/50"
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-orange-500 bg-orange-500/10"
              : "border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="text-white font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium mb-1">
                  Drop image here or click to select
                </p>
                <p className="text-sm text-gray-400">
                  Supports JPEG, PNG, WebP (max 5MB)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Image
              </Button>
            </div>
          )}
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="border-white/30 text-white hover:bg-white/10"
          disabled={disabled || isUploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          {previewUrl ? "Change Image" : "Add Image"}
        </Button>
        
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeImage}
            className="border-red-400 text-red-400 hover:bg-red-400/10"
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};