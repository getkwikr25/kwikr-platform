#!/usr/bin/env python3
"""
SIMPLE EXCEL IMPORT - NO OVER-ENGINEERING
Just get the workers into the database so search works!
"""

import pandas as pd
import sqlite3
import os
from pathlib import Path

def main():
    # Read the Excel file
    print("Reading Excel file...")
    df = pd.read_excel('real_workers.xlsx')
    
    print(f"Found {len(df)} workers in Excel file")
    print("Columns:", list(df.columns))
    
    # Connect to local database first - find the actual database
    db_files = list(Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/').glob('*.sqlite'))
    if not db_files:
        print("No SQLite database found!")
        return
    db_path = db_files[0]  # Use the first one found
    
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Clear existing data to avoid duplicates  
    print("Clearing existing workers...")
    cursor.execute("DELETE FROM users WHERE role = 'worker'")
    cursor.execute("DELETE FROM user_profiles")
    cursor.execute("DELETE FROM worker_services")
    
    # Simple mapping - just get the basic data in
    workers_added = 0
    
    for idx, row in df.iterrows():
        try:
            # Extract basic info - handle different possible column names
            first_name = str(row.get('First Name', row.get('first_name', 'Professional'))).strip()
            last_name = str(row.get('Last Name', row.get('last_name', 'Worker'))).strip()  
            email = str(row.get('Email', row.get('email', f'worker{idx}@kwikr.ca'))).strip()
            phone = str(row.get('Phone', row.get('phone', ''))).strip()
            city = str(row.get('City', row.get('city', 'Toronto'))).strip()
            
            # Map province names to abbreviations
            province_full = str(row.get('Province', row.get('province', 'Ontario'))).strip()
            province_map = {
                'Ontario': 'ON', 'British Columbia': 'BC', 'Alberta': 'AB',
                'Quebec': 'QC', 'Manitoba': 'MB', 'Saskatchewan': 'SK',
                'Nova Scotia': 'NS', 'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
                'Prince Edward Island': 'PE', 'Northwest Territories': 'NT',
                'Nunavut': 'NU', 'Yukon': 'YT'
            }
            province = province_map.get(province_full, province_full[:2].upper())
            
            # Service info
            service = str(row.get('Service', row.get('service', row.get('Business Type', 'Professional Services')))).strip()
            company = str(row.get('Company', row.get('company', row.get('Business Name', f"{first_name} {last_name} Services")))).strip()
            
            # Insert user with default password hash
            cursor.execute("""
                INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'worker', 1, 1, 'temp_hash', datetime('now'))
            """, (first_name, last_name, email, phone, city, province))
            
            user_id = cursor.lastrowid
            
            # Insert profile
            cursor.execute("""
                INSERT INTO user_profiles (user_id, company_name, bio, created_at)
                VALUES (?, ?, ?, datetime('now'))
            """, (user_id, company, f"Professional {service} provider in {city}, {province}"))
            
            # Insert service
            rate = 75  # Default rate
            cursor.execute("""
                INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at)
                VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
            """, (user_id, service, service, f"Professional {service} services", rate))
            
            workers_added += 1
            
        except Exception as e:
            print(f"Error processing row {idx}: {e}")
            continue
    
    conn.commit()
    conn.close()
    
    print(f"Successfully imported {workers_added} workers!")
    
    # Test the search
    print("\nTesting search...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) FROM users WHERE role = 'worker'
    """)
    total_workers = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(*) FROM worker_services WHERE service_name LIKE '%Landscaping%'
    """)
    landscaping_count = cursor.fetchone()[0]
    
    print(f"Total workers in database: {total_workers}")
    print(f"Landscaping services: {landscaping_count}")
    
    conn.close()

if __name__ == "__main__":
    main()