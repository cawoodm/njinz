import { IRequest as Request, IResponse as Response } from "./types.ts";
export class Logger {
  constructor() {
  }
  logStart(req: Request) {
    console.log(req.method, req.originalUrl);
  }
  logEnd(status: number, str: string) {
    console.log("\t", "→", status, str);
  }
  logError(url: string, msg: String) {
    console.error(url, msg);
  }
}
