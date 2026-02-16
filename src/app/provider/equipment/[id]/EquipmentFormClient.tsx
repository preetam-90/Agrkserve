'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Upload,
  X,
  MapPin,
  Plus,
  Video,
  Tractor,
  Layers,
  DollarSign,
  List,
  Image as ImageIcon,
  Power,
  Save,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { motion, useMotionTemplate, useSpring, AnimatePresence } from 'framer-motion';
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

const sanitizeForFileName = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
};

export default function EquipmentFormPage() {
  const router = useRouter();
  const params = useParams();
  const { profile } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Inline validation errors for required fields (inline UX improvements)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  const handleMouseMove = useCallback(
    ({ clientX, clientY }: MouseEvent) => {
      if (containerRef.current) {
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (clientX - left) / width;
        const y = (clientY - top) / height;
        mouseX.set(x);
        mouseY.set(y);
      }
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

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

  const buildEquipmentMediaBaseName = () => {
    const parts = [
      formData.category,
      formData.brand,
      formData.model,
      formData.name,
      formData.year,
    ]
      .filter((part) => typeof part === 'string' && part.trim().length > 0)
      .map((part) => sanitizeForFileName(part as string))
      .filter(Boolean);

    return parts.length > 0 ? parts.join('-') : 'equipment';
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
      for (const file of selectedFiles) {
        const isSquare = await checkIfImageIsSquare(file);
        if (!isSquare) {
          setImageToCrop(file);
          setShowImageCropper(true);
          return;
        }
      }
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
          const uploadData = new FormData();
          const baseName = buildEquipmentMediaBaseName();
          const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const publicId = `${baseName}-image-${fileIndex + 1}-${uniqueSuffix}`;

          uploadData.append('file', file);
          uploadData.append('upload_preset', uploadPreset);
          uploadData.append('folder', 'agri-serve/equipment');
          uploadData.append('public_id', publicId);
          uploadData.append('use_filename', 'false');
          uploadData.append('unique_filename', 'false');

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const fileProgress = (event.loaded / event.total) * 100;
              const overallProgress = ((fileIndex + fileProgress / 100) / totalFiles) * 100;
              setUploadProgress(Math.round(overallProgress));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data.secure_url as string);
              } catch {
                reject(new Error('Invalid server response'));
              }
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
          xhr.send(uploadData);
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
      const duration = await getVideoDuration(file);
      if (duration > 15) {
        setVideoToTrim(file);
        setShowVideoTrimmer(true);
        toast('Please select a 15-second segment from your video');
      } else {
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
          const uploadData = new FormData();
          const baseName = buildEquipmentMediaBaseName();
          const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const publicId = `${baseName}-video-${uniqueSuffix}`;

          uploadData.append('file', file);
          uploadData.append('upload_preset', uploadPreset);
          uploadData.append('folder', 'agri-serve/equipment');
          uploadData.append('resource_type', 'video');
          uploadData.append('public_id', publicId);
          uploadData.append('use_filename', 'false');
          uploadData.append('unique_filename', 'false');

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

          xhr.addEventListener('error', () => reject(new Error('Video upload failed')));
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
          xhr.send(uploadData);
        });
      };

      const videoUrl = await uploadWithProgress();
      setFormData((prev) => ({ ...prev, video_url: videoUrl }));
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
      const toastId = toast.loading('Processing video... 0%');

      const trimmedFile = await trimVideo(videoToTrim, startTime, endTime, (progress) => {
        toast.loading(`Processing video... ${progress}%`, { id: toastId });
      });

      toast.loading('Uploading video...', { id: toastId });
      setVideoToTrim(null);
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
    setFormData((prev) => ({ ...prev, video_url: null }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Equipment name is required';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (!formData.price_per_day || parseFloat(formData.price_per_day) <= 0) {
      errors.price_per_day = 'Valid price per day is required';
    }
    if (!formData.location_name.trim()) {
      errors.location_name = 'Location is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F0C]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
          <p className="animate-pulse text-sm uppercase tracking-wider text-emerald-500/70">
            Initializing Interface...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-x-hidden bg-[#0A0F0C] text-white selection:bg-emerald-500/30"
    >
      <Header />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#22c55e0a,transparent)]" />

        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: useMotionTemplate`radial-gradient(600px circle at ${mouseX.get() * 100}% ${mouseY.get() * 100}%, rgba(34, 197, 94, 0.08), transparent 40%)`,
          }}
        />
      </div>

      <div className="relative z-10 flex">
        <main className="flex-1 px-4 pb-20 pt-28 transition-all duration-500 ease-out lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-7xl"
          >
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="group -ml-4 mb-2 h-auto w-auto px-4 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Inventory
                </Button>

                <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                  {isEdit ? 'Update Equipment' : 'List New Equipment'}
                </h1>
                <p className="flex items-center gap-2 text-gray-400">
                  <Info className="h-4 w-4 text-emerald-500" />
                  {isEdit
                    ? 'Modify your listing details below'
                    : 'Fill in the details to start earning from your machinery'}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:text-white"
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  className="bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? 'Save Changes' : 'Publish Listing'}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-8 lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="group overflow-hidden border-white/5 bg-[#121212]/60 shadow-xl backdrop-blur-xl transition-colors duration-500 hover:border-emerald-500/30">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <CardContent className="relative z-10 space-y-6 p-8">
                      <div className="mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                          <Tractor className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Core Details</h2>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            Equipment Name <span className="text-emerald-500">*</span>
                          </label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. John Deere 5310 Tractor"
                            className="h-12 border-white/10 bg-black/40 text-lg focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                          {validationErrors.name && (
                            <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            Category <span className="text-emerald-500">*</span>
                          </label>
                          <Select value={formData.category} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="h-12 border-white/10 bg-black/40 text-white focus:ring-emerald-500/20">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="border-emerald-500/20 bg-[#1A1F1C] text-white">
                              {EQUIPMENT_CATEGORIES.map((cat) => (
                                <SelectItem
                                  key={cat.value}
                                  value={cat.value}
                                  className="focus:bg-emerald-500/20 focus:text-emerald-300"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors.category && (
                            <p className="mt-1 text-sm text-red-400">{validationErrors.category}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Description</label>
                          <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Detailed description of the equipment capabilities..."
                            rows={5}
                            className="resize-none border-white/10 bg-black/40 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="group overflow-hidden border-white/5 bg-[#121212]/60 shadow-xl backdrop-blur-xl transition-colors duration-500 hover:border-emerald-500/30">
                    <CardContent className="relative z-10 p-8">
                      <div className="mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Visual Gallery</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {formData.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="group/img relative aspect-square overflow-hidden rounded-xl border border-white/10"
                          >
                            <Image
                              src={img}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="rounded-full bg-red-500/80 p-2 text-white transition-colors hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            {idx === 0 && (
                              <span className="absolute bottom-2 left-2 rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                COVER
                              </span>
                            )}
                          </div>
                        ))}

                        <label className="group/upload flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5">
                          {isUploading && uploadType === 'image' ? (
                            <CircularProgress progress={uploadProgress} size="sm" />
                          ) : (
                            <>
                              <Upload className="mb-2 h-6 w-6 text-gray-400 transition-colors group-hover/upload:text-emerald-400" />
                              <span className="text-xs text-gray-500 group-hover/upload:text-emerald-400/70">
                                Add Photo
                              </span>
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

                      <div className="mt-8 border-t border-white/5 pt-6">
                        <div className="mb-4 flex items-center gap-2 text-emerald-400/80">
                          <Video className="h-4 w-4" />
                          <span className="text-sm font-medium uppercase tracking-wider">
                            Demo Video (Optional)
                          </span>
                        </div>

                        {formData.video_url ? (
                          <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-black">
                            <video src={formData.video_url} controls className="h-full w-full" />
                            <button
                              type="button"
                              onClick={handleRemoveVideo}
                              className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 text-white hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="group/video flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-white/10 bg-white/5 p-4 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5">
                            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400 group-hover/video:bg-emerald-500/20">
                              <Video className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-300">
                                Upload Demo Video
                              </div>
                              <div className="text-xs text-gray-500">
                                Max 15 seconds • MP4, WebM
                              </div>
                            </div>
                            {isUploading && uploadType === 'video' ? (
                              <CircularProgress progress={uploadProgress} size="sm" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500" />
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
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="space-y-8 lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="group relative overflow-hidden border-white/5 bg-[#121212]/60 shadow-xl backdrop-blur-xl transition-colors hover:border-emerald-500/30">
                    <div className="absolute right-0 top-0 p-4 opacity-10">
                      <DollarSign className="h-24 w-24 rotate-12 text-emerald-500" />
                    </div>
                    <CardContent className="relative z-10 p-8">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Pricing</h2>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-300">
                            Daily Rate (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-500">
                              ₹
                            </span>
                            <Input
                              name="price_per_day"
                              type="number"
                              value={formData.price_per_day}
                              onChange={handleInputChange}
                              placeholder="2000"
                              className="h-14 border-white/10 bg-black/40 pl-10 text-2xl font-bold text-white placeholder:text-gray-700 focus:border-emerald-500/50"
                            />
                            {validationErrors.price_per_day && (
                              <p className="mt-1 text-sm text-red-400">
                                {validationErrors.price_per_day}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-300">
                            Hourly Rate (₹){' '}
                            <span className="text-xs font-normal text-gray-500">(Optional)</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-500">
                              ₹
                            </span>
                            <Input
                              name="price_per_hour"
                              type="number"
                              value={formData.price_per_hour}
                              onChange={handleInputChange}
                              placeholder="500"
                              className="h-12 border-white/10 bg-black/40 pl-10 text-lg text-white placeholder:text-gray-700 focus:border-emerald-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="group overflow-hidden border-white/5 bg-[#121212]/60 shadow-xl backdrop-blur-xl transition-colors hover:border-emerald-500/30">
                    <CardContent className="relative z-10 p-8">
                      <div className="mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                          <Layers className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Specifications</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                            Brand & Model
                          </label>
                          <div className="flex gap-2">
                            <Input
                              name="brand"
                              value={formData.brand}
                              onChange={handleInputChange}
                              placeholder="Brand"
                              className="border-white/10 bg-black/40 focus:border-emerald-500/40"
                            />
                            <Input
                              name="model"
                              value={formData.model}
                              onChange={handleInputChange}
                              placeholder="Model"
                              className="border-white/10 bg-black/40 focus:border-emerald-500/40"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                            Year
                          </label>
                          <Input
                            name="year"
                            type="number"
                            value={formData.year}
                            onChange={handleInputChange}
                            placeholder="YYYY"
                            className="border-white/10 bg-black/40 focus:border-emerald-500/40"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                            Horsepower
                          </label>
                          <Input
                            name="horsepower"
                            type="number"
                            value={formData.horsepower}
                            onChange={handleInputChange}
                            placeholder="HP"
                            className="border-white/10 bg-black/40 focus:border-emerald-500/40"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
                            Fuel Type
                          </label>
                          <Select value={formData.fuel_type} onValueChange={handleFuelTypeChange}>
                            <SelectTrigger className="border-white/10 bg-black/40 text-white focus:ring-emerald-500/20">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent className="border-emerald-500/20 bg-[#1A1F1C] text-white">
                              {['Diesel', 'Petrol', 'Electric', 'Manual'].map((t) => (
                                <SelectItem
                                  key={t.toLowerCase()}
                                  value={t.toLowerCase()}
                                  className="focus:bg-emerald-500/20"
                                >
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  <Card className="border-white/5 bg-[#121212]/60 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <MapPin className="h-5 w-5" />
                          <span className="font-semibold">Location</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleGetLocation}
                          className="h-8 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/20"
                        >
                          Auto-Detect
                        </Button>
                      </div>
                      <Input
                        name="location_name"
                        value={formData.location_name}
                        onChange={handleInputChange}
                        placeholder="City, District"
                        className="border-white/10 bg-black/40 focus:border-emerald-500/40"
                      />
                      {validationErrors.location_name && (
                        <p className="mt-1 text-sm text-red-400">
                          {validationErrors.location_name}
                        </p>
                      )}
                      {formData.latitude !== 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-500/80">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Coordinates secured</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-[#121212]/60 backdrop-blur-xl">
                    <CardContent className="flex items-center justify-between p-6">
                      <div>
                        <div className="flex items-center gap-2 font-medium text-white">
                          <Power className="h-4 w-4 text-emerald-500" />
                          Active Status
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Visible in search results</p>
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
                        <div className="peer h-6 w-11 rounded-full bg-gray-700/50 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-gray-400 after:transition-all after:content-[''] peer-checked:bg-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:bg-emerald-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30"></div>
                      </label>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="lg:col-span-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="border-white/5 bg-[#121212]/60 backdrop-blur-xl transition-colors hover:border-emerald-500/30">
                    <CardContent className="p-8">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                          <List className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Features & Highlights</h2>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-3">
                        <AnimatePresence>
                          {formData.features.map((feature, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300"
                            >
                              {feature}
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(idx)}
                                className="hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                        <div className="flex items-center gap-2">
                          <Input
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && (e.preventDefault(), handleAddFeature())
                            }
                            placeholder="Add feature..."
                            className="h-9 w-40 border-white/10 bg-transparent text-sm focus:border-emerald-500/50"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddFeature}
                            variant="ghost"
                            className="h-9 w-9 rounded-full border border-white/10 p-0 hover:bg-emerald-500/20 hover:text-emerald-400"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </main>
      </div>

      {showVideoTrimmer && videoToTrim && (
        <VideoTrimmer
          open={showVideoTrimmer}
          videoFile={videoToTrim}
          maxDuration={15}
          onTrim={handleVideoTrim}
          onCancel={handleVideoTrimCancel}
        />
      )}

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
