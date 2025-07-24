/**
 * Unit Tests for Blog Tools
 * Tests all 7 blog management MCP tools
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BlogTools } from '../../src/tools/blog-tools.js';
import { MockGHLApiClient, mockBlogPost, mockBlogSite, mockBlogAuthor, mockBlogCategory } from '../mocks/ghl-api-client.mock.js';

describe('BlogTools', () => {
  let blogTools: BlogTools;
  let mockGhlClient: MockGHLApiClient;

  beforeEach(() => {
    mockGhlClient = new MockGHLApiClient();
    blogTools = new BlogTools(mockGhlClient as any);
  });

  describe('getToolDefinitions', () => {
    it('should return 7 blog tool definitions', () => {
      const tools = blogTools.getToolDefinitions();
      expect(tools).toHaveLength(7);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toEqual([
        'create_blog_post',
        'update_blog_post',
        'get_blog_posts',
        'get_blog_sites',
        'get_blog_authors',
        'get_blog_categories',
        'check_url_slug'
      ]);
    });

    it('should have proper schema definitions for all tools', () => {
      const tools = blogTools.getToolDefinitions();
      
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
      const createSpy = jest.spyOn(blogTools as any, 'createBlogPost');
      const getSitesSpy = jest.spyOn(blogTools as any, 'getBlogSites');

      await blogTools.executeTool('create_blog_post', { 
        title: 'Test Post',
        blogId: 'blog_123',
        content: '<h1>Test</h1>',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg',
        imageAltText: 'Test image',
        urlSlug: 'test-post',
        author: 'author_123',
        categories: ['cat_123']
      });
      await blogTools.executeTool('get_blog_sites', {});

      expect(createSpy).toHaveBeenCalled();
      expect(getSitesSpy).toHaveBeenCalled();
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        blogTools.executeTool('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('create_blog_post', () => {
    const validBlogPostData = {
      title: 'Test Blog Post',
      blogId: 'blog_123',
      content: '<h1>Test Content</h1><p>This is a test blog post.</p>',
      description: 'Test blog post description',
      imageUrl: 'https://example.com/test-image.jpg',
      imageAltText: 'Test image alt text',
      urlSlug: 'test-blog-post',
      author: 'author_123',
      categories: ['cat_123', 'cat_456'],
      tags: ['test', 'blog']
    };

    it('should create blog post successfully', async () => {
      const result = await blogTools.executeTool('create_blog_post', validBlogPostData);

      expect(result.success).toBe(true);
      expect(result.blogPost).toBeDefined();
      expect(result.blogPost.title).toBe(validBlogPostData.title);
      expect(result.message).toContain('created successfully');
    });

    it('should set default status to DRAFT if not provided', async () => {
      const spy = jest.spyOn(mockGhlClient, 'createBlogPost');
      
      await blogTools.executeTool('create_blog_post', validBlogPostData);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DRAFT'
        })
      );
    });

    it('should set publishedAt when status is PUBLISHED', async () => {
      const spy = jest.spyOn(mockGhlClient, 'createBlogPost');
      
      await blogTools.executeTool('create_blog_post', {
        ...validBlogPostData,
        status: 'PUBLISHED'
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PUBLISHED',
          publishedAt: expect.any(String)
        })
      );
    });

    it('should use custom publishedAt if provided', async () => {
      const customDate = '2024-06-01T12:00:00.000Z';
      const spy = jest.spyOn(mockGhlClient, 'createBlogPost');
      
      await blogTools.executeTool('create_blog_post', {
        ...validBlogPostData,
        publishedAt: customDate
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          publishedAt: customDate
        })
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('GHL API Error (400): Invalid blog data');
      jest.spyOn(mockGhlClient, 'createBlogPost').mockRejectedValueOnce(mockError);

      await expect(
        blogTools.executeTool('create_blog_post', validBlogPostData)
      ).rejects.toThrow('Failed to create blog post');
    });
  });

  describe('update_blog_post', () => {
    it('should update blog post successfully', async () => {
      const updateData = {
        postId: 'post_123',
        blogId: 'blog_123',
        title: 'Updated Title',
        status: 'PUBLISHED' as const
      };

      const result = await blogTools.executeTool('update_blog_post', updateData);

      expect(result.success).toBe(true);
      expect(result.blogPost).toBeDefined();
      expect(result.message).toBe('Blog post updated successfully');
    });

    it('should handle partial updates', async () => {
      const spy = jest.spyOn(mockGhlClient, 'updateBlogPost');
      
      await blogTools.executeTool('update_blog_post', {
        postId: 'post_123',
        blogId: 'blog_123',
        title: 'New Title'
      });

      expect(spy).toHaveBeenCalledWith('post_123', {
        locationId: 'test_location_123',
        blogId: 'blog_123',
        title: 'New Title'
      });
    });

    it('should include all provided fields', async () => {
      const spy = jest.spyOn(mockGhlClient, 'updateBlogPost');
      
      const updateData = {
        postId: 'post_123',
        blogId: 'blog_123',
        title: 'Updated Title',
        content: '<h1>Updated Content</h1>',
        status: 'PUBLISHED' as const,
        tags: ['updated', 'test']
      };

      await blogTools.executeTool('update_blog_post', updateData);

      expect(spy).toHaveBeenCalledWith('post_123', {
        locationId: 'test_location_123',
        blogId: 'blog_123',
        title: 'Updated Title',
        rawHTML: '<h1>Updated Content</h1>',
        status: 'PUBLISHED',
        tags: ['updated', 'test']
      });
    });
  });

  describe('get_blog_posts', () => {
    it('should get blog posts successfully', async () => {
      const result = await blogTools.executeTool('get_blog_posts', {
        blogId: 'blog_123'
      });

      expect(result.success).toBe(true);
      expect(result.posts).toBeDefined();
      expect(Array.isArray(result.posts)).toBe(true);
      expect(result.count).toBeDefined();
      expect(result.message).toContain('Retrieved');
    });

    it('should use default parameters', async () => {
      const spy = jest.spyOn(mockGhlClient, 'getBlogPosts');
      
      await blogTools.executeTool('get_blog_posts', {
        blogId: 'blog_123'
      });

      expect(spy).toHaveBeenCalledWith({
        locationId: 'test_location_123',
        blogId: 'blog_123',
        limit: 10,
        offset: 0,
        searchTerm: undefined,
        status: undefined
      });
    });

    it('should handle search and filtering', async () => {
      const result = await blogTools.executeTool('get_blog_posts', {
        blogId: 'blog_123',
        limit: 5,
        offset: 10,
        searchTerm: 'test',
        status: 'PUBLISHED'
      });

      expect(result.success).toBe(true);
      expect(result.posts).toBeDefined();
    });
  });

  describe('get_blog_sites', () => {
    it('should get blog sites successfully', async () => {
      const result = await blogTools.executeTool('get_blog_sites', {});

      expect(result.success).toBe(true);
      expect(result.sites).toBeDefined();
      expect(Array.isArray(result.sites)).toBe(true);
      expect(result.count).toBeDefined();
      expect(result.message).toContain('Retrieved');
    });

    it('should use default parameters', async () => {
      const spy = jest.spyOn(mockGhlClient, 'getBlogSites');
      
      await blogTools.executeTool('get_blog_sites', {});

      expect(spy).toHaveBeenCalledWith({
        locationId: 'test_location_123',
        skip: 0,
        limit: 10,
        searchTerm: undefined
      });
    });

    it('should handle custom parameters', async () => {
      const result = await blogTools.executeTool('get_blog_sites', {
        limit: 5,
        skip: 2,
        searchTerm: 'main blog'
      });

      expect(result.success).toBe(true);
      expect(result.sites).toBeDefined();
    });
  });

  describe('get_blog_authors', () => {
    it('should get blog authors successfully', async () => {
      const result = await blogTools.executeTool('get_blog_authors', {});

      expect(result.success).toBe(true);
      expect(result.authors).toBeDefined();
      expect(Array.isArray(result.authors)).toBe(true);
      expect(result.count).toBeDefined();
      expect(result.message).toContain('Retrieved');
    });

    it('should use default parameters', async () => {
      const spy = jest.spyOn(mockGhlClient, 'getBlogAuthors');
      
      await blogTools.executeTool('get_blog_authors', {});

      expect(spy).toHaveBeenCalledWith({
        locationId: 'test_location_123',
        limit: 10,
        offset: 0
      });
    });

    it('should handle custom pagination', async () => {
      const result = await blogTools.executeTool('get_blog_authors', {
        limit: 20,
        offset: 5
      });

      expect(result.success).toBe(true);
      expect(result.authors).toBeDefined();
    });
  });

  describe('get_blog_categories', () => {
    it('should get blog categories successfully', async () => {
      const result = await blogTools.executeTool('get_blog_categories', {});

      expect(result.success).toBe(true);
      expect(result.categories).toBeDefined();
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.count).toBeDefined();
      expect(result.message).toContain('Retrieved');
    });

    it('should use default parameters', async () => {
      const spy = jest.spyOn(mockGhlClient, 'getBlogCategories');
      
      await blogTools.executeTool('get_blog_categories', {});

      expect(spy).toHaveBeenCalledWith({
        locationId: 'test_location_123',
        limit: 10,
        offset: 0
      });
    });

    it('should handle custom pagination', async () => {
      const result = await blogTools.executeTool('get_blog_categories', {
        limit: 15,
        offset: 3
      });

      expect(result.success).toBe(true);
      expect(result.categories).toBeDefined();
    });
  });

  describe('check_url_slug', () => {
    it('should check available URL slug successfully', async () => {
      const result = await blogTools.executeTool('check_url_slug', {
        urlSlug: 'new-blog-post'
      });

      expect(result.success).toBe(true);
      expect(result.urlSlug).toBe('new-blog-post');
      expect(result.exists).toBe(false);
      expect(result.available).toBe(true);
      expect(result.message).toContain('is available');
    });

    it('should detect existing URL slug', async () => {
      const result = await blogTools.executeTool('check_url_slug', {
        urlSlug: 'existing-slug'
      });

      expect(result.success).toBe(true);
      expect(result.urlSlug).toBe('existing-slug');
      expect(result.exists).toBe(true);
      expect(result.available).toBe(false);
      expect(result.message).toContain('is already in use');
    });

    it('should handle post ID exclusion for updates', async () => {
      const spy = jest.spyOn(mockGhlClient, 'checkUrlSlugExists');
      
      await blogTools.executeTool('check_url_slug', {
        urlSlug: 'test-slug',
        postId: 'post_123'
      });

      expect(spy).toHaveBeenCalledWith({
        locationId: 'test_location_123',
        urlSlug: 'test-slug',
        postId: 'post_123'
      });
    });
  });

  describe('error handling', () => {
    it('should propagate API client errors', async () => {
      const mockError = new Error('Network timeout');
      jest.spyOn(mockGhlClient, 'createBlogPost').mockRejectedValueOnce(mockError);

      await expect(
        blogTools.executeTool('create_blog_post', {
          title: 'Test',
          blogId: 'blog_123',
          content: 'content',
          description: 'desc',
          imageUrl: 'url',
          imageAltText: 'alt',
          urlSlug: 'slug',
          author: 'author',
          categories: ['cat']
        })
      ).rejects.toThrow('Failed to create blog post: Error: Network timeout');
    });

    it('should handle blog not found errors', async () => {
      const mockError = new Error('GHL API Error (404): Blog not found');
      jest.spyOn(mockGhlClient, 'getBlogPosts').mockRejectedValueOnce(mockError);

      await expect(
        blogTools.executeTool('get_blog_posts', { blogId: 'not_found' })
      ).rejects.toThrow('Failed to get blog posts');
    });

    it('should handle invalid blog post data', async () => {
      const mockError = new Error('GHL API Error (422): Invalid blog post data');
      jest.spyOn(mockGhlClient, 'updateBlogPost').mockRejectedValueOnce(mockError);

      await expect(
        blogTools.executeTool('update_blog_post', {
          postId: 'post_123',
          blogId: 'blog_123',
          title: ''
        })
      ).rejects.toThrow('Failed to update blog post');
    });
  });

  describe('input validation', () => {
    it('should validate required fields in create_blog_post', () => {
      const tools = blogTools.getToolDefinitions();
      const createTool = tools.find(tool => tool.name === 'create_blog_post');
      
      expect(createTool?.inputSchema.required).toEqual([
        'title', 'blogId', 'content', 'description', 
        'imageUrl', 'imageAltText', 'urlSlug', 'author', 'categories'
      ]);
    });

    it('should validate required fields in update_blog_post', () => {
      const tools = blogTools.getToolDefinitions();
      const updateTool = tools.find(tool => tool.name === 'update_blog_post');
      
      expect(updateTool?.inputSchema.required).toEqual(['postId', 'blogId']);
    });

    it('should validate blog post status enum', () => {
      const tools = blogTools.getToolDefinitions();
      const createTool = tools.find(tool => tool.name === 'create_blog_post');
      
      expect(createTool?.inputSchema.properties.status.enum).toEqual([
        'DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'
      ]);
    });

    it('should validate URL slug requirement', () => {
      const tools = blogTools.getToolDefinitions();
      const checkSlugTool = tools.find(tool => tool.name === 'check_url_slug');
      
      expect(checkSlugTool?.inputSchema.required).toEqual(['urlSlug']);
    });
  });

  describe('data transformation', () => {
    it('should transform content to rawHTML in create request', async () => {
      const spy = jest.spyOn(mockGhlClient, 'createBlogPost');
      
      await blogTools.executeTool('create_blog_post', {
        title: 'Test',
        blogId: 'blog_123',
        content: '<h1>Test Content</h1>',
        description: 'desc',
        imageUrl: 'url',
        imageAltText: 'alt',
        urlSlug: 'slug',
        author: 'author',
        categories: ['cat']
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          rawHTML: '<h1>Test Content</h1>'
        })
      );
    });

    it('should transform content to rawHTML in update request', async () => {
      const spy = jest.spyOn(mockGhlClient, 'updateBlogPost');
      
      await blogTools.executeTool('update_blog_post', {
        postId: 'post_123',
        blogId: 'blog_123',
        content: '<h2>Updated Content</h2>'
      });

      expect(spy).toHaveBeenCalledWith('post_123', 
        expect.objectContaining({
          rawHTML: '<h2>Updated Content</h2>'
        })
      );
    });

    it('should include location ID in all requests', async () => {
      const createSpy = jest.spyOn(mockGhlClient, 'createBlogPost');
      const getSitesSpy = jest.spyOn(mockGhlClient, 'getBlogSites');
      
      await blogTools.executeTool('create_blog_post', {
        title: 'Test',
        blogId: 'blog_123',
        content: 'content',
        description: 'desc',
        imageUrl: 'url',
        imageAltText: 'alt',
        urlSlug: 'slug',
        author: 'author',
        categories: ['cat']
      });
      
      await blogTools.executeTool('get_blog_sites', {});

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          locationId: 'test_location_123'
        })
      );
      
      expect(getSitesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          locationId: 'test_location_123'
        })
      );
    });
  });
}); 