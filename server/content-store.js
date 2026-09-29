import { mkdir, readFile, writeFile, rename, copyFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { defaultSite } from "../src/data/site.js";
function fail(message) { throw Object.assign(new Error(message), { status: 400 }); }
function text(value, max = 4000) {
  if (typeof value !== "string" || value.length > max) fail(`Text must be at most ${max} characters.`);
  return value.trim();
}
function url(value, allowLocal = true) {
  const result = text(value, 2000);
  if (!result) return "";
  if (allowLocal && /^\/(?!\/)[a-zA-Z0-9/_ .%-]+$/.test(result) && !result.includes("..")) return result;
  try { if (new URL(result).protocol === "https:") return result; } catch { /* validated below */ }
  fail("Links must use https:// or a local file path.");
}
function strings(input, fields) {
  if (!input || typeof input !== "object") fail("A content section is missing.");
  return Object.fromEntries(fields.map((field) => [field, text(input[field])]));
}
function list(input, max = 20) {
  if (!Array.isArray(input) || input.length > max) fail(`Use at most ${max} items.`);
  return input.map((item) => text(item, 200)).filter(Boolean);
}
export function validateSite(input) {
  if (!input || typeof input !== "object") fail("Invalid site content.");
  const profile = strings(input.profile, Object.keys(defaultSite.profile));
  if (!profile.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) fail("A name and valid email are required.");
  for (const key of ["github", "upwork", "fiverr"]) profile[key] = url(profile[key], false);
  profile.portrait = url(profile.portrait);
  if (!Array.isArray(input.projects) || input.projects.length > 100) fail("Use at most 100 projects.");
  const ids = new Set();
  const projects = input.projects.map((project, index) => {
    const id = text(project.id, 100);
    if (!/^[a-z0-9-]+$/.test(id) || ids.has(id)) fail("Each project needs a unique lowercase ID.");
    ids.add(id);
    const title = text(project.title, 150);
    if (!title) fail("Every project needs a title.");
    const result = { id, number: String(index + 1).padStart(2, "0"), title,
      ...strings(project, ["category", "description", "role", "challenge", "solution"]),
      url: url(project.url), downloadUrl: url(project.downloadUrl || ""), image: url(project.image || ""),
      downloadName: text(project.downloadName || "", 200), domain: text(project.domain || "Android APK", 200),
      liveLabel: text(project.liveLabel || "Live website", 100),
      tags: list(project.tags), highlights: list(project.highlights),
      accent: ["cyan", "violet", "pink", "orange"].includes(project.accent) ? project.accent : "cyan",
    };
    if (!result.url && !result.downloadUrl) fail(`${title} needs a website or download link.`);
    return result;
  });
  if (!Array.isArray(input.capabilities) || input.capabilities.length !== defaultSite.capabilities.length) fail("Keep the five capability sections.");
  const capabilities = defaultSite.capabilities.map((original) => {
    const item = input.capabilities.find((value) => value.key === original.key);
    if (!item) fail("A capability section is missing.");
    return { key: original.key, ...strings(item, ["title", "eyebrow", "description"]), stack: list(item.stack), image: url(item.image), accent: ["cyan", "violet", "pink", "orange"].includes(item.accent) ? item.accent : "cyan" };
  });
  const appearance = input.appearance;
  if (!appearance || !/^#[0-9a-fA-F]{6}$/.test(appearance.accent)) fail("Choose a valid accent color.");
  return {
    profile, projects, capabilities,
    ...Object.fromEntries(["hero", "about", "contact", "headings"].map((section) => [section, strings(input[section], Object.keys(defaultSite[section]))])),
    appearance: { background: Boolean(appearance.background), motion: Boolean(appearance.motion), assistant: Boolean(appearance.assistant), theme: appearance.theme === "light" ? "light" : "dark", accent: appearance.accent },
  };
}
export async function createContentStore(directory) {
  const root = resolve(directory);
  await mkdir(join(root, "media"), { recursive: true });
  const contentFile = join(root, "content.json");
  let content;
  try { content = JSON.parse(await readFile(contentFile, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; content = structuredClone(defaultSite); }
  let queue = Promise.resolve();
  function serialize(task) { const next = queue.then(task); queue = next.catch(() => {}); return next; }
  return {
    root,
    read: () => structuredClone(content),
    save: (input) => serialize(async () => {
      if (input.revision !== content.revision) throw Object.assign(new Error("Content changed in another tab. Reload before saving."), { status: 409 });
      const next = { ...validateSite(input), revision: content.revision + 1 };
      await copyFile(contentFile, join(root, "content.previous.json")).catch((error) => { if (error.code !== "ENOENT") throw error; });
      await writeFile(`${contentFile}.tmp`, JSON.stringify(next, null, 2));
      await rename(`${contentFile}.tmp`, contentFile);
      content = next;
      return structuredClone(content);
    }),
  };
}
