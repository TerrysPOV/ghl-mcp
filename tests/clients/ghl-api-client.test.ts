/**
 * Unit Tests for GHL API Client
 * Tests API client configuration, connection, and error handling
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { GHLApiClient } from '../../src/clients/ghl-api-client.js';

// Mock axios
jest.mock('axios', () => ({
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn()
    }))
  }
}));

import axios from 'axios';
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('GHLApiClient', () => {
  let ghlClient: GHLApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset environment variables
    process.env.GHL_API_KEY = 'test_api_key_123';
    process.env.GHL_BASE_URL = 'https://test.leadconnectorhq.com';
    process.env.GHL_LOCATION_ID = 'test_location_123';

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn()
    };

    mockAxios.create.mockReturnValue(mockAxiosInstance);

    ghlClient = new GHLApiClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.leadconnectorhq.com',
        headers: {
          'Authorization': 'Bearer test_api_key_123',
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      });
    });

    it('should throw error if API key is missing', () => {
      delete process.env.GHL_API_KEY;
      
      expect(() => {
        new GHLApiClient();
      }).toThrow('GHL_API_KEY environment variable is required');
    });

    it('should throw error if base URL is missing', () => {
      delete process.env.GHL_BASE_URL;
      
      expect(() => {
        new GHLApiClient();
      }).toThrow('GHL_BASE_URL environment variable is required');
    });

    it('should throw error if location ID is missing', () => {
      delete process.env.GHL_LOCATION_ID;
      
      expect(() => {
        new GHLApiClient();
      }).toThrow('GHL_LOCATION_ID environment variable is required');
    });

    it('should use custom configuration when provided', () => {
      const customConfig = {
        accessToken: 'custom_token',
        baseUrl: 'https://custom.ghl.com',
        locationId: 'custom_location',
        version: '2022-01-01'
      };

      new GHLApiClient(customConfig);

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom.ghl.com',
        headers: {
          'Authorization': 'Bearer custom_token',
          'Content-Type': 'application/json',
          'Version': '2022-01-01'
        }
      });
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = ghlClient.getConfig();
      
      expect(config).toEqual({
        accessToken: 'test_api_key_123',
        baseUrl: 'https://test.leadconnectorhq.com',
        locationId: 'test_location_123',
        version: '2021-07-28'
      });
    });
  });

  describe('updateAccessToken', () => {
    it('should update access token and recreate axios instance', () => {
      ghlClient.updateAccessToken('new_token_456');

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.leadconnectorhq.com',
        headers: {
          'Authorization': 'Bearer new_token_456',
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      });

      const config = ghlClient.getConfig();
      expect(config.accessToken).toBe('new_token_456');
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { success: true },
        status: 200
      });

      const result = await ghlClient.testConnection();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        status: 'connected',
        locationId: 'test_location_123'
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/contacts', {
        params: { limit: 1 }
      });
    });

    it('should handle connection failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(ghlClient.testConnection()).rejects.toThrow('Connection test failed');
    });
  });

  describe('Contact API methods', () => {
    describe('createContact', () => {
      it('should create contact successfully', async () => {
        const contactData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        };

        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { contact: { id: 'contact_123', ...contactData } }
        });

        const result = await ghlClient.createContact(contactData);

        expect(result.success).toBe(true);
        expect(result.data.id).toBe('contact_123');
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/contacts/', contactData);
      });

      it('should handle create contact error', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce({
          response: { status: 400, data: { message: 'Invalid email' } }
        });

        await expect(
          ghlClient.createContact({ email: 'invalid' })
        ).rejects.toThrow('GHL API Error (400): Invalid email');
      });
    });

    describe('getContact', () => {
      it('should get contact successfully', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { contact: { id: 'contact_123', name: 'John Doe' } }
        });

        const result = await ghlClient.getContact('contact_123');

        expect(result.success).toBe(true);
        expect(result.data.id).toBe('contact_123');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/contacts/contact_123');
      });
    });

    describe('searchContacts', () => {
      it('should search contacts successfully', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { 
            contacts: [{ id: 'contact_123' }],
            total: 1
          }
        });

        const result = await ghlClient.searchContacts({ query: 'John' });

        expect(result.success).toBe(true);
        expect(result.data.contacts).toHaveLength(1);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/contacts/search/duplicate', {
          params: { query: 'John' }
        });
      });
    });
  });

  describe('Conversation API methods', () => {
    describe('sendSMS', () => {
      it('should send SMS successfully', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { messageId: 'msg_123', conversationId: 'conv_123' }
        });

        const result = await ghlClient.sendSMS('contact_123', 'Hello World');

        expect(result.success).toBe(true);
        expect(result.data.messageId).toBe('msg_123');
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/conversations/messages', {
          type: 'SMS',
          contactId: 'contact_123',
          message: 'Hello World'
        });
      });

      it('should send SMS with custom from number', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { messageId: 'msg_123' }
        });

        await ghlClient.sendSMS('contact_123', 'Hello', '+1-555-000-0000');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/conversations/messages', {
          type: 'SMS',
          contactId: 'contact_123',
          message: 'Hello',
          fromNumber: '+1-555-000-0000'
        });
      });
    });

    describe('sendEmail', () => {
      it('should send email successfully', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { emailMessageId: 'email_123' }
        });

        const result = await ghlClient.sendEmail('contact_123', 'Test Subject', 'Test body');

        expect(result.success).toBe(true);
        expect(result.data.emailMessageId).toBe('email_123');
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/conversations/messages/email', {
          type: 'Email',
          contactId: 'contact_123',
          subject: 'Test Subject',
          message: 'Test body'
        });
      });

      it('should send email with HTML and options', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { emailMessageId: 'email_123' }
        });

        const options = { emailCc: ['cc@example.com'] };
        await ghlClient.sendEmail('contact_123', 'Subject', 'Text', '<h1>HTML</h1>', options);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/conversations/messages/email', {
          type: 'Email',
          contactId: 'contact_123',
          subject: 'Subject',
          message: 'Text',
          html: '<h1>HTML</h1>',
          emailCc: ['cc@example.com']
        });
      });
    });
  });

  describe('Blog API methods', () => {
    describe('createBlogPost', () => {
      it('should create blog post successfully', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { data: { _id: 'post_123', title: 'Test Post' } }
        });

        const postData = {
          title: 'Test Post',
          blogId: 'blog_123',
          rawHTML: '<h1>Content</h1>'
        };

        const result = await ghlClient.createBlogPost(postData);

        expect(result.success).toBe(true);
        expect(result.data.data._id).toBe('post_123');
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/blogs/blog_123/posts', postData);
      });
    });

    describe('getBlogSites', () => {
      it('should get blog sites successfully', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { data: [{ _id: 'blog_123', name: 'Test Blog' }] }
        });

        const result = await ghlClient.getBlogSites({ locationId: 'loc_123' });

        expect(result.success).toBe(true);
        expect(result.data.data).toHaveLength(1);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/blogs', {
          params: { locationId: 'loc_123' }
        });
      });
    });
  });

  describe('Error handling', () => {
    it('should format axios error with response', async () => {
      const axiosError = {
        response: {
          status: 404,
          data: { message: 'Contact not found' }
        }
      };

      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      await expect(
        ghlClient.getContact('not_found')
      ).rejects.toThrow('GHL API Error (404): Contact not found');
    });

    it('should format axios error without response data', async () => {
      const axiosError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error'
        }
      };

      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      await expect(
        ghlClient.getContact('contact_123')
      ).rejects.toThrow('GHL API Error (500): Internal Server Error');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValueOnce(networkError);

      await expect(
        ghlClient.getContact('contact_123')
      ).rejects.toThrow('GHL API Error: Network Error');
    });
  });

  describe('Request/Response handling', () => {
    it('should properly format successful responses', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { contact: { id: 'contact_123' } },
        status: 200
      });

      const result = await ghlClient.getContact('contact_123');

      expect(result).toEqual({
        success: true,
        data: { id: 'contact_123' }
      });
    });

    it('should extract nested data correctly', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { 
          data: { 
            blogPost: { _id: 'post_123', title: 'Test' }
          }
        }
      });

      const result = await ghlClient.createBlogPost({
        title: 'Test',
        blogId: 'blog_123'
      });

      expect(result.data).toEqual({
        blogPost: { _id: 'post_123', title: 'Test' }
      });
    });
  });
}); 