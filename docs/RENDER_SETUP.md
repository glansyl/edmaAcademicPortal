# Render Deployment Setup Guide

## Fixed Issues

All hardcoded configurations have been fixed:
- ✅ Database URL parsing (handles Render's `postgresql://` format)
- ✅ CORS origins (configurable via environment variable)
- ✅ WebSocket origins (configurable via environment variable)  
- ✅ Server port (configurable via environment variable)

## Required Environment Variables on Render

Go to your Render service → **Environment** tab and add:

### 1. DATABASE_URL
- **Already set automatically** by Render when you attach PostgreSQL database
- No action needed

### 2. CORS_ALLOWED_ORIGINS
- **Value**: Your frontend URL(s) separated by commas
- **Example for Vercel**: `https://your-app.vercel.app`
- **Multiple origins**: `https://your-app.vercel.app,https://www.your-app.com`
- **Important**: No trailing slash

### 3. PORT (Optional)
- **Default**: 8080 (Render will set this automatically)
- No action needed unless you want a specific port

### 4. SPRING_PROFILES_ACTIVE (Optional)
- **Value**: `prod`
- This is already set in `application.properties`, but you can override if needed

## Complete Setup Steps

### 1. Deploy Backend on Render
1. Your latest code is pushed to GitHub (commit: 66af001)
2. Render will automatically detect the changes and redeploy
3. Wait for build to complete (~5-10 minutes)

### 2. Add Frontend URL to CORS
After frontend is deployed:
1. Go to Render dashboard → Your service → Environment
2. Add `CORS_ALLOWED_ORIGINS` with your Vercel URL
3. Click **Save Changes** (this will trigger a redeploy)

### 3. Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set Root Directory: `frontend`
4. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend.onrender.com/api` (your Render backend URL)
5. Deploy

### 4. Update CORS with Vercel URL
1. Once Vercel deployment completes, copy the URL
2. Go back to Render → Environment
3. Update `CORS_ALLOWED_ORIGINS` with the Vercel URL
4. Save (triggers redeploy)

### 5. Import Data (Optional)
If you need sample data in production:
```bash
# Connect to Render PostgreSQL
psql postgresql://user:password@host/database

# Or use Render Shell to run import scripts
# (This requires uploading your CSV files to Render)
```

## Troubleshooting

### Backend not starting
- Check Render logs: Dashboard → Your service → Logs
- Verify DATABASE_URL is set (should be automatic)
- Ensure build completes successfully

### CORS errors in browser
- Check browser console for exact error
- Verify `CORS_ALLOWED_ORIGINS` is set correctly
- Ensure no trailing slash in URL
- Frontend URL must match exactly (http vs https, www vs non-www)

### WebSocket connection fails
- WebSocket uses same CORS settings
- Check if your hosting supports WebSocket connections
- Vercel supports WebSockets on Pro plan

### Database connection errors
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check DatabaseConfig.java logs in Render console
- Ensure PostgreSQL instance is running

## Development vs Production

The code now automatically handles both environments:

- **Development**: Uses `localhost:5173` by default
- **Production**: Uses environment variables

No code changes needed when switching environments!

## Security Notes

- Never commit database credentials to Git
- Always use environment variables for sensitive data
- Render PostgreSQL credentials are managed automatically
- JWT secret should also be moved to environment variable (future improvement)

## Cost

- Render Web Service (Free tier): $0/month
- Render PostgreSQL (Free tier): $0/month
- Vercel (Hobby plan): $0/month

**Total: FREE** 🎉

Note: Free tier limitations:
- Backend sleeps after 15 minutes of inactivity (cold starts ~30 seconds)
- PostgreSQL: 1GB storage, 97 hours/month runtime
- Consider upgrading if you need 24/7 uptime
