import { createServer } from "node:http";
import { resolve } from "node:path";
import { createAssistantHandler } from "./app.js";
import { createContentStore } from "./content-store.js";
import { createAdminHandler, serveFile } from "./admin.js";

const port = Number(process.env.PORT) || 8787;
const store = await createContentStore(process.env.DATA_DIR || ".portfolio-data");
const admin = createAdminHandler(store);
const assistant = createAssistantHandler({ getSite: store.read });
const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  try {
    if (await admin(request, response)) return;
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname.startsWith("/api/") || pathname === "/health") return assistant(request, response);
    if (await serveFile(request, response, resolve("dist"), pathname === "/" ? "/index.html" : pathname, true)) return;
    response.writeHead(404); response.end("Not found. Run npm run build to serve the website.");
  } catch { if (!response.headersSent) response.writeHead(500); response.end("Server error."); }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Portfolio assistant listening on port ${port}`);
});
