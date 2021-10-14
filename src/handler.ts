import { IRequest, IResponse } from "./types.ts";
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
export default interface IHandler {
  id: string;
  init(options: any): void;
  process(req: IRequest, res: IResponse, oreq: Request, ores: Response): void;
}
