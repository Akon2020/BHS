import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { HOST_URL } from "./config/env.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BurningHeart API",
      version: "1.0.0",
      description: "Documentation de l'API BurningHeart",
    },
    servers: [{ url: HOST_URL }],
    components: {
      securitySchemes: {
        // Keep both naming variants to match existing annotations across routes.
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Entrez uniquement le JWT (sans le préfixe Bearer)",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Entrez uniquement le JWT (sans le préfixe Bearer)",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "Cookie token (optionnel)",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );
};

// npm install swagger-jsdoc swagger-ui-express
