import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { IHeaders, IRequest, IResponse } from "./types.ts";
const mapper = {
  opineRequestToInjinz(req: Request, url: URL): IRequest {
    let headers: IHeaders = {};
    for (let [key, value] of req.headers.entries()) {
      if (value) headers[key] = value || "";
    }
    let portSuffix = "";
    if (url.protocol === "http" && url.port != "80") {
      portSuffix = ":" + url.port;
    }
    if (url.protocol === "https" && url.port != "443") {
      portSuffix = ":" + url.port;
    }
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
      originalUrl: url.toString(), // Fixed
      // Dynamic Properties:
      path: req.path,
      query: req.query,
      querystring: url.search,
      url: url, // Parsed current URL
      baseUrl: url.protocol + "://" + url.hostname + portSuffix, // http://hostname:port
      body: req.body,
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
