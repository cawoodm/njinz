import { IRequest, IResponse } from "../types.ts";
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { Handler } from "https://deno.land/x/opine@1.8.0/src/types.ts";
import type { IHandler, XHandler } from "../handler.ts";
// import refs from "../refs.ts";

export default class StaticHandler implements IHandler {
  id = "fixed";
  #handler: XHandler;
  constructor(options: any) {
    let opt = parseOptions(options);
    this.#handler = async (
      ireq: IRequest,
      ires: IResponse,
      req: Request,
      res: Response,
      params: any,
    ) => {
      res.type(opt.contentType);
      //let content = refs.format(glob, opts.content);
      res.setStatus(200).send(opt.content);
    };
  }
  init(options: any) {}
  async process(
    ireq: IRequest,
    ires: IResponse,
    req: Request,
    res: Response,
    params: any,
  ) {
    // TODO: Reduce to req, res
    return await this.#handler(ireq, ires, req, res, null);
  }
}
interface Options {
  contentType: string;
  content: string;
}
interface MimeMap {
  [key: string]: string;
}
const contentTypes: MimeMap = {
  "html": "text/html",
  "json": "application/json",
  "text": "text/plain",
};
function parseOptions(options: any): Options {
  let result: Options = {
    contentType: "text/plain",
    content: "",
  };
  if (typeof options === "string") {
    result.content = <string> options;
    let arr = result.content.split(":");
    if (arr.length > 1) {
      result.contentType = arr[0];
      result.content = result.content.substring(result.contentType.length + 1);
      result.contentType = contentTypes[result.contentType] ||
        result.contentType;
    }
  } else {
    result = {
      contentType: options.contentType || "text/plain",
      content: options.content || "",
    };
  }
  return result;
}
