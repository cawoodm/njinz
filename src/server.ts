//* Server Runtime
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { HandlerMode, VPort, VServer } from "./types.ts";
import { Logger } from "./logger.ts";
import { die, trace } from "./helpers.ts";
import mapper from "./mapper.ts";
import HTTPError from "./httpError.ts";

export function runServer(njinz: VServer, logger: Logger): void {
  try {
    njinz.vports.forEach((vport: VPort) => {
      vport.app.all("*", async (req: Request, res: Response, next) => {
        try {
          let vhost = njinz.vhosts.find((vh) => vh.host.port === vport.number);
          // TODO Match HOST and PORT!
          if (!vhost || !vhost.host) {
            logger.logError(req.originalUrl, "Unknown Virtual Host");
            return next();
          }
          let baseUrl = req.protocol + "://" + req.hostname +
            ":" + vport.number.toString();
          let originalUrl = new URL(req.originalUrl, baseUrl);
          const ireq = mapper.opineRequestToInjinz(req, originalUrl);
          const ires = mapper.opineResponseToInjinz(res);
          logger.logStart(ireq);
          if (vhost && vhost.ruleSets) {
            for (let ruleSet of vhost?.ruleSets) {
              let ruleNo = 0;
              for (let rule of ruleSet.rules) {
                ruleNo++;
                let checkResult: any = rule.when ? rule.when.check(ireq) : true;
                if (checkResult) {
                  try {
                    if (typeof rule?.then?.process === "function") {
                      await rule.then.process(
                        ireq,
                        ires,
                        req,
                        res,
                        checkResult,
                      );
                    }
                    if (ruleSet.mode === HandlerMode.any) {
                      break;
                    }
                    if (res.written) {
                      // Response was handled, exit ruleSet?
                    }
                  } catch (e) {
                    if (e.constructor.name === "HTTPError") {
                      throw e;
                    } else {
                      trace(e);
                      throw new Error(
                        `HandlerError in ruleSet '${ruleSet.id}' rule #${ruleNo}: ${e.message}`,
                      );
                    }
                    // Handler may throw an Error
                    // OR
                    // Decline to process => next()
                  }
                }
              }
            }
          }
          if (!res.written) {
            console.warn("No handler wrote a response!", ireq.originalUrl);
          }
          logger.logEnd(ires.status, ireq.path);
        } catch (e) {
          if (e.constructor.name === "HTTPError") {
            const he = <HTTPError> e;
            logger.logEnd(he.status, he.statusText);
            res.setStatus(he.status).send(he.statusText);
          } else {
            trace(e);
            console.error(e);
            res.setStatus(500).send(<Error> e.trace);
          }
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
