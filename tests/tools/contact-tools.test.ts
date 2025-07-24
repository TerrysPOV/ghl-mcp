/**
 * Unit Tests for Contact Tools
 * Tests all 7 contact management MCP tools
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ContactTools } from '../../src/tools/contact-tools.js';
import { MockGHLApiClient, mockContact } from '../mocks/ghl-api-client.mock.js';

describe('ContactTools', () => {
  let contactTools: ContactTools;
  let mockGhlClient: MockGHLApiClient;

  beforeEach(() => {
    mockGhlClient = new MockGHLApiClient();
    contactTools = new ContactTools(mockGhlClient as any);
  });

  describe('getToolDefinitions', () => {
    it('should return 7 contact tool definitions', () => {
      const tools = contactTools.getToolDefinitions();
      expect(tools).toHaveLength(7);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toEqual([
        'create_contact',
        'search_contacts',
        'get_contact',
        'update_contact',
        'add_contact_tags',
        'remove_contact_tags',
        'delete_contact'
      ]);
    });

    it('should have proper schema definitions for all tools', () => {
      const tools = contactTools.getToolDefinitions();
      
      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      });
    });
  });

  describe('executeTool', () => {
    it('should route tool calls correctly', async () => {
      const createSpy = jest.spyOn(contactTools as any, 'createContact');
      const getSpy = jest.spyOn(contactTools as any, 'getContact');

      await contactTools.executeTool('create_contact', { email: 'test@example.com' });
      await contactTools.executeTool('get_contact', { contactId: 'contact_123' });

      expect(createSpy).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(getSpy).toHaveBeenCalledWith('contact_123');
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        contactTools.executeTool('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('create_contact', () => {
    it('should create contact successfully', async () => {
      const contactData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+1-555-987-6543'
      };

      const result = await contactTools.executeTool('create_contact', contactData);

      expect(result.success).toBe(true);
      expect(result.contact).toBeDefined();
      expect(result.contact.email).toBe(contactData.email);
      expect(result.message).toContain('Contact created successfully');
    });

    it('should handle API errors', async () => {
      const mockError = new Error('GHL API Error (400): Invalid email');
      jest.spyOn(mockGhlClient, 'createContact').mockRejectedValueOnce(mockError);

      await expect(
        contactTools.executeTool('create_contact', { email: 'invalid-email' })
      ).rejects.toThrow('Failed to create contact');
    });

    it('should set default source if not provided', async () => {
      const spy = jest.spyOn(mockGhlClient, 'createContact');
      
      await contactTools.executeTool('create_contact', {
        firstName: 'John',
        email: 'john@example.com'
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'ChatGPT MCP'
        })
      );
    });
  });

  describe('search_contacts', () => {
    it('should search contacts successfully', async () => {
      const searchParams = {
        query: 'John Doe',
        limit: 10
      };

      const result = await contactTools.executeTool('search_contacts', searchParams);

      expect(result.success).toBe(true);
      expect(result.contacts).toBeDefined();
      expect(Array.isArray(result.contacts)).toBe(true);
      expect(result.total).toBeDefined();
      expect(result.message).toContain('Found');
    });

    it('should use default limit if not provided', async () => {
      const spy = jest.spyOn(mockGhlClient, 'searchContacts');
      
      await contactTools.executeTool('search_contacts', { query: 'test' });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 25
        })
      );
    });

    it('should handle search with email filter', async () => {
      const result = await contactTools.executeTool('search_contacts', {
        email: 'john@example.com'
      });

      expect(result.success).toBe(true);
      expect(result.contacts).toBeDefined();
    });
  });

  describe('get_contact', () => {
    it('should get contact by ID successfully', async () => {
      const result = await contactTools.executeTool('get_contact', {
        contactId: 'contact_123'
      });

      expect(result.success).toBe(true);
      expect(result.contact).toBeDefined();
      expect(result.contact.id).toBe('contact_123');
      expect(result.message).toBe('Contact retrieved successfully');
    });

    it('should handle contact not found', async () => {
      await expect(
        contactTools.executeTool('get_contact', { contactId: 'not_found' })
      ).rejects.toThrow('Failed to get contact');
    });
  });

  describe('update_contact', () => {
    it('should update contact successfully', async () => {
      const updateData = {
        contactId: 'contact_123',
        firstName: 'Updated',
        lastName: 'Name'
      };

      const result = await contactTools.executeTool('update_contact', updateData);

      expect(result.success).toBe(true);
      expect(result.contact).toBeDefined();
      expect(result.contact.firstName).toBe('Updated');
      expect(result.message).toBe('Contact updated successfully');
    });

    it('should handle partial updates', async () => {
      const spy = jest.spyOn(mockGhlClient, 'updateContact');
      
      await contactTools.executeTool('update_contact', {
        contactId: 'contact_123',
        email: 'newemail@example.com'
      });

      expect(spy).toHaveBeenCalledWith('contact_123', {
        email: 'newemail@example.com'
      });
    });
  });

  describe('add_contact_tags', () => {
    it('should add tags successfully', async () => {
      const result = await contactTools.executeTool('add_contact_tags', {
        contactId: 'contact_123',
        tags: ['vip', 'premium']
      });

      expect(result.success).toBe(true);
      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.message).toContain('Successfully added 2 tags');
    });

    it('should validate required parameters', async () => {
      await expect(
        contactTools.executeTool('add_contact_tags', { contactId: 'contact_123' })
      ).rejects.toThrow();
    });
  });

  describe('remove_contact_tags', () => {
    it('should remove tags successfully', async () => {
      const result = await contactTools.executeTool('remove_contact_tags', {
        contactId: 'contact_123',
        tags: ['old-tag']
      });

      expect(result.success).toBe(true);
      expect(result.tags).toBeDefined();
      expect(result.message).toContain('Successfully removed 1 tags');
    });

    it('should handle empty tags array', async () => {
      const spy = jest.spyOn(mockGhlClient, 'removeContactTags');
      
      await contactTools.executeTool('remove_contact_tags', {
        contactId: 'contact_123',
        tags: []
      });

      expect(spy).toHaveBeenCalledWith('contact_123', []);
    });
  });

  describe('delete_contact', () => {
    it('should delete contact successfully', async () => {
      const result = await contactTools.executeTool('delete_contact', {
        contactId: 'contact_123'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Contact deleted successfully');
    });

    it('should handle deletion errors', async () => {
      const mockError = new Error('GHL API Error (404): Contact not found');
      jest.spyOn(mockGhlClient, 'deleteContact').mockRejectedValueOnce(mockError);

      await expect(
        contactTools.executeTool('delete_contact', { contactId: 'not_found' })
      ).rejects.toThrow('Failed to delete contact');
    });
  });

  describe('error handling', () => {
    it('should propagate API client errors', async () => {
      const mockError = new Error('Network error');
      jest.spyOn(mockGhlClient, 'createContact').mockRejectedValueOnce(mockError);

      await expect(
        contactTools.executeTool('create_contact', { email: 'test@example.com' })
      ).rejects.toThrow('Failed to create contact: Error: Network error');
    });

    it('should handle missing required fields', async () => {
      // Test with missing email (required field)
      await expect(
        contactTools.executeTool('create_contact', { firstName: 'John' })
      ).rejects.toThrow();
    });
  });

  describe('input validation', () => {
    it('should validate email format in schema', () => {
      const tools = contactTools.getToolDefinitions();
      const createContactTool = tools.find(tool => tool.name === 'create_contact');
      
      expect(createContactTool?.inputSchema.properties.email.format).toBe('email');
    });

    it('should validate required fields in schema', () => {
      const tools = contactTools.getToolDefinitions();
      const createContactTool = tools.find(tool => tool.name === 'create_contact');
      
      expect(createContactTool?.inputSchema.required).toEqual(['email']);
    });
  });
}); 