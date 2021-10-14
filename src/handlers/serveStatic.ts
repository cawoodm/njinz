/*!
 * Port of https://deno.land/x/opine@1.8.0/src/middleware/serveStatic.ts for INJIN-Z
 */

import {
  createError,
  encodeUrl,
  escapeHtml,
  fromFileUrl,
} from "https://deno.land/x/opine@1.8.0/deps.ts";
import {
  originalUrl as original,
  parseUrl,
} from "https://deno.land/x/opine@1.8.0/src/utils/parseUrl.ts";
import { hasTrailingSlash, send, sendError } from "./send.ts";
import type {
  ParsedURL,
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { IRequest, IResponse } from "../types.ts";
import type { XHandler } from "../handler.ts";
import HTTPError from "../httpError.ts";

export function serveStatic(root: string, options: any = {}): XHandler {
  // fall-though
  const fallthrough = options.fallthrough !== false;

  // default redirect
  const redirect = options.redirect !== false;

  // before hook
  const before = options.before;

  if (before && typeof before !== "function") {
    throw new TypeError("option before must be function");
  }

  // setup options for send
  options.maxage = options.maxage ?? options.maxAge ?? 0;
  options.root = root.startsWith("file:") ? fromFileUrl(root) : root;

  // construct directory listener
  const onDirectory = redirect
    ? createRedirectDirectoryListener
    : createNotFoundDirectoryListener;

  return async (
    ireq: IRequest,
    ires: IResponse,
    req: Request,
    res: Response,
    params: any,
  ): Promise<void> => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (fallthrough) return Promise.resolve();
      res.set("Allow", "GET, HEAD");
      throw new HTTPError(405, "Method not allowed");
    }

    const forwardError = !fallthrough;
    const originalUrl = original(req) as ParsedURL;
    let path = params.newPath || (parseUrl(req) as ParsedURL).pathname;

    // make sure redirect occurs at mount
    if (path === "/" && originalUrl.pathname.substr(-1) !== "/") {
      path = "";
    }
    options.onDirectory = onDirectory(req, res, path);
    try {
      await send(req, res, path, options);
      return Promise.resolve();
    } catch (err) {
      // forwardError?
      if (err.status) {
        throw new HTTPError(err.status, err.name);
      }
      throw new HTTPError(500, err.message);
    }
  };
}

function collapseLeadingSlashes(str: string): string {
  let i = 0;
  for (; i < str.length; i++) {
    if (str.charCodeAt(i) !== 0x2f /* / */) {
      break;
    }
  }
  return i > 1 ? "/" + str.substr(i) : str;
}

function createHtmlDocument(title: string, body: string): string {
  return "<!DOCTYPE html>\n" +
    "<html>\n" +
    "<head>\n" +
    '<meta charset="utf-8">\n' +
    "<title>" + title + "</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "<pre>" + body + "</pre>\n" +
    "</body>\n" +
    "</html>\n";
}

function createNotFoundDirectoryListener(
  _req: Request,
  res: Response,
  _path: string,
): Function {
  return function notFound(): void {
    return sendError(res, createError(404));
  };
}

function createRedirectDirectoryListener(
  req: Request,
  res: Response,
  path: string,
): Function {
  return function redirect(): void {
    if (hasTrailingSlash(path)) {
      throw new HTTPError(404, "Not found");
    }

    // get original URL
    const originalUrl = original(req) as ParsedURL;

    // append trailing slash
    originalUrl.path = null;
    originalUrl.pathname = collapseLeadingSlashes(originalUrl.pathname + "/");

    // reformat the URL
    const loc = encodeUrl(originalUrl.pathname);
    const doc = createHtmlDocument(
      "Redirecting",
      'Redirecting to <a href="' + escapeHtml(loc) + '">' +
        escapeHtml(loc) + "</a>",
    );

    // send redirect response
    res.status = 301;
    res.set("Content-Type", "text/html; charset=UTF-8");
    res.set("Content-Security-Policy", "default-src 'none'");
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Location", loc);
    res.send(doc);
  };
}
