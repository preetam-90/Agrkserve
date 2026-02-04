# Cloudinary Media Manager - Setup & Troubleshooting Guide

## ✅ Issue Fixed

**Problem**: Media not loading on admin media page  
**Root Cause**: Invalid Cloudinary search expression `*`  
**Solution**: Changed default expression to `resource_type:image OR resource_type:video`

## 🔧 Configuration

### Environment Variables Required

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=dccpbevin
CLOUDINARY_API_KEY=955324277234948
CLOUDINARY_API_SECRET=IiEveME6Zkc0lJgt2Me4bj1o0nU
```

**✅ All variables are now configured correctly**

## 📊 Current Cloudinary Assets

- **Total Assets**: 99
- **Storage Location**: `agri-serve/equipment/` folder
- **Asset Types**: Images and Videos

## 🗄️ Database Setup

Run the migration to create the `media_audit_logs` table:

```bash
supabase db push
```

Or manually execute:

```bash
psql -f supabase/migrations/20260202000000_create_media_audit_logs.sql
```

## 🚀 Accessing the Media Manager

1. Start the development server:

   ```bash
   bun run dev
   ```

2. Navigate to:

   ```
   http://localhost:3000/admin/media/cloudinary
   ```

3. You should now see:
   - **Assets Tab**: 99 media files from Cloudinary
   - **Users Tab**: User-wise storage breakdown (if organized in users/{userId} structure)
   - **Analytics Tab**: Storage usage and monthly upload trends

## 🔍 Debugging

### Check Cloudinary Connection

The service includes extensive console logging:

```bash
# Look for these in your dev server console:
# ✓ Cloudinary configured: { cloud_name: 'dccpbevin', api_key: '***', api_secret: '***' }
# ✓ Cloudinary searchAssets called with filters: {...}
# ✓ Cloudinary search expression: resource_type:image OR resource_type:video
# ✓ Cloudinary search result: { total_count: 99, resources_count: 50 }
```

### Common Issues

1. **"No assets found"**
   - Check browser console for errors
   - Verify API response in Network tab: `/api/admin/cloudinary/assets`
   - Ensure Cloudinary credentials are correct

2. **"Unauthorized" error**
   - Make sure you're logged in as an admin
   - Check that your user has admin role in `user_roles` table:
     ```sql
     SELECT * FROM user_roles WHERE role IN ('super_admin', 'moderator', 'support_admin');
     ```

3. **"Forbidden" error**
   - Check RBAC permissions for your admin role
   - Super Admin has full access
   - Moderator can view and flag
   - Support Admin can only view

## 📁 File Structure

```
src/
├── app/
│   ├── admin/media/cloudinary/page.tsx    # Main UI page
│   └── api/admin/cloudinary/              # API routes (7 files)
├── lib/
│   ├── types/cloudinary-admin.ts          # TypeScript types
│   ├── services/
│   │   ├── cloudinary-admin-service.ts    # Cloudinary SDK operations
│   │   └── media-audit-service.ts         # Audit logging
│   ├── utils/admin-rbac.ts                # Role-based access control
│   └── hooks/use-cloudinary-admin.ts      # TanStack Query hooks
└── components/admin/media/                # 7 UI components

supabase/migrations/
└── 20260202000000_create_media_audit_logs.sql
```

## 🎯 Features Available

- ✅ Grid & Table view toggle
- ✅ Search by public ID or tags
- ✅ Filter by type (image/video), user, folder, date range
- ✅ Sort by upload date, size, or name
- ✅ Preview modal with full metadata
- ✅ Delete single asset with confirmation
- ✅ Bulk delete with reason tracking
- ✅ Audit log of all admin actions
- ✅ User-wise storage analytics
- ✅ Monthly upload charts
- ✅ Dark theme UI

## 🔐 RBAC Permissions

| Role          | View | Delete | Bulk Delete | Rename | Analytics | Audit Logs |
| ------------- | ---- | ------ | ----------- | ------ | --------- | ---------- |
| Super Admin   | ✅   | ✅     | ✅          | ✅     | ✅        | ✅         |
| Moderator     | ✅   | ❌     | ❌          | ❌     | ❌        | ❌         |
| Support Admin | ✅   | ❌     | ❌          | ❌     | ❌        | ❌         |

## 📝 Next Steps

1. **Test the media manager** - Navigate to `/admin/media/cloudinary` and verify assets load
2. **Grant admin roles** - Add users to `user_roles` table with appropriate roles
3. **Run DB migration** - Create the audit logs table
4. **Configure user media structure** - Organize uploads in `users/{userId}/equipment|labour|profile`

## 🐛 Known Issues

- Pre-existing build error in `/provider/equipment` (unrelated to this implementation)
- Rename feature shows "coming soon" toast (placeholder for future implementation)

## ✅ Verification Checklist

- [x] Cloudinary credentials configured
- [x] API endpoints working
- [x] Search expression fixed (`resource_type:image OR resource_type:video`)
- [x] Console logging added for debugging
- [x] Frontend query hooks implemented
- [x] UI components created
- [x] RBAC enforcement active
- [ ] Database migration run (do this next)
- [ ] Admin roles granted to users (do this next)
