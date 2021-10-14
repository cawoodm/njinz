import { IRequest, IResponse } from "../types.ts";
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { serveStatic } from "https://deno.land/x/opine@1.8.0/src/middleware/serveStatic.ts";
import { Handler } from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { existsSync } from "https://deno.land/std@0.110.0/fs/exists.ts";
import type IHandler from "../handler.ts";

export default class StaticHandler implements IHandler {
  id = "static";
  #handler: Handler;
  #root: string;
  constructor(options: any) {
    if (!existsSync(options?.root)) {
      throw new Error(
        `STATIC-101: Static root directory '${options?.root}' not found!`,
      );
    }
    this.#root = options?.root || "/etc/injinz/htdocs";
    this.#handler = serveStatic(this.#root, {});
  }
  init(options: any) {
  }
  async process(req: IRequest, res: IResponse, oreq: Request, ores: Response) {
    // TODO: Reduce to req, res
    return await this.#handler(oreq, ores, () => null);
  }
}
