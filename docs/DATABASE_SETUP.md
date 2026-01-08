# PostgreSQL Database Setup Guide

## Overview

This guide explains how to set up PostgreSQL database for the EADMS (Educational Administration Management System).

## Prerequisites

1. **PostgreSQL 12 or higher** installed and running
2. **psql** command-line tool available
3. **Superuser access** to PostgreSQL (usually 'postgres' user)

## Quick Setup (Automated) ⚡

Run the setup script from the project root:

```bash
./setup_database.sh
```

This will:
- ✅ Create database user `aman` with password `123456`
- ✅ Create database `eadmsdb`
- ✅ Run all migrations and create tables
- ✅ Setup indexes and constraints
- ✅ Create default admin user via application startup

---

## Manual Setup 🔧

If you prefer manual setup or the script doesn't work:

### Step 1: Check PostgreSQL Installation

```bash
# Check if PostgreSQL is installed
psql --version

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
```

### Step 2: Start PostgreSQL (if not running)

```bash
# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Fedora/RHEL/CentOS
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS (Homebrew)
brew services start postgresql

# Arch Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 3: Login to PostgreSQL

```bash
# Switch to postgres user (Linux)
sudo -u postgres psql

# Or directly with password authentication
psql -U postgres -h localhost
```

### Step 4: Create User and Database

```sql
-- Create user
CREATE USER aman WITH PASSWORD '123456';
ALTER USER aman WITH CREATEDB;

-- Create database
CREATE DATABASE eadmsdb OWNER aman;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE eadmsdb TO aman;

-- Exit
\q
```

### Step 5: Run Migration Script

```bash
# Navigate to project root
cd /path/to/eadms

# Run the migration
psql -U aman -d eadmsdb -f src/main/resources/db/migration/V1__initial_schema.sql
```

Or login and run interactively:

```bash
psql -U aman -d eadmsdb
```

```sql
\i src/main/resources/db/migration/V1__initial_schema.sql
\q
```

### Step 6: Verify Tables

```bash
psql -U aman -d eadmsdb
```

```sql
-- List all tables
\dt

-- Expected output:
--  Schema |    Name     | Type  | Owner 
-- --------+-------------+-------+-------
--  public | attendance  | table | aman
--  public | courses     | table | aman
--  public | marks       | table | aman
--  public | messages    | table | aman
--  public | students    | table | aman
--  public | teachers    | table | aman
--  public | users       | table | aman

-- Check table structure
\d users
\d students
\d teachers

-- Verify no data exists (fresh database)
SELECT COUNT(*) FROM users;
-- Should return 0

-- Exit
\q
```

---

## Database Schema 📊

### Tables Created

1. **users** - Core authentication table
   - Stores email, password (hashed), role, active status
   - Roles: ADMIN, TEACHER, STUDENT

2. **students** - Student profile information
   - Links to users table via user_id
   - Stores student ID, name, class, gender, DOB, contact

3. **teachers** - Teacher profile information
   - Links to users table via user_id
   - Stores teacher ID, name, department, contact

4. **courses** - Course catalog
   - Links to teachers (optional)
   - Stores course code, name, semester, credits, description

5. **marks** - Student examination marks
   - Links to students and courses
   - Stores exam type, marks obtained, max marks, date

6. **attendance** - Daily attendance records
   - Links to students and courses
   - Stores attendance date and status (PRESENT, ABSENT, LATE, EXCUSED)

7. **messages** - Internal messaging system
   - Links to users (sender and receiver)
   - Stores subject, content, read status

### Relationships

```
users (1) ──< (1) students
users (1) ──< (1) teachers
teachers (1) ──< (*) courses
students (*) ──< (*) marks ──> (*) courses
students (*) ──< (*) attendance ──> (*) courses
users (*) ──< (*) messages ──> (*) users
```

---

## Configuration ⚙️

### Application Properties

The application is configured to use PostgreSQL in production mode.

**File: `src/main/resources/application.properties`**
```properties
spring.profiles.active=prod
```

**File: `src/main/resources/application-prod.properties`**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/eadmsdb
spring.datasource.username=aman
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
```

### Important Settings Explained

- **`ddl-auto=validate`**: Validates that the database schema matches entity classes but doesn't auto-create/update tables. This is the **production-safe** setting.
- **Connection pooling**: HikariCP is used by default with optimized settings
- **Hibernate dialect**: PostgreSQL-specific SQL optimizations

---

## Default Admin User 👤

The application automatically creates a default admin user on first startup:

- **Email**: `admin@eadms.com`
- **Password**: `Admin@123`
- **Role**: ADMIN

⚠️ **IMPORTANT**: Change this password immediately after first login!

To change the admin password:
1. Login with default credentials
2. Navigate to Profile/Settings
3. Update password
4. Logout and login with new password

---

## Database Connection Testing 🧪

### Test Connection from Command Line

```bash
# Test connection
psql -U aman -d eadmsdb -h localhost -c "SELECT version();"

# Should output PostgreSQL version
```

### Test from Application

1. Start the application:
```bash
mvn spring-boot:run
```

2. Check logs for:
```
✅ Default admin user created successfully!
📧 Email: admin@eadms.com
🔑 Password: Admin@123
```

3. Test login at `http://localhost:8080/api/auth/login`

---

## Common Issues & Troubleshooting 🔧

### Issue 1: PostgreSQL not running

**Error**: `pg_isready: connection refused`

