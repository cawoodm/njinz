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
        const req = mapper.opineRequestToInjinz(oreq);
        const res = mapper.opineResponseToInjinz(ores);
        try {
          let vhost = njinz.vhosts.find((vh) => vh.host.port === vport.number);
          if (!vhost || !vhost.host) {
            logger.logError(req, "Unknown Virtual Host");
            return next();
          }
          logger.logStart(req);
          let op = [];
          if (vhost && vhost.ruleSets) {
            //op.push("RuleSets: " + vhost?.ruleSets.length);
            for (let ruleSet of vhost?.ruleSets) {
              for (let rule of ruleSet.rules) {
                if (!rule.when || rule.when.check(req) === true) {
                  if (rule.then.static) {
                    // Should call something.static(req, res) here...
                    op.push(rule.then.static);
                  }
                  // TODO: Call handler(req, res, ores)
                  if (ruleSet.mode === HandlerMode.any) {
                    break;
                  }
                }
              }
            }
          }
          ores.send(op.join(""));
          logger.logEnd(req, res);
        } catch (e) {
          trace(e);
          console.error(e);
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
