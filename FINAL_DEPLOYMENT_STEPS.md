# 🚀 FINAL DEPLOYMENT STEPS - EADMS

## 🎯 CURRENT STATUS
✅ **Database**: PostgreSQL populated with complete sample data (28 users, 10 teachers, 17 students, 10 courses, 27 enrollments)  
✅ **Backend Code**: Updated with correct CORS configuration  
✅ **Frontend Code**: Built successfully with production URLs  
❌ **Backend Connection**: Needs DATABASE_URL fix on Render  
❌ **Frontend Deployment**: Needs deployment to Vercel  

## 🔧 STEP 1: Fix Render Backend Database Connection

### Go to Render Dashboard
1. Open your Render dashboard
2. Navigate to your backend service: `edmaacademicportal`
3. Go to Environment Variables section

### Update DATABASE_URL
**Replace the current DATABASE_URL with:**
```
postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a.oregon-postgres.render.com/edmadb_vwl0
```

### Verify Other Environment Variables
Ensure these are set:
```bash
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-production-use
CORS_ALLOWED_ORIGINS=https://edma-academic-portal.vercel.app,https://edma-three.vercel.app,http://localhost:5173
```

### Redeploy
Click "Manual Deploy" to apply the environment variable changes.

## 🌐 STEP 2: Deploy Frontend to Vercel

### Vercel Settings
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `frontend`

### Environment Variables (Vercel)
```bash
VITE_API_URL=https://edmaacademicportal.onrender.com/api
VITE_WS_URL=https://edmaacademicportal.onrender.com
```

### Deploy
Deploy to: `https://edma-academic-portal.vercel.app`

## ✅ STEP 3: Verify Deployment

### Test Backend (after DATABASE_URL fix)
```bash
curl "https://edmaacademicportal.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eadms.com","password":"Admin@123"}'
```

Expected: Login success with JWT token

### Test Dashboard Stats
After login, dashboard should show:
- **Students**: 17
- **Teachers**: 10  
- **Courses**: 10
- **Active Users**: 28

### Test Frontend
Visit: `https://edma-academic-portal.vercel.app`
- Should load login page
- Login with `admin@eadms.com` / `Admin@123`
- Dashboard should display correct statistics

## 🎉 SUCCESS CRITERIA

When deployment is complete, you should have:

1. **Backend**: `https://edmaacademicportal.onrender.com`
   - ✅ API responding
   - ✅ Database connected (showing real data counts)
   - ✅ Authentication working

2. **Frontend**: `https://edma-academic-portal.vercel.app`
   - ✅ Login page loads
   - ✅ Admin dashboard shows correct statistics
   - ✅ All features accessible

3. **Data Verification**:
   - 28 total users (1 admin + 10 teachers + 17 students)
   - International faculty from 10 countries
   - Students from Europe, Asia, Middle East, Africa, Americas
   - 10 Applied Sciences courses
   - 27 active enrollments

## 🔑 Login Credentials

### Admin
- **Email**: `admin@eadms.com`
- **Password**: `Admin@123`

### Sample Teacher
- **Email**: `luca.bernardi@eadms.eu`
- **Password**: `Teacher@123`

### Sample Student  
- **Email**: `mateo.rossi@student.eu`
- **Password**: `Student@123`

---

**The system is ready for production! Just need to fix the DATABASE_URL and deploy the frontend.** 🚀