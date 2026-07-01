import fs from "fs";
import path from "path";
import { swaggerSpec } from "./swagger.js";

// Génère le fichier api-docs.json à partir des annotations Swagger des routes.
const outPath = path.join(process.cwd(), "api-docs.json");
fs.writeFileSync(outPath, JSON.stringify(swaggerSpec, null, 2), "utf-8");

const paths = Object.keys(swaggerSpec.paths || {}).length;
console.log(`api-docs.json généré : ${outPath} (${paths} chemins)`);
