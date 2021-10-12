import {
  assertEquals,
  assertMatch,
  fail,
} from "https://deno.land/std@0.110.0/testing/asserts.ts";
// import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";

const PORT = 8889;
const toReturn = 200;
const chalk = {
  red: (msg: string) => "\x1b[31m" + msg + "\x1b[0m",
  green: (msg: string) => "\x1b[32m" + msg + "\x1b[0m",
};

//(async () => {
// Expect /ping to deliver "Pong!"
Deno.test("Ping works", async () =>
  expect("/ping", toReturn, "Pong!", "Ping exact"));
Deno.test("Ping works", async () =>
  expect("/ping/foo", toReturn, "Pong!", "Ping deep"));
Deno.test("Pingo works", async () => expect("/pingo", toReturn, "Pongo!", ""));
// TODO: Expect /pingo/foo to deliver 404
// TODO: Expect /ui/foo to deliver "UI!"
// TODO: Expect / to deliver *Welcome!*
//})();

async function expect(
  path: string,
  status: number,
  content: string,
  msg: string,
) {
  console.log(2);
  let res, text;
  try {
    res = await fetch(`http://localhost:${PORT}${path}`);
    if (status) assertEquals(res.status, status, "Status does not match!");
    text = await res.text();
    if (content) {
      assertMatch(text, new RegExp(content), "Content does not match");
    }
  } catch (e) {
    fail(e.message);
  }
}
