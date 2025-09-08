#!/usr/bin/env node

// Database setup script for Cloudflare D1
// Run with: node setup-db.js

const fs = require('fs');
const path = require('path');

console.log('📋 Kwikr Database Setup Instructions');
console.log('=====================================\n');

console.log('🔗 Database Configuration Updated!');
console.log('Your database ID has been added to wrangler.jsonc\n');

console.log('📋 Next Steps:');
console.log('1. Go to: https://dash.cloudflare.com');
console.log('2. Click: D1 SQL Database → kwikr-production');
console.log('3. Click: Console tab');
console.log('4. Copy and run these SQL commands:\n');

// Read and display schema in manageable chunks
console.log('🏗️ STEP 1: Create Tables (copy this into D1 console):');
console.log('─'.repeat(60));

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const createTableStatements = schema
  .split(';')
  .filter(stmt => stmt.trim() && stmt.includes('CREATE TABLE'))
  .slice(0, 3); // First 3 tables

createTableStatements.forEach(stmt => {
  console.log(stmt.trim() + ';\n');
});

console.log('─'.repeat(60));
console.log('✅ Run the above statements, then continue...\n');

console.log('📊 STEP 2: Add Sample Data');
console.log('Once tables are created, we\'ll add sample data\n');

console.log('🚀 STEP 3: Deploy Updated Site');
console.log('After database setup, we\'ll redeploy your site\n');

console.log('💡 Tip: Copy one CREATE TABLE statement at a time into the D1 console');
console.log('🔍 Each statement should end with a semicolon (;)');