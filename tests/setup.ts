/**
 * Jest Test Setup
 * Global configuration and utilities for testing
 */

// Mock environment variables for testing
process.env.GHL_API_KEY = 'test_api_key_123';
process.env.GHL_BASE_URL = 'https://test.leadconnectorhq.com';
process.env.GHL_LOCATION_ID = 'test_location_123';
process.env.NODE_ENV = 'test';

// Extend global interface for test utilities
declare global {
  var testConfig: {
    ghlApiKey: string;
    ghlBaseUrl: string;
    ghlLocationId: string;
  };
}

// Global test utilities
(global as any).testConfig = {
  ghlApiKey: 'test_api_key_123',
  ghlBaseUrl: 'https://test.leadconnectorhq.com',
  ghlLocationId: 'test_location_123'
};

// Set up test timeout
jest.setTimeout(10000); 