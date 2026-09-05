import assert from "node:assert/strict";
import { test } from "node:test";
import { observeSceneActivity } from "../src/lib/scene-performance.js";

function environment() {
  const timers = new Map();
  const listeners = new Map();
  const documentListeners = new Map();
  let sequence = 0;
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
    setTimeout: (callback) => { timers.set(++sequence, callback); return sequence; },
    clearTimeout: (id) => timers.delete(id),
    IntersectionObserver: class {
      constructor(callback) { intersection = callback; }
      observe() {}
      disconnect() { disconnected = true; }
    },
  };

  return {
    env,
    timers,
    listeners,
    documentListeners,
    isDisconnected: () => disconnected,
    intersect: (isIntersecting) => intersection([{ isIntersecting }]),
    scroll: () => listeners.get("scroll")?.(),
    visibility: (state) => {
      env.document.visibilityState = state;
      documentListeners.get("visibilitychange")?.();
    },
    resume: () => {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
  };
}

test("offscreen and hidden interactive sections pause during scrolling", () => {
  const harness = environment();
  const states = [];
  const dispose = observeSceneActivity({}, (active) => states.push(active), harness.env);

  assert.deepEqual(states, [false]);
  harness.intersect(true);
  for (let index = 0; index < 50; index += 1) harness.scroll();
  assert.deepEqual(states, [false, true, false]);
  assert.equal(harness.timers.size, 1);

  harness.resume();
  harness.visibility("hidden");
  harness.scroll();
  assert.equal(harness.timers.size, 0);

  harness.visibility("visible");
  harness.intersect(false);
  dispose();
  assert.equal(harness.isDisconnected(), true);
  assert.equal(harness.listeners.size, 0);
  assert.equal(harness.documentListeners.size, 0);
});

test("pending scroll work cannot reactivate an offscreen section", () => {
  const harness = environment();
  const states = [];
  const dispose = observeSceneActivity({}, (active) => states.push(active), harness.env);

  harness.intersect(true);
  harness.scroll();
  harness.intersect(false);
  harness.resume();

  assert.deepEqual(states, [false, true, false]);
  dispose();
  assert.equal(harness.timers.size, 0);
});
