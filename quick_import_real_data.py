#!/usr/bin/env python3
import pandas as pd
import json
import hashlib

def create_import_sql():
    """Create SQL import from the Excel file for current schema"""
    
    # Read the Excel file
    try:
        df = pd.read_excel('Kwikr_platform_import-sept-2025.xlsx')
        print(f"Loaded {len(df)} records from Excel file")
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return
    
    # Create users import SQL
    users_sql = []
    profiles_sql = []
    services_sql = []
    
    for idx, row in df.iterrows():
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
        
        # Create password hash (dummy)
        password_hash = hashlib.sha256(f"kwikr{user_id}".encode()).hexdigest()
        
        # Clean phone number
        if phone and phone != 'nan':
            phone = ''.join(filter(str.isdigit, phone))
            if len(phone) == 10:
                phone = phone
            elif len(phone) == 11 and phone.startswith('1'):
                phone = phone[1:]
            else:
                phone = None
        else:
            phone = None
            
        # Users SQL
        users_sql.append(f"""
INSERT OR IGNORE INTO users (
    id, email, password_hash, role, first_name, last_name, 
    phone, province, city, is_verified, is_active, created_at
) VALUES (
    {user_id}, 
    '{email.replace("'", "''")}',
    '{password_hash}',
    'worker',
    '{first_name.replace("'", "''")}',
    '{last_name.replace("'", "''")}',
    {f"'{phone}'" if phone else 'NULL'},
    '{province.replace("'", "''")}',
    '{city.replace("'", "''")}',
    1,
    1,
    datetime('now')
);""")
        
        # User profiles SQL
        profiles_sql.append(f"""
INSERT OR IGNORE INTO user_profiles (
    user_id, bio, profile_image_url, company_name, website_url, created_at
) VALUES (
    {user_id},
    '{description.replace("'", "''")[:500]}',
    NULL,
    '{company.replace("'", "''")}',
    {f"'{website.replace("'", "''")}'" if website and website != 'nan' else 'NULL'},
    datetime('now')
);""")
        
        # Worker services SQL
        if category and category != 'nan':
            services_sql.append(f"""
INSERT OR IGNORE INTO worker_services (
    user_id, service_category, service_name, description, is_available, created_at
) VALUES (
    {user_id},
    '{category.replace("'", "''")}',
    '{company.replace("'", "''")} Services',
    '{description.replace("'", "''")[:500]}',
    1,
    datetime('now')
);""")
    
    # Write SQL files
    with open('import_real_users.sql', 'w') as f:
        f.write("-- Real Kwikr Users Import\n")
        f.write('\n'.join(users_sql))
        
    with open('import_real_profiles.sql', 'w') as f:
        f.write("-- Real Kwikr User Profiles Import\n")
        f.write('\n'.join(profiles_sql))
        
    with open('import_real_services.sql', 'w') as f:
        f.write("-- Real Kwikr Worker Services Import\n")
        f.write('\n'.join(services_sql))
    
    print(f"Created import files with {len(users_sql)} users")
    print("Files created: import_real_users.sql, import_real_profiles.sql, import_real_services.sql")

if __name__ == "__main__":
    create_import_sql()