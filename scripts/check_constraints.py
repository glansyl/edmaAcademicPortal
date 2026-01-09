#!/usr/bin/env python3
"""Check constraints on schedules table"""

import psycopg2
from urllib.parse import urlparse

DATABASE_URL = "postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a.oregon-postgres.render.com/edmadb_vwl0"

def parse_database_url(url):
    result = urlparse(url)
    return {
        'host': result.hostname,
        'port': result.port or 5432,
        'database': result.path[1:],
        'user': result.username,
        'password': result.password
    }

try:
    db_params = parse_database_url(DATABASE_URL)
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    
    print("\n" + "=" * 60)
    print("Constraints on 'schedules' table")
    print("=" * 60)
    
    # Check all constraints
    cursor.execute("""
        SELECT 
            con.conname AS constraint_name,
            con.contype AS constraint_type,
            CASE con.contype
                WHEN 'p' THEN 'PRIMARY KEY'
                WHEN 'u' THEN 'UNIQUE'
                WHEN 'c' THEN 'CHECK'
                WHEN 'f' THEN 'FOREIGN KEY'
                ELSE con.contype::text
            END AS type_description,
            pg_get_constraintdef(con.oid) AS definition
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'schedules'
        ORDER BY con.contype, con.conname
    """)
    
    constraints = cursor.fetchall()
    
    if constraints:
        print(f"\nFound {len(constraints)} constraints:\n")
        for c in constraints:
            print(f"Name: {c[0]}")
            print(f"Type: {c[2]}")
            print(f"Definition: {c[3]}")
            print("-" * 60)
    else:
        print("\nNo constraints found")
    
    # Check indexes
    print("\n" + "=" * 60)
    print("Indexes on 'schedules' table")
    print("=" * 60)
    
    cursor.execute("""
        SELECT 
            indexname,
            indexdef
        FROM pg_indexes
        WHERE tablename = 'schedules'
        ORDER BY indexname
    """)
    
    indexes = cursor.fetchall()
    
    if indexes:
        print(f"\nFound {len(indexes)} indexes:\n")
        for idx in indexes:
            print(f"• {idx[0]}")
            print(f"  {idx[1]}")
            print()
    
    cursor.close()
    conn.close()
    
    print("=" * 60 + "\n")
    
except Exception as e:
    print(f"\n✗ Error: {e}\n")
