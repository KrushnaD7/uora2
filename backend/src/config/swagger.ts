import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDocument = YAML.load("./src/docs/swagger.yaml");

export { swaggerUi, swaggerDocument };