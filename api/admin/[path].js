import { createClient } from "@supabase/supabase-js";
import { createGoogleAuth } from "../../server/google-auth.js";
import { validateSite } from "../../server/content-store.js";

function send(response, status, body) {
  response.status(status).setHeader("Cache-Control", "no-store").json(body);
}

function userClient(token) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function readBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  try { return JSON.parse(request.body || "{}"); }
  catch { throw Object.assign(new Error("Invalid JSON."), { status: 400 }); }
}

export default async function handler(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  const path = Array.isArray(request.query.path) ? request.query.path[0] : request.query.path;
  const auth = createGoogleAuth(process.env);
  try {
    if (path === "config" && request.method === "GET") return send(response, 200, auth.config());
    const actor = await auth.verify(request);
    if (path === "session" && request.method === "GET") {
      const { token: _token, ...profile } = actor || {};
      return send(response, 200, { authenticated: Boolean(actor), user: actor ? profile : null });
    }
    if (!actor) return send(response, 401, { error: "Sign in with an authorized Google account." });
    if (path === "members") {
      if (actor.role !== "owner") return send(response, 403, { error: "Only the owner can manage admins." });
      if (request.method === "GET") return send(response, 200, { members: await auth.members(actor) });
      if (["POST", "DELETE"].includes(request.method)) {
        const input = readBody(request);
        const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw Object.assign(new Error("Enter a valid Google-account email."), { status: 400 });
        return send(response, 200, { members: await auth.members(actor, request.method === "POST" ? "add" : "remove", email) });
      }
    }
    if (path === "content" && request.method === "PUT") {
      const input = readBody(request);
      const revision = Number(input.revision);
      if (!Number.isSafeInteger(revision) || revision < 0) throw Object.assign(new Error("Invalid content revision."), { status: 400 });
      const content = validateSite(input);
      const { data, error } = await userClient(actor.token).rpc("portfolio_admin_save_content", { new_content: content, expected_revision: revision });
      if (error) {
        const conflict = /changed in another tab/i.test(error.message);
        throw Object.assign(new Error(conflict ? error.message : "Could not publish content to Supabase."), { status: conflict ? 409 : 500 });
      }
      return send(response, 200, data);
    }
    return send(response, 404, { error: "Not found." });
  } catch (error) {
    return send(response, error.status || 500, { error: error.status ? error.message : "Admin request failed." });
  }
}
