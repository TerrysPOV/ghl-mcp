/**
 * Mock implementation of GHLApiClient for testing
 * Provides realistic test data without making actual API calls
 */

import { 
  GHLApiResponse, 
  GHLContact, 
  GHLConversation, 
  GHLMessage,
  GHLBlogPost,
  GHLBlogSite,
  GHLBlogAuthor,
  GHLBlogCategory
} from '../../src/types/ghl-types.js';

// Mock test data
export const mockContact: GHLContact = {
  id: 'contact_123',
  locationId: 'test_location_123',
  firstName: 'John',
  lastName: 'Doe', 
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567',
  tags: ['test', 'customer'],
  source: 'ChatGPT MCP',
  dateAdded: '2024-01-01T00:00:00.000Z',
  dateUpdated: '2024-01-01T00:00:00.000Z'
};

export const mockConversation: GHLConversation = {
  id: 'conv_123',
  contactId: 'contact_123',
  locationId: 'test_location_123',
  lastMessageBody: 'Test message',
  lastMessageType: 'TYPE_SMS',
  type: 'SMS',
  unreadCount: 0,
  fullName: 'John Doe',
  contactName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567'
};

export const mockMessage: GHLMessage = {
  id: 'msg_123',
  type: 1,
  messageType: 'TYPE_SMS',
  locationId: 'test_location_123',
  contactId: 'contact_123',
  conversationId: 'conv_123',
  dateAdded: '2024-01-01T00:00:00.000Z',
  body: 'Test SMS message',
  direction: 'outbound',
  status: 'sent',
  contentType: 'text/plain'
};

export const mockBlogPost: GHLBlogPost = {
  _id: 'post_123',
  title: 'Test Blog Post',
  description: 'Test blog post description',
  imageUrl: 'https://example.com/image.jpg',
  imageAltText: 'Test image',
  urlSlug: 'test-blog-post',
  author: 'author_123',
  publishedAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  status: 'PUBLISHED',
  categories: ['cat_123'],
  tags: ['test', 'blog'],
  archived: false,
  rawHTML: '<h1>Test Content</h1>'
};

export const mockBlogSite: GHLBlogSite = {
  _id: 'blog_123',
  name: 'Test Blog Site'
};

export const mockBlogAuthor: GHLBlogAuthor = {
  _id: 'author_123',
  name: 'Test Author',
  locationId: 'test_location_123',
  updatedAt: '2024-01-01T00:00:00.000Z',
  canonicalLink: 'https://example.com/author/test'
};

export const mockBlogCategory: GHLBlogCategory = {
  _id: 'cat_123',
  label: 'Test Category',
  locationId: 'test_location_123',
  updatedAt: '2024-01-01T00:00:00.000Z',
  canonicalLink: 'https://example.com/category/test',
  urlSlug: 'test-category'
};

/**
 * Mock GHL API Client class
 */
export class MockGHLApiClient {
  private config = {
    accessToken: 'test_token',
    baseUrl: 'https://test.leadconnectorhq.com',
    version: '2021-07-28',
    locationId: 'test_location_123'
  };

  // Contact methods
  async createContact(contactData: any): Promise<GHLApiResponse<GHLContact>> {
    return {
      success: true,
      data: { ...mockContact, ...contactData, id: 'contact_' + Date.now() }
    };
  }

  async getContact(contactId: string): Promise<GHLApiResponse<GHLContact>> {
    if (contactId === 'not_found') {
      throw new Error('GHL API Error (404): Contact not found');
    }
    return {
      success: true,
      data: { ...mockContact, id: contactId }
    };
  }

  async updateContact(contactId: string, updates: any): Promise<GHLApiResponse<GHLContact>> {
    return {
      success: true,
      data: { ...mockContact, ...updates, id: contactId }
    };
  }

  async deleteContact(contactId: string): Promise<GHLApiResponse<{ succeded: boolean }>> {
    return {
      success: true,
      data: { succeded: true }
    };
  }

  async searchContacts(searchParams: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        contacts: [mockContact],
        total: 1
      }
    };
  }

  async addContactTags(contactId: string, tags: string[]): Promise<GHLApiResponse<{ tags: string[] }>> {
    return {
      success: true,
      data: { tags: [...mockContact.tags!, ...tags] }
    };
  }

  async removeContactTags(contactId: string, tags: string[]): Promise<GHLApiResponse<{ tags: string[] }>> {
    return {
      success: true,
      data: { tags: mockContact.tags!.filter(tag => !tags.includes(tag)) }
    };
  }

  // Conversation methods
  async sendSMS(contactId: string, message: string, fromNumber?: string): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        messageId: 'msg_' + Date.now(),
        conversationId: 'conv_123'
      }
    };
  }

  async sendEmail(contactId: string, subject: string, message?: string, html?: string, options?: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        messageId: 'msg_' + Date.now(),
        conversationId: 'conv_123',
        emailMessageId: 'email_' + Date.now()
      }
    };
  }

  async searchConversations(searchParams: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        conversations: [mockConversation],
        total: 1
      }
    };
  }

  async getConversation(conversationId: string): Promise<GHLApiResponse<GHLConversation>> {
    return {
      success: true,
      data: { ...mockConversation, id: conversationId }
    };
  }

  async createConversation(conversationData: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'conv_' + Date.now(),
        dateUpdated: new Date().toISOString(),
        dateAdded: new Date().toISOString(),
        deleted: false,
        contactId: conversationData.contactId,
        locationId: conversationData.locationId,
        lastMessageDate: new Date().toISOString()
      }
    };
  }

  async updateConversation(conversationId: string, updates: any): Promise<GHLApiResponse<GHLConversation>> {
    return {
      success: true,
      data: { ...mockConversation, ...updates, id: conversationId }
    };
  }

  async getConversationMessages(conversationId: string, options?: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        lastMessageId: 'msg_123',
        nextPage: false,
        messages: [mockMessage]
      }
    };
  }

  // Blog methods
  async createBlogPost(postData: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        data: { ...mockBlogPost, ...postData, _id: 'post_' + Date.now() }
      }
    };
  }

  async updateBlogPost(postId: string, postData: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        updatedBlogPost: { ...mockBlogPost, ...postData, _id: postId }
      }
    };
  }

  async getBlogPosts(params: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        blogs: [mockBlogPost]
      }
    };
  }

  async getBlogSites(params: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        data: [mockBlogSite]
      }
    };
  }

  async getBlogAuthors(params: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        authors: [mockBlogAuthor]
      }
    };
  }

  async getBlogCategories(params: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        categories: [mockBlogCategory]
      }
    };
  }

  async checkUrlSlugExists(params: any): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        exists: params.urlSlug === 'existing-slug'
      }
    };
  }

  async testConnection(): Promise<GHLApiResponse<any>> {
    return {
      success: true,
      data: {
        status: 'connected',
        locationId: this.config.locationId
      }
    };
  }

  getConfig() {
    return { ...this.config };
  }

  updateAccessToken(newToken: string): void {
    this.config.accessToken = newToken;
  }
} 