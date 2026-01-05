# Environment Variables Configuration

## Required for Render Deployment

### 1. DATABASE_URL (Auto-set by Render)
- **Auto-configured** when you attach PostgreSQL database
- Format: `postgresql://username:password@host:port/database`
- No manual configuration needed

### 2. JWT_SECRET (REQUIRED - Manual Setup)
- **CRITICAL**: Generate a strong secret for production
- Minimum 32 characters (base64 encoded recommended)
- **How to generate**:
  ```bash
  # Option 1: Using openssl
  openssl rand -base64 64
  
  # Option 2: Using Node.js
  node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
  
  # Option 3: Using Python
  python3 -c "import secrets; print(secrets.token_urlsafe(64))"
  ```
- **Set on Render**: Dashboard → Service → Environment → Add Variable
  - Name: `JWT_SECRET`
  - Value: Your generated secret

### 3. CORS_ALLOWED_ORIGINS (Required after frontend deployment)
- **Value**: Comma-separated list of allowed frontend URLs
- **Examples**:
  - Single origin: `https://your-app.vercel.app`
  - Multiple origins: `https://your-app.vercel.app,https://www.your-app.com`
- **Important**: No trailing slashes, no spaces (unless you want them)
- **Set on Render**: Dashboard → Service → Environment → Add Variable
  - Name: `CORS_ALLOWED_ORIGINS`
  - Value: Your frontend URL(s)

### 4. PORT (Auto-set by Render)
- **Auto-configured** by Render (usually 10000)
- No manual configuration needed

### 5. JWT_EXPIRATION (Optional)
- **Default**: 86400000 (24 hours in milliseconds)
- **To customize**: Set on Render
  - Name: `JWT_EXPIRATION`
  - Value: Time in milliseconds
  - Examples:
    - 1 hour: `3600000`
    - 12 hours: `43200000`
    - 7 days: `604800000`

## Quick Setup Checklist for Render

1. ✅ Attach PostgreSQL database (DATABASE_URL auto-set)
2. ✅ Generate and set JWT_SECRET
3. ⏳ Deploy backend (will fail CORS initially - this is normal)
4. ⏳ Deploy frontend to Vercel with `VITE_API_URL`
5. ✅ Add CORS_ALLOWED_ORIGINS with Vercel URL
6. ✅ Redeploy (triggers automatically when you save env vars)

## Security Notes

- **NEVER** commit JWT_SECRET to Git
- **NEVER** use the default JWT secret in production
- Generate a NEW secret for each environment (dev, staging, prod)
- Rotate JWT secrets periodically for security

## Troubleshooting

### Build fails with "jwt.secret not found"
- Make sure JWT_SECRET is set in Render environment variables
- Check spelling (case-sensitive)

### CORS errors in browser console
- Verify CORS_ALLOWED_ORIGINS matches your frontend URL exactly
- Check for trailing slashes
- Ensure protocol matches (http vs https)

### Database connection fails
- Verify DATABASE_URL is set (should be automatic)
- Check PostgreSQL instance is running
- View Render logs for specific error messages
