// Run dev webserver with hot reload
const p = Deno.run({
  cmd: [
    "denon",
    "run",
    "-A",
    "src/webserver.ts",
  ],
});
await p.status();
