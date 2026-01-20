'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  Upload,
  X,
  MapPin,
  Plus,
  Loader2
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { 
  Button, 
  Card, 
  CardContent, 
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner
} from '@/components/ui';
import { equipmentService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { EquipmentCategory } from '@/lib/types';
import { EQUIPMENT_CATEGORIES } from '@/lib/utils';
import { IMAGE_UPLOAD } from '@/lib/utils/constants';
import toast from 'react-hot-toast';

interface EquipmentFormData {
  name: string;
  description: string;
  category: EquipmentCategory | '';
  brand: string;
  model: string;
  year: string;
  horsepower: string;
  fuel_type: string;
  price_per_day: string;
  price_per_hour: string;
  location_name: string;
  latitude: number;
  longitude: number;
  features: string[];
  images: string[];
  is_available: boolean;
}

export default function EquipmentFormPage() {
  const router = useRouter();
  const params = useParams();
  const { profile } = useAuthStore();
  
  const isEdit = params.id !== 'new';
  const equipmentId = isEdit ? (params.id as string) : null;
  
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    year: '',
    horsepower: '',
    fuel_type: '',
    price_per_day: '',
    price_per_hour: '',
    location_name: profile?.address || '',
    latitude: profile?.latitude || 0,
    longitude: profile?.longitude || 0,
    features: [],
    images: [],
    is_available: true,
  });

  useEffect(() => {
    if (isEdit && equipmentId) {
      loadEquipment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, equipmentId]);

  const loadEquipment = async () => {
    try {
      const data = await equipmentService.getEquipmentById(equipmentId!);
      if (!data) {
        toast.error('Equipment not found');
        router.push('/provider/equipment');
        return;
      }
      setFormData({
        name: data.name,
        description: data.description || '',
        category: data.category || '',
        brand: data.brand || '',
        model: data.model || '',
        year: data.year?.toString() || '',
        horsepower: data.horsepower?.toString() || '',
        fuel_type: data.fuel_type || '',
        price_per_day: data.price_per_day.toString(),
        price_per_hour: data.price_per_hour?.toString() || '',
        location_name: data.location_name || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        features: data.features || [],
        images: data.images || [],
        is_available: data.is_available,
      });
    } catch (err) {
      console.error('Failed to load equipment:', err);
      toast.error('Failed to load equipment');
      router.push('/provider/equipment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value as EquipmentCategory }));
  };

  const handleFuelTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, fuel_type: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const selectedFiles = Array.from(files);
      const totalCount = formData.images.length + selectedFiles.length;
      if (totalCount > IMAGE_UPLOAD.MAX_FILES) {
        toast.error(`You can upload up to ${IMAGE_UPLOAD.MAX_FILES} images`);
        return;
      }

      const invalidType = selectedFiles.find(file => !IMAGE_UPLOAD.ALLOWED_TYPES.includes(file.type));
      if (invalidType) {
        toast.error('Only JPG, PNG, or WebP images are allowed');
        return;
      }

      const maxSizeBytes = IMAGE_UPLOAD.MAX_SIZE_MB * 1024 * 1024;
      const tooLarge = selectedFiles.find(file => file.size > maxSizeBytes);
      if (tooLarge) {
        toast.error(`Each image must be under ${IMAGE_UPLOAD.MAX_SIZE_MB}MB`);
        return;
      }

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        toast.error('Cloudinary is not configured');
        return;
      }

      const uploadFile = async (file: File) => {
        const body = new FormData();
        body.append('file', file);
        body.append('upload_preset', uploadPreset);
        body.append('folder', 'agri-serve/equipment');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url as string;
      };

      const uploadedUrls = await Promise.all(selectedFiles.map(uploadFile));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success('Images uploaded successfully');
    } catch (err) {
      console.error('Failed to upload images:', err);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            location_name: data.display_name || prev.location_name,
          }));
          
          toast.success('Location detected');
        } catch {
          setFormData(prev => ({ ...prev, latitude, longitude }));
          toast.success('Coordinates captured');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get location');
      }
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Equipment name is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return false;
    }
    if (!formData.price_per_day || parseFloat(formData.price_per_day) <= 0) {
      toast.error('Valid price per day is required');
      return false;
    }
    if (!formData.location_name.trim()) {
      toast.error('Location is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const equipmentData = {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as EquipmentCategory,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        horsepower: formData.horsepower ? parseInt(formData.horsepower) : undefined,
        fuel_type: formData.fuel_type || undefined,
        price_per_day: parseFloat(formData.price_per_day),
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : undefined,
        location_name: formData.location_name,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        is_available: formData.is_available,
      };

      if (isEdit && equipmentId) {
        await equipmentService.updateEquipment(equipmentId, equipmentData);
        toast.success('Equipment updated successfully');
      } else {
        await equipmentService.createEquipment(equipmentData);
        toast.success('Equipment created successfully');
      }
      
      router.push('/provider/equipment');
    } catch (err) {
      console.error('Failed to save equipment:', err);
      toast.error('Failed to save equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Link 
          href="/provider/equipment"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to equipment
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Deere 5050D Tractor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your equipment, its condition, and what it's best used for..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Specifications</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <Input
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., John Deere"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <Input
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., 5050D"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <Input
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horsepower
                  </label>
                  <Input
                    name="horsepower"
                    type="number"
                    value={formData.horsepower}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <Select value={formData.fuel_type} onValueChange={handleFuelTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Pricing</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Day (₹) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="price_per_day"
                    type="number"
                    value={formData.price_per_day}
                    onChange={handleInputChange}
                    placeholder="e.g., 2500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Hour (₹)
                  </label>
                  <Input
                    name="price_per_hour"
                    type="number"
                    value={formData.price_per_hour}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Location</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Location <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      name="location_name"
                      value={formData.location_name}
                      onChange={handleInputChange}
                      placeholder="Village, District, State"
                      className="flex-1"
                      required
                    />
                    <Button type="button" variant="outline" onClick={handleGetLocation}>
                      <MapPin className="h-4 w-4 mr-1" />
                      Detect
                    </Button>
                  </div>
                  {formData.latitude !== 0 && formData.longitude !== 0 && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ GPS coordinates captured
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Features</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature (e.g., AC cabin, Power steering)"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Photos</h2>
              
              <div className="space-y-4">
                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image src={img} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload Button */}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-green-600 transition-colors">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mb-1" />
                        <span className="text-xs">Add Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                
                <p className="text-xs text-gray-500">
                  Add up to 10 photos. First photo will be the cover image.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Available for Booking</h2>
                  <p className="text-sm text-gray-500">
                    Turn off to temporarily hide from search results
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="flex-1"
            >
              {isEdit ? 'Save Changes' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
