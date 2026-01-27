import * as bcrypt from 'bcryptjs';

// Helper to hash passwords for tests
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const testUsers = {
  customer: {
    username: 'testcustomer',
    fullName: 'Test Customer',
    email: 'customer@test.com',
    password: 'Customer@123',
    phoneNumber: '+255123456789',
    role: 'CUSTOMER' as const,
    emailVerified: true,
    verificationToken: null,
    verificationTokenExpires: null,
  },
  admin: {
    username: 'testadmin',
    fullName: 'Test Admin',
    email: 'admin@test.com',
    password: 'Admin@123',
    phoneNumber: '+255987654321',
    role: 'ADMIN' as const,
    emailVerified: true,
    verificationToken: null,
    verificationTokenExpires: null,
  },
  warehouse: {
    username: 'testwarehouse',
    fullName: 'Test Warehouse',
    email: 'warehouse@test.com',
    password: 'Warehouse@123',
    phoneNumber: '+255555555555',
    role: 'WAREHOUSE' as const,
    emailVerified: true,
    verificationToken: null,
    verificationTokenExpires: null,
  },
  // Unverified user for testing email verification
  unverified: {
    username: 'unverifieduser',
    fullName: 'Unverified User',
    email: 'unverified@test.com',
    password: 'Unverified@123',
    phoneNumber: '+255111111111',
    role: 'CUSTOMER' as const,
    emailVerified: false,
    verificationToken: 'test_verification_token',
    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  }
};

export const testBooks = [
  {
    title: 'React Testing Guide',
    authorId: 1, // Will be set after author creation
    genreId: 1,  // Will be set after genre creation
    price: 29.99,
    stockQuantity: 10,
    sku: 'REACT-TEST-001',
    barcode: '9781234567890',
    shelfLocation: 'A1-01',
    coverImageUrl: 'https://example.com/react-book.jpg',
    description: 'Complete guide to testing React applications',
    status: 'available',
    averageRating: 4.5,
    totalReviews: 10,
  },
  {
    title: 'Node.js for Beginners',
    authorId: 2,
    genreId: 2,
    price: 24.99,
    stockQuantity: 5,
    sku: 'NODE-BEGIN-001',
    barcode: '9780987654321',
    shelfLocation: 'B2-03',
    coverImageUrl: 'https://example.com/nodejs-book.jpg',
    description: 'Learn Node.js from scratch',
    status: 'available',
    averageRating: 4.2,
    totalReviews: 8,
  }
];

export const testAuthors = [
  {
    name: 'John Developer',
    bio: 'Expert in React and testing'
  },
  {
    name: 'Jane Coder',
    bio: 'Node.js specialist and educator'
  }
];

export const testGenres = [
  {
    name: 'Education',
    description: 'Educational materials'
  },
  {
    name: 'Programming',
    description: 'Programming and software development'
  }
];

export const testCouriers = [
  {
    name: 'Test Courier Express'
  }
];

export const testAddress = {
  streetAddress: '123 Test Street',
  apartment: 'Suite 4B',
  city: 'Dar es Salaam',
  state: 'DSM',
  country: 'Tanzania',
  phone: '+255123456789',
  isDefault: true
};

// For testing email verification
export const generateVerificationToken = () => {
  return `test_verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};