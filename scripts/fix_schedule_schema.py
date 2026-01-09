#!/usr/bin/env python3
"""
Fix Schedule Table Schema in PostgreSQL
Adds missing columns for schedule functionality
"""

import psycopg2
import sys
from urllib.parse import urlparse

# Database URL from render.yaml
DATABASE_URL = "postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a.oregon-postgres.render.com/edmadb_vwl0"

def parse_database_url(url):
    """Parse PostgreSQL URL into connection parameters"""
    result = urlparse(url)
    return {
        'host': result.hostname,
        'port': result.port or 5432,
        'database': result.path[1:],
        'user': result.username,
        'password': result.password
    }

def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    cursor.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name=%s AND column_name=%s
        )
    """, (table_name, column_name))
    return cursor.fetchone()[0]

def main():
    print("=" * 60)
    print("Schedule Table Schema Fix for PostgreSQL")
    print("=" * 60)
    
    try:
        # Parse database URL
        db_params = parse_database_url(DATABASE_URL)
        print(f"\nConnecting to database: {db_params['database']}")
        print(f"Host: {db_params['host']}")
        
        # Connect to database
        conn = psycopg2.connect(**db_params)
        conn.autocommit = False
        cursor = conn.cursor()
        
        print("\n✓ Connected successfully")
        
        # Check current schema
        print("\nChecking current schema...")
        required_columns = [
            'teacher_id', 'title', 'description', 
            'start_date_time', 'end_date_time', 
            'recurrence', 'location'
        ]
        
        missing_columns = []
        for column in required_columns:
            exists = check_column_exists(cursor, 'schedules', column)
            status = "✓" if exists else "✗"
            print(f"  {status} {column}: {'EXISTS' if exists else 'MISSING'}")
            if not exists:
                missing_columns.append(column)
        
        if not missing_columns:
            print("\n✓ All required columns exist!")
            cursor.close()
            conn.close()
            return
        
        print(f"\n⚠ Found {len(missing_columns)} missing columns")
        print("\nApplying schema fixes...")
        
        # Read and execute SQL script
        with open('scripts/fix_schedule_table_postgresql.sql', 'r') as f:
            sql_script = f.read()
        
        cursor.execute(sql_script)
        conn.commit()
        
        print("\n✓ Schema updated successfully!")
        
        # Verify changes
        print("\nVerifying changes...")
        for column in missing_columns:
            exists = check_column_exists(cursor, 'schedules', column)
            status = "✓" if exists else "✗"
            print(f"  {status} {column}: {'NOW EXISTS' if exists else 'STILL MISSING'}")
        
        # Get schedule count
        cursor.execute("SELECT COUNT(*) FROM schedules")
        count = cursor.fetchone()[0]
        print(f"\nTotal schedules in database: {count}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("✓ Schema fix completed successfully!")
        print("=" * 60)
        
    except psycopg2.Error as e:
        print(f"\n✗ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
