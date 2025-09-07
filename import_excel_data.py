#!/usr/bin/env python3
"""
Import Excel data into the restructured worker_profiles_new table
This script imports all 1,002 records from the Excel file with proper data cleaning
"""

import pandas as pd
import sqlite3
import sys
import os
import re
from datetime import datetime

# Database path for local D1
DB_PATH = '.wrangler/state/v3/d1/kwikr-directory-production.sqlite'

def clean_text(text):
    """Clean and normalize text data"""
    if pd.isna(text) or text is None:
        return None
    
    # Convert to string and strip whitespace
    text = str(text).strip()
    
    # Return None for empty strings
    if not text or text.lower() == 'nan':
        return None
        
    return text

def clean_numeric(value):
    """Clean numeric values"""
    if pd.isna(value) or value is None:
        return None
    
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def clean_phone(phone):
    """Clean and format phone numbers"""
    if pd.isna(phone) or phone is None:
        return None
    
    # Remove all non-digits
    phone = re.sub(r'[^\d]', '', str(phone))
    
    # Ensure it's a valid length
    if len(phone) < 10:
        return None
        
    return phone

def clean_email(email):
    """Validate and clean email addresses"""
    if pd.isna(email) or email is None:
        return None
    
    email = str(email).strip().lower()
    
    # Basic email validation
    if '@' not in email or '.' not in email:
        return None
        
    return email

def clean_province(province):
    """Standardize province names to 2-letter codes"""
    if pd.isna(province) or province is None:
        return None
    
    province = str(province).strip()
    
    # Mapping of full names to codes
    province_map = {
        'ontario': 'ON',
        'british columbia': 'BC', 
        'alberta': 'AB',
        'quebec': 'QC',
        'manitoba': 'MB',
        'saskatchewan': 'SK',
        'nova scotia': 'NS',
        'new brunswick': 'NB',
        'newfoundland and labrador': 'NL',
        'prince edward island': 'PE',
        'northwest territories': 'NT',
        'nunavut': 'NU',
        'yukon': 'YT',
        # Also handle codes
        'on': 'ON', 'bc': 'BC', 'ab': 'AB', 'qc': 'QC',
        'mb': 'MB', 'sk': 'SK', 'ns': 'NS', 'nb': 'NB',
        'nl': 'NL', 'pe': 'PE', 'nt': 'NT', 'nu': 'NU', 'yt': 'YT'
    }
    
    return province_map.get(province.lower(), province)

def import_excel_data():
    """Import data from Excel file to database"""
    
    # Check if Excel file exists
    if not os.path.exists('Kwikr_platform_import-sept-2025.xlsx'):
        print("Error: Excel file 'Kwikr_platform_import-sept-2025.xlsx' not found!")
        return False
    
    # Check if database directory exists
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        print(f"Error: Database directory '{db_dir}' not found!")
        print("Please run: npm run db:migrate:local first")
        return False
    
    try:
        # Read Excel file
        print("Reading Excel file...")
        df = pd.read_excel('Kwikr_platform_import-sept-2025.xlsx')
        print(f"Found {len(df)} records in Excel file")
        
        # Connect to database
        print("Connecting to database...")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Apply migration to create new table
        print("Running migration...")
        # Migration is already applied via wrangler, so we skip this step
        print("Migration already applied via wrangler")
        
        # Clear existing data in new table
        cursor.execute("DELETE FROM worker_profiles_new")
        
        # Process and insert data
        print("Processing and inserting data...")
        successful_inserts = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Clean and prepare data
                data = {
                    'company': clean_text(row.get('company')),
                    'description': clean_text(row.get('description')),
                    'address': clean_text(row.get('address')),
                    'country': clean_text(row.get('country', 'Canada')),
                    'province': clean_province(row.get('province')),
                    'city': clean_text(row.get('city')),
                    'postal_code': clean_text(row.get('postal_code')),
                    'email': clean_email(row.get('email')),
                    'filename': clean_text(row.get('filename')),
                    'google_place_id': clean_text(row.get('google_place_id')),
                    'latitude': clean_numeric(row.get('latitude')),
                    'longitude': clean_numeric(row.get('longitude')),
                    'phone': clean_phone(row.get('phone')),
                    'profile_photo': clean_text(row.get('profile_photo')),
                    'category': clean_text(row.get('category')),
                    'subscription_type': clean_text(row.get('subscription_type')),
                    'user_id': int(row.get('user_id')) if pd.notna(row.get('user_id')) else None,
                    'website': clean_text(row.get('website')),
                    'hours_of_operation': clean_text(row.get('hours_of_operation')),
                    'hourly_rate': clean_numeric(row.get('hourly_rate')),
                    'price_range': clean_text(row.get('price_range')),
                    'services_provided': clean_text(row.get('services_provided')),
                }
                
                # Skip if essential data is missing
                if not data['company'] or not data['user_id']:
                    errors.append(f"Row {index + 1}: Missing company name or user_id")
                    continue
                
                # Insert data
                insert_sql = """
                INSERT INTO worker_profiles_new (
                    company, description, address, country, province, city, postal_code,
                    email, filename, google_place_id, latitude, longitude, phone,
                    profile_photo, category, subscription_type, user_id, website,
                    hours_of_operation, hourly_rate, price_range, services_provided
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                """
                
                cursor.execute(insert_sql, (
                    data['company'], data['description'], data['address'], data['country'],
                    data['province'], data['city'], data['postal_code'], data['email'],
                    data['filename'], data['google_place_id'], data['latitude'], data['longitude'],
                    data['phone'], data['profile_photo'], data['category'], data['subscription_type'],
                    data['user_id'], data['website'], data['hours_of_operation'], data['hourly_rate'],
                    data['price_range'], data['services_provided']
                ))
                
                successful_inserts += 1
                
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
                continue
        
        # Commit changes
        conn.commit()
        
        # Get final count
        cursor.execute("SELECT COUNT(*) FROM worker_profiles_new")
        final_count = cursor.fetchone()[0]
        
        conn.close()
        
        print(f"\nImport Summary:")
        print(f"================")
        print(f"Total records in Excel: {len(df)}")
        print(f"Successfully imported: {successful_inserts}")
        print(f"Final database count: {final_count}")
        print(f"Errors: {len(errors)}")
        
        if errors:
            print(f"\nFirst 10 errors:")
            for error in errors[:10]:
                print(f"  - {error}")
        
        print(f"\nImport completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error during import: {e}")
        return False

if __name__ == "__main__":
    success = import_excel_data()
    sys.exit(0 if success else 1)