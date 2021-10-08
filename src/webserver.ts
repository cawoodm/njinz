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
import { TConfig, THost, THostDetail, TNJINZ, TVPort } from "./types.ts";
// import { TNJINZ } from '../../../C:/Marc/work/njinz/types.ts'

const njinz: TNJINZ = {
  vports: [],
  vhosts: [],
};

try {
  const configFile = new URL("../config.json", import.meta.url).pathname
    .substring(1);
  const config: TConfig = JSON.parse(Deno.readTextFileSync(configFile));

  config.hosts.forEach((host: THost) => {
    let vhost: THostDetail = URL2VHost(host.host);
    if (!njinz.vports.find((vp) => vp.number === vhost.port)) {
      njinz.vports.push({
        number: vhost.port,
        app: opine(),
      });
    }
    njinz.vhosts.push({
      host: vhost,
      ruleSets: toArray(host.ruleSets).map((rs) => {
        let ruleSetName: string | undefined = Object.keys(config.ruleSets).find(
          (k) => k === rs,
        );
        if (!ruleSetName) {
          throw new Error(`NJINZ:103 Ruleset '${rs}' reference not found!`);
        }
        return { ...config.ruleSets[rs] };
      }),
    });
  });
} catch (e) {
  console.trace(e);
  console.error("Invalid config: ", e.message);
  Deno.exit(1);
}

try {
  njinz.vports.forEach((vport: TVPort) => {
    vport.app.get("/", function (req: Request, res: Response) {
      res.send("Hello World: " + req.url);
    });
    vport.app.listen(
      vport.number,
      () =>
        console.log(
          `Virtual port listening on http://localhost:${vport.number} 🚀`,
        ),
    );
  });
} catch (e) {
  console.trace(e);
  console.error("Invalid config: ", e.message);
  Deno.exit(1);
}

function URL2VHost(url: string): THostDetail {
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
function toArray(a: any) {
  if (Array.isArray(a)) return a;
  if (typeof a === "undefined") return [];
  return [a];
}
