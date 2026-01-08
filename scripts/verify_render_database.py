#!/usr/bin/env python3
"""
Verify Render Database Connection and Data

This script checks both internal and external database URLs to verify
which one the Render backend should be using.
"""

import psycopg2
import sys

def test_database_connection(db_url, description):
    """Test database connection and count records"""
    print(f"\n🔍 Testing {description}")
    print(f"URL: {db_url.split('@')[1] if '@' in db_url else 'hidden'}")
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Test basic connection
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ Connected successfully")
        print(f"📊 PostgreSQL Version: {version[:50]}...")
        
        # Count records in each table
        tables = ['users', 'teachers', 'students', 'courses', 'enrollments']
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table};")
                count = cursor.fetchone()[0]
                print(f"📋 {table}: {count} records")
            except Exception as e:
                print(f"❌ Error counting {table}: {e}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def main():
    print("🔍 RENDER DATABASE VERIFICATION")
    print("=" * 50)
    
    # Test internal URL (what Render backend should use)
    internal_url = "postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a/edmadb_vwl0"
    
    # Test external URL (what we use from outside Render)
    external_url = "postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a.oregon-postgres.render.com/edmadb_vwl0"
    
    internal_success = test_database_connection(internal_url, "INTERNAL URL (for Render backend)")
    external_success = test_database_connection(external_url, "EXTERNAL URL (for external connections)")
    
    print("\n" + "=" * 50)
    print("📋 SUMMARY:")
    print(f"Internal URL works: {'✅ YES' if internal_success else '❌ NO'}")
    print(f"External URL works: {'✅ YES' if external_success else '❌ NO'}")
    
    if external_success and not internal_success:
        print("\n💡 RECOMMENDATION:")
        print("Render backend should use EXTERNAL URL format")
        print("Set DATABASE_URL on Render to:")
        print("postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a.oregon-postgres.render.com/edmadb_vwl0")
    elif internal_success:
        print("\n💡 RECOMMENDATION:")
        print("Render backend should use INTERNAL URL format")
        print("Set DATABASE_URL on Render to:")
        print("postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a/edmadb_vwl0")

if __name__ == "__main__":
    main()