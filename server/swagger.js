const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LAPOR API',
      version: '1.0.0',
      description: 'API untuk aplikasi pelaporan kerusakan jalan',
      contact: {
        name: 'LAPOR Team',
        email: 'support@lapor.id'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.lapor.id',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            }
          }
        },
        Report: {
          type: 'object',
          required: ['description', 'latitude', 'longitude', 'photo'],
          properties: {
            _id: {
              type: 'string',
              description: 'Report ID'
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              description: 'Description of the road damage'
            },
            photo: {
              type: 'string',
              description: 'Photo filename'
            },
            location: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point'],
                  default: 'Point'
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  minItems: 2,
                  maxItems: 2,
                  description: 'Longitude and latitude coordinates [lng, lat]'
                }
              }
            },
            address: {
              type: 'string',
              description: 'Human-readable address'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'resolved', 'rejected'],
              default: 'pending',
              description: 'Report status'
            },
            user: {
              type: 'string',
              description: 'User ID who created the report'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Report creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Report last update date'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string'
                  },
                  value: {
                    type: 'string'
                  },
                  msg: {
                    type: 'string'
                  },
                  path: {
                    type: 'string'
                  },
                  location: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};