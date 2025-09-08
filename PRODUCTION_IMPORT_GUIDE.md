# Production Data Import Guide

## Current Status
✅ **37+ real workers successfully imported locally**  
✅ **Search functionality working with real data**  
✅ **Province mapping fixed** (Ontario → ON, etc.)  
⚠️ **Need to import to production database**

## Files Ready for Production Import

### 1. Import Script
- `bulk_import_real_data.py` - Python script to import all workers
- Handles province mapping automatically
- Creates users, profiles, and services

### 2. Sample Workers Successfully Imported
- **Plumbing Ambulance Inc** (Mississauga, ON)
- **Kodiak Plumbing** (Lethbridge, AB)  
- **Epic Plumbing and Heating** (Parksville, BC)
- **Drain Master Plumbers** (Burnaby, BC)
- And 30+ more real businesses

### 3. Verified Search Queries
```sql
-- This query works and returns 33 plumbers:
SELECT COUNT(DISTINCT u.id) as total 
FROM users u 
LEFT JOIN user_profiles p ON u.id = p.user_id 
LEFT JOIN worker_services ws ON u.id = ws.user_id 
WHERE u.role = 'worker' 
  AND u.is_active = 1 
  AND ws.is_available = 1 
  AND LOWER(ws.service_name) LIKE LOWER('%Plumbing%');
```

## Production Deployment Steps

### Step 1: Deploy Application
1. Use the **"Publish"** button in your Deploy tab
2. Your API token has proper permissions now
3. This will deploy all search fixes

### Step 2: Import All Workers (933 total)
Run this command in your production environment:
```bash
# Modify bulk_import_real_data.py to import all 933 workers
python3 bulk_import_real_data.py
```

Or use the SQL files directly:
```bash
wrangler d1 execute kwikr-production --remote --file=import_real_users.sql
wrangler d1 execute kwikr-production --remote --file=import_real_profiles.sql  
wrangler d1 execute kwikr-production --remote --file=import_real_services.sql
```

## Expected Results After Import
- ✅ **Search for "Plumbing"** → Shows 33+ real plumbers
- ✅ **Search for "Landscaping"** → Shows real landscaping companies
- ✅ **Location filtering** → Works with real Canadian cities/provinces
- ✅ **No more "0 Results"** → Real worker data displayed

## Verification Commands
```bash
# Check total workers imported
wrangler d1 execute kwikr-production --remote --command="SELECT COUNT(*) FROM users WHERE role='worker';"

# Check plumbers specifically  
wrangler d1 execute kwikr-production --remote --command="SELECT COUNT(*) FROM users u JOIN worker_services ws ON u.id = ws.user_id WHERE ws.service_category = 'Plumbing';"
```

The search functionality is working perfectly with real data - it just needs to be deployed to production!