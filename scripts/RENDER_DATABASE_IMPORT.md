# Render Database Import Guide

This guide shows you how to migrate sample data to your Render PostgreSQL database using Python.

## Prerequisites

- Python 3.7+ installed locally
- Access to your Render PostgreSQL database URL

## Quick Setup

### 1. Install Python Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### 2. Get Your Database URL from Render

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Click on your **PostgreSQL** service (not your web service)
3. Go to the **Info** tab
4. Copy the **External Database URL** (starts with `postgresql://`)

Example format:
```
postgresql://username:password@dpg-xxxxx-a.oregon-postgres.render.com/database_name
```

### 3. Run the Migration

**Option A: Pass URL as argument**
```bash
python migrate_data.py --database-url "postgresql://user:pass@host:port/db"
```

**Option B: Use environment variable**
```bash
export DATABASE_URL="postgresql://user:pass@host:port/db"
python migrate_data.py
```

**Option C: Dry run first (recommended)**
```bash
python migrate_data.py --database-url "your-url-here" --dry-run
```

## What Gets Created

### 👨‍💼 Admin User
- **Email**: admin@eadms.com
- **Password**: Admin@123
- **Role**: ADMIN

### 👨‍🏫 Teachers (3)
- **John Smith** (TCH001): john.smith@eadms.com - Computer Science
- **Jane Doe** (TCH002): jane.doe@eadms.com - Mathematics  
- **Mike Wilson** (TCH003): mike.wilson@eadms.com - Physics
- **Password**: Teacher@123

### 👨‍🎓 Students (4)
- **Alice Johnson** (CS001, Class: CS-1A): alice.johnson@student.com
- **Bob Brown** (CS002, Class: CS-1A): bob.brown@student.com
- **Carol Davis** (CS003, Class: CS-1B): carol.davis@student.com
- **David Miller** (CS004, Class: CS-1B): david.miller@student.com
- **Password**: Student@123

### 📚 Courses (3)
- **CS101**: Introduction to Programming (Semester 1, 3 credits) - John Smith
- **MATH201**: Calculus I (Semester 2, 4 credits) - Jane Doe
- **PHY101**: Physics Fundamentals (Semester 1, 3 credits) - Mike Wilson

### 📝 Enrollments (7)
- Alice: CS101 (S1), MATH201 (S2)
- Bob: CS101 (S1), PHY101 (S1)
- Carol: MATH201 (S2), PHY101 (S1)
- David: CS101 (S1)

## Features

✅ **Idempotent**: Safe to run multiple times - won't create duplicates
✅ **Password Hashing**: Uses bcrypt compatible with Spring Security
✅ **Error Handling**: Comprehensive error handling and logging
✅ **Dry Run**: Test before making changes
✅ **Detailed Logging**: See exactly what's happening

## Example Output

```
2024-01-07 10:30:15 - INFO - ✅ Connected to PostgreSQL database
2024-01-07 10:30:15 - INFO - 🌱 Starting data migration...
2024-01-07 10:30:15 - INFO - 👨‍💼 Creating admin user...
2024-01-07 10:30:15 - INFO - ✅ Created user: admin@eadms.com (ID: 1)
2024-01-07 10:30:15 - INFO - 👨‍🏫 Creating teachers...
2024-01-07 10:30:16 - INFO - ✅ Created user: john.smith@eadms.com (ID: 2)
2024-01-07 10:30:16 - INFO - ✅ Created teacher: John Smith (ID: 1)
...
2024-01-07 10:30:20 - INFO - 🎉 Data migration completed successfully!
```

## Troubleshooting

### Connection Issues

**Error**: `connection to server failed`
- ✅ Verify your DATABASE_URL is correct
- ✅ Check if your IP is whitelisted (Render PostgreSQL allows all by default)
- ✅ Ensure the database service is running

**Error**: `authentication failed`
- ✅ Double-check username/password in DATABASE_URL
- ✅ Copy the URL exactly from Render dashboard

### Python Issues

**Error**: `ModuleNotFoundError: No module named 'psycopg2'`
```bash
pip install -r requirements.txt
```

**Error**: `bcrypt` installation issues on Windows
```bash
pip install --only-binary=all bcrypt
```

### Database Issues

**Error**: `relation "users" does not exist`
- ✅ Make sure your Spring Boot app has run at least once to create tables
- ✅ Check that `spring.jpa.hibernate.ddl-auto=update` is set

**Error**: `duplicate key value violates unique constraint`
- ✅ This is normal - the script detects existing data and skips duplicates
- ✅ Check the logs to see what was skipped vs created

## Advanced Usage

### Custom Data

You can modify `migrate_data.py` to add your own data:

```python
# Add more teachers
teacher_users = [
    ("your.teacher@eadms.com", "Your", "Teacher", "Your Department"),
    # ... existing teachers
]

# Add more students  
student_users = [
    ("your.student@student.com", "Your", "Student", "YOUR001"),
    # ... existing students
]
```

### Environment-Specific Migration

```bash
# Development
export DATABASE_URL="postgresql://localhost:5432/eadms_dev"
python migrate_data.py

# Staging
export DATABASE_URL="postgresql://staging-url"
python migrate_data.py

# Production
export DATABASE_URL="postgresql://production-url"
python migrate_data.py
```

## Security Notes

- 🔒 Never commit database URLs to version control
- 🔒 Use environment variables for sensitive data
- 🔒 The script uses bcrypt hashing compatible with Spring Security
- 🔒 Default passwords are for demo purposes - change in production

## Alternative: Using Render Shell

If you prefer to run the script directly on Render:

1. Go to your Render web service dashboard
2. Click **Shell** tab
3. Upload the script files
4. Run: `python migrate_data.py` (DATABASE_URL is already set)

This approach doesn't require local Python setup but is less convenient for development.

## Next Steps

After migration:
1. ✅ Test login with admin credentials
2. ✅ Verify teachers can access their dashboard
3. ✅ Check student enrollments
4. ✅ Test course management features
5. ✅ Update passwords for production use