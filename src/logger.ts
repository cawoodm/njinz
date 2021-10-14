import { IRequest as Request, IResponse as Response } from "./types.ts";
export class Logger {
  constructor() {
  }
  logStart(req: Request) {
    console.log(req.method, req.originalUrl);
  }
  logEnd(req: Request, res: Response) {
    console.log("\t", "→", res.status, req.path);
  }
  logError(url: string, msg: String) {
    console.error(url, msg);
  }
}
