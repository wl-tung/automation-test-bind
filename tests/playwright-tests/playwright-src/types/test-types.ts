/**
 * TypeScript type definitions for test automation
 */

export interface TestConfig {
  baseUrl: string;
  apiUrl: string;
  timeout: number;
  retries: number;
}

export interface BrowserConfig {
  name: 'chromium' | 'webkit' | 'firefox';
  headless: boolean;
  viewport: {
    width: number;
    height: number;
  };
}

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  images: string[];
}

export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface TestEnvironment {
  name: 'development' | 'staging' | 'production';
  config: TestConfig;
}

export interface PageLoadMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export interface AccessibilityResult {
  violations: AccessibilityViolation[];
  passes: AccessibilityCheck[];
  incomplete: AccessibilityCheck[];
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityCheck {
  id: string;
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityNode {
  target: string[];
  html: string;
  failureSummary?: string;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface TestDataSet<T> {
  valid: T[];
  invalid: T[];
  edge: T[];
}

export interface FormValidation {
  field: string;
  value: string;
  expectedError?: string;
  shouldPass: boolean;
}
