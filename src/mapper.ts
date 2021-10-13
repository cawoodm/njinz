import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { IHeaders, IRequest, IResponse } from "./types.ts";
const mapper = {
  opineRequestToInjinz(req: Request): IRequest {
    let headers: IHeaders = {};
    for (let [key, value] of req.headers.entries()) {
      if (value) headers[key] = value || "";
    }
    let url = new URL(req.url);
    return {
      accepts: req.headers.get("Accept") || "",
      agent: req.headers.get("User-Agent") || "",
      contentType: req.headers.get("Content-Type") || "",
      contentLength: req.contentLength || 0,
      hostname: req.hostname,
      // Header Line 1
      method: req.method,
      protocol: req.protocol, // proto
      secure: req.secure, // proto
      ip: req.ip, // ips?
      originalUrl: req.originalUrl, // Fixed
      // Dynamic Properties:
      path: req.path,
      query: req.query,
      querystring: url.search,
      url: url, // Parsed current URL
      baseUrl: req.baseUrl, // http://hostname:port
      body: req.body, // Need body parser => _parsedBody
      headers,
      vars: { foo: "bar" },
    };
  },
  opineResponseToInjinz(res: Response): IResponse {
    let headers: IHeaders = {};
    if (res.headers) {
      for (let [key, value] of res.headers.entries()) {
        if (value) headers[key] = value || "";
      }
    }
    return {
      // original: req
      status: res.status || 0,
      statusText: res.statusText || "",
      body: "",
      headers,
      written: <boolean> res.written,
    };
  },
};
export default mapper;
