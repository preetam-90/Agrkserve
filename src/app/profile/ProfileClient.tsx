'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Shield,
  Clock,
  ArrowLeft,
  Camera,
  LayoutDashboard,
  Lock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Award,
  ChevronRight,
  FileText,
  Sparkles,
  Crown,
  Zap,
  Target,
  Activity,
  ShieldCheck,
  Home,
  LogOut,
  Pencil,
  Monitor,
  MapPinned,
} from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Separator,
} from '@/components/ui';
import { ImageCropper } from '@/components/image-cropper';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

 
const _scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

 
const _slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Mock function to get device info - replace with actual implementation
const getDeviceInfo = () => {
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
  const isChrome = userAgent.includes('Chrome');
  const isFirefox = userAgent.includes('Firefox');
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
  const isWindows = userAgent.includes('Windows');
  const isMac = userAgent.includes('Mac');
  const isLinux = userAgent.includes('Linux');

  let browser = 'Browser';
  if (isChrome) browser = 'Chrome';
  else if (isFirefox) browser = 'Firefox';
  else if (isSafari) browser = 'Safari';

  let os = 'OS';
  if (isWindows) os = 'Windows';
  else if (isMac) os = 'macOS';
  else if (isLinux) os = 'Linux';

  return `${browser} on ${os}`;
};

