import path from 'node:path';

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pastebin Clone API',
      version: '1.0.0',
      description: 'REST API for the Pastebin Clone application',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ─── Utility ─────────────────────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },

        // ─── Lookup tables ────────────────────────────────────────────────────
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            category_name: { type: 'string' },
          },
        },
        SyntaxHighlight: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            language: { type: 'string' },
          },
        },
        ExpirationTime: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            label: { type: 'string', example: '1 hour' },
            duration: { type: 'integer', nullable: true, description: 'Duration in milliseconds' },
          },
        },

        // ─── User ─────────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
            isActivated: { type: 'boolean' },
            avatar: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        UserStats: {
          type: 'object',
          properties: {
            totalActivePastes: { type: 'integer' },
            publicPastes: { type: 'integer' },
            unlistedPastes: { type: 'integer' },
            privatePastes: { type: 'integer' },
            totalLikes: { type: 'integer' },
          },
        },

        // ─── Auth ─────────────────────────────────────────────────────────────
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },

        // ─── Paste ────────────────────────────────────────────────────────────
        PasteDto: {
          type: 'object',
          description: 'Base paste data returned from create and summary endpoints',
          properties: {
            id: { type: 'string', format: 'uuid' },
            createdBy: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            linkEndpoint: { type: 'string' },
            exposure: { type: 'string', enum: ['public', 'private', 'unlisted'] },
            size: { type: 'integer', description: 'File size in bytes' },
            expirationTime: { type: 'integer', nullable: true, description: 'Unix timestamp ms' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            category: {
              nullable: true,
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
            syntaxHighlight: {
              nullable: true,
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
          },
        },
        PasteInfo: {
          type: 'object',
          description: 'Full paste response returned when viewing a paste',
          properties: {
            pasteData: {
              allOf: [
                { $ref: '#/components/schemas/PasteDto' },
                {
                  type: 'object',
                  properties: {
                    content: { type: 'string', description: 'Full text content from S3' },
                    contentType: { type: 'string', example: 'text/plain' },
                    likes: { type: 'integer' },
                    dislikes: { type: 'integer' },
                  },
                },
              ],
            },
            owner: {
              nullable: true,
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                username: { type: 'string' },
                avatar: { type: 'string', nullable: true },
              },
            },
            remainingTime: {
              type: 'integer',
              nullable: true,
              description: 'Milliseconds until expiry',
            },
            requiresPassword: { type: 'boolean' },
            viewCount: { type: 'integer' },
          },
        },
        ProfilePaste: {
          type: 'object',
          description: 'Paste item shown on a user profile page',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            link: { type: 'string' },
            exposure: { type: 'string', enum: ['public', 'private', 'unlisted'] },
            added: { type: 'string', format: 'date-time' },
            expires: { type: 'integer', nullable: true },
            comments: { type: 'integer' },
            syntax: { type: 'string', nullable: true },
          },
        },
        SearchResult: {
          type: 'object',
          description: 'Single paste item in search results',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            link: { type: 'string' },
            size: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'integer', nullable: true },
            category: { type: 'string', nullable: true },
            syntaxHighlight: { type: 'string', nullable: true },
            author: { type: 'string', nullable: true },
            preview: { type: 'string', nullable: true, description: 'First 300 chars of content' },
            remainingTime: { type: 'integer', nullable: true },
            likes: { type: 'integer' },
          },
        },
        SearchResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/SearchResult' },
            },
            pagination: {
              type: 'object',
              properties: {
                hasNextPage: { type: 'boolean' },
                hasPrevPage: { type: 'boolean' },
                nextCursor: { type: 'string', nullable: true },
                prevCursor: { type: 'string', nullable: true },
                itemsPerPage: { type: 'integer' },
              },
            },
          },
        },
        ArchiveItem: {
          type: 'object',
          description: 'Single paste item in the archive list',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            link: { type: 'string' },
            size: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'integer', nullable: true },
            author: { type: 'string', nullable: true },
            category: { type: 'string', nullable: true },
            syntax: { type: 'string', nullable: true },
          },
        },
        ArchiveResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ArchiveItem' },
            },
            pagination: {
              type: 'object',
              properties: {
                hasNextPage: { type: 'boolean' },
                nextCursor: { type: 'string', nullable: true, format: 'date-time' },
              },
            },
          },
        },

        // ─── Comment ──────────────────────────────────────────────────────────
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            content: { type: 'string' },
            paste_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CommentWithAuthor: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            content: { type: 'string', example: 'Great paste!' },
            createdAt: { type: 'string', format: 'date-time' },
            author: { type: 'string', example: 'john_doe' },
            avatar: { type: 'string', nullable: true, example: 'https://…/avatar.jpg' },
          },
        },

        // ─── Likes ────────────────────────────────────────────────────────────
        LikeStats: {
          type: 'object',
          properties: {
            likes: { type: 'integer' },
            dislikes: { type: 'integer' },
          },
        },
        LikeToggleResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            likedStatus: { type: 'boolean' },
          },
        },

        // ─── Health ───────────────────────────────────────────────────────────
        HealthStatus: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ok', 'degraded'] },
            db: { type: 'string', enum: ['ok', 'error'] },
            redis: { type: 'string', enum: ['ok', 'error'] },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../modules/**/route.ts'),
    path.join(__dirname, '../modules/health/route.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
