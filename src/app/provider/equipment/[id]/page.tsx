'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, X, MapPin, Plus, Loader2, Video } from 'lucide-react';
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
  Spinner,
  VideoTrimmer,
  ImageCropper,
  CircularProgress,
} from '@/components/ui';
import { equipmentService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import { EquipmentCategory } from '@/lib/types';
import { EQUIPMENT_CATEGORIES } from '@/lib/utils';
import { IMAGE_UPLOAD } from '@/lib/utils/constants';
import { trimVideo, getVideoDuration } from '@/lib/utils/ffmpeg-trimmer';
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
  video_url: string | null;
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'image' | 'video' | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [showVideoTrimmer, setShowVideoTrimmer] = useState(false);
  const [videoToTrim, setVideoToTrim] = useState<File | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);

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
    video_url: null,
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
        video_url: (data as { video_url?: string | null }).video_url || null,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value as EquipmentCategory }));
  };

  const handleFuelTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, fuel_type: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const selectedFiles = Array.from(files);

      // Check if we need to crop any images
      for (const file of selectedFiles) {
        const isSquare = await checkIfImageIsSquare(file);
        if (!isSquare) {
          // Show cropper for non-square image
          setImageToCrop(file);
          setShowImageCropper(true);
          // Store remaining files for later (if needed)
          return;
        }
      }

      // All images are square, proceed with upload
      await uploadImagesToCloudinary(selectedFiles);
    } catch (err) {
      console.error('Failed to process images:', err);
      toast.error('Failed to process images');
    }
  };

  const checkIfImageIsSquare = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img.width === img.height);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImagesToCloudinary = async (files: File[]) => {
    setIsUploading(true);
    setUploadType('image');
    setUploadProgress(0);

    try {
      const totalCount = formData.images.length + files.length;
      if (totalCount > IMAGE_UPLOAD.MAX_FILES) {
        toast.error(`You can upload up to ${IMAGE_UPLOAD.MAX_FILES} images`);
        return;
      }

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        toast.error('Cloudinary is not configured');
        return;
      }

      const uploadFileWithProgress = (
        file: File,
        fileIndex: number,
        totalFiles: number
      ): Promise<string> => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', 'agri-serve/equipment');

          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const fileProgress = (event.loaded / event.total) * 100;
              const overallProgress = ((fileIndex + fileProgress / 100) / totalFiles) * 100;
              setUploadProgress(Math.round(overallProgress));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              resolve(data.secure_url as string);
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
          xhr.send(formData);
        });
      };

      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFileWithProgress(files[i], i, files.length);
        uploadedUrls.push(url);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success('Images uploaded successfully');
    } catch (err) {
      console.error('Failed to upload images:', err);
      toast.error('Failed to upload images');
    } finally {
      setUploadProgress(0);
      setUploadType(null);
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check video duration
      const duration = await getVideoDuration(file);

      if (duration > 15) {
        // Always show trimmer for videos longer than 15 seconds
        setVideoToTrim(file);
        setShowVideoTrimmer(true);
        toast('Please select a 15-second segment from your video');
      } else {
        // Show trimmer even for short videos to allow user to select the segment
        setVideoToTrim(file);
        setShowVideoTrimmer(true);
        toast('Select the portion of video you want to upload');
      }
    } catch (err) {
      console.error('Failed to read video:', err);
      toast.error('Failed to read video file');
    }
  };

  const uploadVideoToCloudinary = async (file: File) => {
    setIsUploading(true);
    setUploadType('video');
    setUploadProgress(0);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        toast.error('Cloudinary is not configured');
        return;
      }

      const uploadWithProgress = (): Promise<string> => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', 'agri-serve/equipment');
          formData.append('resource_type', 'video');

          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              setUploadProgress(Math.round(progress));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              resolve(data.secure_url as string);
            } else {
              reject(new Error('Video upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Video upload failed'));
          });

          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
          xhr.send(formData);
        });
      };

      const videoUrl = await uploadWithProgress();

      setFormData((prev) => ({
        ...prev,
        video_url: videoUrl,
      }));

      toast.success('Video uploaded successfully');
    } catch (err) {
      console.error('Failed to upload video:', err);
      toast.error('Failed to upload video');
    } finally {
      setUploadProgress(0);
      setUploadType(null);
      setIsUploading(false);
    }
  };

  const handleVideoTrim = async (startTime: number, endTime: number) => {
    if (!videoToTrim) return;

    try {
      setShowVideoTrimmer(false);
      setIsUploading(true);

      // Show progress toast
      const toastId = toast.loading('Processing video... 0%');

      // Trim video using FFmpeg with progress callback
      const trimmedFile = await trimVideo(videoToTrim, startTime, endTime, (progress) => {
        toast.loading(`Processing video... ${progress}%`, { id: toastId });
      });

      toast.loading('Uploading video...', { id: toastId });

      setVideoToTrim(null);

      // Upload the trimmed video
      await uploadVideoToCloudinary(trimmedFile);

      toast.success('Video uploaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Failed to trim video:', err);
      toast.error('Failed to process video. Please try again.');
      setIsUploading(false);
    }
  };

  const handleVideoTrimCancel = () => {
    setShowVideoTrimmer(false);
    setVideoToTrim(null);
  };

  const handleImageCrop = async (croppedFile: File) => {
    setShowImageCropper(false);
    setImageToCrop(null);

    // Upload the cropped image
    await uploadImagesToCloudinary([croppedFile]);
  };

  const handleImageCropCancel = () => {
    setShowImageCropper(false);
    setImageToCrop(null);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({
      ...prev,
      video_url: null,
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

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            location_name: data.display_name || prev.location_name,
          }));

          toast.success('Location detected');
        } catch {
          setFormData((prev) => ({ ...prev, latitude, longitude }));
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
        video_url: formData.video_url || undefined,
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

      <main className="mx-auto max-w-3xl px-4 pb-6 pt-28">
        <Link
          href="/provider/equipment"
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to equipment
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
              <h2 className="mb-4 text-lg font-semibold">Specifications</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
                  <Input
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., John Deere"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Model</label>
                  <Input
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., 5050D"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Year</label>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Horsepower</label>
                  <Input
                    name="horsepower"
                    type="number"
                    value={formData.horsepower}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Fuel Type</label>
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
              <h2 className="mb-4 text-lg font-semibold">Pricing</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
              <h2 className="mb-4 text-lg font-semibold">Location</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
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
                      <MapPin className="mr-1 h-4 w-4" />
                      Detect
                    </Button>
                  </div>
                  {formData.latitude !== 0 && formData.longitude !== 0 && (
                    <p className="mt-1 text-xs text-green-600">✓ GPS coordinates captured</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Features</h2>

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
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
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

          {/* Photos */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Photos</h2>

              <div className="space-y-4">
                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-green-500 hover:text-green-600">
                    {isUploading && uploadType === 'image' ? (
                      <CircularProgress progress={uploadProgress} size="md" />
                    ) : (
                      <>
                        <Upload className="mb-1 h-8 w-8" />
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
                  Add up to {IMAGE_UPLOAD.MAX_FILES} photos. Images will be cropped to square
                  format. First photo will be the cover image.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Video */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Video (Optional)</h2>

              <div className="space-y-4">
                {formData.video_url ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                    <video src={formData.video_url} controls className="h-full w-full" />
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-green-500 hover:text-green-600">
                    {isUploading && uploadType === 'video' ? (
                      <CircularProgress progress={uploadProgress} size="md" />
                    ) : (
                      <>
                        <Video className="mb-1 h-8 w-8" />
                        <span className="text-xs">Add Video</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                )}

                <p className="text-xs text-gray-500">
                  Add one video to showcase your equipment in action. Maximum 15 seconds. You'll be
                  able to select which portion to use.
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
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_available: e.target.checked }))
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rtl:peer-checked:after:-translate-x-full"></div>
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
            <Button type="submit" loading={isSubmitting} className="flex-1">
              {isEdit ? 'Save Changes' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </main>

      {/* Video Trimmer Modal */}
      {showVideoTrimmer && videoToTrim && (
        <VideoTrimmer
          open={showVideoTrimmer}
          videoFile={videoToTrim}
          maxDuration={15}
          onTrim={handleVideoTrim}
          onCancel={handleVideoTrimCancel}
        />
      )}

      {/* Image Cropper Modal */}
      {showImageCropper && imageToCrop && (
        <ImageCropper
          open={showImageCropper}
          imageFile={imageToCrop}
          onCrop={handleImageCrop}
          onCancel={handleImageCropCancel}
        />
      )}

      <Footer />
    </div>
  );
}
