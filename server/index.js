import { createAssistantServer } from "./app.js";

const port = Number(process.env.PORT) || 8787;
const server = createAssistantServer();

server.listen(port, "0.0.0.0", () => {
  console.log(`Portfolio assistant listening on port ${port}`);
});
