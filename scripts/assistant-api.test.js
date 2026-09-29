import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { createAssistantServer, extractResponseText } from "../server/app.js";

async function withServer(options, callback) {
  const server = createAssistantServer(options);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("assistant health check and missing-key state are explicit", async () => {
  await withServer({ env: {} }, async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });

    const chat = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://127.0.0.1:5173" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
    });
    assert.equal(chat.status, 200);
    const answer = await chat.json();
    assert.equal(answer.mode, "portfolio");
    assert.match(answer.message, /portfolio/);
  });
});

test("assistant uses the Gemini free-tier model through the server-only key", async () => {
  let upstreamRequest;
  const fetchImpl = async (url, options) => {
    upstreamRequest = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Hamdan builds web and mobile products." }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  await withServer({ env: { GEMINI_API_KEY: "test-key", GEMINI_MODEL: "test-model" }, fetchImpl }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
      body: JSON.stringify({ messages: [{ role: "user", content: "What does Hamdan build?" }] }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Hamdan builds web and mobile products." });
    assert.equal(upstreamRequest.url, "https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent");
    assert.equal(upstreamRequest.options.headers["x-goog-api-key"], "test-key");
    assert.match(upstreamRequest.body.system_instruction.parts[0].text, /portfolio assistant/i);
    assert.equal(upstreamRequest.body.contents.at(-1).parts[0].text, "What does Hamdan build?");
    assert.equal(upstreamRequest.body.generationConfig.maxOutputTokens, 350);
  });
});

test("assistant rejects browser origins outside the allow-list", async () => {
  await withServer({ env: { GEMINI_API_KEY: "test-key" }, fetchImpl: () => { throw new Error("must not call upstream"); } }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://malicious.example" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
    });
    assert.equal(response.status, 403);
  });
});

test("Gemini response parser joins text parts", () => {
  assert.equal(extractResponseText({ candidates: [{ content: { parts: [{ text: " Direct" }, { text: " answer " }] } }] }), "Direct answer");
  assert.equal(extractResponseText({ candidates: [] }), "");
});

test("assistant enforces the configurable daily free-tier safety cap", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Available" }] } }] }), { status: 200 });
  await withServer({ env: { GEMINI_API_KEY: "test-key", MAX_DAILY_REQUESTS: "1" }, fetchImpl, now: () => 1000 }, async (baseUrl) => {
    const request = () => fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
    });
    assert.equal((await request()).status, 200);
    assert.equal((await request()).status, 429);
  });
});
