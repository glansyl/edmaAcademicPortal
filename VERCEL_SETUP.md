# Vercel Deployment Setup

## 🚀 Quick Setup Guide

# Vercel Deployment Setup

## 🚀 Quick Setup Guide

### 1. Generate JWT Secret
Run this command to generate a secure JWT secret:
```bash
python3 scripts/generate-jwt-secret.py
```

### 2. Environment Variables in Render.com (Backend)
Go to your Render.com service → Environment tab and add:

```bash
# JWT Configuration (REQUIRED)
JWT_SECRET=your-generated-jwt-secret-from-script-above
JWT_EXPIRATION=86400000

# Database (Auto-configured by Render)
DATABASE_URL=postgresql://username:password@host:port/database

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:5173

# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# Server Port (Optional - Render auto-assigns)
PORT=8080
```

### 3. Environment Variables in Vercel (Frontend)
Go to your Vercel project → Settings → Environment Variables and add:

```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_WS_URL=https://your-backend-url.onrender.com
```

### 4. Local Development Environment
Create/update `frontend/.env.local` (for local development):

```bash
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080
```

Create/update `application-dev.properties` (for local backend):
```bash
jwt.secret=your-development-jwt-secret-different-from-production
jwt.expiration=86400000
cors.allowed.origins=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

### 3. Deployment Steps

1. **Deploy Backend First** (Render.com):
   - Push your code to GitHub
   - Deploy on Render.com
   - Note your backend URL (e.g., `https://edma-backend.onrender.com`)

2. **Configure Frontend** (Vercel):
   - Set environment variables in Vercel dashboard
   - Use your actual backend URL from step 1

3. **Update Backend CORS**:
   - Add your Vercel frontend URL to CORS_ALLOWED_ORIGINS
   - Redeploy backend

## 🔧 Troubleshooting

### CORS Errors
- Ensure backend CORS includes your Vercel URL
- Check environment variables are set correctly
- Verify URLs don't have trailing slashes

### Build Errors
- Check all dependencies are in package.json
- Ensure build command is correct: `npm run build`
- Verify output directory is `dist`

### API Connection Issues
- Verify backend is deployed and accessible
- Check API URL format: `https://domain.com/api` (no trailing slash)
- Test backend endpoints directly

## 📝 Example Configuration

### Render.com Environment Variables:
```bash
JWT_SECRET=9t9!*qg99BamwuvJ61JfpQgYXLXFjIN2mAYXvXPk2dFOIsOum58FKYjX7b*%#y86
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://edma-frontend.vercel.app,http://localhost:5173
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Vercel Environment Variables:
```bash
VITE_API_URL=https://edma-backend.onrender.com/api
VITE_WS_URL=https://edma-backend.onrender.com
```

## 🔐 Security Best Practices

### JWT Secret Security:
- **Never commit JWT secrets to Git**
- **Use different secrets for dev/prod**
- **Minimum 32 characters length**
- **Include special characters**
- **Regenerate periodically**

### Environment Variable Security:
- Store secrets only in platform environment variables
- Use `.env.local` for local development (add to .gitignore)
- Never use `.env` files in production
- Rotate secrets regularly