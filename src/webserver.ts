import { loadServerConfig } from "./config.ts";
import { runServer } from "./server.ts";
import { Logger } from "./logger.ts";

runServer(
  await loadServerConfig(Deno.args),
  new Logger(),
);
