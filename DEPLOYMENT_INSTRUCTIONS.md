# 🚀 EADMS Deployment Instructions

## Current Status
✅ **Database**: PostgreSQL populated with sample data  
✅ **Backend**: Updated CORS configuration  
✅ **Frontend**: Built with correct production URLs  

## 🔧 Backend Deployment (Render.com)

### 1. Deploy to Render.com
Your backend should be deployed to: `https://edmaacademicportal.onrender.com`

**Environment Variables to Set on Render:**
```bash
DATABASE_URL=postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a.oregon-postgres.render.com/edmadb_vwl0
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-production-use
CORS_ALLOWED_ORIGINS=https://edma-academic-portal.vercel.app,https://edma-three.vercel.app,http://localhost:5173
```

**⚠️ IMPORTANT**: Use the EXTERNAL database URL format (with `.oregon-postgres.render.com`) for Render deployments.

### 2. Build Command
```bash
mvn clean package -DskipTests
```

### 3. Start Command
```bash
java -jar target/eadms-1.0.0.jar --spring.profiles.active=prod
```

## 🌐 Frontend Deployment (Vercel)

### 1. Deploy to Vercel
Your frontend should be deployed to: `https://edma-academic-portal.vercel.app`

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables (Vercel Dashboard)
```bash
VITE_API_URL=https://edmaacademicportal.onrender.com/api
VITE_WS_URL=https://edmaacademicportal.onrender.com
```

## 📋 Deployment Steps

### Step 1: Deploy Backend
1. Push your code to GitHub
2. Connect Render.com to your repository
3. Set environment variables in Render dashboard
4. Deploy and wait for build to complete

### Step 2: Deploy Frontend
1. Connect Vercel to your repository
2. Set build settings (framework: Vite, build command: npm run build)
3. Set environment variables in Vercel dashboard
4. Deploy from `frontend/` directory

### Step 3: Test Deployment
1. Visit `https://edmaacademicportal.onrender.com` (should show API welcome)
2. Visit `https://edma-academic-portal.vercel.app` (should show login page)
3. Login with: `admin@eadms.com` / `Admin@123`

## 🔑 Login Credentials

### Admin
- **Email**: `admin@eadms.com`
- **Password**: `Admin@123`

### Teachers (10 international faculty)
- **Format**: `[firstname.lastname]@eadms.eu` / `Teacher@123`
- **Examples**: 
  - `luca.bernardi@eadms.eu` / `Teacher@123`
  - `anna.kowalska@eadms.eu` / `Teacher@123`

### Students (17 international students)
- **Format**: `[firstname.lastname]@student.eu` / `Student@123`
- **Examples**:
  - `mateo.rossi@student.eu` / `Student@123`
  - `elena.garcia@student.eu` / `Student@123`

## 📊 Expected Data
After successful deployment, you should see:
- **28 Users** (1 admin + 10 teachers + 17 students)
- **10 Teachers** from different countries
- **17 Students** from around the world  
- **10 Courses** in Applied Sciences curriculum
- **27 Enrollments** across different semesters

## 🔧 Troubleshooting

### If Backend Shows 0 Data:
1. Check DATABASE_URL environment variable
2. Verify PostgreSQL connection
3. Check application logs for errors

### If Frontend Can't Connect:
1. Verify CORS settings in backend
2. Check VITE_API_URL environment variable
3. Ensure backend is running and accessible

### CORS Issues:
The backend is configured to allow:
- `https://edma-academic-portal.vercel.app`
- `https://edma-three.vercel.app`
- `http://localhost:*` (for development)

## 🎯 Final URLs
- **Frontend**: https://edma-academic-portal.vercel.app
- **Backend API**: https://edmaacademicportal.onrender.com/api
- **Admin Dashboard**: https://edma-academic-portal.vercel.app/admin

Your EADMS system is ready for production! 🎉