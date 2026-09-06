import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";
import { capabilities, techStack } from "../src/data/portfolio.js";
import { angleAtTime, createOrbitController, normalizeAngle, orbitLayout, ORBIT_DURATION } from "../src/lib/stack-orbit.js";

function createElement() {
  const animations = [];
  const element = {
    style: {},
    animate(keyframes, options) {
      const animation = { currentTime: 0, canceled: false, cancel() { this.canceled = true; } };
      animations.push({ keyframes, options, animation });
      return animation;
    },
  };
  return { element, animations };
}

test("autoplay uses one transform-only compositor animation and preserves its angle when paused", () => {
  const { element, animations } = createElement();
  const orbit = createOrbitController(element);
  orbit.play();
  orbit.play();
  assert.equal(animations.length, 1);
  assert.deepEqual(Object.keys(animations[0].keyframes[0]), ["transform"]);
  assert.equal(animations[0].options.duration, ORBIT_DURATION);
  assert.equal(animations[0].options.iterations, Infinity);
  animations[0].animation.currentTime = ORBIT_DURATION / 4;
  assert.equal(orbit.getAngle(), 270);
  orbit.pause();
  assert.equal(animations[0].animation.canceled, true);
  assert.equal(element.style.transform, "rotateY(270deg)");
  orbit.play();
  assert.equal(animations[1].keyframes[0].transform, "rotateY(270deg)");
  orbit.dispose();
  assert.equal(animations[1].animation.canceled, true);
});

test("manual dragging and arrow steps wrap through a full 360 degrees in either direction", () => {
  const { element, animations } = createElement();
  const orbit = createOrbitController(element);
  const { step } = orbitLayout(techStack.length);
  orbit.play();
  orbit.setAngle(750);
  assert.equal(orbit.getAngle(), 30);
  assert.equal(animations[0].animation.canceled, true);
  orbit.setAngle(-750);
  assert.equal(orbit.getAngle(), 330);
  orbit.setAngle(0);
  for (let i = 0; i < techStack.length; i++) orbit.rotateBy(step);
  assert.ok(Math.abs(orbit.getAngle()) < 0.0001 || Math.abs(orbit.getAngle() - 360) < 0.0001);
  orbit.setAngle(0);
  for (let i = 0; i < techStack.length; i++) orbit.rotateBy(-step);
  assert.ok(Math.abs(orbit.getAngle()) < 0.0001 || Math.abs(orbit.getAngle() - 360) < 0.0001);
  orbit.setAngle(0);
  assert.equal(element.style.transform, "rotateY(0deg)");
  assert.equal(animations.length, 1, "manual input never starts an extra animation");
});

test("arrow navigation animates the whole rotor and can resume autoplay", () => {
  const { element, animations } = createElement();
  const orbit = createOrbitController(element);
  let resumed = false;

  orbit.play();
  orbit.stepBy(orbitLayout(techStack.length).step, () => { resumed = true; });

  assert.equal(animations.length, 2);
  assert.deepEqual(Object.keys(animations[1].keyframes[0]), ["transform"]);
  assert.equal(animations[1].options.duration, 460);
  assert.equal(animations[1].options.fill, "forwards");
  animations[1].animation.onfinish();
  assert.equal(resumed, true);
  assert.match(element.style.transform, /^rotateY\(/);
});

test("the connected ring closes and remains numerically stable over long sessions", () => {
  const layout = orbitLayout(14);
  assert.equal(layout.step * 14, 360);
  assert.ok(layout.chord > 0 && layout.depth > 0);
  assert.equal(angleAtTime(0, ORBIT_DURATION * 400 + ORBIT_DURATION / 2), 180);
  assert.equal(normalizeAngle(-1080), 0);
  assert.equal(angleAtTime(75, null), 75);
});

test("manual rotation still works if the Web Animations API is unavailable", () => {
  const element = { style: {} };
  const orbit = createOrbitController(element);
  assert.doesNotThrow(() => orbit.play());
  orbit.rotateBy(-90);
  assert.equal(element.style.transform, "rotateY(270deg)");
  orbit.dispose();
});

test("all 14 technologies use local brand SVGs including n8n and Grok AI", async () => {
  assert.equal(techStack.length, 14);
  assert.equal(new Set(techStack.map((technology) => technology.name)).size, 14);
  assert.ok(techStack.some((technology) => technology.name === "n8n"));
  assert.ok(techStack.some((technology) => technology.name === "Grok AI"));
  let size = 0;
  for (const logo of new Set(techStack.map((technology) => technology.logo))) {
    const svg = await readFile(new URL("../public/logos/" + logo + ".svg", import.meta.url), "utf8");
    assert.match(svg, /<svg[\s>]/);
    assert.doesNotMatch(svg, /<script|\bonload=|\bonerror=/i);
    size += Buffer.byteLength(svg);
  }
  assert.ok(size < 30000, "brand assets should remain below 30 KB combined");
});

test("all five capability cards have local WebP backgrounds below the image budget", async (context) => {
  assert.equal(capabilities.length, 5);
  assert.ok(capabilities.some((capability) => capability.key === "automation"));
  let total = 0;
  for (const capability of capabilities) {
    const path = new URL("../public" + capability.image, import.meta.url);
    const buffer = await readFile(path);
    assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
    assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
    total += (await stat(path)).size;
  }
  assert.ok(total < 200000, "five photos must stay below 200 KB combined");
  context.diagnostic("Five service photos: " + total + " bytes total");
});
