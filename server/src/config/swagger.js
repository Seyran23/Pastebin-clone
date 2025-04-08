const swaggerJSDoc = require("swagger-jsdoc");
const { API_URL } = require("../utils/enviromentVariables");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pastebin Clone API",
      version: "1.0.0",
      description: "API documentation for your Pastebin Clone project",
    },
    servers: [
      {
        url: API_URL, 
      },
    ],
  },
  apis: ["./src/modules/**/*.js"], 
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
