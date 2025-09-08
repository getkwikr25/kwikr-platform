#!/usr/bin/env python3
"""
Export local data to SQL format for production import
"""

import sqlite3
import os
from pathlib import Path

def main():
    # Find local database
    db_files = list(Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/').glob('*.sqlite'))
    if not db_files:
        print("No local database found!")
        return
    
    db_path = db_files[0]
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Export workers data
    print("Exporting workers...")
    
    with open('production_import.sql', 'w') as f:
        # Get all workers
        cursor.execute("SELECT * FROM users WHERE role = 'worker'")
        users = cursor.fetchall()
        
        f.write("-- Clear existing data\n")
        f.write("DELETE FROM users WHERE role = 'worker';\n")
        f.write("DELETE FROM user_profiles;\n") 
        f.write("DELETE FROM worker_services;\n\n")
        
        # Province mapping
        province_map = {
            'Ontario': 'ON', 'British Columbia': 'BC', 'Alberta': 'AB',
            'Quebec': 'QC', 'Manitoba': 'MB', 'Saskatchewan': 'SK',
            'Nova Scotia': 'NS', 'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
            'Prince Edward Island': 'PE', 'Northwest Territories': 'NT',
            'Nunavut': 'NU', 'Yukon': 'YT'
        }
        
        f.write("-- Insert users\n")
        for user in users:
            # user columns: id, first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at, updated_at
            # Fix province
            province = user[6]
            if province and len(province) > 2:
                province = province_map.get(province, province[:2].upper())
            if province not in ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']:
                province = 'ON'  # Default to Ontario
            
            f.write(f"""INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at) 
VALUES ('{user[1]}', '{user[2]}', '{user[3]}', '{user[4] or ''}', '{user[5]}', '{province}', 'worker', 1, 1, 'temp_hash', datetime('now'));\n""")
            
            # Insert profile
            cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user[0],))
            profile = cursor.fetchone()
            if profile:
                f.write(f"""INSERT INTO user_profiles (user_id, company_name, bio, created_at) 
VALUES (last_insert_rowid(), '{profile[2] or ''}', '{profile[3] or ''}', datetime('now'));\n""")
                
            # Insert services
            cursor.execute("SELECT * FROM worker_services WHERE user_id = ?", (user[0],))
            services = cursor.fetchall()
            for service in services:
                f.write(f"""INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at) 
VALUES (last_insert_rowid(), '{service[2]}', '{service[3]}', '{service[4] or ''}', {service[5]}, 1, datetime('now'));\n""")
            
            f.write("\n")
    
    conn.close()
    print("Export completed! File: production_import.sql")
    
    # Count records
    with open('production_import.sql', 'r') as f:
        content = f.read()
        user_count = content.count("INSERT INTO users")
        print(f"Exported {user_count} workers")

if __name__ == "__main__":
    main()