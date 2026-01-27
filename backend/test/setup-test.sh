#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up testing environment...\n');

// 1. Check for .env.test
const envTestPath = path.join(__dirname, '.env.test');
if (!fs.existsSync(envTestPath)) {
  console.log('📄 Creating .env.test file...');
  const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
  
  // Modify for testing
  const testEnv = envExample
    .replace(/PORT=4000/, 'PORT=4001')
    .replace(/JWT_SECRET=.*/, 'JWT_SECRET="test_jwt_secret_12345"')
    .replace(/SMTP_USER=.*/, 'SMTP_USER=test@example.com')
    .replace(/SMTP_PASS=.*/, 'SMTP_PASS=fakepassword')
    .replace(/EMAIL_FROM=.*/, 'EMAIL_FROM="Test <test@example.com>"')
    .replace(/NODE_ENV=.*/, 'NODE_ENV=test\nTEST_MODE=true\nSKIP_EMAIL_VERIFICATION=true');
  
  fs.writeFileSync(envTestPath, testEnv);
  console.log('✅ .env.test created');
}

// 2. Install dependencies if needed
console.log('\n📦 Checking dependencies...');
try {
  execSync('npm list dotenv-cli', { stdio: 'ignore' });
} catch {
  console.log('Installing dotenv-cli...');
  execSync('npm install --save-dev dotenv-cli', { stdio: 'inherit' });
}

// 3. Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// 4. Push schema
console.log('\n🗄️  Pushing schema to test database...');
try {
  execSync('npx dotenv -e .env.test -- npx prisma db push --accept-data-loss', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Error pushing schema. You might need to check your database connection.');
  console.log('Make sure DATABASE_URL in .env.test is correct.');
  process.exit(1);
}

// 5. Create test directory structure
console.log('\n📁 Creating test directory structure...');
const testDirs = ['api', 'setup', 'fixtures', 'helpers'];
testDirs.forEach(dir => {
  const dirPath = path.join(__dirname, 'test', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// 6. Run database setup
console.log('\n🌱 Seeding test data...');
try {
  execSync('npx ts-node test/setup/test-db.setup.ts', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Error seeding data. Running simplified setup...');
  
  // Try simplified setup
  const prisma = require('./src/prisma/prisma.service').PrismaService;
  const prismaInstance = new prisma();
  
  // Just truncate tables
  const tables = ['users', 'books', 'authors', 'genres'];
  for (const table of tables) {
    try {
      await prismaInstance.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
    } catch (e) {
      // Ignore
    }
  }
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Run auth tests:    npm run test:api:auth');
console.log('2. Run all tests:     npm run test:api');
console.log('3. Watch mode:        npm run test:api:watch');
console.log('4. With coverage:     npm run test:api:coverage');
console.log('\n⚠️  Note: Tests use your actual Supabase database.');
console.log('   Consider creating a separate test project at:');
console.log('   https://supabase.com/dashboard');