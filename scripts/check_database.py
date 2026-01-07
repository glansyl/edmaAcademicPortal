#!/usr/bin/env python3
"""
Quick database check script to verify data exists in PostgreSQL
"""
import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

def check_database(database_url):
    """Check if data exists in the database"""
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ Connected to PostgreSQL database")
        print("\n" + "="*60)
        print("DATABASE CONTENT CHECK")
        print("="*60)
        
        # Check users
        cursor.execute("SELECT COUNT(*) as count FROM users")
        user_count = cursor.fetchone()['count']
        print(f"👤 Users: {user_count}")
        
        # Check teachers
        cursor.execute("SELECT COUNT(*) as count FROM teachers")
        teacher_count = cursor.fetchone()['count']
        print(f"👨‍🏫 Teachers: {teacher_count}")
        
        # Check students
        cursor.execute("SELECT COUNT(*) as count FROM students")
        student_count = cursor.fetchone()['count']
        print(f"👨‍🎓 Students: {student_count}")
        
        # Check courses
        cursor.execute("SELECT COUNT(*) as count FROM courses")
        course_count = cursor.fetchone()['count']
        print(f"📚 Courses: {course_count}")
        
        # Check enrollments
        cursor.execute("SELECT COUNT(*) as count FROM enrollments")
        enrollment_count = cursor.fetchone()['count']
        print(f"📝 Enrollments: {enrollment_count}")
        
        print("="*60)
        
        if teacher_count == 0 and student_count == 0 and course_count == 0:
            print("\n❌ NO DATA FOUND! Run the migration script:")
            print("   python scripts/migrate_data.py --database-url 'YOUR_DATABASE_URL'")
        else:
            print("\n✅ Data exists in database!")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    database_url = os.getenv('DATABASE_URL')
    if len(sys.argv) > 1:
        database_url = sys.argv[1]
    
    if not database_url:
        print("❌ Please provide DATABASE_URL:")
        print("   python scripts/check_database.py 'postgresql://user:pass@host:port/db'")
        print("   OR set DATABASE_URL environment variable")
        sys.exit(1)
    
    check_database(database_url)
