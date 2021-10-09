import {
  Request,
  Response,
} from "https://deno.land/x/opine@1.8.0/src/types.ts";
import {
  opine,
  request,
  response,
} from "https://deno.land/x/opine@1.8.0/mod.ts";
import { urlParse } from "https://deno.land/x/url_parse@1.0.0/mod.ts";
import { Config, Host, HostDetail, RuleSet, VPort, VServer } from "./types.ts";

const njinz: VServer = {
  vports: [],
  vhosts: [],
};

//* Configuration Loader
try {
  const configFile = new URL("../config.json", import.meta.url).pathname
    .substring(1);
  const config: Config = JSON.parse(Deno.readTextFileSync(configFile));

  config.hosts.forEach((host: Host) => {
    let vhost: HostDetail = URL2VHost(host.host);
    if (!njinz.vports.find((vp) => vp.number === vhost.port)) {
      njinz.vports.push({
        number: vhost.port,
        app: opine(),
      });
    }
    njinz.vhosts.push({
      host: vhost,
      ruleSets: extractRuleSets(config, host),
    });
  });
} catch (e) {
  console.trace(e);
  console.error("Invalid config: ", e.message);
  Deno.exit(1);
}
//* Server Runtime
try {
  njinz.vports.forEach((vport: VPort) => {
    vport.app.get("/", function (req: Request, res: Response) {
      try {
        let vhost = njinz.vhosts.find((vh) => vh.host.port === vport.number);
        if (!vhost || !vhost.host) die("Unknown Virtual Host");
        // for(let ruleSet: RuleSet in vhost.ruleSets) {}
        let op = ["<h1>Hello World</h1>"];
        op.push("Port: " + vport.number);
        op.push("Host: " + vhost?.host?.origin);
        if (vhost && vhost.ruleSets) {
          op.push("RuleSets: " + vhost?.ruleSets.length);
          for (let ruleSet of vhost?.ruleSets) {
            for (let rule of ruleSet.rules) {
              op.push(
                "<li><b>" + rule.when + "</b>" + JSON.stringify(rule.then),
              );
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
      parseInt(Deno.env.get("DEBUG_PORT_OVERRIDE") || "0", 10) || vport.number;
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
/**
 * Helper Functions
 */
function extractRuleSets(config: Config, host: Host): RuleSet[] {
  let a: RuleSet[] = host.ruleSets.map((rs) => {
    let ruleSetName: string | undefined = Object.keys(config.ruleSets).find(
      (k) => k === rs,
    );
    if (!ruleSetName) {
      throw new Error(`NJINZ:103 Ruleset '${rs}' reference not found!`);
    }
    return <RuleSet> { rules: config.ruleSets[rs].rules };
  });
  return a;
}
function die(msg: string) {
  throw new Error(msg);
}
function URL2VHost(url: string): HostDetail {
  try {
    let uri = urlParse(url);
    if (uri.protocol === "https:") {
      throw new Error("NJINZ-100: HTTPS not yet supported!");
    }
    return {
      origin: uri.origin,
      protocol: uri.protocol,
      host: uri.host,
      port: parseInt(uri.port) || 80,
    };
  } catch (e) {
    throw new Error("NJINZ-101: Invalid host name in config: " + e.message);
  }
}
function toArray<Type>(a: Type): Type[] {
  if (Array.isArray(a)) return a;
  if (typeof a === "undefined") return [];
  return [a];
}
