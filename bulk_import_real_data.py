#!/usr/bin/env python3
import pandas as pd
import subprocess
import hashlib
import json

def import_real_data():
    """Import real data using direct wrangler commands"""
    
    # Read the Excel file
    try:
        df = pd.read_excel('Kwikr_platform_import-sept-2025.xlsx')
        print(f"Loaded {len(df)} records from Excel file")
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return
    
    success_count = 0
    error_count = 0
    
    for idx, row in df.head(100).iterrows():  # Import 100 workers
        user_id = 1000 + idx
        
        # Extract data from row
        company = str(row.get('company', '')).strip()
        email = str(row.get('email', '')).strip()
        address = str(row.get('address', '')).strip()
        city = str(row.get('city', '')).strip()
        province = str(row.get('province', '')).strip()
        phone = str(row.get('phone', '')).strip()
        category = str(row.get('category', '')).strip()
        website = str(row.get('website', '')).strip()
        description = str(row.get('description', '')).strip()
        
        # Skip if no company name or email
        if not company or company == 'nan' or not email or email == 'nan':
            continue
            
        # Create name from company
        name_parts = company.split()
        first_name = name_parts[0] if name_parts else 'Business'
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else 'Owner'
        
        # Province mapping
        province_map = {
            'Alberta': 'AB',
            'British Columbia': 'BC',
            'Manitoba': 'MB',
            'New Brunswick': 'NB',
            'Newfoundland and Labrador': 'NL',
            'Nova Scotia': 'NS',
            'Northwest Territories': 'NT',
            'Nunavut': 'NU',
            'Ontario': 'ON',
            'Prince Edward Island': 'PE',
            'Quebec': 'QC',
            'Saskatchewan': 'SK',
            'Yukon': 'YT'
        }
        
        # Clean and escape data
        email = email.replace("'", "''")
        first_name = first_name.replace("'", "''")[:50]
        last_name = last_name.replace("'", "''")[:50] 
        company = company.replace("'", "''")[:100]
        city = city.replace("'", "''")[:50]
        province = province_map.get(province, province)[:2]  # Use mapping or keep original if already abbreviated
        category = category.replace("'", "''")[:50]
        description = description.replace("'", "''")[:500]
        
        # Clean phone number
        if phone and phone != 'nan':
            phone = ''.join(filter(str.isdigit, phone))[:15]
        else:
            phone = None
            
        # Create password hash
        password_hash = hashlib.sha256(f"kwikr{user_id}".encode()).hexdigest()
        
        try:
            # Insert user
            user_sql = f"""INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, province, city, is_verified, is_active, created_at) VALUES ({user_id}, '{email}', '{password_hash}', 'worker', '{first_name}', '{last_name}', {f"'{phone}'" if phone else 'NULL'}, '{province}', '{city}', 1, 1, datetime('now'));"""
            
            result = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'kwikr-production', '--local', '--command', user_sql], 
                                 capture_output=True, text=True, cwd='/home/user/webapp')
            
            if result.returncode == 0:
                # Insert profile
                profile_sql = f"""INSERT INTO user_profiles (user_id, company_name, company_description, created_at) VALUES ({user_id}, '{company}', '{description}', datetime('now'));"""
                
                profile_result = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'kwikr-production', '--local', '--command', profile_sql], 
                                             capture_output=True, text=True, cwd='/home/user/webapp')
                
                if profile_result.returncode == 0 and category and category != 'nan':
                    # Insert service
                    service_sql = f"""INSERT INTO worker_services (user_id, service_category, service_name, description, is_available, created_at) VALUES ({user_id}, '{category}', '{company} Services', '{description}', 1, datetime('now'));"""
                    
                    service_result = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'kwikr-production', '--local', '--command', service_sql], 
                                                 capture_output=True, text=True, cwd='/home/user/webapp')
                
                success_count += 1
                print(f"✓ Imported {company} ({email}) - ID: {user_id}")
            else:
                error_count += 1
                print(f"✗ Failed to import {company}: {result.stderr}")
                
        except Exception as e:
            error_count += 1
            print(f"✗ Error importing {company}: {e}")
            
    print(f"\nImport completed: {success_count} successful, {error_count} errors")

if __name__ == "__main__":
    import_real_data()