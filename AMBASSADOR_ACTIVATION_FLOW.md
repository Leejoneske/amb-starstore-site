# Ambassador Activation Flow Documentation

## Complete User Journey: From Application to Active Ambassador

### 1. **Application Submission**
- User fills out ambassador application form
- Application stored in `applications` table with status `pending`
- Admin receives real-time notification

### 2. **Admin Approval Process**
When admin approves an application:

#### Backend Process (`admin-approve-application` function):
1. **User Account Creation**
   - Creates Supabase auth user with temporary password (format: `STAR[8-digit-code]`)
   - Sets `email_confirm: true` to bypass email verification
   - Adds user metadata with full name

2. **Profile Setup**
   - Creates/updates `profiles` table entry
   - Creates `ambassador_profiles` entry with:
     - `status: 'active'`
     - Generated referral code
     - `approved_at` timestamp
     - `approved_by` admin ID
     - `password_change_required: true`
     - `activation_email_sent_at` timestamp

3. **Email Notification**
   - Sends professional welcome email via Resend
   - Includes temporary password and referral code
   - Provides login instructions and next steps

4. **Application Update**
   - Updates application status to `approved`
   - Sets `reviewed_at` and `reviewed_by` fields

### 3. **User Activation Process**

#### First Login Detection:
- `useFirstLoginTracker` hook monitors user login
- When user logs in for first time:
  - Updates `first_login_at` timestamp
  - Shows welcome toast notification
  - Displays password change reminder

#### Password Security:
- Users prompted to change temporary password
- `PasswordChangeDialog` component with validation:
  - Minimum 8 characters
  - Uppercase & lowercase letters
  - Numbers and special characters
- Updates `password_change_required: false` when changed

### 4. **Admin Tracking & Monitoring**

#### Ambassador Status Dashboard:
- **Activation Statistics**:
  - Total ambassadors
  - Activated vs pending
  - Recent approvals (last 7 days)
  - Never logged in count
  - Temporary password users

#### Status Indicators:
- ✅ **Activated**: User has logged in
- ⏳ **Pending**: Approved but not logged in yet
- ⚠️ **Overdue**: 7+ days since approval, no login
- 🔑 **Temp Password**: Still using temporary password

#### Tracking Features:
- Real-time activation monitoring
- Email resend functionality
- Export user status data
- Follow-up reminders for overdue activations

### 5. **Database Schema Enhancements**

#### New Columns in `ambassador_profiles`:
```sql
first_login_at timestamptz          -- When user first logged in
activation_email_sent_at timestamptz -- When activation email was sent
password_change_required boolean     -- Whether user needs to change password
```

#### New Functions:
- `get_auth_users_info()` - Admin function to fetch auth user data
- `update_first_login(uuid)` - Updates first login timestamp
- `ambassador_status_view` - View combining profile and activation data

### 6. **User Experience Features**

#### For New Ambassadors:
- Welcome toast on first login
- Password change reminders
- Secure password requirements
- Account activation confirmation

#### For Admins:
- Real-time activation notifications
- Comprehensive status dashboard
- Activation analytics and insights
- Email resend capabilities
- Export functionality for reporting

### 7. **Security Measures**

#### Password Security:
- Strong temporary passwords (`STAR` + 8 random chars)
- Mandatory password change prompts
- Password complexity validation
- Secure password update via Supabase auth

#### Access Control:
- Admin-only access to user activation data
- RLS policies on all sensitive tables
- Secure edge functions with proper authorization

### 8. **Real-time Features**

#### Live Updates:
- Activation status changes
- New ambassador approvals
- Login activity monitoring
- Password change tracking

#### Notifications:
- Admin notifications for new activations
- User welcome messages
- Security reminders
- Follow-up alerts for inactive users

## Technical Implementation

### Key Components:
- `AmbassadorStatusList` - Admin dashboard for tracking
- `PasswordChangeDialog` - Secure password update
- `useAuthTracking` - Hook for activation monitoring
- `useFirstLoginTracker` - First login detection
- `NotificationCenter` - Real-time updates

### Edge Functions:
- `admin-approve-application` - Complete approval workflow
- `send-approval-email` - Professional email notifications

### Database Functions:
- `get_auth_users_info()` - Auth data access for admins
- `update_first_login()` - First login tracking
- `ambassador_status_view` - Combined status view

## Flow Summary

```
Application → Admin Approval → Email Sent → User Login → Password Change → Active Ambassador
     ↓              ↓              ↓            ↓             ↓              ↓
  [pending]    [approved]    [email_sent]  [first_login] [password_ok]  [fully_active]
```

This comprehensive system ensures:
- ✅ Secure user onboarding
- ✅ Complete activation tracking
- ✅ Admin visibility and control
- ✅ Professional user experience
- ✅ Security best practices
- ✅ Real-time monitoring
- ✅ Automated follow-ups