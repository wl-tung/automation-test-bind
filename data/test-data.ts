/**
 * Test data management
 */

export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

/**
 * Test users for different scenarios
 */
export const TestUsers = {
  validUser: {
    email: 'valid.user@example.com',
    password: 'ValidPassword123!',
    firstName: 'John',
    lastName: 'Doe',
    phone: '555-123-4567',
  },

  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    firstName: 'Admin',
    lastName: 'User',
    phone: '555-987-6543',
  },

  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword',
    firstName: 'Invalid',
    lastName: 'User',
  },

  webLifeUser: {
    email: 'nguyen-tung@web-life.co.jp',
    password: 'x7wtPvVVnKLgYYR',
    firstName: 'Nguyen',
    lastName: 'Tung',
  },
} as const;

/**
 * Test products for e-commerce scenarios
 */
export const TestProducts = {
  laptop: {
    id: 'laptop-001',
    name: 'Gaming Laptop',
    price: 1299.99,
    category: 'Electronics',
    description: 'High-performance gaming laptop',
  },

  book: {
    id: 'book-001',
    name: 'Test Automation Guide',
    price: 29.99,
    category: 'Books',
    description: 'Complete guide to test automation',
  },
} as const;

/**
 * Form validation test data
 */
export const ValidationData = {
  invalidEmails: ['invalid-email', '@example.com', 'test@', 'test..test@example.com', ''],

  invalidPasswords: ['123', 'password', 'PASSWORD', '12345678', ''],

  validEmails: ['test@example.com', 'user.name@domain.co.uk', 'test+tag@example.org'],

  validPasswords: ['ValidPassword123!', 'AnotherGood1@', 'SecurePass2#'],
} as const;

/**
 * Environment-specific data
 */
export const EnvironmentData = {
  development: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3001/api',
  },

  staging: {
    baseUrl: 'https://staging.example.com',
    apiUrl: 'https://api-staging.example.com',
  },

  production: {
    baseUrl: 'https://example.com',
    apiUrl: 'https://api.example.com',
  },
} as const;

/**
 * Get environment-specific data
 */
export function getEnvironmentData() {
  const env = process.env.NODE_ENV || 'development';
  return EnvironmentData[env as keyof typeof EnvironmentData] || EnvironmentData.development;
}

/**
 * Generate dynamic test data
 */
export class TestDataGenerator {
  static generateUser(): UserData {
    const timestamp = Date.now();
    return {
      email: `test.user.${timestamp}@example.com`,
      password: 'TestPassword123!',
      firstName: `FirstName${timestamp}`,
      lastName: `LastName${timestamp}`,
      phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    };
  }

  static generateProduct(): ProductData {
    const timestamp = Date.now();
    return {
      id: `product-${timestamp}`,
      name: `Test Product ${timestamp}`,
      price: Math.floor(Math.random() * 1000) + 10,
      category: 'Test Category',
      description: `Test product description ${timestamp}`,
    };
  }
}
