import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createContentStore, validateSite } from "../server/content-store.js";
import { createAdminHandler } from "../server/admin.js";
import { defaultSite } from "../src/data/site.js";

function fakeGoogleAuth() {
  const owner = { userId: "owner-id", email: "hamdanamir2005@gmail.com", name: "Owner", avatar: "https://lh3.googleusercontent.com/owner", role: "owner", token: "owner-token" };
  const admins = new Set(["admin@example.com"]);
  const list = () => [
    { email: owner.email, name: owner.name, avatar: owner.avatar, role: "owner" },
    ...[...admins].sort().map((email) => ({ email, name: null, avatar: null, role: "admin" })),
  ];
  return {
    config: () => ({ configured: true, ownerEmail: owner.email, url: "https://project.supabase.co", publishableKey: "test-key" }),
    async verify(request) {
      const token = /^Bearer (\S+)$/.exec(request.headers.authorization || "")?.[1];
      if (token === owner.token) return owner;
      if (token === "admin-token" && admins.has("admin@example.com")) return { userId: "admin-id", email: "admin@example.com", role: "admin", token };
      return null;
    },
    async members(actor, action = "list", email) {
      if (actor.role !== "owner") throw Object.assign(new Error("Only the owner can manage admins."), { status: 403 });
      if (action === "add") admins.add(email);
      if (action === "remove") admins.delete(email);
      return list();
    },
  };
}

test("Google admin auth protects publishing, membership and uploads", async () => {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-admin-test-"));
  const store = await createContentStore(directory);
  const handler = createAdminHandler(store, {}, fakeGoogleAuth());
  const server = createServer(async (request, response) => { if (!await handler(request, response)) { response.writeHead(404); response.end(); } });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const common = { "Content-Type": "application/json", Origin: "http://localhost:5173" };
  const ownerHeaders = { ...common, Authorization: "Bearer owner-token" };
  try {
    const content = await (await fetch(`${base}/api/site`)).json();
    assert.equal(content.projects.length, 7);
    assert.equal((await fetch(`${base}/api/admin/config`, { headers: common })).status, 200);
    assert.equal((await fetch(`${base}/api/admin/content`, { method: "PUT", headers: common, body: JSON.stringify(content) })).status, 401);
    assert.equal((await fetch(`${base}/api/admin/login`, { method: "POST", headers: common })).status, 410);
    assert.equal((await fetch(`${base}/api/admin/content`, { method: "PUT", headers: { ...ownerHeaders, Origin: "https://evil.example" }, body: JSON.stringify(content) })).status, 403);
    const session = await (await fetch(`${base}/api/admin/session`, { headers: ownerHeaders })).json();
    assert.equal(session.authenticated, true); assert.equal(session.user.role, "owner"); assert.equal(session.user.token, undefined);
    const added = await (await fetch(`${base}/api/admin/members`, { method: "POST", headers: ownerHeaders, body: JSON.stringify({ email: "new-admin@example.com" }) })).json();
    assert.equal(added.members.some((member) => member.email === "new-admin@example.com"), true);
    assert.equal((await fetch(`${base}/api/admin/members`, { headers: { ...common, Authorization: "Bearer admin-token" } })).status, 403);
    assert.equal((await fetch(`${base}/api/admin/members`, { method: "DELETE", headers: ownerHeaders, body: JSON.stringify({ email: "admin@example.com" }) })).status, 200);
    const revoked = await (await fetch(`${base}/api/admin/session`, { headers: { ...common, Authorization: "Bearer admin-token" } })).json();
    assert.equal(revoked.authenticated, false);
    content.hero.title = "Updated from Google admin";
    content.projects.push({ ...content.projects[0], id: "test-project", title: "Test project" });
    const save = await fetch(`${base}/api/admin/content`, { method: "PUT", headers: ownerHeaders, body: JSON.stringify(content) });
    assert.equal(save.status, 200);
    const saved = await save.json(); assert.equal(saved.revision, 1); assert.equal(saved.projects.length, 8);
    assert.equal((await createContentStore(directory)).read().hero.title, "Updated from Google admin");
    assert.equal((await fetch(`${base}/api/admin/content`, { method: "PUT", headers: ownerHeaders, body: JSON.stringify(content) })).status, 409);
    const bad = structuredClone(saved); bad.projects[0].url = "javascript:alert(1)";
    assert.equal((await fetch(`${base}/api/admin/content`, { method: "PUT", headers: ownerHeaders, body: JSON.stringify(bad) })).status, 400);
    const upload = await fetch(`${base}/api/admin/upload?name=test.png`, { method: "POST", headers: { Origin: common.Origin, Authorization: "Bearer owner-token" }, body: Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]) });
    assert.equal(upload.status, 201); const media = await upload.json();
    const file = await fetch(base + media.url); assert.equal(file.status, 200); assert.equal(file.headers.get("content-type"), "image/png");
    assert.equal((await fetch(`${base}/api/admin/upload?name=bad.png`, { method: "POST", headers: { Origin: common.Origin, Authorization: "Bearer owner-token" }, body: "<html>no</html>" })).status, 400);
  } finally { server.close(); server.closeAllConnections(); await once(server, "close"); await rm(directory, { recursive: true, force: true }); }
});

test("Supabase setup keeps roles private and protects the exact owner", async () => {
  const sql = await readFile(new URL("../supabase/setup.sql", import.meta.url), "utf8");
  assert.match(sql, /hamdanamir2005@gmail\.com/);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /force row level security/i);
  assert.match(sql, /revoke all on portfolio_private\.admin_members from public, anon, authenticated/i);
  assert.match(sql, /auth\.sessions/);
  assert.match(sql, /provider = 'google'/);
  assert.doesNotMatch(sql, /raw_user_meta_data|service_role/i);
});

test("content validation accepts defaults and blocks duplicate IDs and unsafe file paths", () => {
  assert.equal(validateSite(defaultSite).projects.length, 7);
  const duplicate = structuredClone(defaultSite); duplicate.projects.push(duplicate.projects[0]);
  assert.throws(() => validateSite(duplicate), /unique/);
  const unsafe = structuredClone(defaultSite); unsafe.profile.portrait = "//evil.example/a.png";
  assert.throws(() => validateSite(unsafe), /https/);
});
