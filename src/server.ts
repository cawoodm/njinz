//* Server Runtime
import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { VPort, VServer } from "./types.ts";
import { die } from "./helpers.ts";

export function runServer(njinz: VServer): void {
  try {
    njinz.vports.forEach((vport: VPort) => {
      vport.app.all("*", (req: Request, res: Response) => {
        try {
          let vhost = njinz.vhosts.find((vh) => vh.host.port === vport.number);
          if (!vhost || !vhost.host) die("Unknown Virtual Host");
          let op = []; // "<h1>Hello World</h1>"];
          //op.push("Port: " + vport.number);
          //op.push("Host: " + vhost?.host?.origin);
          if (vhost && vhost.ruleSets) {
            //op.push("RuleSets: " + vhost?.ruleSets.length);
            for (let ruleSet of vhost?.ruleSets) {
              for (let rule of ruleSet.rules) {
                if (!rule.when || req.path === rule.when) {
                  if (rule.then.static) {
                    op.push(rule.then.static);
                  }
                }
              }
            }
          }
          res.send(op.join("<br>"));
        } catch (e) {
          console.trace(e);
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
    console.trace(e);
    console.error("Invalid config: ", e.message);
    Deno.exit(1);
  }
}
