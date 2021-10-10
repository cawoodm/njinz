//* Configuration Loader
import { parse } from "https://deno.land/std@0.110.0/flags/mod.ts";
import { urlParse } from "https://deno.land/x/url_parse@1.0.0/mod.ts";
import { opine } from "https://deno.land/x/opine@1.8.0/mod.ts";
import type { Config, Host, HostDetail, RuleSet, VServer } from "./types.ts";

export function loadServerConfig(args: string[]): VServer {
  let commandLine = parse(Deno.args);
  let configFile = commandLine.f || "config.json"; // new URL("../config.json", import.meta.url).pathname;
  const njinz: VServer = {
    vports: [],
    vhosts: [],
  };
  try {
    if (configFile.match(/^\/\S:/)) configFile = configFile.replace(/^\//, ""); // Windows leading / hack
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
    return njinz;
  } catch (e) {
    console.trace(e);
    console.error("Invalid config: ", configFile, e.message);
    Deno.exit(1);
  }
}

function extractRuleSets(config: Config, host: Host): RuleSet[] {
  let a: RuleSet[] = host.ruleSets.map((rs) => {
    let ruleSetName: string | undefined = Object.keys(config.ruleSets).find(
      (k) => k === rs,
    );
    if (!ruleSetName) {
      throw new Error(`NJINZ-103: Ruleset '${rs}' reference not found!`);
    }
    return <RuleSet> { rules: config.ruleSets[rs].rules };
  });
  return a;
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
