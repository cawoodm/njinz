import {
  assertEquals,
  assertMatch,
  fail,
} from "https://deno.land/std@0.110.0/testing/asserts.ts";
// import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";

const PORT = parseInt(Deno.env.get("DEBUG_PORT_OVERRIDE") || "0", 10) || 8889;
const toReturn = 200;
const chalk = {
  red: (msg: string) => "\x1b[31m" + msg + "\x1b[0m",
  green: (msg: string) => "\x1b[32m" + msg + "\x1b[0m",
};
let it = Deno.test;

it("Exact prefix", should("/ping", toReturn, "Pong!"));
it("Deep prefix", should("/ping/foo", toReturn, "Pong!"));
it("Exact equals", should("/pingo", toReturn, "Pongo!"));
it("Reqular expression", should("/ui/foo", toReturn, "UI!"));
it("Fixed welcome", should("/welcome", toReturn, "<h1>Welcome.*<h1>"));
it("Serve index", should("/static/foo/", toReturn, ".*Foo!.*"));
it("404", should("/favicon.ico", 404, ""));

function should(
  path: string,
  status: number,
  content: string,
) {
  return () => go(path, status, content);
}

async function go(
  path: string,
  status: number,
  content: string,
) {
  console.log(2);
  let res, text;
  try {
    res = await fetch(`http://localhost:${PORT}${path}`);
    if (status) {
      assertEquals(
        res.status,
        status,
        `Status '${status}' does not match received '${res.status}'!`,
      );
    }
    text = await res.text();
    if (content) {
      assertMatch(
        text,
        new RegExp(content),
        `Content '${content}' does not match received '${
          text?.substring(0, 50)
        }'!`,
      );
    }
  } catch (e) {
    fail(e.message);
  }
}
