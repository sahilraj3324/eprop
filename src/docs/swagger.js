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
            user_type: {
              type: 'string',
              enum: ['buyer', 'seller', 'agent', 'admin'],
              default: 'buyer',
              example: 'buyer',
              description: 'Type of user account',
            },
            is_verified: {
              type: 'boolean',
              default: false,
              example: false,
              description: 'Whether the user account is verified',
            },
            is_aadhar_verified: {
              type: 'boolean',
              default: false,
              example: false,
              description: 'Whether the user Aadhar is verified',
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
        ResidentialProperty: {
          type: 'object',
          required: ['looking_for', 'name', 'city', 'property_type', 'location', 'locality', 'bhk_rk', 'build_up_area', 'cost', 'user'],
          properties: {
            looking_for: {
              type: 'string',
              enum: ['rent', 'sale', 'lease'],
              example: 'rent',
              description: 'What the property is listed for',
            },
            name: {
              type: 'string',
              example: 'Luxury 3BHK Apartment in Prime Location',
              description: 'Property name/title',
            },
            city: {
              type: 'string',
              example: 'Mumbai',
              description: 'City where property is located',
            },
            property_type: {
              type: 'string',
              enum: ['apartment', 'villa', 'independent_house', 'builder_floor', 'penthouse', 'studio_apartment'],
              example: 'apartment',
              description: 'Type of residential property',
            },
            location: {
              type: 'string',
              example: 'Andheri West',
              description: 'Broad location/area',
            },
            locality: {
              type: 'string',
              example: 'Versova',
              description: 'Specific locality/neighborhood',
            },
            bhk_rk: {
              type: 'string',
              enum: ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', '5+BHK'],
              example: '3BHK',
              description: 'Bedroom/Hall/Kitchen configuration',
            },
            build_up_area: {
              type: 'number',
              example: 1200,
              minimum: 0,
              description: 'Built-up area of the property',
            },
            area_unit: {
              type: 'string',
              enum: ['sqft', 'sqm', 'sqyd'],
              default: 'sqft',
              example: 'sqft',
              description: 'Unit of measurement for area',
            },
            flat_furnishings: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'sofa', 'bed', 'wardrobe', 'dining_table', 'chairs', 'tv', 'refrigerator',
                  'washing_machine', 'microwave', 'ac', 'geyser', 'cooler', 'study_table',
                  'bookshelf', 'curtains', 'light_fittings', 'modular_kitchen', 'water_purifier'
                ],
              },
              example: ['sofa', 'bed', 'wardrobe', 'ac', 'refrigerator'],
              description: 'List of furnishings available in the flat',
            },
            society_amenities: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'swimming_pool', 'gym', 'garden', 'children_play_area', 'club_house',
                  'parking', 'security', 'elevator', 'power_backup', 'water_supply',
                  'waste_management', 'intercom', 'fire_safety', 'cctv', 'visitor_parking',
                  'jogging_track', 'tennis_court', 'badminton_court', 'basketball_court'
                ],
              },
              example: ['swimming_pool', 'gym', 'parking', 'security', 'elevator'],
              description: 'List of amenities available in the society',
            },
            rent: {
              type: 'number',
              minimum: 0,
              example: 35000,
              description: 'Monthly rent (applicable for rent listings)',
            },
            available_from: {
              type: 'string',
              format: 'date',
              example: '2024-02-01',
              description: 'Date from when property is available',
            },
            cost: {
              type: 'number',
              minimum: 0,
              example: 75000000,
              description: 'Total cost/price of the property',
            },
            commission: {
              type: 'number',
              minimum: 0,
              default: 0,
              example: 50000,
              description: 'Commission amount',
            },
            put_on_top: {
              type: 'boolean',
              default: false,
              example: false,
              description: 'Whether to put this property on top of listings',
            },
            descriptions: {
              type: 'string',
              example: 'Beautiful 3BHK apartment with all modern amenities in prime location. Well-ventilated rooms with ample natural light.',
              description: 'Detailed description of the property',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              example: [
                'https://example.com/property1.jpg',
                'https://example.com/property2.jpg',
                'https://example.com/property3.jpg'
              ],
              description: 'Array of property image URLs',
            },
            user: {
              type: 'string',
              description: 'User ID (ObjectId) of the property owner',
              example: '64f123abc456def789012345',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'rented', 'sold'],
              default: 'active',
              example: 'active',
              description: 'Current status of the property listing',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Property creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Property last update timestamp',
            },
          },
        },
        CommercialProperty: {
          type: 'object',
          required: ['looking_to', 'property_type', 'your_name', 'city', 'location', 'locality', 'possession_status', 'build_up_area', 'ownership', 'cost', 'user'],
          properties: {
            looking_to: {
              type: 'string',
              enum: ['rent', 'sale', 'lease'],
              example: 'rent',
              description: 'What the property is listed for',
            },
            property_type: {
              type: 'string',
              example: 'office_space',
              description: 'Type of commercial property (office, retail, warehouse, etc.)',
            },
            your_name: {
              type: 'string',
              example: 'Premium Office Complex',
              description: 'Name/title of the property',
            },
            city: {
              type: 'string',
              example: 'Mumbai',
              description: 'City where property is located',
            },
            location: {
              type: 'string',
              example: 'Bandra Kurla Complex',
              description: 'Broad location/area',
            },
            locality: {
              type: 'string',
              example: 'BKC',
              description: 'Specific locality/neighborhood',
            },
            possession_status: {
              type: 'string',
              enum: ['ready_to_move', 'under_construction', 'new_launch'],
              example: 'ready_to_move',
              description: 'Current possession status of the property',
            },
            location_hub: {
              type: 'string',
              example: 'Financial District',
              description: 'Business hub or commercial area description',
            },
            build_up_area: {
              type: 'number',
              example: 2500,
              minimum: 0,
              description: 'Built-up area of the property',
            },
            build_up_area_unit: {
              type: 'string',
              enum: ['sqft', 'sqm', 'sqyd'],
              default: 'sqft',
              example: 'sqft',
              description: 'Unit of measurement for built-up area',
            },
            carpet_area: {
              type: 'number',
              example: 2000,
              minimum: 0,
              description: 'Carpet area of the property',
            },
            carpet_area_unit: {
              type: 'string',
              enum: ['sqft', 'sqm', 'sqyd'],
              default: 'sqft',
              example: 'sqft',
              description: 'Unit of measurement for carpet area',
            },
            ownership: {
              type: 'string',
              enum: ['freehold', 'leasehold', 'co_operative_society', 'power_of_attorney'],
              example: 'freehold',
              description: 'Type of property ownership',
            },
            total_floor: {
              type: 'number',
              minimum: 1,
              example: 25,
              description: 'Total number of floors in the building',
            },
            your_floor: {
              type: 'number',
              minimum: 0,
              example: 15,
              description: 'Floor number of this property',
            },
            put_on_top: {
              type: 'boolean',
              default: false,
              example: false,
              description: 'Whether to put this property on top of listings',
            },
            monthly_rent: {
              type: 'number',
              minimum: 0,
              example: 150000,
              description: 'Monthly rent (applicable for rent listings)',
            },
            available_from: {
              type: 'string',
              format: 'date',
              example: '2024-02-01',
              description: 'Date from when property is available',
            },
            cost: {
              type: 'number',
              minimum: 0,
              example: 50000000,
              description: 'Total cost/price of the property',
            },
            commission: {
              type: 'number',
              minimum: 0,
              default: 0,
              example: 100000,
              description: 'Commission amount',
            },
            description: {
              type: 'string',
              example: 'Premium office space in prime business district with modern amenities and excellent connectivity.',
              description: 'Detailed description of the property',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              example: [
                'https://example.com/office1.jpg',
                'https://example.com/office2.jpg',
                'https://example.com/office3.jpg'
              ],
              description: 'Array of property image URLs',
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['parking', 'elevator', 'security', 'power_backup', 'cafeteria'],
              description: 'List of amenities available with the property',
            },
            user: {
              type: 'string',
              description: 'User ID (ObjectId) of the property owner',
              example: '64f123abc456def789012345',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'rented', 'sold'],
              default: 'active',
              example: 'active',
              description: 'Current status of the property listing',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Property creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Property last update timestamp',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // path to the API docs
};

module.exports = swaggerJsdoc(options); 