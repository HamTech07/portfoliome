import assert from "node:assert/strict";
import { test } from "node:test";
import { projects } from "../src/data/portfolio.js";

test("portfolio includes the public Caloverse direct APK download", () => {
  assert.equal(projects.length, 5);

  const caloverse = projects.find(({ id }) => id === "caloverse");
  const viewUrl = "https://drive.google.com/file/d/1t2m_4luq1fK0l0W_Eza-j6SX6ar-EgQT/view?usp=drive_link";

  assert.ok(caloverse);
  assert.equal(caloverse.category, "Mobile App");
  assert.equal(caloverse.url, viewUrl);
  assert.equal(caloverse.downloadName, "caloverse-image-fixed.apk");
  assert.match(caloverse.downloadUrl, /^https:\/\/drive\.usercontent\.google\.com\/download\?/);
  assert.match(caloverse.downloadUrl, /1t2m_4luq1fK0l0W_Eza-j6SX6ar-EgQT/);
});

test("portfolio includes the AI Agile live automation preview", () => {
  const aiAgile = projects.find(({ id }) => id === "ai-agile");
  assert.ok(aiAgile);
  assert.equal(aiAgile.category, "AI Automation");
  assert.equal(aiAgile.url, "https://ai-agile-ochre.vercel.app/");
  assert.equal(aiAgile.liveLabel, "Live preview");
});
