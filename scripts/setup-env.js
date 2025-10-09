#!/usr/bin/env node

/**
 * Setup Environment Variables
 * Creates .env.local files for frontend and admin if they don't exist
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment files...\n');

const apps = [
  {
    name: 'Frontend',
    envPath: path.join(__dirname, '../apps/frontend/.env.local'),
    examplePath: path.join(__dirname, '../apps/frontend/.env.example')
  },
  {
    name: 'Admin',
    envPath: path.join(__dirname, '../apps/admin/.env.local'),
    examplePath: path.join(__dirname, '../apps/admin/.env.example')
  }
];

apps.forEach(app => {
  if (fs.existsSync(app.envPath)) {
    console.log(`✅ ${app.name}: .env.local already exists`);
  } else {
    if (fs.existsSync(app.examplePath)) {
      fs.copyFileSync(app.examplePath, app.envPath);
      console.log(`✅ ${app.name}: Created .env.local from .env.example`);
    } else {
      console.log(`⚠️  ${app.name}: No .env.example found, skipping...`);
    }
  }
});

console.log('\n✨ Environment setup complete!\n');
console.log('📝 Next steps:');
console.log('   1. Update .env.local files with your API keys');
console.log('   2. Run "npm run dev" to start development servers');
console.log('   3. Frontend: http://localhost:3000');
console.log('   4. Admin: http://localhost:3001\n');
