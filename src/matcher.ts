import { IRequest as Request } from "./types.ts";
import { existsSync } from "https://deno.land/std@0.110.0/fs/exists.ts";
import { debug, trace } from "./helpers.ts";

export class Matcher {
  #function: Function;
  #funcname: string;
  #funcPath: string;
  #object: string;
  #params: string;
  #MATCHER_ROOT: string = "etc/injinz/plugins/matchers";
  constructor(matcherExpression: string) {
    // Parse <object?>:<function?>:<params>
    // Parse <function?>:<params>
    // Parse <params>
    let parms = matcherExpression.split(" ");
    if (parms.length === 0) {
      throw new Error(`NJINZ-104: Invalid matcher '${matcherExpression}'!`);
    }
    if (parms.length < 2) parms.splice(0, 0, "");
    if (parms.length < 3) parms.splice(0, 0, "");

    this.#object = parms[0] ||= "req.path";
    this.#funcname = parms[1] ||= "startsWith";
    this.#params = parms[2];
    debug(this.#object, ":", this.#funcname, ":", this.#params);

    // TODO: Support array of params sep=|
    // TODO: Support hashmap of params sep=&
    this.#function = (o: any) => o.toString().startsWith(this.#params);
    this.#funcPath = "";
    if (this.#funcname) {
      if (this.#funcname === "startsWith") {
        // startsWith: Standard prefix matcher
      } else if (this.#funcname === "matches" || this.#funcname === "~") {
        // matches: Regular Expressions
        let paramsRegEx = new RegExp(this.#params);
        this.#function = (o: any) => o.toString().match(paramsRegEx);
      } else if (this.#funcname === "like" || this.#funcname === "=") {
        // like: Wildcards - case-insensitive
        let paramsRegEx = new RegExp(this.#params.replace(/\*/gi, ".*"));
        this.#function = (o: any) => o.toString().match(paramsRegEx);
      } else if (this.#funcname === "equals" || this.#funcname === "==") {
        // equals: Exact match
        this.#function = (o: any) => o.toString() === this.#params;
      } else {
        this.#funcPath = `${this.#MATCHER_ROOT}/${this.#funcname}.js`;
        if (!existsSync(this.#funcPath)) {
          let errmsg =
            `NJINZ-105: Custom matcher for '${matcherExpression}' not found at '${this.#funcPath}'!`;
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
  check(req: Request): any {
    if (this.#function) {
      return this.#function(eval(this.#object));
    }
    throw new Error("NJINZ-106: No matcher function available!");
  }
}
