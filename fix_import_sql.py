#!/usr/bin/env python3
"""
Fix the import SQL by regenerating with proper VALUES clause
"""

import pandas as pd
import re
import sys

def clean_text(text):
    if pd.isna(text) or text is None:
        return None
    text = str(text).strip()
    if not text or text.lower() == 'nan':
        return None
    # Escape single quotes for SQL
    text = text.replace("'", "''")
    # Remove null characters that might break SQL
    text = text.replace('\x00', '')
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

def main():
    try:
        # Read Excel file
        print("Reading Excel file...")
        df = pd.read_excel('Kwikr_platform_import-sept-2025.xlsx')
        
        successful = 0
        errors = []
        
        # Generate smaller batches
        batch_size = 10
        batch_num = 1
        
        for start_idx in range(0, len(df), batch_size):
            end_idx = min(start_idx + batch_size, len(df))
            batch_df = df.iloc[start_idx:end_idx]
            
            batch_file = f'import_batch_{batch_num:03d}.sql'
            
            with open(batch_file, 'w', encoding='utf-8') as f:
                f.write(f'-- Batch {batch_num}: Records {start_idx + 1} to {end_idx}\\n\\n')
                
                for index, row in batch_df.iterrows():
                    try:
                        # Clean all data
                        company = clean_text(row.get('company'))
                        description = clean_text(row.get('description'))
                        address = clean_text(row.get('address'))
                        country = clean_text(row.get('country', 'Canada'))
                        province = clean_province(row.get('province'))
                        city = clean_text(row.get('city'))
                        postal_code = clean_text(row.get('postal_code'))
                        email = clean_email(row.get('email'))
                        filename = clean_text(row.get('filename'))
                        google_place_id = clean_text(row.get('google_place_id'))
                        latitude = clean_numeric(row.get('latitude'))
                        longitude = clean_numeric(row.get('longitude'))
                        phone = clean_phone(row.get('phone'))
                        profile_photo = clean_text(row.get('profile_photo'))
                        category = clean_text(row.get('category'))
                        subscription_type = clean_text(row.get('subscription_type'))
                        user_id = int(row.get('user_id')) if pd.notna(row.get('user_id')) else None
                        website = clean_text(row.get('website'))
                        hours_of_operation = clean_text(row.get('hours_of_operation'))
                        hourly_rate = clean_numeric(row.get('hourly_rate'))
                        price_range = clean_text(row.get('price_range'))
                        services_provided = clean_text(row.get('services_provided'))
                        
                        # Skip if essential data missing
                        if not company or not user_id:
                            continue
                        
                        # Write INSERT statement
                        f.write(f'-- {company}\\n')
                        f.write('INSERT INTO worker_profiles_new (\\n')
                        f.write('  company, description, address, country, province, city, postal_code,\\n')
                        f.write('  email, filename, google_place_id, latitude, longitude, phone,\\n')
                        f.write('  profile_photo, category, subscription_type, user_id, website,\\n')
                        f.write('  hours_of_operation, hourly_rate, price_range, services_provided\\n')
                        f.write(') VALUES (\\n')
                        
                        # Format each value properly
                        values = []
                        values.append(f"'{company}'" if company else 'NULL')
                        values.append(f"'{description}'" if description else 'NULL')
                        values.append(f"'{address}'" if address else 'NULL')
                        values.append(f"'{country}'" if country else 'NULL')
                        values.append(f"'{province}'" if province else 'NULL')
                        values.append(f"'{city}'" if city else 'NULL')
                        values.append(f"'{postal_code}'" if postal_code else 'NULL')
                        values.append(f"'{email}'" if email else 'NULL')
                        values.append(f"'{filename}'" if filename else 'NULL')
                        values.append(f"'{google_place_id}'" if google_place_id else 'NULL')
                        values.append(str(latitude) if latitude is not None else 'NULL')
                        values.append(str(longitude) if longitude is not None else 'NULL')
                        values.append(f"'{phone}'" if phone else 'NULL')
                        values.append(f"'{profile_photo}'" if profile_photo else 'NULL')
                        values.append(f"'{category}'" if category else 'NULL')
                        values.append(f"'{subscription_type}'" if subscription_type else 'NULL')
                        values.append(str(user_id))
                        values.append(f"'{website}'" if website else 'NULL')
                        values.append(f"'{hours_of_operation}'" if hours_of_operation else 'NULL')
                        values.append(str(hourly_rate) if hourly_rate is not None else 'NULL')
                        values.append(f"'{price_range}'" if price_range else 'NULL')
                        values.append(f"'{services_provided}'" if services_provided else 'NULL')
                        
                        # Write values with proper formatting
                        for i, value in enumerate(values):
                            if i == 0:
                                f.write(f'  {value}')
                            else:
                                f.write(f',\\n  {value}')
                        
                        f.write('\\n);\\n\\n')
                        successful += 1
                        
                    except Exception as e:
                        errors.append(f'Row {index + 1}: {str(e)}')
                        continue
            
            print(f'Generated {batch_file} with {end_idx - start_idx} records')
            batch_num += 1
        
        print(f'\\nGenerated {batch_num - 1} batch files with {successful} total records')
        print(f'Errors: {len(errors)}')
        if errors:
            print('First few errors:')
            for error in errors[:5]:
                print(f'  - {error}')
        
        return True
        
    except Exception as e:
        print(f'Error: {e}')
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)