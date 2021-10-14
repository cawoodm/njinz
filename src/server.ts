//* Server Runtime
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { HandlerMode, VPort, VServer } from "./types.ts";
import { Logger } from "./logger.ts";
import { die, trace } from "./helpers.ts";
import mapper from "./mapper.ts";

export function runServer(njinz: VServer, logger: Logger): void {
  try {
    njinz.vports.forEach((vport: VPort) => {
      vport.app.all("*", (oreq: Request, ores: Response, next) => {
        try {
          let vhost = njinz.vhosts.find((vh) => vh.host.port === vport.number);
          // TODO Match HOST and PORT!
          if (!vhost || !vhost.host) {
            logger.logError(oreq.originalUrl, "Unknown Virtual Host");
            return next();
          }
          let baseUrl = oreq.protocol + "://" + oreq.hostname +
            ":" + vport.number.toString();
          let originalUrl = new URL(oreq.originalUrl, baseUrl);
          const req = mapper.opineRequestToInjinz(oreq, originalUrl);
          const res = mapper.opineResponseToInjinz(ores);
          logger.logStart(req);
          if (vhost && vhost.ruleSets) {
            for (let ruleSet of vhost?.ruleSets) {
              for (let rule of ruleSet.rules) {
                if (!rule.when || rule.when.check(req) === true) {
                  try {
                    if (typeof rule?.then?.process === "function") {
                      rule?.then?.process(req, res, oreq, ores);
                    }
                    if (ruleSet.mode === HandlerMode.any) {
                      break;
                    }
                    if (ores.written) {
                      // Response was handled, exit ruleSet?
                    }
                  } catch (e) {
                    // Handler may throw an Error
                    // OR
                    // Decline to process => next()
                  }
                }
              }
            }
          }
          if (!ores.written) {
            console.warn("No handler wrote a response!", req.originalUrl);
          }
          logger.logEnd(req, res);
        } catch (e) {
          trace(e);
          console.error(e);
          ores.setStatus(500).send(<Error> e.trace);
        }
      });
      let portNumber: number =
        parseInt(Deno.env.get("DEBUG_PORT_OVERRIDE") || "0", 10) ||
        vport.number;
      vport.app.listen(
        portNumber,
        () =>
          console.log(
            `Virtual port listening on http://localhost:${portNumber} 🚀`,
          ),
      );
    });
  } catch (e) {
    trace(e);
    console.error("Invalid config: ", e.message);
    Deno.exit(1);
  }
}
