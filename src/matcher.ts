import { Request } from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { existsSync } from "https://deno.land/std@0.110.0/fs/exists.ts";

export class Matcher {
  #function: Function;
  #funcname: string;
  #funcPath: string;
  #object: string;
  #params: string;
  constructor(params: string) {
    // Parse <function?>:<object?>:<params>
    let parms = params.split(":");
    if (parms.length === 0) {
      throw new Error(`NJINZ-104: Invalid matcher '${params}'!`);
    }
    if (parms.length < 2) parms.splice(0, 0, "");
    if (parms.length < 3) parms.splice(0, 0, "");

    this.#funcname = parms[0] ||= "match";
    this.#object = parms[1] ||= "req.path";
    this.#params = parms[2];
    // TODO: Support pseudo-regex
    // TODO: Support array of params sep=|
    // TODO: Support hashmap of params sep=&

    this.#function = (o: string, p: string) =>
      o.toString().match(new RegExp(p));
    this.#funcPath = "";
    if (this.#funcname) {
      if (this.#funcname === "match") {
        // Standard matcher
      } else {
        this.#funcPath = `plugins/matchers/${this.#funcname}.js`;
        if (!existsSync(this.#funcPath)) {
          this.#funcPath = "";
          throw new Error(
            `NJINZ-105: Custom matcher for '${params}' not found at '${this.#funcPath}'!`,
          );
        }
      }
    }
  }
  async init() {
    // Have to initialize
    if (this.#funcPath) {
      let checker = await import(this.#funcPath);
      this.#function = (obj: any) => checker(obj, this.#params);
    }
  }
  check(req: Request): boolean {
    if (this.#function) {
      return !!this.#function(eval(this.#object), this.#params);
    }
    throw new Error("NJINZ-106: No matcher function available!");
  }
}
