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
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Entrez votre token JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

// npm install swagger-jsdoc swagger-ui-express
