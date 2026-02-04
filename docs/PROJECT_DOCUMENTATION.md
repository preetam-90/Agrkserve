# AgriServe Project Documentation

## 🚀 Overview

AgriServe is a comprehensive agricultural services marketplace platform built with modern web technologies. It connects farmers (Renters) with equipment owners (Providers) and skilled agricultural labor.

## 🛠 Tech Stack

- **Framework**: [Next.js 16.1.3](https://nextjs.org/) (App Router, React 19)
- **Runtime/Package Manager**: [Bun 1.1.0](https://bun.sh/)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Auth, PostgreSQL Database, SSR)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) (Smooth Scroll)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Media Processing**: [FFmpeg](https://ffmpeg.org/), [Sharp](https://sharp.pixelplumbing.com/), [Cloudinary](https://cloudinary.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## ✨ Key Features

### 👤 Multi-Role Architecture

- **Admin**: Full platform oversight, user moderation, analytics, and system logs.
- **Provider**: Manage equipment listings, track earnings, and handle labour services.
- **Renter**: Browse and book agricultural equipment or labour, manage favorites, and track bookings.
- **Labour**: Professional profiles for skilled agricultural workers.

### 🚜 Marketplace Modules

- **Equipment Rental**: Search, filter, and book agricultural machinery (Tractors, Harvesters, etc.).
- **Labour Services**: Find and hire specialized agricultural labour teams.
- **Booking System**: End-to-end rental flow with status tracking (Pending, Confirmed, Completed, Cancelled).

### 💬 Communication & Engagement

- **Real-time Messaging**: Direct chat between Renters and Providers.
- **Notification System**: In-app and push notifications for booking updates and platform alerts.
- **Reviews & Ratings**: Trust-building system for both equipment and labour services.

### 💳 Financial & Operations

- **Payment Integration**: Secure payment processing with order creation and verification (Razorpay).
- **Earnings Tracking**: Detailed financial reports for Providers.
- **Invoice Generation**: Automated invoice PDF creation for transactions.

### 🛡 Admin Control Center

- **Analytics Dashboard**: Real-time platform metrics and revenue tracking.
- **User Management**: Deep-dive into user profiles and activity.
- **System Health**: Audit logs, database monitoring, and storage management.

### 📸 Media & Performance

- **Media Upload Pipeline**: Support for high-quality images and video listings.
- **On-the-fly Processing**: Client-side cropping and server-side optimization.
- **Offline Support**: PWA capabilities for use in areas with poor connectivity.

## 📁 Project Structure

- `src/app/`: Next.js App Router pages and API routes.
- `src/components/`: Reusable UI components organized by module (Admin, Renter, Provider).
- `src/lib/`: Core logic including Supabase client, Zustand stores, and services.
- `src/utils/`: Helper functions for formatting, validation, and common tasks.
- `scripts/`: Development and maintenance automation scripts.

## 🚦 Getting Started

1. **Prerequisites**: Install [Bun](https://bun.sh/).
2. **Environment**: Configure `.env.local` with Supabase and Cloudinary credentials.
3. **Installation**: `bun install`
4. **Development**: `bun dev` (Runs on http://localhost:3001)
