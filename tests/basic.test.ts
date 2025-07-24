/**
 * Basic test to verify Jest setup
 */

// Set up test environment variables
process.env.GHL_API_KEY = 'test_api_key_123';
process.env.GHL_BASE_URL = 'https://test.leadconnectorhq.com';
process.env.GHL_LOCATION_ID = 'test_location_123';
process.env.NODE_ENV = 'test';

describe('Basic Setup', () => {
  it('should run basic test', () => {
    expect(true).toBe(true);
  });

  it('should have environment variables set', () => {
    expect(process.env.GHL_API_KEY).toBe('test_api_key_123');
    expect(process.env.GHL_BASE_URL).toBe('https://test.leadconnectorhq.com');
    expect(process.env.GHL_LOCATION_ID).toBe('test_location_123');
  });
}); 