#!/usr/bin/env python3
"""
Full EADMS Migration Script - Schema + Data

This script:
1. Creates the database schema (tables, indexes, constraints)
2. Migrates sample data (users, teachers, students, courses, enrollments)

Usage:
    python run_full_migration.py --database-url "postgresql://user:pass@host:port/db"
"""

import os
import sys
import argparse
import psycopg2
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_schema_migration(database_url):
    """Run the SQL schema migration"""
    logger.info("🗄️ Running database schema migration...")
    
    # Read the SQL migration file
    sql_file_path = Path(__file__).parent.parent / "src/main/resources/db/migration/V1__initial_schema.sql"
    
    if not sql_file_path.exists():
        logger.error(f"❌ SQL migration file not found: {sql_file_path}")
        return False
    
    try:
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
        
        # Connect and execute SQL
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        
        with conn.cursor() as cursor:
            cursor.execute(sql_content)
        
        conn.close()
        logger.info("✅ Database schema created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Schema migration failed: {e}")
        return False

def run_data_migration(database_url):
    """Run the data migration using the existing script"""
    logger.info("📊 Running data migration...")
    
    try:
        # Import and run the data migrator
        sys.path.append(str(Path(__file__).parent))
        from migrate_data import EADMSDataMigrator
        
        migrator = EADMSDataMigrator(database_url)
        
        if migrator.connect():
            migrator.migrate_sample_data()
            migrator.close()
            return True
        else:
            return False
            
    except Exception as e:
        logger.error(f"❌ Data migration failed: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Run full EADMS migration (schema + data)')
    parser.add_argument('--database-url', required=True, help='PostgreSQL database URL')
    parser.add_argument('--schema-only', action='store_true', help='Run only schema migration')
    parser.add_argument('--data-only', action='store_true', help='Run only data migration')
    
    args = parser.parse_args()
    
    database_url = args.database_url
    
    logger.info("🚀 Starting EADMS Full Migration")
    logger.info("="*60)
    
    success = True
    
    if not args.data_only:
        success &= run_schema_migration(database_url)
    
    if not args.schema_only and success:
        success &= run_data_migration(database_url)
    
    if success:
        logger.info("🎉 Full migration completed successfully!")
        logger.info("="*60)
        logger.info("🌐 Your EADMS database is ready!")
        logger.info("👨‍💼 Admin Login: admin@eadms.com / Admin@123")
        logger.info("🏫 10 Teachers and 17 Students from around the world")
        logger.info("📚 10 Applied Sciences courses with enrollments")
        logger.info("="*60)
    else:
        logger.error("❌ Migration failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()