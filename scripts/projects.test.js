import assert from "node:assert/strict";
import { test } from "node:test";
import { projects } from "../src/data/portfolio.js";

test("portfolio includes the public Caloverse Android download", () => {
  assert.equal(projects.length, 4);
  const caloverse = projects.find(({ id }) => id === "caloverse");

  assert.ok(caloverse);
  assert.equal(caloverse.category, "Mobile App");
  assert.equal(caloverse.downloadName, "caloverse.apk");
  assert.match(caloverse.downloadUrl, /^https:\/\/drive\.usercontent\.google\.com\/download\?/);
  assert.match(caloverse.downloadUrl, /1v2jXCsqX8c9IbFXfUUNiOPLxvYSaZfYe/);
});
