const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Website API',
      version: '1.0.0',
      description: 'API documentation for Property Website backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'phoneNumber', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
            },
            address: {
              type: 'string',
              example: '456 Oak Street, Central City',
            },
            phoneNumber: {
              type: 'string',
              example: '+919876543210',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              default: 'active',
              example: 'active',
            },
            profilePic: {
              type: 'string',
              format: 'uri',
              description: 'URL of profile picture',
              example: 'https://example.com/profile.jpg',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'mypassword123',
            },
          },
        },
        Property: {
          type: 'object',
          required: ['title', 'price', 'address', 'user'],
          properties: {
            title: {
              type: 'string',
              example: 'Beautiful 3BHK Apartment',
            },
            description: {
              type: 'string',
              example: 'Spacious apartment with modern amenities',
            },
            price: {
              type: 'number',
              example: 50000,
            },
            address: {
              type: 'string',
              example: '123 Main Street, Downtown',
            },
            city: {
              type: 'string',
              example: 'Mumbai',
            },
            state: {
              type: 'string',
              example: 'Maharashtra',
            },
            country: {
              type: 'string',
              example: 'India',
            },
            propertyType: {
              type: 'string',
              enum: ['apartment', 'house', 'villa', 'plot', 'commercial', 'other'],
              example: 'apartment',
            },
            bedrooms: {
              type: 'integer',
              example: 3,
            },
            bathrooms: {
              type: 'integer',
              example: 2,
            },
            area: {
              type: 'number',
              example: 1200,
              description: 'Area in square feet',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
            },
            user: {
              type: 'string',
              description: 'User ID (ObjectId)',
              example: '64f123abc456def789012345',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // path to the API docs
};

module.exports = swaggerJsdoc(options); 