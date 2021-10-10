import { loadServerConfig } from "./config.ts";
import { runServer } from "./server.ts";

runServer(
  loadServerConfig(Deno.args),
);
