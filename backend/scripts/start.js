// backend/scripts/start.js
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting CRM Backend Server...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating from .env.example...');
  
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('📝 Please update the .env file with your configuration\n');
  } else {
    console.log('❌ .env.example file not found. Creating basic .env file...');
    const basicEnv = `# Environment Configuration
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
REQUIRE_EMAIL_VERIFICATION=false
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created successfully!\n');
  }
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.log(`   - ${envVar}`));
  console.log('\n📝 Please update your .env file with the missing variables');
  process.exit(1);
}

// Print startup information
console.log('📋 Configuration:');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Port: ${process.env.PORT || 5000}`);
console.log(`   Database: ${process.env.MONGODB_URI}`);
console.log(`   JWT Secret: ${'*'.repeat(10)} (${process.env.JWT_SECRET ? 'Set' : 'Not Set'})`);
console.log(`   Client URL: ${process.env.CLIENT_URL || 'Not Set'}\n`);

// Start the server
console.log('🔄 Loading server...\n');
require('../server.js');