// Mock function to get location - replace with actual implementation
const getLocationInfo = () => {
  // In a real app, you'd get this from the backend based on IP or user preference
  return 'Meerut';
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, refreshProfile, isLoading: authLoading, signOut } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_image: '',
    bio: '',
    address: '',
    pincode: '',
  });
  const [tempFieldValue, setTempFieldValue] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profile_image: profile.profile_image || '',
        bio: profile.bio || '',
        address: profile.address || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, authLoading, router]);

  const completionStats = useMemo(() => {
    if (!formData) return { percentage: 0, completed: 0, total: 6 };

    const fields = [
      { name: 'name', value: formData.name, label: 'Business Name', icon: User },
      { name: 'email', value: formData.email, label: 'Email Address', icon: Mail },
      { name: 'phone', value: formData.phone, label: 'Phone Number', icon: Phone },
      {
        name: 'profile_image',
        value: formData.profile_image,
        label: 'Profile Picture',
        icon: Camera,
      },
      { name: 'address', value: formData.address, label: 'Address', icon: MapPin },
      { name: 'bio', value: formData.bio, label: 'Bio', icon: FileText },
    ];

    const completed = fields.filter((f) => f.value && f.value.trim() !== '').length;
    const percentage = Math.round((completed / fields.length) * 100);

    return { percentage, completed, total: fields.length, fields };
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldEdit = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName);
    setTempFieldValue(currentValue);
  };

  const handleFieldSave = async (fieldName: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await authService.upsertProfile(user.id, {
        [fieldName]: tempFieldValue,
      });
      await refreshProfile();
      setEditingField(null);
      toast.success(`${fieldName} updated successfully!`);
    } catch {
      toast.error(`Failed to update ${fieldName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setTempFieldValue('');
  };

  const handleProfilePictureUpload = async (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, profile_image: imageUrl }));

    if (user && !isEditing) {
      setIsLoading(true);
      try {
        await authService.upsertProfile(user.id, {
          profile_image: imageUrl,
        });
        await refreshProfile();
        toast.success('Profile picture updated!');
      } catch {
        toast.error('Failed to update profile picture');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      await authService.upsertProfile(user.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profile_image: formData.profile_image,
        bio: formData.bio,
        address: formData.address,
        pincode: formData.pincode,
      });

      await refreshProfile();
      setIsEditing(false);
      setActiveTab('overview');
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      console.error('Profile update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profile_image: profile.profile_image || '',
        bio: profile.bio || '',
        address: profile.address || '',
        pincode: profile.pincode || '',
      });
    }
    setIsEditing(false);
    setActiveTab('overview');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-12 w-12 text-violet-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Back Button - Floating */}
      <div className="fixed left-4 top-20 z-50">
        <BackButton variant="floating" />
      </div>

      {/* Image Cropper Modal */}
      {cropImage && (
        <ImageCropper
          image={cropImage}
          onCropComplete={async (croppedBlob) => {
            // Upload the cropped image
            const formDataUpload = new FormData();
            formDataUpload.append('file', croppedBlob, 'profile.jpg');
            formDataUpload.append('userId', user?.id || '');
            formDataUpload.append('bucket', 'avatars');
            formDataUpload.append('folder', 'profile-pictures');

            try {
              const response = await fetch('/api/upload/profile', {
                method: 'POST',
                body: formDataUpload,
              });
              const data = await response.json();
              if (data.success) {
                setFormData((prev) => ({ ...prev, profile_image: data.url }));
                toast.success('Profile picture updated');
              } else {
                toast.error('Failed to upload image');
              }
            } catch {
              toast.error('Failed to upload image');
            } finally {
              setCropImage(null);
              URL.revokeObjectURL(cropImage);
            }
          }}
          onCancel={() => {
            setCropImage(null);
            URL.revokeObjectURL(cropImage);
          }}
        />
      )}
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/2 -top-1/2 h-full w-full animate-pulse bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full animate-pulse bg-gradient-to-tl from-emerald-900/20 via-teal-900/10 to-transparent blur-3xl delay-1000" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-600/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-900/50 to-slate-950" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-violet-400">Profile</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="border-slate-700 bg-slate-800/50 text-slate-300 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/50 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </motion.div>

          {/* Profile Header */}
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                type: 'spring',
                stiffness: 100,
                damping: 15,
              }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-emerald-600 opacity-25 blur-xl transition-opacity duration-500 group-hover:opacity-50" />

              <div className="relative h-40 w-40 overflow-hidden rounded-full bg-slate-800 shadow-2xl ring-4 ring-slate-800/50 lg:h-48 lg:w-48">
                {formData.profile_image ? (
                  <Image
                    src={formData.profile_image}
                    alt={formData.name}
                    width={192}
                    height={192}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-emerald-600">
                    <span className="text-5xl font-bold tracking-wider text-white lg:text-6xl">
                      {getInitials(formData.name)}
                    </span>
                  </div>
                )}

                {/* Edit Mode Overlay */}
                {activeTab === 'edit' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Create a temporary URL and open cropper
                        const tempUrl = URL.createObjectURL(file);
                        setCropImage(tempUrl);
                      }}
                      className="hidden"
                      id="profile-picture-input"
                    />
                    <label
                      htmlFor="profile-picture-input"
                      className="cursor-pointer rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                    >
                      Change Photo
                    </label>
                    {formData.profile_image && (
                      <button
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, profile_image: '' }));
                          handleProfilePictureUpload('');
                        }}
                        className="rounded-full bg-red-500/80 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Verified Badge */}
              <AnimatePresence>
                {profile.is_verified && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    className="absolute -bottom-2 -right-2"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-50 blur-md" />
                      <div className="relative rounded-full border-2 border-slate-800 bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white shadow-xl">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edit Button - only show when not in edit mode */}
              {activeTab !== 'edit' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('edit')}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 opacity-0 shadow-lg transition-opacity duration-300 hover:bg-slate-700 hover:text-white group-hover:opacity-100"
                >
                  <Camera className="mr-1 inline h-3 w-3" />
                  Change
                </motion.button>
              )}
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl"
              >
                {formData.name || 'Welcome!'}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6 flex flex-wrap justify-center gap-3 lg:justify-start"
              >
                {profile.roles?.map((role, index) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Badge
                      variant="secondary"
                      className="border border-violet-500/30 bg-slate-800/80 px-4 py-1.5 text-sm capitalize text-violet-300 backdrop-blur-sm"
                    >
                      <Crown className="mr-1.5 h-3 w-3" />
                      {role}
                    </Badge>
                  </motion.div>
                ))}
                {profile.is_verified && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Badge className="border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-blue-600/20 px-4 py-1.5 text-sm text-blue-300 backdrop-blur-sm">
                      <Shield className="mr-1.5 h-3 w-3" />
                      Verified Account
                    </Badge>
                  </motion.div>
                )}
              </motion.div>

              {formData.bio ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="max-w-2xl text-lg leading-relaxed text-slate-400"
                >
                  {formData.bio}
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="max-w-2xl"
                >
                  <p className="text-lg leading-relaxed text-slate-500">
                    Tell us a bit about yourself to help people get to know you!
                  </p>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="mt-2 inline-flex items-center gap-2 text-violet-400 transition-colors hover:text-violet-300"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="text-sm font-medium">Write Bio</span>
                  </button>
                </motion.div>
              )}

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start"
              >
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-2">
                    <Calendar className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Joined</p>
                    <p className="text-sm font-medium text-slate-300">
                      {formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>

                {profile.last_login && (
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Last Active</p>
                      <p className="text-sm font-medium text-slate-300">
                        {formatDate(profile.last_login)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Monitor className="h-3 w-3" />
                        {getDeviceInfo()} • {getLocationInfo()}
                      </p>
                    </div>
                  </div>
                )}

                {completionStats.percentage < 100 && (
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-2">
                      <Target className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Profile</p>
                      <p className="text-sm font-medium text-slate-300">
                        {completionStats.percentage}% Complete
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto -mt-8 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation - Premium Pill Design */}
          <motion.div variants={itemVariants} className="relative">
            {/* Animated Background Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 via-emerald-600/20 to-blue-600/20 opacity-50 blur-xl" />

            <TabsList className="relative mx-auto grid w-full max-w-2xl grid-cols-3 rounded-xl border border-slate-700/50 bg-slate-900/80 p-1.5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              {/* Overview Tab */}
              <TabsTrigger
                value="overview"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-sm font-medium text-slate-400 transition-all duration-500 ease-out hover:text-slate-200 data-[state=active]:text-white"
              >
                {/* Active Background with Animation */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 shadow-lg shadow-violet-500/25 transition-all duration-500 ease-out group-hover:opacity-0 group-data-[state=active]:opacity-100" />

                {/* Shine Effect */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-data-[state=active]:opacity-100" />

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="relative">
                    <User className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    {/* Active Indicator Dot */}
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-white opacity-0 shadow-sm transition-opacity duration-300 group-data-[state=active]:opacity-100" />
                  </span>
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Info</span>
                </span>
              </TabsTrigger>

              {/* Edit Profile Tab */}
              <TabsTrigger
                value="edit"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-sm font-medium text-slate-400 transition-all duration-500 ease-out hover:text-slate-200 data-[state=active]:text-white"
              >
                {/* Active Background with Animation */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 shadow-lg shadow-emerald-500/25 transition-all duration-500 ease-out group-hover:opacity-0 group-data-[state=active]:opacity-100" />

                {/* Shine Effect */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-data-[state=active]:opacity-100" />

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="relative">
                    <Edit className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    {/* Active Indicator Dot */}
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-white opacity-0 shadow-sm transition-opacity duration-300 group-data-[state=active]:opacity-100" />
                  </span>
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </span>
              </TabsTrigger>

              {/* Activity Tab */}
              <TabsTrigger
                value="activity"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-sm font-medium text-slate-400 transition-all duration-500 ease-out hover:text-slate-200 data-[state=active]:text-white"
              >
                {/* Active Background with Animation */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 shadow-lg shadow-blue-500/25 transition-all duration-500 ease-out group-hover:opacity-0 group-data-[state=active]:opacity-100" />

                {/* Shine Effect */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-data-[state=active]:opacity-100" />

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="relative">
                    <Activity className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    {/* Active Indicator Dot */}
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-white opacity-0 shadow-sm transition-opacity duration-300 group-data-[state=active]:opacity-100" />
                  </span>
                  <span className="hidden sm:inline">Activity</span>
                  <span className="sm:hidden">Stats</span>
                </span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <motion.div
              key="overview-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              {/* Left Column */}
              <div className="space-y-6 lg:col-span-2">
                {/* Profile Completion Card - Only show if less than 100% */}
                {completionStats.percentage < 100 && (
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    onHoverStart={() => setHoveredCard('completion')}
                    onHoverEnd={() => setHoveredCard(null)}
                  >
                    <Card className="group relative overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                      {/* Hover Glow */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-violet-600/10 to-purple-600/10 transition-opacity duration-500 ${hoveredCard === 'completion' ? 'opacity-100' : 'opacity-0'}`}
                      />

                      <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-2">
                            <Award className="h-5 w-5 text-violet-400" />
                          </div>
                          <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            Profile Completion
                          </span>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Complete your profile to unlock all features
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                              {completionStats.percentage}%
                            </span>
                            <span className="text-sm text-slate-500">
                              {completionStats.completed} / {completionStats.total}
                            </span>
                          </div>
                        </div>

                        <div className="relative">
                          <Progress
                            value={completionStats.percentage}
                            showValue={false}
                            size="lg"
                            className="bg-slate-800"
                          />
                          <motion.div
                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${completionStats.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                          />
                        </div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="space-y-3"
                        >
                          <p className="text-sm font-medium text-slate-400">
                            Complete these fields:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {completionStats.fields
                              ?.filter((f) => !f.value || f.value.trim() === '')
                              .map((field, index) => (
                                <motion.button
                                  key={field.name}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.8 + index * 0.05 }}
                                  whileHover={{ scale: 1.05 }}
                                  onClick={() => setActiveTab('edit')}
                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-400 transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
                                >
                                  <AlertCircle className="h-3 w-3" />
                                  {field.label}
                                </motion.button>
                              ))}
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Profile Complete Success Banner - Show when 100% */}
                {completionStats.percentage === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="overflow-hidden border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 backdrop-blur-xl">
                      <CardContent className="flex items-center gap-4 py-6">
                        <div className="rounded-full bg-emerald-500/20 p-3">
                          <CheckCircle className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-300">
                            Profile Complete! 🎉
                          </h3>
                          <p className="text-slate-400">
                            Your profile is fully set up. You now have access to all platform
                            features.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Personal Details Card - Combined Email, Phone, Location */}
                <motion.div variants={itemVariants}>
                  <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-2">
                          <User className="h-5 w-5 text-emerald-400" />
                        </div>
                        <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                          Personal Details
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Email with Edit */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="group flex items-start gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 transition-all duration-300 hover:border-slate-600"
                        >
                          <div className="rounded-xl bg-emerald-500/10 p-3 transition-colors duration-300 group-hover:bg-emerald-500/20">
                            <Mail className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                              Email Address
                            </p>
                            {editingField === 'email' ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="email"
                                  value={tempFieldValue}
                                  onChange={(e) => setTempFieldValue(e.target.value)}
                                  className="h-10 border-slate-700 bg-slate-800 text-slate-200"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleFieldSave('email')}
                                  className="bg-emerald-600 hover:bg-emerald-500"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleFieldCancel}
                                  className="border-slate-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="truncate font-medium text-slate-200">
                                  {formData.email || 'Not provided'}
                                </p>
                                <button
                                  onClick={() => handleFieldEdit('email', formData.email)}
                                  className="rounded-full p-2 text-slate-500 opacity-0 transition-all duration-300 hover:bg-slate-700 hover:text-slate-300 group-hover:opacity-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>

                        {/* Phone with Edit */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="group flex items-start gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 transition-all duration-300 hover:border-slate-600"
                        >
                          <div className="rounded-xl bg-violet-500/10 p-3 transition-colors duration-300 group-hover:bg-violet-500/20">
                            <Phone className="h-5 w-5 text-violet-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                              Phone Number
                            </p>
                            {editingField === 'phone' ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-10 items-center rounded-lg border border-slate-700 bg-slate-800 px-3">
                                  <span className="font-medium text-slate-400">+91</span>
                                </div>
                                <Input
                                  type="tel"
                                  value={tempFieldValue}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setTempFieldValue(value);
                                  }}
                                  className="h-10 flex-1 border-slate-700 bg-slate-800 text-slate-200"
                                  autoFocus
                                  maxLength={10}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleFieldSave('phone')}
                                  className="bg-emerald-600 hover:bg-emerald-500"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleFieldCancel}
                                  className="border-slate-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="truncate font-medium text-slate-200">
                                  {formData.phone ? `+91 ${formData.phone}` : 'Not provided'}
                                </p>
                                <button
                                  onClick={() => handleFieldEdit('phone', formData.phone)}
                                  className="rounded-full p-2 text-slate-500 opacity-0 transition-all duration-300 hover:bg-slate-700 hover:text-slate-300 group-hover:opacity-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>

                        {/* Address with Edit */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="group flex items-start gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 transition-all duration-300 hover:border-slate-600"
                        >
                          <div className="rounded-xl bg-blue-500/10 p-3 transition-colors duration-300 group-hover:bg-blue-500/20">
                            <MapPinned className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                              Location
                            </p>
                            {editingField === 'address' ? (
                              <div className="space-y-2">
                                <textarea
                                  value={tempFieldValue}
                                  onChange={(e) => setTempFieldValue(e.target.value)}
                                  rows={3}
                                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500/50 focus:outline-none"
                                  autoFocus
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleFieldSave('address')}
                                    className="bg-emerald-600 hover:bg-emerald-500"
                                  >
                                    <Save className="mr-1 h-4 w-4" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleFieldCancel}
                                    className="border-slate-700"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-slate-200">
                                    {formData.address || 'No address provided'}
                                  </p>
                                  {formData.pincode && (
                                    <p className="mt-1 text-sm text-slate-400">
                                      PIN: {formData.pincode}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleFieldEdit('address', formData.address)}
                                  className="rounded-full p-2 text-slate-500 opacity-0 transition-all duration-300 hover:bg-slate-700 hover:text-slate-300 group-hover:opacity-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Bio Card */}
                <AnimatePresence>
                  {formData.bio && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2">
                              <FileText className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                              About
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-lg leading-relaxed text-slate-300">{formData.bio}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Actions - Removed Edit Profile */}
                <motion.div variants={itemVariants}>
                  <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-lg text-transparent">
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          href: '/dashboard',
                          icon: LayoutDashboard,
                          label: 'Dashboard',
                          color: 'emerald',
                          desc: 'View your dashboard',
                        },
                        {
                          href: '/auth/reset-password',
                          icon: Lock,
                          label: 'Change Password',
                          color: 'amber',
                          desc: 'Secure your account',
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Link href={item.href}>
                            <Button
                              variant="outline"
                              className="group h-auto w-full justify-start gap-4 border-slate-700 bg-slate-800/30 py-4 transition-all duration-300 hover:border-slate-600 hover:bg-slate-700/50"
                            >
                              <div
                                className={`p-2.5 bg-${item.color}-500/10 rounded-xl group-hover:bg-${item.color}-500/20 transition-colors duration-300`}
                              >
                                <item.icon className={`h-5 w-5 text-${item.color}-400`} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-slate-200">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-400" />
                            </Button>
                          </Link>
                        </motion.div>
                      ))}

                      {/* Log Out Button */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="group h-auto w-full justify-start gap-4 border-red-500/30 bg-red-500/5 py-4 transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/10"
                        >
                          <div className="rounded-xl bg-red-500/10 p-2.5 transition-colors duration-300 group-hover:bg-red-500/20">
                            <LogOut className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-red-300">Log Out</p>
                            <p className="text-xs text-slate-500">Sign out of your account</p>
                          </div>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Account Stats */}
                <motion.div variants={itemVariants}>
                  <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-lg text-transparent">
                        Account Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-blue-500/10 p-2.5">
                            <Calendar className="h-4 w-4 text-blue-400" />
                          </div>
                          <span className="text-sm text-slate-400">Member Since</span>
                        </div>
                        <span className="font-semibold text-slate-200">
                          {new Date(profile.created_at).getFullYear()}
                        </span>
                      </motion.div>

                      <Separator className="bg-slate-800" />

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-purple-500/10 p-2.5">
                            <Briefcase className="h-4 w-4 text-purple-400" />
                          </div>
                          <span className="text-sm text-slate-400">Account Type</span>
                        </div>
                        <span className="font-semibold capitalize text-slate-200">
                          {profile.roles?.[0] || 'User'}
                        </span>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit" className="mt-6 space-y-6">
            <motion.div
              key="edit-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                <CardHeader className="border-b border-slate-800 bg-slate-900/30">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <CardTitle className="mb-2 flex items-center gap-3 text-2xl">
                        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-2">
                          <Edit className="h-6 w-6 text-emerald-400" />
                        </div>
                        <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                          Edit Your Profile
                        </span>
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Update your personal information and customize your profile
                      </CardDescription>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={isLoading}
                        className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="border-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Zap className="mr-2 h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[
                      {
                        name: 'name',
                        label: 'Full Name',
                        type: 'text',
                        icon: User,
                        required: true,
                        placeholder: 'Your full name',
                      },
                      {
                        name: 'email',
                        label: 'Email Address',
                        type: 'email',
                        icon: Mail,
                        required: false,
                        placeholder: 'your@email.com',
                      },
                    ].map((field, index) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="space-y-2"
                      >
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                          <field.icon className="h-4 w-4 text-slate-500" />
                          {field.label}
                          {field.required && <span className="text-emerald-400">*</span>}
                        </label>
                        <Input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          disabled={isLoading}
                          className="h-12 border-slate-700 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                      </motion.div>
                    ))}

                    {/* Phone */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Phone className="h-4 w-4 text-slate-500" />
                        Phone Number
                        <span className="text-emerald-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex h-12 items-center rounded-lg border border-slate-700 bg-slate-800/50 px-4">
                          <span className="font-medium text-slate-400">+91</span>
                        </div>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData((prev) => ({ ...prev, phone: value }));
                          }}
                          placeholder="9876543210"
                          disabled={isLoading}
                          maxLength={10}
                          className="h-12 flex-1 border-slate-700 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                      </div>
                    </motion.div>

                    {/* Pincode */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        PIN Code
                      </label>
                      <Input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setFormData((prev) => ({ ...prev, pincode: value }));
                        }}
                        placeholder="123456"
                        disabled={isLoading}
                        maxLength={6}
                        className="h-12 border-slate-700 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      />
                    </motion.div>

                    {/* Address - Full Width */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2 md:col-span-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Your full address"
                        disabled={isLoading}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </motion.div>

                    {/* Bio - Full Width */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="space-y-2 md:col-span-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <FileText className="h-4 w-4 text-slate-500" />
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us a bit about yourself to help people get to know you!"
                        disabled={isLoading}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <p className="text-xs text-slate-500">
                        This will be visible on your public profile
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6 space-y-6">
            <motion.div
              key="activity-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Grid */}
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {[
                  {
                    label: 'Member Since',
                    value: formatDate(profile.created_at),
                    icon: Calendar,
                    color: 'blue',
                    gradient: 'from-blue-600/20 to-cyan-600/20',
                  },
                  {
                    label: 'Last Login',
                    value: profile.last_login ? formatDate(profile.last_login) : 'N/A',
                    icon: Clock,
                    color: 'emerald',
                    gradient: 'from-emerald-600/20 to-teal-600/20',
                  },
                  {
                    label: 'Profile Status',
                    value: `${completionStats.percentage}%`,
                    subValue: 'Complete',
                    icon: TrendingUp,
                    color: 'violet',
                    gradient: 'from-violet-600/20 to-purple-600/20',
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className="group relative overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                      />
                      <CardContent className="relative pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                              {stat.label}
                            </p>
                            <p className="text-2xl font-bold text-slate-200">{stat.value}</p>
                            {stat.subValue && (
                              <p className="text-sm text-slate-400">{stat.subValue}</p>
                            )}
                          </div>
                          <div
                            className={`rounded-2xl border border-${stat.color}-500/20 bg-${stat.color}-500/10 p-4`}
                          >
                            <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Activity Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2">
                        <Activity className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Account Timeline
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {(() => {
                        const events = [
                          {
                            title: 'Account Created',
                            date: formatDate(profile.created_at),
                            description: 'Welcome to the platform!',
                            icon: Sparkles,
                            color: 'violet',
                          },
                          ...(profile.last_login
                            ? [
                                {
                                  title: 'Last Login',
                                  date: formatDate(profile.last_login),
                                  description: `${getDeviceInfo()} • ${getLocationInfo()}`,
                                  icon: Clock,
                                  color: 'blue',
                                },
                              ]
                            : []),
                          ...(profile.is_verified
                            ? [
                                {
                                  title: 'Account Verified',
                                  date: 'Verified Account',
                                  description: 'You have access to all platform features',
                                  icon: ShieldCheck,
                                  color: 'emerald',
                                },
                              ]
                            : []),
                        ];

                        return events.map((event, index) => {
                          const IconComponent = event.icon;
                          const isLast = index === events.length - 1;
                          return (
                            <motion.div
                              key={`${event.title}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="flex gap-4"
                            >
                              <div className="flex flex-col items-center">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                                  className={`h-3 w-3 rounded-full bg-${event.color}-500 shadow-lg shadow-${event.color}-500/50`}
                                />
                                {!isLast && (
                                  <div className="my-2 w-0.5 flex-1 bg-gradient-to-b from-slate-700 to-slate-800" />
                                )}
                              </div>
                              <div className={isLast ? '' : 'pb-8'}>
                                <div className="mb-1 flex items-center gap-2">
                                  <IconComponent className={`h-4 w-4 text-${event.color}-400`} />
                                  <p className="font-semibold text-slate-200">{event.title}</p>
                                </div>
                                <p className="mb-1 text-sm text-slate-500">{event.date}</p>
                                <p className="text-sm text-slate-400">{event.description}</p>
                              </div>
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
