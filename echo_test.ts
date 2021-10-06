import { echo } from "./echo.ts";
import { assertEquals } from "https://deno.land/std@0.100.0/testing/asserts.ts";

Deno.test("Adding Works", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});
Deno.test("Concatting Works", () => {
  const y = "hello" + echo("world");
  assertEquals(y, "hello world");
});
