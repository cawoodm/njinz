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

Deno.test("Exact prefix", async () => expect("/ping", toReturn, "Pong!"));
Deno.test("Deep prefix", async () => expect("/ping/foo", toReturn, "Pong!"));
Deno.test("Exact equals", async () => expect("/pingo", toReturn, "Pongo!"));
Deno.test("Reqular expression", async () => expect("/ui/foo", toReturn, "UI!"));
// TODO: Expect /ui/foo to deliver "UI!"
// TODO: Expect / to deliver *Welcome!*
// TODO: Expect /pingo/foo to deliver 404

async function expect(
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
