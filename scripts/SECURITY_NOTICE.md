# Security Notice

## ⚠️ IMPORTANT: Database Credentials

**NEVER commit database credentials to version control!**

All scripts in this directory require database credentials to be passed via:

1. **Environment variables** (recommended):
```bash
export DATABASE_URL="postgresql://user:pass@host:port/db"
python migrate_data.py
```

2. **Command line arguments**:
```bash
python migrate_data.py --database-url "postgresql://user:pass@host:port/db"
```

## If Credentials Were Exposed

If database credentials were accidentally committed:

1. **Rotate credentials immediately** on Render:
   - Go to Render Dashboard → PostgreSQL service
   - Click "Info" tab
   - Click "Reset Database Password"

2. **Update environment variables**:
   - Update `DATABASE_URL` on Render web service
   - Update local environment variables

3. **Remove from git history**:
```bash
# Remove sensitive files from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch scripts/test_connection.py" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (use with caution)
git push origin --force --all
```

## Best Practices

- ✅ Use environment variables for all credentials
- ✅ Add credential files to `.gitignore`
- ✅ Use Render's internal DATABASE_URL (automatically set)
- ✅ Rotate credentials regularly
- ❌ Never hardcode credentials in source files
- ❌ Never commit `.env` files with real credentials
