#!/usr/bin/env python3
"""
Quick test to verify database connection and check existing tables

SECURITY: Get DATABASE_URL from environment variable
Usage: 
    export DATABASE_URL="your-database-url"
    python test_connection.py
"""

import psycopg2
import os
import sys

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL environment variable not set")
    print("Usage: export DATABASE_URL='postgresql://user:pass@host:port/db'")
    sys.exit(1)

try:
    print("🔌 Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    print("✅ Connected successfully!")
    print("\n📊 Checking tables...")
    
    # Check if tables exist
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    
    tables = cursor.fetchall()
    print(f"\n✅ Found {len(tables)} tables:")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Check data counts
    print("\n📈 Data counts:")
    
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    print(f"  Users: {user_count}")
    
    cursor.execute("SELECT COUNT(*) FROM teachers")
    teacher_count = cursor.fetchone()[0]
    print(f"  Teachers: {teacher_count}")
    
    cursor.execute("SELECT COUNT(*) FROM students")
    student_count = cursor.fetchone()[0]
    print(f"  Students: {student_count}")
    
    cursor.execute("SELECT COUNT(*) FROM courses")
    course_count = cursor.fetchone()[0]
    print(f"  Courses: {course_count}")
    
    cursor.execute("SELECT COUNT(*) FROM enrollments")
    enrollment_count = cursor.fetchone()[0]
    print(f"  Enrollments: {enrollment_count}")
    
    cursor.close()
    conn.close()
    
    print("\n✅ Database is ready!")
    
except Exception as e:
    print(f"❌ Error: {e}")
