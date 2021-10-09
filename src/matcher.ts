import { Request } from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { existsSync } from "https://deno.land/std@0.110.0/fs/mod.ts";

class Matcher {
  _function: Function | null;
  _func: string;
  _object: string;
  _params: string;
  constructor(params: string) {
    let parms = params.split(":");
    if (parms.length === 0) {
      throw new Error(`NJINZ-104: Invalid matcher '${params}'!`);
    }
    if (parms.length < 2) parms.splice(0, 0, "match");
    if (parms.length < 3) parms.splice(0, 0, "req.path");

    this._func = parms[0];
    this._object = parms[1];
    this._params = parms[2];

    if (this._func) {
      this._func = `lib/sys/${this._func}.js`;
      if (!existsSync(this._func)) {
        throw new Error(
          `NJINZ-105: Custom matcher '${params}' not found at '${this._func}'!`,
        );
      }
    }
    this._function = (o: string, p: string) =>
      o.toString().match(new RegExp(p));
  }
  async run(req: Request) {
    if (this._func && !this._function) {
      this._function = await import(this._func);
    }
    if (this._function) {
      return !!this._function(eval(this._object), this._params);
    }
    throw new Error("NJINZ-106: No matcher available!");
  }
}
