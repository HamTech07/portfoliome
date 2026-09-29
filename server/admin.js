import { randomUUID } from "node:crypto";
import { createGoogleAuth } from "./google-auth.js";
import { createReadStream, createWriteStream } from "node:fs";
import { stat, unlink, rename } from "node:fs/promises";
import { join, extname, resolve, sep } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".apk": "application/vnd.android.package-archive", ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
function json(response, status, body) { response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }); response.end(JSON.stringify(body)); }
async function body(request) {
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > 1024 * 1024) throw Object.assign(new Error("Request is too large."), { status: 413 }); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw Object.assign(new Error("Invalid JSON."), { status: 400 }); }
}
export async function serveFile(request, response, root, pathname, fallback = false) {
  if (!["GET", "HEAD"].includes(request.method)) return false;
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return false; }
  let file = resolve(root, `.${decoded}`);
  if (!file.startsWith(resolve(root) + sep)) return false;
  let info = await stat(file).catch(() => null);
  if ((!info || !info.isFile()) && fallback && !extname(decoded)) { file = join(root, "index.html"); info = await stat(file).catch(() => null); }
  if (!info?.isFile()) return false;
  const extension = extname(file);
  response.writeHead(200, { "Content-Type": TYPES[extension] || "application/octet-stream", "Content-Length": info.size, "X-Content-Type-Options": "nosniff", ...(extension === ".apk" ? { "Content-Disposition": 'attachment; filename="rock-ai-download.apk"' } : {}), "Cache-Control": "no-cache" });
  if (request.method === "HEAD") response.end(); else createReadStream(file).on("error", () => response.destroy()).pipe(response);
  return true;
}
export function createAdminHandler(store, env = process.env, auth = createGoogleAuth(env)) {
  const configured = (env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const allowed = new Set(["http://127.0.0.1:5173", "http://localhost:5173", `http://127.0.0.1:${env.PORT || 8787}`, `http://localhost:${env.PORT || 8787}`, ...configured]);
  return async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/api/site" && request.method === "GET") { json(response, 200, store.read()); return true; }
    if (url.pathname.startsWith("/media/")) {
      if (!await serveFile(request, response, join(store.root, "media"), url.pathname.slice(6))) json(response, 404, { error: "File not found." });
      return true;
    }
    if (!url.pathname.startsWith("/api/admin/")) return false;
    const origin = request.headers.origin;
    if ((origin && !allowed.has(origin)) || (!["GET", "HEAD"].includes(request.method) && !origin)) { json(response, 403, { error: "This origin is not allowed. Configure ALLOWED_ORIGINS for your website." }); return true; }
    try {
      if (url.pathname === "/api/admin/config" && request.method === "GET") { json(response, 200, auth.config()); return true; }
      if (["/api/admin/login", "/api/admin/password"].includes(url.pathname)) { json(response, 410, { error: "Password login has been removed. Sign in with your authorized Google account." }); return true; }
      const actor = await auth.verify(request);
      if (url.pathname === "/api/admin/session" && request.method === "GET") {
        const { token: _token, ...profile } = actor || {};
        json(response, 200, { authenticated: Boolean(actor), user: actor ? profile : null }); return true;
      }
      if (!actor) { json(response, 401, { error: "Sign in with an authorized Google account." }); return true; }
      if (url.pathname === "/api/admin/members") {
        if (actor.role !== "owner") { json(response, 403, { error: "Only the owner can manage admins." }); return true; }
        if (request.method === "GET") { json(response, 200, { members: await auth.members(actor) }); return true; }
        if (["POST", "DELETE"].includes(request.method)) {
          const data = await body(request);
          const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw Object.assign(new Error("Enter a valid Google-account email."), { status: 400 });
          json(response, 200, { members: await auth.members(actor, request.method === "POST" ? "add" : "remove", email) }); return true;
        }
      }
      if (url.pathname === "/api/admin/content" && request.method === "PUT") { json(response, 200, await store.save(await body(request))); return true; }
      if (url.pathname === "/api/admin/upload" && request.method === "POST") {
        const extension = extname(url.searchParams.get("name") || "").toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp", ".apk"].includes(extension)) throw Object.assign(new Error("Upload a JPG, PNG, WebP or APK file."), { status: 400 });
        const maximum = extension === ".apk" ? 160 * 1024 * 1024 : 8 * 1024 * 1024;
        if (Number(request.headers["content-length"]) > maximum) throw Object.assign(new Error("File is too large."), { status: 413 });
        const filename = `${randomUUID()}${extension}`;
        const temporary = join(store.root, "media", `${filename}.tmp`);
        let size = 0; let signature = Buffer.alloc(0);
        const limiter = new Transform({ transform(chunk, encoding, done) {
          size += chunk.length;
          if (signature.length < 12) signature = Buffer.concat([signature, chunk]).subarray(0, 12);
          done(size > maximum ? Object.assign(new Error("File is too large."), { status: 413 }) : null, chunk);
        } });
        try {
          await pipeline(request, limiter, createWriteStream(temporary, { flags: "wx" }));
          const valid = extension === ".apk" ? signature.subarray(0, 4).equals(Buffer.from([80,75,3,4])) : extension === ".png" ? signature.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : extension === ".webp" ? signature.toString("ascii", 0, 4) === "RIFF" && signature.toString("ascii", 8, 12) === "WEBP" : signature[0] === 255 && signature[1] === 216 && signature[2] === 255;
          if (!valid) throw Object.assign(new Error("File contents do not match its extension."), { status: 400 });
          await rename(temporary, join(store.root, "media", filename));
          json(response, 201, { url: `/media/${filename}`, size });
        } catch (error) { await unlink(temporary).catch(() => {}); throw error; }
        return true;
      }
      json(response, 404, { error: "Not found." });
    } catch (error) { if (!response.destroyed) json(response, error.status || 500, { error: error.status ? error.message : "Could not save your changes. Check server storage." }); }
    return true;
  };
}
