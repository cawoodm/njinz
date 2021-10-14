import { IRequest, IResponse } from "./types.ts";
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import StaticHandler from "./handlers/staticHandler.ts";
import FixedHandler from "./handlers/fixedHandler.ts";

export interface IHandler {
  id: string;
  init(options: any): void;
  process: XHandler;
}
export interface XHandler {
  (
    ireq: IRequest,
    ires: IResponse,
    req: Request,
    res: Response,
    params: any,
  ): Promise<void>;
}
export function HandlerFactory(options: any): IHandler {
  let keys = Object.keys(options);
  if (keys.length === 0) throw new Error("Invalid Handler!");
  let handlerId: string = keys[0];
  let opt = options;
  if (keys.length === 1) opt = options[keys[0]];
  if (handlerId === "send") {
    return new FixedHandler(opt);
  } else if (handlerId === "serve") {
    return new StaticHandler(opt);
  }
  throw new Error(`INJINZ-110: Unknown handler '${handlerId}'`);
}
