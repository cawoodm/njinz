import { Request } from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { existsSync } from "https://deno.land/std@0.110.0/fs/exists.ts";
import { debug, trace } from "./helpers.ts";

export class Matcher {
  #function: Function;
  #funcname: string;
  #funcPath: string;
  #object: string;
  #params: string;
  #MATCHER_ROOT: string = "etc/injinz/plugins/matchers";
  constructor(params: string) {
    // Parse <function?>:<object?>:<params>
    // Parse <object?>:<params>
    // Parse <params>
    let parms = params.split(":");
    if (parms.length === 0) {
      throw new Error(`NJINZ-104: Invalid matcher '${params}'!`);
    }
    if (parms.length < 2) parms.splice(0, 0, "");
    if (parms.length < 3) parms.splice(0, 0, "");

    this.#funcname = parms[0] ||= "startsWith";
    this.#object = parms[1] ||= "req.path";
    this.#params = parms[2];
    // TODO: Support pseudo-regex
    // TODO: Support array of params sep=|
    // TODO: Support hashmap of params sep=&
    debug(this.#funcname, ":", this.#object, ":", this.#params);
    this.#function = (o: any) => o.toString().startsWith(this.#params);
    this.#funcPath = "";
    if (this.#funcname) {
      if (this.#funcname === "startsWith") {
        // Standard matcher
      } else if (this.#funcname === "regex") {
        let params = new RegExp(this.#params);
        this.#function = (o: any) => o.toString().match(params);
      } else {
        this.#funcPath = `${this.#MATCHER_ROOT}/${this.#funcname}.js`;
        if (!existsSync(this.#funcPath)) {
          let errmsg =
            `NJINZ-105: Custom matcher for '${params}' not found at '${this.#funcPath}'!`;
          this.#funcPath = "";
          throw new Error(errmsg);
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
      return !!this.#function(eval(this.#object));
    }
    throw new Error("NJINZ-106: No matcher function available!");
  }
}
