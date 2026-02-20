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
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        image: { type: 'string' },
                        fromCity: { type: 'string' },
                        toCity: { type: 'string' },
                        price: { type: 'string' },
                        class: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        flightDate: { type: 'string', example: '2026-03-15' },
                        flightTime: { type: 'string', example: '14:30' },
                        flightWeekday: { type: 'string', nullable: true, example: 'Yakshanba' },
                        createdAt: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Admin Tickets'],
          summary: 'Yangi chipta qo\'shish (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', example: 'https://example.com/ticket.jpg' },
                    fromCity: { type: 'string', example: 'Toshkent' },
                    toCity: { type: 'string', example: 'Samarqand' },
                    price: { type: 'string', example: '250000 so\'m' },
                    class: { type: 'string', example: 'Business' },
                    flightDate: { type: 'string', example: '2026-03-15' },
                    flightTime: { type: 'string', example: '14:30' },
                    description: { type: 'string', nullable: true, example: 'Tezkor poyezd chiptasi' }
                  },
                  required: ['image', 'fromCity', 'toCity', 'price', 'class', 'flightDate', 'flightTime']
                }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/api/tickets/{id}': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        get: {
          tags: ['Tickets'],
          summary: 'ID bo\'yicha chipta batafsil ma\'lumotlari (public)',
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      image: { type: 'string' },
                      fromCity: { type: 'string' },
                      toCity: { type: 'string' },
                      price: { type: 'string' },
                      class: { type: 'string' },
                      description: { type: 'string', nullable: true },
                      flightDate: { type: 'string', example: '2026-03-15' },
                      flightTime: { type: 'string', example: '14:30' },
                      flightWeekday: { type: 'string', nullable: true, example: 'Yakshanba' },
                      createdAt: { type: 'string' },
                      cartItemsCount: { type: 'integer' },
                      cartTotalQuantity: { type: 'integer' }
                    }
                  }
                }
              }
            },
            404: { description: 'Not Found' }
          }
        },
        patch: {
          tags: ['Admin Tickets'],
          summary: 'Chipta yangilash (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', example: 'https://example.com/ticket.jpg' },
                    fromCity: { type: 'string', example: 'Toshkent' },
                    toCity: { type: 'string', example: 'Buxoro' },
                    price: { type: 'string', example: '300000 so\'m' },
                    class: { type: 'string', example: 'Economy' },
                    flightDate: { type: 'string', example: '2026-03-20' },
                    flightTime: { type: 'string', example: '09:45' },
                    description: { type: 'string', nullable: true, example: 'Yangilangan tarif' }
                  }
                }
              }
            }
          },
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
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ticketId: { type: 'integer', example: 1 },
                    quantity: { type: 'integer', example: 2 }
                  },
                  required: ['ticketId']
                }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        },
        delete: {
          tags: ['Cart'],
          summary: 'Savatchadan o\'chirish',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ticketId: { type: 'integer', example: 1 }
                  },
                  required: ['ticketId']
                }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJSDoc(options);
