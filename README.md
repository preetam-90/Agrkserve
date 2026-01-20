# AgriServe - Agricultural Equipment & Labour Marketplace

A modern Next.js application for connecting farmers with agricultural equipment providers and labour services.

## 🎯 Features

### ✅ Complete Authentication System
- **Email/Password Authentication** with strong password validation
- **Google OAuth Integration** for quick signup
- **Mandatory Phone Number Collection** for all users
- **Profile Picture Upload** with real-time preview
- **Comprehensive Profile Management** page
- **Smart Redirects** based on profile completion status
- **Last Login Tracking** for account activity

### 🔐 Security Features
- Strong password requirements (8+ chars, uppercase, lowercase, number)
- Phone number validation (Indian 10-digit mobile)
- Row Level Security (RLS) on all tables
- Secure file upload with type and size validation
- Protected routes with middleware

### 🌾 Core Marketplace Features
- Equipment listing and browsing
- Labour service listings
- Booking management
- Real-time notifications
- Multi-language support (English/Hindi)
- Role-based dashboards (Renter, Provider, Labour)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agri-serve-web

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

### Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Open Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/007_add_phone_mandatory.sql`
   - `supabase/migrations/008_setup_storage.sql`

### Configure Supabase

1. **Authentication:**
   - Enable Email provider
   - (Optional) Enable Google OAuth
   - Add redirect URL: `http://localhost:3000/auth/callback`

2. **Storage:**
   - Verify `avatars` bucket exists
   - Verify `equipment-images` bucket exists

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[AUTH_PROFILE_GUIDE.md](./AUTH_PROFILE_GUIDE.md)** - Complete authentication guide
- **[USER_FLOWS.md](./USER_FLOWS.md)** - Visual user flow diagrams
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **State Management:** Zustand
- **UI Components:** Custom components with Radix UI
- **Icons:** Lucide React

---

## 📁 Project Structure

```
agri-serve-web/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── login/             # Authentication page
│   │   ├── phone-setup/       # Phone number collection
│   │   ├── onboarding/        # User onboarding
│   │   ├── profile/           # Profile management
│   │   ├── provider/          # Provider dashboard
│   │   ├── renter/            # Renter dashboard
│   │   └── auth/              # Auth callbacks
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives
│   │   ├── layout/           # Layout components
│   │   ├── phone-modal.tsx   # Phone collection modal
│   │   └── profile-picture-upload.tsx
│   ├── lib/                   # Utilities and services
│   │   ├── services/         # API services
│   │   ├── store/            # State management
│   │   ├── supabase/         # Supabase clients
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helper functions
│   └── middleware.ts          # Route protection
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── scripts/                   # Helper scripts
```

---

## 🔑 Key Features Explained

### Authentication Flow

1. **Email Signup:**
   - User creates account with email/password
   - Password must meet strength requirements
   - Redirected to phone setup

2. **Phone Collection:**
   - Mandatory for all users
   - Validates Indian mobile numbers (10 digits)
   - Cannot proceed without phone

3. **Profile Picture:**
   - Optional during signup
   - Can upload later from profile page
   - Supports JPG, PNG, GIF, WebP (max 5MB)

4. **Onboarding:**
   - Select role (Renter, Provider, Labour)
   - Complete profile information
   - Set location

5. **Dashboard:**
   - Role-based interface
   - Access to all features

### Profile Management

- View and edit all profile information
- Update profile picture
- Change phone number (with validation)
- Update address and location
- View account activity
- See member since and last login

---

## 🛣️ User Flows

### New User (Email)
```
Login → Sign Up → Phone Setup → Picture (optional) → Onboarding → Dashboard
```

### New User (Google)
```
Login → Google Auth → Phone Check → Phone Setup (if needed) → Onboarding → Dashboard
```

### Existing User
```
Login → Check Profile → Phone Setup (if missing) → Dashboard
```

---

## 🧪 Testing

### Test Email Signup
```bash
# Visit http://localhost:3000/login
# Click "Sign Up"
# Enter: test@example.com / Password123
# Should redirect to phone setup
```

### Test Phone Validation
```bash
# Valid: 9876543210 (10 digits, starts with 6-9)
# Invalid: 5876543210 (starts with 5)
# Invalid: 98765432 (only 8 digits)
```

### Test Profile Page
```bash
# Visit http://localhost:3000/profile
# Click "Edit Profile"
# Update information
# Save changes
```

---

## 🚢 Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

1. Connect your repository
2. Add environment variables
3. Deploy

### Environment Variables (Production)

Same as development:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Post-Deployment

1. Update Supabase redirect URLs
2. Test all authentication flows
3. Verify storage uploads work
4. Check error logs

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete checklist.

---

## 🐛 Troubleshooting

### Common Issues

**"Supabase connection failed"**
- Check environment variables
- Verify Supabase URL and key
- Restart dev server

**"user_profiles table doesn't exist"**
- Run database migrations
- Check Supabase Tables tab

**"Redirect loop"**
- Complete phone setup
- Complete onboarding
- Check profile completion status

**"Profile picture not uploading"**
- Verify storage bucket exists
- Check file size < 5MB
- Run migration 008

More troubleshooting: [AUTH_PROFILE_GUIDE.md](./AUTH_PROFILE_GUIDE.md)

---

## 📝 Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Run production build

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript check

# Helpers
./scripts/setup-auth.sh  # Auth setup guide
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 📞 Support

For questions or issues:
- Check the [documentation](./AUTH_PROFILE_GUIDE.md)
- Open an issue on GitHub
- Contact the development team

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** January 2026
