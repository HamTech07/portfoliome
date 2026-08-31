import assert from "node:assert/strict";
import { test } from "node:test";
import { IcosahedronGeometry, TorusGeometry, TorusKnotGeometry } from "three";
import { observeSceneActivity, sceneQuality, startFrameLoop } from "../src/lib/scene-performance.js";

function environment() {
  let sequence = 0;
  const frames = new Map();
  const timers = new Map();
  const listeners = new Map();
  const documentListeners = new Map();
  let intersection;
  let disconnected = false;
  const env = {
    document: {
      visibilityState: "visible",
      addEventListener: (name, callback) => documentListeners.set(name, callback),
      removeEventListener: (name) => documentListeners.delete(name),
    },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    requestAnimationFrame: (callback) => { frames.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: (callback) => { timers.set(++sequence, callback); return sequence; },
    clearTimeout: (id) => timers.delete(id),
    IntersectionObserver: class {
      constructor(callback) { intersection = callback; }
      observe() {}
      disconnect() { disconnected = true; }
    },
  };
  return {
    env, frames, timers, listeners, documentListeners,
    isDisconnected: () => disconnected,
    intersect: (isIntersecting) => intersection([{ isIntersecting }]),
    scroll: () => listeners.get("scroll")?.(),
    visibility: (state) => {
      env.document.visibilityState = state;
      documentListeners.get("visibilitychange")?.();
    },
    frame: (timestamp) => {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(timestamp));
    },
    resume: () => {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
  };
}

for (const fps of [30, 60]) {
  test(fps + "fps budget is respected on a 120Hz display and stops cleanly", () => {
    const harness = environment();
    let renders = 0;
    const stop = startFrameLoop(() => renders++, fps, harness.env);
    for (let frame = 0; frame <= 120; frame++) harness.frame(frame * 1000 / 120);
    assert.equal(renders, fps + 1);
    const queuedFrame = [...harness.frames.values()][0];
    stop();
    assert.equal(harness.frames.size, 0);
    queuedFrame(2000);
    assert.equal(renders, fps + 1);
    assert.equal(harness.frames.size, 0);
  });
}

test("hidden/offscreen scenes do no continuous rendering; scroll events coalesce", () => {
  const harness = environment();
  const states = [];
  let stopLoop = () => {};
  const dispose = observeSceneActivity({}, (active) => {
    states.push(active);
    stopLoop();
    stopLoop = active ? startFrameLoop(() => {}, 60, harness.env) : () => {};
  }, harness.env);
  assert.deepEqual(states, [false]);
  assert.equal(harness.frames.size, 0);
  harness.intersect(true);
  assert.equal(harness.frames.size, 1);
  for (let i = 0; i < 50; i++) harness.scroll();
  assert.deepEqual(states, [false, true, false]);
  assert.equal(harness.frames.size, 0);
  assert.equal(harness.timers.size, 1);
  harness.resume();
  assert.equal(harness.frames.size, 1);
  harness.visibility("hidden");
  assert.equal(harness.frames.size, 0);
  harness.scroll();
  assert.equal(harness.timers.size, 0);
  harness.visibility("visible");
  assert.equal(harness.frames.size, 1);
  harness.intersect(false);
  assert.equal(harness.frames.size, 0);
  dispose();
  stopLoop();
  assert.equal(harness.isDisconnected(), true);
  assert.equal(harness.listeners.size, 0);
  assert.equal(harness.documentListeners.size, 0);
  assert.equal(harness.timers.size, 0);
});

test("scroll timeout cannot restart a scene after it leaves the viewport", () => {
  const harness = environment();
  const states = [];
  const dispose = observeSceneActivity({}, (active) => states.push(active), harness.env);
  harness.intersect(true);
  harness.scroll();
  harness.intersect(false);
  harness.resume();
  assert.deepEqual(states, [false, true, false]);
  harness.intersect(true);
  harness.scroll();
  dispose();
  assert.equal(harness.timers.size, 0);
});

function triangles(geometry) {
  const count = (geometry.index?.count ?? geometry.attributes.position.count) / 3;
  geometry.dispose();
  return count;
}

function sceneTriangles(knotSegments, tubeSegments, ringSegments, ringTube, detail) {
  return triangles(new TorusKnotGeometry(1.05, 0.29, knotSegments, tubeSegments))
    + 2 * triangles(new TorusGeometry(1.08, 0.018, ringTube, ringSegments))
    + triangles(new IcosahedronGeometry(1, detail))
    + 3 * triangles(new IcosahedronGeometry(0.2, 0));
}

test("desktop and phone geometry/pixel budgets remain below the original scene", (context) => {
  const original = sceneTriangles(220, 32, 160, 12, 5);
  for (const compact of [false, true]) {
    const quality = sceneQuality(compact);
    const current = sceneTriangles(quality.knotSegments, quality.tubeSegments, quality.ringSegments, 6, 2);
    assert.ok(current < original * 0.3, "at least 70% fewer triangles");
    assert.ok(quality.dpr <= (compact ? 1 : 1.25));
    context.diagnostic((compact ? "Phone" : "Desktop") + ": " + current + " triangles vs " + original + "; DPR " + quality.dpr + ", cap " + quality.fps + "fps");
  }
});
