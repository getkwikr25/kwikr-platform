#!/usr/bin/env python3
"""
Create simple CSV file for import and then convert to SQL statements
"""

import pandas as pd
import re
import csv

def clean_text(text):
    if pd.isna(text) or text is None:
        return ''
    text = str(text).strip()
    if not text or text.lower() == 'nan':
        return ''
    # Clean for CSV/SQL
    text = text.replace('\x00', '').replace('\r\n', ' ').replace('\n', ' ').replace('\r', ' ')
    # Remove excessive quotes and normalize
    text = re.sub(r'\s+', ' ', text)
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
        return ''
    phone = re.sub(r'[^\d]', '', str(phone))
    if len(phone) < 10:
        return ''
    return phone

def clean_email(email):
    if pd.isna(email) or email is None:
        return ''
    email = str(email).strip().lower()
    if '@' not in email or '.' not in email:
        return ''
    return email

def clean_province(province):
    if pd.isna(province) or province is None:
        return ''
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
    print("Reading Excel file...")
    df = pd.read_excel('Kwikr_platform_import-sept-2025.xlsx')
    
    # Create smaller batches of 20 records each with simple INSERT statements
    batch_size = 20
    batch_count = 0
    
    for start_idx in range(0, len(df), batch_size):
        end_idx = min(start_idx + batch_size, len(df))
        batch_df = df.iloc[start_idx:end_idx]
        batch_count += 1
        
        filename = f'simple_batch_{batch_count:03d}.sql'
        
        with open(filename, 'w', encoding='utf-8') as f:
            for index, row in batch_df.iterrows():
                try:
                    # Get and clean data
                    company = clean_text(row.get('company'))
                    description = clean_text(row.get('description'))
                    address = clean_text(row.get('address'))
                    country = clean_text(row.get('country', 'Canada'))
                    province = clean_province(row.get('province'))
                    city = clean_text(row.get('city'))
                    postal_code = clean_text(row.get('postal_code'))
                    email = clean_email(row.get('email'))
                    filename_col = clean_text(row.get('filename'))
                    google_place_id = clean_text(row.get('google_place_id'))
                    latitude = clean_numeric(row.get('latitude'))
                    longitude = clean_numeric(row.get('longitude'))
                    phone = clean_phone(row.get('phone'))
                    profile_photo = clean_text(row.get('profile_photo'))
                    category = clean_text(row.get('category'))
                    subscription_type = clean_text(row.get('subscription_type'))
                    user_id = int(row.get('user_id')) if pd.notna(row.get('user_id')) else None
                    website = clean_text(row.get('website'))
                    
                    # Skip if essential data missing
                    if not company or not user_id:
                        continue
                    
                    # Create simple INSERT with proper escaping
                    f.write(f'INSERT INTO worker_profiles_new (company, description, address, country, province, city, postal_code, email, filename, google_place_id, latitude, longitude, phone, profile_photo, category, subscription_type, user_id, website) VALUES (')
                    
                    values = []
                    values.append(f"'{company.replace(chr(39), chr(39)+chr(39))}'")  # Escape single quotes
                    values.append(f"'{description.replace(chr(39), chr(39)+chr(39))}'")
                    values.append(f"'{address.replace(chr(39), chr(39)+chr(39))}'")
                    values.append(f"'{country.replace(chr(39), chr(39)+chr(39))}'")
                    values.append(f"'{province}'")
                    values.append(f"'{city.replace(chr(39), chr(39)+chr(39))}'")
                    values.append(f"'{postal_code}'")
                    values.append(f"'{email}'")
                    values.append(f"'{filename_col.replace(chr(39), chr(39)+chr(39))}'")
                    values.append(f"'{google_place_id}'")
                    values.append(str(latitude) if latitude is not None else 'NULL')
                    values.append(str(longitude) if longitude is not None else 'NULL')
                    values.append(f"'{phone}'")
                    values.append(f"'{profile_photo.replace(chr(39), chr(39)+chr(39))}'")
                    values.append(f"'{category}'")
                    values.append(f"'{subscription_type}'")
                    values.append(str(user_id))
                    values.append(f"'{website.replace(chr(39), chr(39)+chr(39))}'")
                    
                    f.write(', '.join(values))
                    f.write(');\\n')
                    
                except Exception as e:
                    print(f"Error processing row {index}: {e}")
                    continue
        
        print(f"Created {filename} with {end_idx - start_idx} records")
    
    print(f"\\nCreated {batch_count} batch files")
    return True

if __name__ == "__main__":
    main()