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
  logError(req: Request, msg: String) {
    console.error(req.url, msg);
  }
}
