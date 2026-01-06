# Vercel Deployment Setup

## 🚀 Quick Setup Guide

### 1. Environment Variables in Vercel
Go to your Vercel project → Settings → Environment Variables and add:

```
VITE_API_URL = https://your-backend-url.onrender.com/api
VITE_WS_URL = https://your-backend-url.onrender.com
```

### 2. Backend CORS Configuration
In your Render.com backend, add this environment variable:

```
CORS_ALLOWED_ORIGINS = https://your-frontend-url.vercel.app,http://localhost:5173
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

## 📝 Example URLs

**Backend (Render.com):**
```
https://edma-backend.onrender.com
```

**Frontend (Vercel):**
```
https://edma-frontend.vercel.app
```

**Environment Variables:**
```
# Vercel (Frontend)
VITE_API_URL=https://edma-backend.onrender.com/api
VITE_WS_URL=https://edma-backend.onrender.com

# Render (Backend)
CORS_ALLOWED_ORIGINS=https://edma-frontend.vercel.app,http://localhost:5173
```