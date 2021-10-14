import { IRequest, IResponse } from "../types.ts";
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { serveStatic } from "./serveStatic.ts";
import { existsSync } from "https://deno.land/std@0.110.0/fs/exists.ts";
import type { IHandler, XHandler } from "../handler.ts";

export default class StaticHandler implements IHandler {
  id = "static";
  #handler: XHandler;
  #root: string;
  #options: Options;
  constructor(options: any) {
    this.#options = parseOptions(options);
    if (!this.#options?.root || !existsSync(this.#options?.root)) {
      throw new Error(
        `STATIC-101: Root directory '${this.#options?.root}' not found!`,
      );
    }
    this.#root = this.#options.root || "/etc/injinz/htdocs";

    this.#handler = serveStatic(this.#options.root, this.#options);
  }
  init(options: any) {
  }
  async process(
    ireq: IRequest,
    ires: IResponse,
    req: Request,
    res: Response,
    params: any,
  ) {
    // TODO: Reduce to req, res
    // TODO: Very inefficient to recreate handler for each request!
    return await this.#handler(
      ireq,
      ires,
      req,
      res,
      { newPath: ireq.path.replace(params[0], "") },
    );
  }
}
interface Options {
  root: string;
  pathPrefix?: string; // Extracted from HTTP path
  index?: string[]; // ["index.html"]
  redirect?: boolean; // Redirect /foo to /foo/ ???
  dotfiles?: string; // allow/deny/ignore
  // Cache-Control:
  cacheControl?: boolean;
  maxAge?: number;
  immutable?: boolean;
  lastModified?: boolean;
  etag?: boolean;
}
function parseOptions(options: any): Options {
  if (typeof options === "string") {
    return {
      root: <string> options,
      redirect: true,
      index: ["index.html"],
      dotfiles: "ignore",
    };
  }
  return options;
}
function nix() {}