**Solution**:
```bash
# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

### Issue 2: Password authentication failed

**Error**: `FATAL: password authentication failed for user "aman"`

**Solution**: Reset the password
```bash
sudo -u postgres psql
```
```sql
ALTER USER aman WITH PASSWORD '123456';
\q
```

### Issue 3: Database already exists

**Error**: `ERROR: database "eadmsdb" already exists`

**Solution**: Either:
- Drop and recreate:
```bash
./setup_database.sh  # Will prompt to confirm drop
```

Or manually:
```bash
sudo -u postgres psql
```
```sql
DROP DATABASE eadmsdb;
CREATE DATABASE eadmsdb OWNER aman;
\q
```

### Issue 4: Permission denied on database

**Error**: `ERROR: permission denied for database eadmsdb`

**Solution**: Grant privileges
```bash
sudo -u postgres psql
```
```sql
GRANT ALL PRIVILEGES ON DATABASE eadmsdb TO aman;
\q
```

### Issue 5: Port 5432 already in use

**Error**: `could not bind IPv4 address "127.0.0.1": Address already in use`

**Solution**: Check what's using the port
```bash
sudo lsof -i :5432
# Or
sudo netstat -tulpn | grep 5432
```

### Issue 6: Connection refused from application

**Checklist**:
1. ✅ PostgreSQL is running: `sudo systemctl status postgresql`
2. ✅ Database exists: `psql -U aman -d eadmsdb -c "\l"`
3. ✅ User has access: `psql -U aman -d eadmsdb -c "SELECT 1;"`
4. ✅ Firewall allows connections (if remote)
5. ✅ Application properties are correct

---

## Database Management 🛠️

### Backup Database

```bash
# Backup entire database
pg_dump -U aman -d eadmsdb -F c -f eadmsdb_backup_$(date +%Y%m%d).dump

# Backup schema only
pg_dump -U aman -d eadmsdb --schema-only -f schema_backup.sql

# Backup data only
pg_dump -U aman -d eadmsdb --data-only -f data_backup.sql
```

### Restore Database

```bash
# Restore from custom format dump
pg_restore -U aman -d eadmsdb eadmsdb_backup_20260104.dump

# Restore from SQL file
psql -U aman -d eadmsdb -f backup.sql
```

### Database Statistics

```sql
-- Connect to database
psql -U aman -d eadmsdb

-- Database size
SELECT pg_size_pretty(pg_database_size('eadmsdb'));

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT 
    schemaname,
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Clean Database (Remove all data, keep structure)

```sql
-- Connect to database
psql -U aman -d eadmsdb

-- Truncate all tables (removes data, keeps structure)
TRUNCATE TABLE messages, attendance, marks, courses, teachers, students, users CASCADE;

-- Or drop and recreate
\q
```

Then run the migration script again:
```bash
./setup_database.sh
```

---

## Performance Optimization 🚀

### Indexes

All necessary indexes are already created by the migration script:
- Email lookups (users, teachers)
- Foreign key relationships
- Date-based queries (attendance, marks)
- Student/Course lookups

### Connection Pooling

HikariCP settings are optimized in `application-prod.properties`:
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

### Query Performance

To analyze slow queries:
```sql
-- Enable query logging (temporarily)
ALTER DATABASE eadmsdb SET log_statement = 'all';

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

---

## Security Best Practices 🔒

1. **Change Default Credentials**
   - ✅ Change admin password after first login
   - ✅ Use strong database password (not '123456' in production!)

2. **Database User Permissions**
   - Current setup: User `aman` has full access to `eadmsdb`
   - For production: Consider more restrictive permissions

3. **Network Security**
   - Default: PostgreSQL only accepts local connections
   - For remote access: Update `postgresql.conf` and `pg_hba.conf`

4. **Password Encryption**
   - Application uses BCrypt for password hashing
   - Database passwords are NOT stored in plain text

5. **SQL Injection Protection**
   - Application uses JPA/Hibernate with parameterized queries
   - Never concatenate user input into SQL queries

---

## Migration Management 📝

### Current Migration

- **V1__initial_schema.sql** - Creates all tables and constraints

### Future Migrations

For schema changes, create new migration files:

```bash
# Create new migration
touch src/main/resources/db/migration/V2__add_new_feature.sql
```

Example:
```sql
-- V2__add_student_address.sql
ALTER TABLE students ADD COLUMN address VARCHAR(500);
ALTER TABLE students ADD COLUMN city VARCHAR(100);
CREATE INDEX idx_students_city ON students(city);
```

### Migration Tools (Optional)

Consider using migration tools for better version control:
- **Flyway**: Automatic migration management
- **Liquibase**: Database-agnostic change management

---

## Development vs Production 🔄

### Development Setup (Optional)

To use H2 in-memory database for development:

**File: `application-dev.properties`**
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
```

Switch profiles:
```properties
# In application.properties
spring.profiles.active=dev  # For development
spring.profiles.active=prod # For production
```

### Production Checklist

Before deploying to production:

- [ ] Change database password from `123456`
- [ ] Use environment variables for credentials
- [ ] Enable SSL for database connections
- [ ] Set up regular backups
- [ ] Configure firewall rules
- [ ] Update admin password from default
- [ ] Test all CRUD operations
- [ ] Monitor database performance
- [ ] Set up database monitoring/alerting

---

## Additional Resources 📚

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [HikariCP Configuration](https://github.com/brettwooldridge/HikariCP)
- [Flyway Migration](https://flywaydb.org/)

---

## Support 💬

If you encounter issues:

1. Check application logs: `tail -f logs/application.log`
2. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
3. Verify configuration files
4. Test database connection manually
5. Check firewall/network settings

---

## Next Steps 🎯

After database setup:

1. ✅ Build the application: `mvn clean package`
2. ✅ Run the application: `java -jar target/eadms-1.0.0.jar`
3. ✅ Access frontend: `http://localhost:8080`
4. ✅ Login with admin credentials
5. ✅ Change default admin password
6. ✅ Start creating teachers, students, courses

---

**Last Updated**: 2026-01-04  
**Version**: 1.0  
**Maintained by**: EADMS Development Team
