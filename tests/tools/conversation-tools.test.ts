/**
 * Unit Tests for Conversation Tools
 * Tests all 7 messaging and conversation MCP tools
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ConversationTools } from '../../src/tools/conversation-tools.js';
import { MockGHLApiClient, mockConversation, mockMessage } from '../mocks/ghl-api-client.mock.js';

describe('ConversationTools', () => {
  let conversationTools: ConversationTools;
  let mockGhlClient: MockGHLApiClient;

  beforeEach(() => {
    mockGhlClient = new MockGHLApiClient();
    conversationTools = new ConversationTools(mockGhlClient as any);
  });

  describe('getToolDefinitions', () => {
    it('should return 7 conversation tool definitions', () => {
      const tools = conversationTools.getToolDefinitions();
      expect(tools).toHaveLength(7);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toEqual([
        'send_sms',
        'send_email',
        'search_conversations',
        'get_conversation',
        'create_conversation',
        'update_conversation',
        'get_recent_messages'
      ]);
    });

    it('should have proper schema definitions for all tools', () => {
      const tools = conversationTools.getToolDefinitions();
      
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
      const sendSmsSpy = jest.spyOn(conversationTools as any, 'sendSMS');
      const sendEmailSpy = jest.spyOn(conversationTools as any, 'sendEmail');

      await conversationTools.executeTool('send_sms', { 
        contactId: 'contact_123', 
        message: 'Test SMS' 
      });
      await conversationTools.executeTool('send_email', { 
        contactId: 'contact_123', 
        subject: 'Test Email' 
      });

      expect(sendSmsSpy).toHaveBeenCalledWith({ 
        contactId: 'contact_123', 
        message: 'Test SMS' 
      });
      expect(sendEmailSpy).toHaveBeenCalledWith({ 
        contactId: 'contact_123', 
        subject: 'Test Email' 
      });
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        conversationTools.executeTool('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('send_sms', () => {
    it('should send SMS successfully', async () => {
      const smsData = {
        contactId: 'contact_123',
        message: 'Hello from ChatGPT!'
      };

      const result = await conversationTools.executeTool('send_sms', smsData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.conversationId).toBeDefined();
      expect(result.message).toContain('SMS sent successfully');
    });

    it('should send SMS with custom from number', async () => {
      const spy = jest.spyOn(mockGhlClient, 'sendSMS');
      
      await conversationTools.executeTool('send_sms', {
        contactId: 'contact_123',
        message: 'Test message',
        fromNumber: '+1-555-000-0000'
      });

      expect(spy).toHaveBeenCalledWith('contact_123', 'Test message', '+1-555-000-0000');
    });

    it('should handle SMS sending errors', async () => {
      const mockError = new Error('GHL API Error (400): Invalid phone number');
      jest.spyOn(mockGhlClient, 'sendSMS').mockRejectedValueOnce(mockError);

      await expect(
        conversationTools.executeTool('send_sms', {
          contactId: 'contact_123',
          message: 'Test message'
        })
      ).rejects.toThrow('Failed to send SMS');
    });
  });

  describe('send_email', () => {
    it('should send email successfully', async () => {
      const emailData = {
        contactId: 'contact_123',
        subject: 'Test Email',
        message: 'This is a test email'
      };

      const result = await conversationTools.executeTool('send_email', emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.conversationId).toBeDefined();
      expect(result.emailMessageId).toBeDefined();
      expect(result.message).toContain('Email sent successfully');
    });

    it('should send email with HTML content', async () => {
      const spy = jest.spyOn(mockGhlClient, 'sendEmail');
      
      await conversationTools.executeTool('send_email', {
        contactId: 'contact_123',
        subject: 'HTML Email',
        html: '<h1>Hello World</h1>'
      });

      expect(spy).toHaveBeenCalledWith(
        'contact_123',
        'HTML Email',
        undefined,
        '<h1>Hello World</h1>',
        {}
      );
    });

    it('should send email with CC and BCC', async () => {
      const spy = jest.spyOn(mockGhlClient, 'sendEmail');
      
      await conversationTools.executeTool('send_email', {
        contactId: 'contact_123',
        subject: 'Test Subject',
        message: 'Test message',
        emailCc: ['cc@example.com'],
        emailBcc: ['bcc@example.com']
      });

      expect(spy).toHaveBeenCalledWith(
        'contact_123',
        'Test Subject',
        'Test message',
        undefined,
        expect.objectContaining({
          emailCc: ['cc@example.com'],
          emailBcc: ['bcc@example.com']
        })
      );
    });

    it('should handle email sending errors', async () => {
      const mockError = new Error('GHL API Error (400): Invalid email address');
      jest.spyOn(mockGhlClient, 'sendEmail').mockRejectedValueOnce(mockError);

      await expect(
        conversationTools.executeTool('send_email', {
          contactId: 'contact_123',
          subject: 'Test Subject'
        })
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('search_conversations', () => {
    it('should search conversations successfully', async () => {
      const searchParams = {
        contactId: 'contact_123',
        limit: 10
      };

      const result = await conversationTools.executeTool('search_conversations', searchParams);

      expect(result.success).toBe(true);
      expect(result.conversations).toBeDefined();
      expect(Array.isArray(result.conversations)).toBe(true);
      expect(result.total).toBeDefined();
      expect(result.message).toContain('Found');
    });

    it('should use default limit and status', async () => {
      const spy = jest.spyOn(mockGhlClient, 'searchConversations');
      
      await conversationTools.executeTool('search_conversations', {});

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'all',
          limit: 20
        })
      );
    });

    it('should handle search with filters', async () => {
      const result = await conversationTools.executeTool('search_conversations', {
        query: 'test query',
        status: 'unread',
        assignedTo: 'user_123'
      });

      expect(result.success).toBe(true);
      expect(result.conversations).toBeDefined();
    });
  });

  describe('get_conversation', () => {
    it('should get conversation with messages successfully', async () => {
      const result = await conversationTools.executeTool('get_conversation', {
        conversationId: 'conv_123'
      });

      expect(result.success).toBe(true);
      expect(result.conversation).toBeDefined();
      expect(result.messages).toBeDefined();
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.hasMoreMessages).toBeDefined();
    });

    it('should use default message limit', async () => {
      const spy = jest.spyOn(mockGhlClient, 'getConversationMessages');
      
      await conversationTools.executeTool('get_conversation', {
        conversationId: 'conv_123'
      });

      expect(spy).toHaveBeenCalledWith('conv_123', { limit: 20 });
    });

    it('should filter by message types', async () => {
      const spy = jest.spyOn(mockGhlClient, 'getConversationMessages');
      
      await conversationTools.executeTool('get_conversation', {
        conversationId: 'conv_123',
        messageTypes: ['TYPE_SMS', 'TYPE_EMAIL']
      });

      expect(spy).toHaveBeenCalledWith('conv_123', {
        limit: 20,
        type: 'TYPE_SMS,TYPE_EMAIL'
      });
    });
  });

  describe('create_conversation', () => {
    it('should create conversation successfully', async () => {
      const result = await conversationTools.executeTool('create_conversation', {
        contactId: 'contact_123'
      });

      expect(result.success).toBe(true);
      expect(result.conversationId).toBeDefined();
      expect(result.message).toContain('Conversation created successfully');
    });

    it('should include location ID in request', async () => {
      const spy = jest.spyOn(mockGhlClient, 'createConversation');
      
      await conversationTools.executeTool('create_conversation', {
        contactId: 'contact_123'
      });

      expect(spy).toHaveBeenCalledWith({
        locationId: 'test_location_123',
        contactId: 'contact_123'
      });
    });
  });

  describe('update_conversation', () => {
    it('should update conversation successfully', async () => {
      const result = await conversationTools.executeTool('update_conversation', {
        conversationId: 'conv_123',
        starred: true,
        unreadCount: 0
      });

      expect(result.success).toBe(true);
      expect(result.conversation).toBeDefined();
      expect(result.message).toBe('Conversation updated successfully');
    });

    it('should handle partial updates', async () => {
      const spy = jest.spyOn(mockGhlClient, 'updateConversation');
      
      await conversationTools.executeTool('update_conversation', {
        conversationId: 'conv_123',
        starred: true
      });

      expect(spy).toHaveBeenCalledWith('conv_123', {
        locationId: 'test_location_123',
        starred: true,
        unreadCount: undefined
      });
    });
  });

  describe('get_recent_messages', () => {
    it('should get recent messages successfully', async () => {
      const result = await conversationTools.executeTool('get_recent_messages', {});

      expect(result.success).toBe(true);
      expect(result.conversations).toBeDefined();
      expect(Array.isArray(result.conversations)).toBe(true);
      expect(result.message).toContain('Retrieved');
    });

    it('should use default parameters', async () => {
      const spy = jest.spyOn(mockGhlClient, 'searchConversations');
      
      await conversationTools.executeTool('get_recent_messages', {});

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          status: 'unread',
          sortBy: 'last_message_date',
          sort: 'desc'
        })
      );
    });

    it('should handle custom parameters', async () => {
      const result = await conversationTools.executeTool('get_recent_messages', {
        limit: 5,
        status: 'all'
      });

      expect(result.success).toBe(true);
      expect(result.conversations).toBeDefined();
    });

    it('should format conversation data correctly', async () => {
      const result = await conversationTools.executeTool('get_recent_messages', {});

      expect(result.conversations[0]).toEqual(
        expect.objectContaining({
          conversationId: expect.any(String),
          contactName: expect.any(String),
          lastMessageBody: expect.any(String),
          unreadCount: expect.any(Number)
        })
      );
    });
  });

  describe('error handling', () => {
    it('should propagate API client errors', async () => {
      const mockError = new Error('Network timeout');
      jest.spyOn(mockGhlClient, 'sendSMS').mockRejectedValueOnce(mockError);

      await expect(
        conversationTools.executeTool('send_sms', {
          contactId: 'contact_123',
          message: 'test'
        })
      ).rejects.toThrow('Failed to send SMS: Error: Network timeout');
    });

    it('should handle conversation not found', async () => {
      const mockError = new Error('GHL API Error (404): Conversation not found');
      jest.spyOn(mockGhlClient, 'getConversation').mockRejectedValueOnce(mockError);

      await expect(
        conversationTools.executeTool('get_conversation', {
          conversationId: 'not_found'
        })
      ).rejects.toThrow('Failed to get conversation');
    });
  });

  describe('input validation', () => {
    it('should validate SMS message length', () => {
      const tools = conversationTools.getToolDefinitions();
      const sendSmsTool = tools.find(tool => tool.name === 'send_sms');
      
      expect(sendSmsTool?.inputSchema.properties.message.maxLength).toBe(1600);
    });

    it('should validate required fields', () => {
      const tools = conversationTools.getToolDefinitions();
      const sendSmsTool = tools.find(tool => tool.name === 'send_sms');
      const sendEmailTool = tools.find(tool => tool.name === 'send_email');
      
      expect(sendSmsTool?.inputSchema.required).toEqual(['contactId', 'message']);
      expect(sendEmailTool?.inputSchema.required).toEqual(['contactId', 'subject']);
    });

    it('should validate email format', () => {
      const tools = conversationTools.getToolDefinitions();
      const sendEmailTool = tools.find(tool => tool.name === 'send_email');
      
      expect(sendEmailTool?.inputSchema.properties.emailFrom.format).toBe('email');
    });
  });
}); 