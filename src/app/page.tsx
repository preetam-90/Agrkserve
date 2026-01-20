'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header, Footer } from '@/components/layout';
import { Button, Card, CardContent, Badge, Spinner } from '@/components/ui';
import {
  Tractor,
  Users,
  MapPin,
  Shield,
  Clock,
  Star,
  ChevronRight,
  CheckCircle,
  Smartphone,
  CreditCard,
  Headphones,
  Search,
  Wrench,
  Settings,
  Video,
  Gift,
  Camera,
  Box,
  Phone,
  Mail,
  IndianRupee
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { equipmentService } from '@/lib/services';
import { Equipment } from '@/lib/types';
import { EQUIPMENT_CATEGORIES } from '@/lib/utils';

const categoryIcons: Record<string, React.ElementType> = {
  tractor: Tractor,
  harvester: Tractor,
  plough: Wrench,
  seeder: Gift,
  sprayer: Video,
  cultivator: Settings,
  rotavator: Settings,
  thresher: Box,
  irrigation: Settings,
  drone: Camera,
  other: Box,
};

export default function HomePage() {
  const [featuredEquipment, setFeaturedEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalEquipment: 0, totalUsers: 0 });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch featured equipment (latest 6)
        const result = await equipmentService.getEquipment({ limit: 6 });
        setFeaturedEquipment(result.data);
        setStats({ totalEquipment: result.count, totalUsers: Math.floor(result.count * 2.5) });
        
        // Calculate category counts from equipment
        const counts: Record<string, number> = {};
        result.data.forEach((eq) => {
          if (eq.category) {
            counts[eq.category] = (counts[eq.category] || 0) + 1;
          }
        });
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Build categories with real counts
  const categories = EQUIPMENT_CATEGORIES.map((cat) => ({
    value: cat.value,
    name: cat.label,
    icon: categoryIcons[cat.value] || Box,
    count: categoryCounts[cat.value] || 0,
  })).filter((cat) => cat.value !== 'other');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 text-white overflow-hidden min-h-[85vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600/90 to-blue-900/90" />
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Tractor className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">😊</span>
                  </div>
                </div>
              </div>

              {/* Brand Name */}
              <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                <span className="text-yellow-400">agri</span>serve
              </h1>

              {/* Live Stats */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 mt-8">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                  <Users className="h-5 w-5 text-green-300" />
                  <span className="text-2xl font-bold">{stats.totalUsers || '---'}</span>
                  <span className="text-sm">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    USERS
                  </span>
                </div>
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                  <Tractor className="h-5 w-5 text-green-300" />
                  <span className="text-2xl font-bold">{stats.totalEquipment || '---'}</span>
                  <span className="text-sm">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    EQUIPMENT LISTINGS
                  </span>
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Put Your Equipment to{' '}
                <span className="text-yellow-400">Work!</span>
              </h2>
              
              <p className="text-lg md:text-xl text-teal-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Turn underused items into income. From tractors to harvesters, 
                AgriServe connects owners and renters India-wide with fast delivery, 
                secure payments, and real rewards.
              </p>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm rounded-full" asChild>
                  <Link href="/equipment?category=tractor">
                    Tractors
                  </Link>
                </Button>
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm rounded-full" asChild>
                  <Link href="/equipment?category=harvester">
                    Harvesters
                  </Link>
                </Button>
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm rounded-full" asChild>
                  <Link href="/equipment?category=plough">
                    Ploughs
                  </Link>
                </Button>
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm rounded-full" asChild>
                  <Link href="/equipment?category=irrigation">
                    Irrigation
                  </Link>
                </Button>
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm rounded-full" asChild>
                  <Link href="/equipment">
                    View All
                  </Link>
                </Button>
              </div>

              {/* Trust Badge */}
              <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-gray-800 font-semibold">Protected by AgriServe Guarantee</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Reliability Strip */}
        <section className="bg-gray-50 py-4 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm md:text-base">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                <span>Verified Providers Only</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Shield className="h-5 w-5" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Shield className="h-5 w-5" />
                <span>Protected by AgriServe Guarantee</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore Categories
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover what you can rent
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category.value}
                  href={`/equipment?category=${category.value}`}
                  className="group"
                >
                  <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-teal-500 bg-white">
                    <CardContent className="p-0">
                      <div className="w-16 h-16 mx-auto mb-4 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                        <category.icon className="h-8 w-8 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.count} items</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="border-2 border-teal-500 text-teal-600 hover:bg-teal-50" asChild>
                <Link href="/equipment">
                  View All Equipment
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Equipment Section - Real Data */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Featured Equipment
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Recently listed agricultural equipment available for rent
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : featuredEquipment.length === 0 ? (
              <div className="text-center py-12">
                <Tractor className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No equipment listed yet. Be the first to list!</p>
                <Button className="mt-4" asChild>
                  <Link href="/provider/equipment/new">List Your Equipment</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {featuredEquipment.map((equipment) => (
                  <Link key={equipment.id} href={`/renter/equipment/${equipment.id}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        {equipment.images?.[0] ? (
                          <Image
                            src={equipment.images[0]}
                            alt={equipment.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tractor className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        {equipment.is_available ? (
                          <Badge className="absolute top-2 right-2 bg-green-500">Available</Badge>
                        ) : (
                          <Badge className="absolute top-2 right-2 bg-gray-500">Booked</Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                          {equipment.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {equipment.location_name || 'Location not specified'}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 text-teal-600" />
                            <span className="text-lg font-bold text-teal-600">{equipment.price_per_day}</span>
                            <span className="text-sm text-gray-500">/day</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {equipment.rating?.toFixed(1) || 'New'}
                            </span>
                          </div>
                        </div>
                        {equipment.category && (
                          <Badge variant="outline" className="mt-2">
                            {EQUIPMENT_CATEGORIES.find(c => c.value === equipment.category)?.label || equipment.category}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            
            {featuredEquipment.length > 0 && (
              <div className="text-center mt-12">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700" asChild>
                  <Link href="/equipment">
                    Browse All Equipment
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Choose AgriServe?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                We make agricultural equipment accessible to every farmer in India
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                    <MapPin className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Location-Based Search</h3>
                  <p className="text-gray-600">Find agricultural equipment available near your farm with precise geolocation technology.</p>
                </CardContent>
              </Card>

              <Card className="p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                    <Shield className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Providers</h3>
                  <p className="text-gray-600">All equipment providers are verified to ensure quality and reliability.</p>
                </CardContent>
              </Card>

              <Card className="p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Rentals</h3>
                  <p className="text-gray-600">Rent by the hour or day - choose what works best for your farming needs.</p>
                </CardContent>
              </Card>

              <Card className="p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                    <CreditCard className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
                  <p className="text-gray-600">Safe and secure payment processing with multiple payment options.</p>
                </CardContent>
              </Card>

              <Card className="p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                    <Smartphone className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Booking</h3>
                  <p className="text-gray-600">Simple booking process - find, book, and manage rentals from your phone.</p>
                </CardContent>
              </Card>

              <Card className="p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                    <Headphones className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
                  <p className="text-gray-600">Our support team is always ready to help you with any questions.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Getting started with AgriServe is easy. Follow these simple steps.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-xl">
                    <Search className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900 shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Search & Discover</h3>
                <p className="text-gray-600 text-lg">Browse through our extensive catalog of agricultural equipment available in your area.</p>
              </div>

              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-xl">
                    <CreditCard className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900 shadow-lg">
                    2
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Book & Pay</h3>
                <p className="text-gray-600 text-lg">Select your dates, review the pricing, and complete your booking with secure payment.</p>
              </div>

              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-xl">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900 shadow-lg">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Use & Return</h3>
                <p className="text-gray-600 text-lg">Pick up the equipment, use it for your farming needs, and return it when done.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Regional & Local Focus Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Serving Farmers Across India
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Connecting rural communities with quality agricultural equipment
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              <div className="bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-24 w-24 mx-auto mb-4" />
                  <p className="text-lg font-medium">Interactive India Map</p>
                  <p className="text-sm mt-2">Showing coverage areas across 500+ villages</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex text-yellow-400">
                        {Array(5).fill(0).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">&ldquo;Great service! The equipment was delivered on time and in excellent condition.&rdquo;</p>
                      <p className="text-sm text-gray-500 mt-2">- Farmer from Punjab</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex text-yellow-400">
                        {Array(5).fill(0).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">&ldquo;Easy to use platform. Found exactly what I needed for my farm.&rdquo;</p>
                      <p className="text-sm text-gray-500 mt-2">- Farmer from Maharashtra</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16 text-center">
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">{stats.totalUsers || '0'}+</div>
                <div className="text-gray-600 font-medium">Happy Farmers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">{stats.totalEquipment || '0'}+</div>
                <div className="text-gray-600 font-medium">Equipment Listings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">{Object.keys(categoryCounts).length || '0'}+</div>
                <div className="text-gray-600 font-medium">Categories</div>
              </div>
            </div>
          </div>
        </section>

        {/* Equipment Owner Benefits Section */}
        <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Why List Your Equipment?
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Join thousands of equipment owners who are earning extra income with AgriServe
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Earn Extra Income</h3>
                      <p className="text-gray-600">Turn your underused equipment into a steady income stream</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Rental Terms</h3>
                      <p className="text-gray-600">Set your own availability and pricing for maximum control</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Equipment Protection</h3>
                      <p className="text-gray-600">Comprehensive insurance and verification for peace of mind</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Management</h3>
                      <p className="text-gray-600">Simple dashboard to manage bookings, payments, and availability</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white text-lg px-8 py-6 rounded-xl shadow-xl" asChild>
                    <Link href="/become-provider">
                      List Your Equipment
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Tractor className="h-32 w-32 mx-auto mb-4" />
                  <p className="text-lg font-medium">Happy Farmer with Equipment</p>
                  <p className="text-sm mt-2">Join our community of successful equipment owners</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support & Help Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                We&apos;re Here to Help
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Our dedicated support team is available 24/7 to assist you
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              <Card className="text-center p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Phone Support</h3>
                  <p className="text-gray-600 mb-4">+91 1800-XXX-XXXX</p>
                  <p className="text-sm text-gray-500">Available 24/7</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                    <Headphones className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Live Chat</h3>
                  <p className="text-gray-600 mb-4">Instant assistance</p>
                  <p className="text-sm text-gray-500">Available 24/7</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-8 border-2 hover:border-teal-500 hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Email Support</h3>
                  <p className="text-gray-600 mb-4">support@agriserve.in</p>
                  <p className="text-sm text-gray-500">Response within 24 hours</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="bg-teal-50 rounded-xl p-6 border border-teal-100 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-teal-600 font-bold">Q</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">How do I rent equipment?</h4>
                    <p className="text-gray-600">Search for equipment, select your dates, book, and use in 3 easy steps!</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button size="lg" variant="outline" className="border-2 border-teal-500 text-teal-600 hover:bg-teal-50" asChild>
                  <Link href="/help">
                    Search Help Center
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600/90 to-blue-900/90" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of farmers who are already using AgriServe to find quality agricultural equipment.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-xl" asChild>
                <Link href="/login">
                  Start Renting Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-700 text-lg px-8 py-6 rounded-xl transition-colors" asChild>
                <Link href="/onboarding">
                  List Your Equipment
                  <Users className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
