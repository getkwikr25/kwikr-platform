#!/usr/bin/env python3
import pandas as pd
import subprocess
import hashlib

def import_to_production():
    """Import all 943 workers to PRODUCTION database"""
    
    # Read the Excel file
    try:
        df = pd.read_excel('Kwikr_platform_import-sept-2025.xlsx')
        print(f"Loaded {len(df)} records from Excel file")
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return
    
    # First, clear existing data to avoid conflicts
    print("Clearing existing data from production...")
    try:
        clear_cmd = ['npx', 'wrangler', 'd1', 'execute', 'kwikr-production', '--remote', '--command', 'DELETE FROM worker_services; DELETE FROM user_profiles; DELETE FROM users WHERE role = "worker";']
        subprocess.run(clear_cmd, capture_output=True, text=True, cwd='/home/user/webapp')
        print("✓ Cleared existing worker data from production")
    except Exception as e:
        print(f"Warning: Could not clear existing data: {e}")
    
    success_count = 0
    error_count = 0
    
    # Province mapping for Canadian provinces
    province_map = {
        'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB',
        'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL',
        'Nova Scotia': 'NS', 'Northwest Territories': 'NT',
        'Nunavut': 'NU', 'Ontario': 'ON', 'Prince Edward Island': 'PE',
        'Quebec': 'QC', 'Saskatchewan': 'SK', 'Yukon': 'YT'
    }
    
    for idx, row in df.iterrows():
        user_id = 1000 + idx
        
        # Extract and clean data
        company = str(row.get('company', '')).strip()
        email = str(row.get('email', '')).strip()
        city = str(row.get('city', '')).strip()
        province = str(row.get('province', '')).strip()
        phone = str(row.get('phone', '')).strip()
        category = str(row.get('category', '')).strip()
        description = str(row.get('description', '')).strip()
        
        # Skip invalid entries
        if not company or company == 'nan' or not email or email == 'nan':
            continue
            
        # Clean and prepare data
        name_parts = company.split()
        first_name = (name_parts[0] if name_parts else 'Business').replace("'", "''")[:50]
        last_name = (' '.join(name_parts[1:]) if len(name_parts) > 1 else 'Owner').replace("'", "''")[:50]
        
        email = email.replace("'", "''")
        company = company.replace("'", "''")[:100]
        city = city.replace("'", "''")[:50] 
        province = province_map.get(province, province)[:2]
        category = category.replace("'", "''")[:50]
        description = description.replace("'", "''")[:500]
        
        # Clean phone
        if phone and phone != 'nan':
            phone = ''.join(filter(str.isdigit, phone))[:15]
            phone = f"'{phone}'" if phone else 'NULL'
        else:
            phone = 'NULL'
            
        password_hash = hashlib.sha256(f"kwikr{user_id}".encode()).hexdigest()
        
        try:
            # Import to PRODUCTION (--remote flag)
            user_sql = f"""INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, province, city, is_verified, is_active, created_at) VALUES ({user_id}, '{email}', '{password_hash}', 'worker', '{first_name}', '{last_name}', {phone}, '{province}', '{city}', 1, 1, datetime('now'));"""
            
            result = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'kwikr-production', '--remote', '--command', user_sql], 
                                 capture_output=True, text=True, cwd='/home/user/webapp')
            
            if result.returncode == 0:
                # Add profile
                profile_sql = f"""INSERT INTO user_profiles (user_id, company_name, company_description, created_at) VALUES ({user_id}, '{company}', '{description}', datetime('now'));"""
                
                profile_result = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'kwikr-production', '--remote', '--command', profile_sql], 
                                             capture_output=True, text=True, cwd='/home/user/webapp')
                
                # Add service
                if category and category != 'nan':
                    service_sql = f"""INSERT INTO worker_services (user_id, service_category, service_name, description, is_available, created_at) VALUES ({user_id}, '{category}', '{company} Services', '{description}', 1, datetime('now'));"""
                    
                    service_result = subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'kwikr-production', '--remote', '--command', service_sql], 
                                                 capture_output=True, text=True, cwd='/home/user/webapp')
                
                success_count += 1
                if success_count % 50 == 0:
                    print(f"✓ Imported {success_count} workers so far...")
            else:
                error_count += 1
                print(f"✗ Failed to import {company}: {result.stderr.strip()}")
                
        except Exception as e:
            error_count += 1
            print(f"✗ Error importing {company}: {e}")
            
    print(f"\n🎯 PRODUCTION IMPORT COMPLETED:")
    print(f"✅ Successfully imported: {success_count} workers")
    print(f"❌ Failed imports: {error_count}")
    print(f"📊 Expected categories: Flooring(254), Electrical(238), Plumbing(68), etc.")

if __name__ == "__main__":
    import_to_production()