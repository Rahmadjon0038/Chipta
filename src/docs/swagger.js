const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel Ticket API',
      version: '1.0.0',
      description: 'Online chipta sotib olish uchun demo backend API'
    },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Ro\'yxatdan o\'tish',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phone: { type: 'string' },
                    password: { type: 'string' }
                  },
                  required: ['firstName', 'lastName', 'phone', 'password']
                }
              }
            }
          },
          responses: {
            201: { description: 'Created' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    phone: { type: 'string' },
                    password: { type: 'string' }
                  },
                  required: ['phone', 'password']
                }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Access tokenni yangilash',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: { type: 'string' }
                  },
                  required: ['refreshToken']
                }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: { type: 'string' }
                  },
                  required: ['refreshToken']
                }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/tickets': {
        get: {
          tags: ['Tickets'],
          summary: 'Barcha chiptalarni olish (public)',
          responses: { 200: { description: 'OK' } }
        },
        post: {
          tags: ['Admin Tickets'],
          summary: 'Yangi chipta qo\'shish (admin)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/tickets/{id}': {
        get: {
          tags: ['Tickets'],
          summary: 'ID bo\'yicha chipta detail (public)',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: { 200: { description: 'OK' }, 404: { description: 'Not Found' } }
        },
        patch: {
          tags: ['Admin Tickets'],
          summary: 'Chipta yangilash (admin)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' } }
        },
        delete: {
          tags: ['Admin Tickets'],
          summary: 'Chipta o\'chirish (admin)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Profil ma\'lumotlari',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' } }
        }
      },
      '/api/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Mening savatcham',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' } }
        },
        post: {
          tags: ['Cart'],
          summary: 'Savatchaga qo\'shish',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/cart/{id}': {
        patch: {
          tags: ['Cart'],
          summary: 'Savatcha elementini yangilash',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' } }
        },
        delete: {
          tags: ['Cart'],
          summary: 'Savatchadan o\'chirish',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' } }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJSDoc(options);
