#!/bin/bash
exec > git_resolve.log 2>&1
echo "Resolving conflicts by keeping local versions..."
git checkout --ours src/app/admin/bookings/page.tsx
git checkout --ours src/app/admin/equipment/page.tsx
git checkout --ours src/app/admin/users/page.tsx
git checkout --ours src/app/messages/page.tsx
git checkout --ours src/components/landing/CTASection.tsx
git checkout --ours src/components/landing/FeaturedEquipmentSection.tsx
git checkout --ours src/components/landing/HeroSection.tsx
git checkout --ours src/components/landing/HowItWorksSection.tsx
git checkout --ours src/components/landing/PremiumFooter.tsx
git checkout --ours src/components/landing/PremiumHeader.tsx
git checkout --ours src/components/landing/StatsSection.tsx
git checkout --ours src/components/system-pages/ErrorPageTemplate.tsx

echo "Adding resolved files..."
git add .

echo "Committing merge..."
git commit -m "Merge remote changes and resolve conflicts favoring local version"

echo "Pushing..."
git push origin main

echo "Done."
