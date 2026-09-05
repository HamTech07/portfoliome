import assert from "node:assert/strict";
import { test } from "node:test";
import { projects } from "../src/data/portfolio.js";

test("portfolio includes the public Caloverse download folder", () => {
  assert.equal(projects.length, 4);

  const caloverse = projects.find(({ id }) => id === "caloverse");
  const folderUrl =
    "https://drive.google.com/drive/folders/16d8ICzhwzMAsGgWNza-G3SeoLjOug-E0?usp=sharing";

  assert.ok(caloverse);
  assert.equal(caloverse.category, "Mobile App");
  assert.equal(caloverse.url, folderUrl);
  assert.equal(caloverse.downloadUrl, folderUrl);
});