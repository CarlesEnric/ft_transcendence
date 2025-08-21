# Two-Factor Authentication (2FA) Implementation

🎉 **2FA has been successfully implemented in your ft_transcendence authentication system!**

## What's been added:

### 📁 New Files Created:
- `services/auth-service/src/utils/twoFactor.ts` - 2FA utility functions
- `services/auth-service/src/routes/twoFactor.ts` - 2FA API endpoints

### 🗄️ Database Updates:
- Added 2FA fields to users table:
  - `two_factor_enabled` (Boolean)
  - `two_factor_secret` (TOTP secret)
  - `backup_codes` (JSON array of backup codes)

### 🛠️ New Database Functions:
- `enable2FA()` - Enable 2FA for a user
- `disable2FA()` - Disable 2FA for a user
- `get2FASettings()` - Get user's 2FA settings
- `useBackupCode()` - Consume a backup code

## 🔗 Available 2FA Endpoints:

### GET `/api/auth/2fa/status`
Get 2FA status for authenticated user
```bash
curl -k -H "Authorization: Bearer YOUR_JWT_TOKEN" https://localhost:3000/api/auth/2fa/status
```

### GET `/api/auth/2fa/setup`
Generate 2FA setup data (secret, QR code, backup codes)
```bash
curl -k -H "Authorization: Bearer YOUR_JWT_TOKEN" https://localhost:3000/api/auth/2fa/setup
```

### POST `/api/auth/2fa/verify-setup`
Verify and enable 2FA with TOTP token
```bash
curl -k -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"123456","secret":"YOUR_SECRET"}' \
  https://localhost:3000/api/auth/2fa/verify-setup
```

### POST `/api/auth/2fa/verify`
Verify 2FA token during authentication
```bash
curl -k -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"123456"}' \
  https://localhost:3000/api/auth/2fa/verify
```

### POST `/api/auth/2fa/disable`
Disable 2FA (requires password or TOTP token)
```bash
curl -k -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"your_password"}' \
  https://localhost:3000/api/auth/2fa/disable
```

### POST `/api/auth/2fa/regenerate-backup-codes`
Generate new backup codes
```bash
curl -k -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://localhost:3000/api/auth/2fa/regenerate-backup-codes
```

## 🔐 How to use 2FA:

### 1. **User Registration/Login**
First, users need to register and get authenticated:
```bash
# Register
curl -k -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}' \
  https://localhost:3000/api/auth/register

# Login (check cookies for JWT)
curl -k -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' \
  https://localhost:3000/api/auth/login
```

### 2. **Setup 2FA**
Once authenticated, users can setup 2FA:
```bash
# Get 2FA setup data (includes QR code and backup codes)
curl -k -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://localhost:3000/api/auth/2fa/setup
```

### 3. **Enable 2FA**
After scanning QR code with authenticator app, verify with TOTP:
```bash
# Verify setup with TOTP token from authenticator app
curl -k -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"123456","secret":"RECEIVED_SECRET"}' \
  https://localhost:3000/api/auth/2fa/verify-setup
```

## 🛡️ Security Features:

- **TOTP (Time-based One-Time Password)** using `speakeasy`
- **QR Code generation** for easy setup
- **Backup codes** for account recovery
- **JWT-protected endpoints**
- **Secure backup code consumption** (one-time use)
- **Password or TOTP required** for disabling 2FA

## 📱 Compatible Authenticator Apps:

- Google Authenticator
- Authy
- Microsoft Authenticator
- 1Password
- Bitwarden
- Any TOTP-compatible app

## 🔧 Integration Notes:

- All 2FA endpoints require JWT authentication
- QR codes are returned as base64 data URLs
- Backup codes are 8-character hexadecimal strings
- TOTP window allows ±60 seconds for time drift
- Database automatically handles backup code consumption

## 🧪 Testing:

The system is now ready for 2FA testing! Users can:
1. Register/login to get authenticated
2. Setup 2FA with their authenticator app
3. Use TOTP codes or backup codes for verification
4. Manage their 2FA settings securely

Your authentication system now has enterprise-grade two-factor authentication! 🚀
