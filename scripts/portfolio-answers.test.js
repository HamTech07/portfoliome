import assert from "node:assert/strict";
import { test } from "node:test";
import { portfolioAnswer } from "../src/lib/portfolio-answers.js";
import { projects } from "../src/data/portfolio.js";

test("saved mobile answers include both Android download destinations", () => {
  const answer = portfolioAnswer("Show me his mobile work");
  assert.match(answer, /Rock AI Detective/);
  assert.match(answer, /\/downloads\/rock-ai-detective.apk/);
  assert.match(answer, /Caloverse/);
  assert.doesNotMatch(answer, /Juna Store/);
});

test("project answers are sourced from the complete catalog", () => {
  const answer = portfolioAnswer("Show all projects");
  for (const project of projects) assert.ok(answer.includes(project.title));
  assert.match(portfolioAnswer("Techora Pakistan"), /https:\/\/techorapakistan.com\//);
});

test("unknown requests and prices do not invent portfolio claims", () => {
  assert.match(portfolioAnswer("What is the weather?"), /contact Hamdan/i);
  assert.match(portfolioAnswer("What does hiring cost?"), /pricing through Upwork or Fiverr/);
});
