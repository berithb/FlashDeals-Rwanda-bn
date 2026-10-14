import swaggerJSDoc from 'swagger-jsdoc';

const port = process.env.PORT || 5000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',

    info: {
      title: 'FlashDeal Rwanda API',
      version: '1.0.0',
      description:
        'REST API documentation for the FlashDeal Rwanda e-commerce platform.',
    },

    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local development server',
      },
    ],

    tags: [
      {
        name: 'System',
        description: 'API status and health-check endpoints',
      },
      {
        name: 'Authentication',
        description: 'Customer and seller authentication',
      },
      {
        name: 'Customers',
        description: 'Customer-protected endpoints',
      },
      {
        name: 'Sellers',
        description: 'Seller-protected endpoints',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter the JWT token returned by the login or registration endpoint',
        },
      },

      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '68cfa3e0daa8e03ad9c93e71',
            },
            fullName: {
              type: 'string',
              example: 'Aline Uwase',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'aline@example.com',
            },
            phone: {
              type: 'string',
              nullable: true,
              example: '0788000000',
            },
            role: {
              type: 'string',
              enum: ['customer', 'seller'],
              example: 'customer',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: {
              type: 'string',
              minLength: 2,
              maxLength: 80,
              example: 'Aline Uwase',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'aline@example.com',
            },
            phone: {
              type: 'string',
              nullable: true,
              example: '0788000000',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'Password123',
            },
            role: {
              type: 'string',
              enum: ['customer', 'seller'],
              default: 'customer',
              example: 'customer',
            },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'aline@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Password123',
            },
          },
        },

        AuthenticationData: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },

        AuthenticationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              $ref: '#/components/schemas/AuthenticationData',
            },
          },
        },

        CurrentUserResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },

        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Request completed successfully',
            },
          },
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
          },
        },

        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Password must contain at least 8 characters'],
            },
          },
        },
      },

      responses: {
        UnauthorizedError: {
          description: 'Authentication is required or the token is invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Authentication token is required',
              },
            },
          },
        },

        ForbiddenError: {
          description: 'The authenticated user does not have permission',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'This action requires one of these roles: seller',
              },
            },
          },
        },

        ServerError: {
          description: 'Unexpected server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'An unexpected server error occurred',
              },
            },
          },
        },
      },
    },
  },

  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
