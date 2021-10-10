import { loadServerConfig } from "./config.ts";
import { runServer } from "./server.ts";

runServer(
  await loadServerConfig(Deno.args),
);
