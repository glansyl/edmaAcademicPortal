# 🔧 CORS Debugging Guide

## 🚨 Current Issue
Your frontend (https://edma-three.vercel.app) is getting CORS errors when trying to connect to your backend.

## 📋 Step-by-Step Fix

### Step 1: Find Your Backend URL
1. Go to your Render.com dashboard
2. Find your backend service
3. Copy the URL (should be something like `https://your-service-name.onrender.com`)

### Step 2: Update Render.com Environment Variables
In your Render.com service → Environment tab, set:

```bash
CORS_ALLOWED_ORIGINS=https://edma-three.vercel.app,http://localhost:5173
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=your-postgres-url-here
SPRING_PROFILES_ACTIVE=prod
```

### Step 3: Update Vercel Environment Variables
In your Vercel project → Settings → Environment Variables:

```bash
VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api
VITE_WS_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com
```

### Step 4: Test CORS
After both deployments are updated, test CORS:

1. **Open browser console on your frontend**
2. **Run this test:**
```javascript
fetch('https://YOUR-BACKEND-URL.onrender.com/api/cors-test', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('CORS Test Success:', data))
.catch(error => console.error('CORS Test Failed:', error));
```

### Step 5: Test Login API
```javascript
fetch('https://YOUR-BACKEND-URL.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@eadms.com',
    password: 'Admin@123'
  })
})
.then(response => response.json())
.then(data => console.log('Login Test:', data))
.catch(error => console.error('Login Test Failed:', error));
```

## 🔍 Common Issues & Solutions

### Issue 1: Wrong Backend URL
**Problem:** Frontend trying to connect to wrong URL
**Solution:** Update VITE_API_URL in Vercel environment variables

### Issue 2: Backend Not Allowing Frontend Domain
**Problem:** CORS_ALLOWED_ORIGINS doesn't include your Vercel URL
**Solution:** Add your exact Vercel URL to CORS_ALLOWED_ORIGINS

### Issue 3: Environment Variables Not Applied
**Problem:** Changes not taking effect
**Solution:** Redeploy both frontend and backend after changing environment variables

### Issue 4: HTTPS/HTTP Mismatch
**Problem:** Frontend is HTTPS but trying to connect to HTTP backend
**Solution:** Ensure backend URL uses HTTPS (Render.com provides this automatically)

## 🧪 Quick CORS Test Commands

### Test 1: Basic Connectivity
```bash
curl -I https://YOUR-BACKEND-URL.onrender.com/api/cors-test
```

### Test 2: CORS Preflight
```bash
curl -X OPTIONS \
  -H "Origin: https://edma-three.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://YOUR-BACKEND-URL.onrender.com/api/auth/login
```

### Test 3: Actual Request
```bash
curl -X POST \
  -H "Origin: https://edma-three.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eadms.com","password":"Admin@123"}' \
  https://YOUR-BACKEND-URL.onrender.com/api/auth/login
```

## 📝 What to Check

1. ✅ Backend is deployed and accessible
2. ✅ Frontend is deployed and accessible  
3. ✅ Environment variables are set correctly
4. ✅ URLs match exactly (no trailing slashes)
5. ✅ Both services redeployed after env var changes
6. ✅ CORS headers are present in response
7. ✅ No typos in domain names

## 🆘 If Still Not Working

1. **Check Render.com logs** for CORS-related errors
2. **Check browser network tab** for exact error messages
3. **Verify environment variables** are actually set in both platforms
4. **Try the CORS test endpoint** I created: `/api/cors-test`
5. **Ensure both deployments are using latest code**

## 📞 Next Steps

Please provide:
1. Your actual Render.com backend URL
2. Screenshot of browser network tab showing the CORS error
3. Screenshot of your Render.com environment variables

Then I can give you the exact configuration needed!