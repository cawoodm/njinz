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
import {
  hasTrailingSlash,
  send,
  sendError,
} from "https://deno.land/x/opine@1.8.0/src/utils/send.ts";
import type {
  Handler,
  ParsedURL,
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";

export function serveStatic(root: string, options: any = {}): Handler {
  // fall-though
  const fallthrough = options.fallthrough !== false;

  // default redirect
  const redirect = options.redirect !== false;

  // setup options for send
  options.maxage = options.maxage ?? options.maxAge ?? 0;
  options.root = root.startsWith("file:") ? fromFileUrl(root) : root;

  // construct directory listener
  const onDirectory = redirect
    ? createRedirectDirectoryListener
    : createNotFoundDirectoryListener;

  return async function serveStatic(
    req: Request,
    res: Response,
  ) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.status = 405;
      res.set("Allow", "GET, HEAD");
      res.end();
      return;
    }

    const originalUrl = original(req) as ParsedURL;
    let path = (parseUrl(req) as ParsedURL).pathname;

    // make sure redirect occurs at mount
    if (path === "/" && originalUrl.pathname.substr(-1) !== "/") {
      path = "";
    }

    options.onDirectory = onDirectory(req, res, path);

    try {
      return await send(req, res, path, options);
    } catch (err) {
      console.error("STATIC-500: Error sending response");
      throw (err);
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
    '<html lang="en">\n' +
    "<head>\n" +
    '<meta charset="utf-8">\n' +
    "<title>" + title + "</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "<pre>" + body + "</pre>\n" +
    "</body>\n" +
    "</html>\n";
}

// Create a directory listener that returns 404
function createNotFoundDirectoryListener(
  _req: Request,
  res: Response,
  _path: string,
): Function {
  return function notFound(): void {
    return sendError(res, createError(404));
  };
}

// A directory listener that redirects
function createRedirectDirectoryListener(
  req: Request,
  res: Response,
  path: string,
): Function {
  return function redirect(): void {
    if (hasTrailingSlash(path)) {
      return sendError(res, createError(404));
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
