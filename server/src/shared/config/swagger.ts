// src/shared/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WePlay API',
      version: '1.0.0',
      description: 'WePlay Social Gaming Platform REST API',
    },
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/presentation/http/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
