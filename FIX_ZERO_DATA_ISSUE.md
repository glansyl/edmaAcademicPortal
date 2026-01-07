# Fix: Zero Teachers/Students/Courses Issue

## ✅ DIAGNOSIS COMPLETE

Your PostgreSQL database **HAS DATA**:
- 28 Users
- 10 Teachers
- 17 Students
- 10 Courses
- 27 Enrollments

**Problem:** Your backend is NOT connecting to this PostgreSQL database!

---

## 🔧 SOLUTION: Fix Backend Database Connection

### Step 1: Update Render Environment Variables

Go to your Render dashboard → Backend Service → Environment

**Set these environment variables:**

```bash
DATABASE_URL=postgresql://glansyldsouza:90sdqXPOCt8vjts1erxYBSbciI0Xv2YN@dpg-d5e9bsh5pdvs73f7pkl0-a.oregon-postgres.render.com/edmadb

SPRING_PROFILES_ACTIVE=prod

JWT_SECRET=your-secure-jwt-secret-at-least-32-characters-long

CORS_ALLOWED_ORIGINS=https://edma-three.vercel.app,http://localhost:5173
```

**IMPORTANT:** 
- The `DATABASE_URL` should match exactly what I used above
- Make sure `SPRING_PROFILES_ACTIVE=prod` is set
- Replace JWT_SECRET with a secure random string

### Step 2: Verify Database Connection in Render

1. In Render dashboard, go to your database (`edma-db`)
2. Copy the **External Database URL** 
3. It should match: `postgresql://glansyldsouza:90sdqXPOCt8vjts1erxYBSbciI0Xv2YN@dpg-d5e9bsh5pdvs73f7pkl0-a.oregon-postgres.render.com/edmadb`
4. If the database name is different, update the DATABASE_URL accordingly

### Step 3: Redeploy Backend

After setting environment variables:
1. Go to your backend service in Render
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

### Step 4: Verify Fix

After deployment, test these endpoints:

```bash
# 1. Check database diagnostic (NEW endpoint I created)
curl https://edma-m87i.onrender.com/api/diagnostic/database-info

# 2. Check admin dashboard stats
curl https://edma-m87i.onrender.com/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Get all teachers (should return 10)
curl https://edma-m87i.onrender.com/api/admin/teachers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 5: Check Backend Logs

In Render logs, you should see:
```
✅ The following profiles are active: prod
✅ Connecting to database: jdbc:postgresql://dpg-d5e9bsh5pdvs73f7pkl0-a.oregon-postgres.render.com:5432/edmadb
```

If you see H2 or a different database, the environment variable isn't being picked up.

---

## 🚨 Common Issues

### Issue 1: DATABASE_URL not set correctly
**Symptom:** Backend still shows 0 counts
**Fix:** Double-check the DATABASE_URL in Render environment variables

### Issue 2: Wrong database name
**Symptom:** Connection error in logs
**Fix:** Your database name is `edmadb` (not `eadmsdb`). Make sure it matches.

### Issue 3: Profile not set to prod
**Symptom:** Backend uses H2 database
**Fix:** Set `SPRING_PROFILES_ACTIVE=prod` in Render environment variables

### Issue 4: Database connection string has wrong format
**Symptom:** Parse error in logs
**Fix:** Use the exact format: `postgresql://user:pass@host/dbname`

---

## 📊 Expected Results After Fix

Your admin dashboard should show:
- **Total Students:** 17
- **Total Teachers:** 10
- **Total Courses:** 10
- **Active Users:** 28

---

## 🔍 Debug Commands

If it still doesn't work, run these locally:

```bash
# Check database content
python3 scripts/check_database.py "postgresql://glansyldsouza:90sdqXPOCt8vjts1erxYBSbciI0Xv2YN@dpg-d5e9bsh5pdvs73f7pkl0-a.oregon-postgres.render.com/edmadb"

# Test backend connection (after getting JWT token)
curl https://edma-m87i.onrender.com/api/diagnostic/database-info
```

---

## ⚠️ Security Note

After fixing the issue, you should:
1. Remove the DiagnosticController (it exposes database info)
2. Change your database password
3. Update the DATABASE_URL with the new password
4. Never commit database credentials to git

---

## 📝 Summary

The data is in PostgreSQL, but your backend isn't connecting to it. Follow the steps above to:
1. Set correct DATABASE_URL in Render
2. Set SPRING_PROFILES_ACTIVE=prod
3. Redeploy
4. Verify the fix

Your dashboard will then show all 10 teachers, 17 students, and 10 courses! 🎉
