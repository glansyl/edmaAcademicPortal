# EDMA Deployment Guide

## Free Deployment Options

### Option 1: Render.com (Recommended)

#### Backend Deployment
1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** edma-backend
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/eadms-1.0.0.jar`
   - **Environment:** Java
   - **Instance Type:** Free

5. Add Environment Variables:
   ```
   SPRING_PROFILES_ACTIVE=prod
   SERVER_PORT=8080
   ```

#### Database
1. Click "New +" → "PostgreSQL"
2. **Name:** edma-db
3. **Database:** eadmsdb
4. **User:** aman
5. Copy the **Internal Database URL**
6. Add to backend environment variables:
   ```
   DATABASE_URL=<your-postgres-url>
   ```

#### Frontend Deployment (Vercel)
1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://edma-backend.onrender.com/api
   ```

5. Update `frontend/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
   ```

---

### Option 2: Railway.app

#### Full Stack Setup
1. Create account at [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add PostgreSQL plugin
4. Configure services automatically
5. Get $5/month free credit

#### Commands:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

---

### Option 3: Fly.io

#### Backend
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch backend
cd /path/to/edma
flyctl launch --name edma-backend

# Add PostgreSQL
flyctl postgres create --name edma-db
flyctl postgres attach edma-db

# Deploy
flyctl deploy
```

#### Frontend
```bash
cd frontend
flyctl launch --name edma-frontend
flyctl deploy
```

---

### Option 4: Free Tier Combination

**Backend:** Render.com (750 hours/month free)
**Database:** Supabase (500MB free, never sleeps)
**Frontend:** Vercel (unlimited free)

#### Supabase Setup:
1. Create account at [supabase.com](https://supabase.com)
2. New project → Get connection string
3. Update backend configuration:
   ```properties
   spring.datasource.url=jdbc:postgresql://db.xxx.supabase.co:5432/postgres
   spring.datasource.username=postgres
   spring.datasource.password=<your-password>
   ```

---

## Configuration Updates Needed

### 1. Update application-prod.properties

```properties
# Use environment variables
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/eadmsdb}
spring.datasource.username=${DB_USERNAME:aman}
spring.datasource.password=${DB_PASSWORD:aman}

# Server port
server.port=${PORT:8080}

# CORS - Update with your frontend URL
cors.allowed.origins=${FRONTEND_URL:http://localhost:5173}
```

### 2. Update Frontend API Base URL

File: `frontend/src/services/api.ts`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     (import.meta.env.MODE === 'production' 
                       ? 'https://your-backend-url.onrender.com/api'
                       : 'http://localhost:8080/api')
```

### 3. Update CORS in Backend

File: `src/main/java/com/eadms/config/WebConfig.java`
```java
@Value("${cors.allowed.origins:http://localhost:5173}")
private String allowedOrigins;

@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOrigins(allowedOrigins.split(","))
            .allowedMethods("*")
            .allowedHeaders("*")
            .allowCredentials(true);
}
```

---

## Cost Comparison

| Service | Backend | Database | Frontend | Total |
|---------|---------|----------|----------|-------|
| **Render + Vercel** | Free (750h) | Free | Free | $0 |
| **Railway** | $5/mo credit | Included | $5/mo credit | $0-5 |
| **Fly.io** | 3 VMs free | 3GB free | Free | $0 |
| **Supabase + Render + Vercel** | Free | Free (500MB) | Free | $0 |

---

## Deployment Checklist

- [ ] Update CORS configuration
- [ ] Set environment variables
- [ ] Update API base URL in frontend
- [ ] Test database connection
- [ ] Run database migrations
- [ ] Import initial data (CSV files)
- [ ] Test authentication
- [ ] Test all features
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)

---

## Post-Deployment

### Import Data
```bash
# SSH into backend or use Render Shell
./import_all_data.sh
```

### Monitor Logs
- **Render:** Dashboard → Logs
- **Vercel:** Dashboard → Deployments → Logs
- **Railway:** Project → Logs

### Custom Domain (Optional)
- Vercel: Free SSL + custom domain
- Render: Free SSL + custom domain
- Cloudflare: Free DNS + CDN

---

## Troubleshooting

### Backend won't start
- Check environment variables
- Verify database connection
- Check logs for errors

### Database connection failed
- Verify DATABASE_URL format
- Check database credentials
- Ensure database is running

### CORS errors
- Update CORS allowed origins
- Add frontend URL to backend config
- Check request headers

### Frontend API calls fail
- Verify VITE_API_BASE_URL
- Check CORS configuration
- Test API endpoints directly
