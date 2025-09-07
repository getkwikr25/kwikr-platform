#!/usr/bin/env python3
"""
Direct import from Excel to SQLite database using Python sqlite3
This bypasses wrangler file limitations and imports all 1002 records efficiently
"""

import pandas as pd
import sqlite3
import sys
import os
import re

# Database path for local D1
DB_PATH = '.wrangler/state/v3/d1/kwikr-directory-production.sqlite'

def clean_text(text):
    if pd.isna(text) or text is None:
        return None
    text = str(text).strip()
    if not text or text.lower() == 'nan':
        return None
    # Remove null bytes and normalize whitespace
    text = text.replace('\x00', '').replace('\r\n', ' ').replace('\n', ' ').replace('\r', ' ')
    return text

def clean_numeric(value):
    if pd.isna(value) or value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def clean_phone(phone):
    if pd.isna(phone) or phone is None:
        return None
    phone = re.sub(r'[^\d]', '', str(phone))
    if len(phone) < 10:
        return None
    return phone

def clean_email(email):
    if pd.isna(email) or email is None:
        return None
    email = str(email).strip().lower()
    if '@' not in email or '.' not in email:
        return None
    return email

def clean_province(province):
    if pd.isna(province) or province is None:
        return None
    province = str(province).strip()
    province_map = {
        'ontario': 'ON', 'british columbia': 'BC', 'alberta': 'AB', 'quebec': 'QC',
        'manitoba': 'MB', 'saskatchewan': 'SK', 'nova scotia': 'NS', 'new brunswick': 'NB',
        'newfoundland and labrador': 'NL', 'prince edward island': 'PE',
        'northwest territories': 'NT', 'nunavut': 'NU', 'yukon': 'YT',
        'on': 'ON', 'bc': 'BC', 'ab': 'AB', 'qc': 'QC',
        'mb': 'MB', 'sk': 'SK', 'ns': 'NS', 'nb': 'NB',
        'nl': 'NL', 'pe': 'PE', 'nt': 'NT', 'nu': 'NU', 'yt': 'YT'
    }
    return province_map.get(province.lower(), province)

def import_data():
    """Import all Excel data directly to SQLite database"""
    
    if not os.path.exists('Kwikr_platform_import-sept-2025.xlsx'):
        print("Error: Excel file not found!")
        return False
    
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        print("Please ensure wrangler database is created and accessible")
        return False
    
    try:
        print("Reading Excel file...")
        df = pd.read_excel('Kwikr_platform_import-sept-2025.xlsx')
        print(f"Found {len(df)} records")
        
        print("Connecting to database...")
        conn = sqlite3.connect(DB_PATH, timeout=30)
        cursor = conn.cursor()
        
        # Clear existing data from new table
        print("Clearing existing data...")
        cursor.execute("DELETE FROM worker_profiles_new")
        
        # Prepare insert statement
        insert_sql = """
        INSERT INTO worker_profiles_new (
            company, description, address, country, province, city, postal_code,
            email, filename, google_place_id, latitude, longitude, phone,
            profile_photo, category, subscription_type, user_id, website,
            hours_of_operation, hourly_rate, price_range, services_provided
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        # Process all records
        successful = 0
        errors = []
        
        print("Processing records...")
        for index, row in df.iterrows():
            try:
                # Clean all data
                data = [
                    clean_text(row.get('company')),
                    clean_text(row.get('description')),
                    clean_text(row.get('address')),
                    clean_text(row.get('country', 'Canada')),
                    clean_province(row.get('province')),
                    clean_text(row.get('city')),
                    clean_text(row.get('postal_code')),
                    clean_email(row.get('email')),
                    clean_text(row.get('filename')),
                    clean_text(row.get('google_place_id')),
                    clean_numeric(row.get('latitude')),
                    clean_numeric(row.get('longitude')),
                    clean_phone(row.get('phone')),
                    clean_text(row.get('profile_photo')),
                    clean_text(row.get('category')),
                    clean_text(row.get('subscription_type')),
                    int(row.get('user_id')) if pd.notna(row.get('user_id')) else None,
                    clean_text(row.get('website')),
                    clean_text(row.get('hours_of_operation')),
                    clean_numeric(row.get('hourly_rate')),
                    clean_text(row.get('price_range')),
                    clean_text(row.get('services_provided'))
                ]
                
                # Skip if essential data missing
                if not data[0] or not data[16]:  # company or user_id
                    continue
                
                # Insert record
                cursor.execute(insert_sql, data)
                successful += 1
                
                if successful % 50 == 0:
                    print(f"Processed {successful} records...")
                    
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
                continue
        
        # Commit changes
        print("Committing changes...")
        conn.commit()
        
        # Get final count
        cursor.execute("SELECT COUNT(*) FROM worker_profiles_new")
        final_count = cursor.fetchone()[0]
        
        conn.close()
        
        print(f"\n" + "="*50)
        print("IMPORT SUMMARY")
        print(f"="*50)
        print(f"Excel records: {len(df)}")
        print(f"Successfully imported: {successful}")
        print(f"Database count: {final_count}")
        print(f"Errors: {len(errors)}")
        
        if errors:
            print(f"\nFirst 10 errors:")
            for error in errors[:10]:
                print(f"  - {error}")
        
        if final_count > 0:
            # Show sample data
            conn = sqlite3.connect(DB_PATH, timeout=30)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT company, province, city, category 
                FROM worker_profiles_new 
                ORDER BY id 
                LIMIT 5
            """)
            sample = cursor.fetchall()
            
            print(f"\nSample imported records:")
            for i, (company, province, city, category) in enumerate(sample, 1):
                print(f"  {i}. {company} - {category} in {city}, {province}")
            
            conn.close()
        
        return final_count > 0
        
    except Exception as e:
        print(f"Error during import: {e}")
        return False

if __name__ == "__main__":
    success = import_data()
    sys.exit(0 if success else 1)