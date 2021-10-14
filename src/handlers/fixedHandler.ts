import { IRequest, IResponse } from "../types.ts";
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { Handler } from "https://deno.land/x/opine@1.8.0/src/types.ts";
import type IHandler from "../handler.ts";

export default class StaticHandler implements IHandler {
  id = "fixed";
  #handler: Handler;
  constructor(options: any) {
    let contentType = options?.contentType || "text/html";
    let content: string = options?.content || "!";
    if (content.match(/^\w+:.+/)) {
      contentType = content.split(":")[0];
      content = content.substring(contentType.length + 1);
      contentType = contentTypes[contentType];
    }
    this.#handler = (req: Request, res: Response) => {
      res.type(contentType);
      res.setStatus(200).send(content);
    };
  }
  init(options: any) {}
  async process(req: IRequest, res: IResponse, oreq: Request, ores: Response) {
    // TODO: Reduce to req, res
    return await this.#handler(oreq, ores, () => null);
  }
}
interface MimeMap {
  [key: string]: string;
}
const contentTypes: MimeMap = {
  "html": "text/html",
  "json": "application/json",
  "text": "text/plain",
};
