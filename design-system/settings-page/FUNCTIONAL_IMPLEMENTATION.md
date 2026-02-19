# Admin Settings Page - Functional Implementation

## Overview

Fully functional admin settings page with system management, maintenance mode, contact information, and session management capabilities.

## Implemented Features

### 1. System Tab ✅

#### Platform Information

- **Platform Name**: AgriServe (from database)
- **Version**: 1.0.0 (from database)
- **Environment**: Production/Development status with live indicator
- **Database**: Supabase connection status

#### System Health Metrics (Real-time)

- **API Response Time**: Measured in milliseconds with visual progress bar
- **Database Load**: Calculated based on record counts and response times
- **Storage Usage**: Percentage based on total records
- **Uptime**: System uptime percentage (99.9%)
- **Total Records**: Combined count of users, equipment, bookings, labour
- **Auto-refresh**: Button to manually refresh metrics
- **Logging**: All metrics logged to `system_health_logs` table

#### Maintenance Mode

- **Toggle On/Off**: Enable/disable maintenance mode instantly
- **Custom Message**: Editable maintenance message shown to users
- **Scheduled Maintenance**:
  - Set scheduled start time
  - Set scheduled end time
- **IP Whitelist**:
  - Add IP addresses that can bypass maintenance mode
  - Remove IPs from whitelist
  - Visual list of all whitelisted IPs
- **Status Indicator**: Shows if maintenance is currently active
- **Warning Banner**: Displayed when maintenance mode is enabled

### 2. General Tab ✅

#### Contact Information (Editable)

- **Support Email**: Email for customer support
- **Support Phone**: Phone number for support
- **Business Address**: Full business address (multi-line)
- **Social Media Links**:
  - Facebook URL
  - Twitter URL
  - LinkedIn URL
  - Instagram URL
- **Edit Mode**: Toggle edit mode to modify settings
- **Save Functionality**: Persist changes to database

#### Platform Stats (Read-only)

- Total Users count
- Equipment count
- Bookings count
- Labour profiles count

#### Quick Actions

- Links to all major admin sections
- Visual icons with hover effects

### 3. Security Tab ✅

#### Session Management

- **Session Timeout Configuration**:
  - Set timeout duration in seconds
  - Visual display in minutes
  - Range: 5 minutes to 24 hours

#### Active Sessions Viewer

- **Real-time Session List**:
  - User name and email
  - IP address
  - User agent (device/browser info)
  - Last activity timestamp
  - Session creation time
  - Session expiration time
- **Session Actions**:
  - Revoke individual sessions
  - Force logout all users (with confirmation)
- **Session Count**: Display total active sessions
- **Auto-refresh**: Updates when tab is activated

#### Access Control

- Display admin permissions
- Show active session count

### 4. Notifications Tab ✅

(Existing functionality maintained)

- Broadcast notifications to all users
- Preview before sending
- Recent broadcasts history

## Database Schema

### New Tables Created

#### `system_settings`

```sql
- id: UUID (primary key)
- key: TEXT (unique)
- value: JSONB
- category: TEXT (general, contact, maintenance, security)
- updated_at: TIMESTAMPTZ
- updated_by: UUID (references auth.users)
```

#### `maintenance_mode`

```sql
- id: UUID (primary key)
- is_enabled: BOOLEAN
- message: TEXT
- scheduled_start: TIMESTAMPTZ
- scheduled_end: TIMESTAMPTZ
- whitelisted_ips: TEXT[]
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- updated_by: UUID
```

#### `user_sessions`

```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- session_token: TEXT (unique)
- ip_address: TEXT
- user_agent: TEXT
- last_activity: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ
```

#### `system_health_logs`

```sql
- id: UUID (primary key)
- metric_name: TEXT
- metric_value: NUMERIC
- metadata: JSONB
- recorded_at: TIMESTAMPTZ
```

## RPC Functions

### System Settings

- `get_system_settings(p_category)` - Get settings by category
- `update_system_setting(p_key, p_value)` - Update a setting

### Maintenance Mode

- `get_maintenance_mode()` - Get current maintenance status
- `update_maintenance_mode(...)` - Update maintenance settings

### Session Management

- `get_active_sessions()` - Get all active sessions with user info
- `revoke_session(p_session_id)` - Revoke a specific session
- `revoke_user_sessions(p_user_id)` - Revoke all sessions for a user
- `force_logout_all_users()` - Force logout all users

### Health Monitoring

- `log_system_health(...)` - Log health metrics
- `get_system_health_metrics(...)` - Retrieve health metrics
- `cleanup_expired_sessions()` - Clean up expired sessions

## API Routes

### `/api/admin/settings`

- **GET**: Fetch system settings (optionally by category)
- **PUT**: Update a system setting

### `/api/admin/maintenance`

- **GET**: Get maintenance mode status
- **PUT**: Update maintenance mode settings

### `/api/admin/sessions`

- **GET**: Get all active sessions
- **DELETE**: Revoke session(s)
  - `?session_id=<id>` - Revoke specific session
  - `?user_id=<id>` - Revoke all sessions for user
  - `?force_all=true` - Force logout all users

### `/api/admin/health`

- **GET**: Get real-time system health metrics

## Security

### Row Level Security (RLS)

- All tables have RLS enabled
- Admin-only access enforced via policies
- Users can only view their own sessions
- System can insert health logs without authentication

### Admin Verification

All RPC functions verify admin role:

```sql
IF NOT EXISTS (
  SELECT 1 FROM user_profiles
  WHERE id = auth.uid() AND role = 'admin'
) THEN
  RAISE EXCEPTION 'Unauthorized: Admin access required';
END IF;
```

## Component Structure

```
src/app/admin/settings/
├── page.tsx              # Main settings page with state management
├── GeneralTab.tsx        # Contact info, stats, quick actions
├── SystemTab.tsx         # Platform info, health, maintenance
└── SecurityTab.tsx       # Session management, access control
```

## Usage

### Enable Maintenance Mode

1. Go to Settings → System tab
2. Click "Enable" button
3. Optionally edit maintenance message
4. Add whitelisted IPs if needed
5. Set scheduled start/end times (optional)
6. Click "Save Maintenance Settings"

### Manage Sessions

1. Go to Settings → Security tab
2. View all active sessions
3. Click trash icon to revoke individual session
4. Click "Force Logout All" to logout all users

### Update Contact Information

1. Go to Settings → General tab
2. Click "Edit" button
3. Modify email, phone, address, social links
4. Click "Save" button

### Monitor System Health

1. Go to Settings → System tab
2. View real-time metrics
3. Click refresh icon to update
4. Metrics are automatically logged to database

## Success Notifications

All actions show success toast notifications:

- Settings saved
- Maintenance mode toggled
- IP whitelist updated
- Sessions revoked
- Broadcast sent

## Future Enhancements

- Email notifications for maintenance mode
- Scheduled maintenance automation
- Session analytics and reporting
- Health metric charts and trends
- Export session logs
- Two-factor authentication toggle (functional)
- API key management
- Backup and restore functionality

## Testing

To test the implementation:

1. **Run Migration**:

   ```bash
   # Apply the migration in Supabase dashboard or CLI
   ```

2. **Access Settings**:

   ```
   http://localhost:3001/admin/settings
   ```

3. **Test Each Feature**:
   - Toggle maintenance mode
   - Add/remove whitelisted IPs
   - Update contact information
   - View active sessions
   - Revoke a session
   - Check system health metrics

## Notes

- All database operations are admin-only
- Session management requires proper authentication
- Health metrics are logged every time the health endpoint is called
- Maintenance mode affects all non-whitelisted users
- Session timeout is configurable per installation
