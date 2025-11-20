#!/usr/bin/env node
/**
 * Helper script to convert Firebase service account JSON to .env format
 * Usage: node convert-firebase-key.js path/to/service-account.json
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node convert-firebase-key.js <path-to-service-account.json>');
  console.error('Example: node convert-firebase-key.js ./akhati-uno-firebase-adminsdk.json');
  process.exit(1);
}

const filePath = args[0];

if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found: ${filePath}`);
  process.exit(1);
}

try {
  const rawJson = fs.readFileSync(filePath, 'utf8');
  const serviceAccount = JSON.parse(rawJson);
  
  // Validate required fields
  if (!serviceAccount.project_id) {
    console.error('Error: Missing project_id in service account JSON');
    process.exit(1);
  }
  
  if (!serviceAccount.private_key) {
    console.error('Error: Missing private_key in service account JSON');
    process.exit(1);
  }
  
  // Convert to single-line string (escape newlines in private_key)
  const singleLineJson = JSON.stringify(serviceAccount);
  
  console.log('\n✅ Conversion successful!\n');
  console.log('Add these lines to your server/.env file:\n');
  console.log('FIREBASE_PROJECT_ID=' + serviceAccount.project_id);
  console.log('FIREBASE_SERVICE_ACCOUNT_KEY=' + singleLineJson);
  console.log('\n⚠️  Make sure to keep this JSON on a SINGLE LINE in .env');
  console.log('⚠️  Do NOT add extra quotes around it\n');
  
} catch (error) {
  console.error('Error reading or parsing JSON:', error.message);
  process.exit(1);
}

