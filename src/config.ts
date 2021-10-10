//* Configuration Loader
import { parse } from "https://deno.land/std@0.110.0/flags/mod.ts";
import { urlParse } from "https://deno.land/x/url_parse@1.0.0/mod.ts";
import { opine } from "https://deno.land/x/opine@1.8.0/mod.ts";
import type { Config, Host, HostDetail, Rule } from "./types.ts";
import type { VRule, VRuleSet, VServer } from "./types.ts";
import { Matcher } from "./matcher.ts";
import { debug, trace } from "./helpers.ts";

export async function loadServerConfig(args: string[]): Promise<VServer> {
  let configFile: string = "config.json";
  let config: Config;
  try {
    let commandLine = parse(args);
    configFile = commandLine.f || configFile;
    debug("****ConfigFile", configFile);
    if (configFile.match(/^\/\S:/)) configFile = configFile.replace(/^\//, ""); // Windows leading / hack
    config = JSON.parse(Deno.readTextFileSync(configFile));
  } catch (e) {
    trace(e);
    console.error("Error parsing config file:", configFile, e.message);
    Deno.exit(1);
  }
  try {
    const server: VServer = {
      vports: [],
      vhosts: [],
    };
    // new URL("../config.json", import.meta.url).pathname;
    config.hosts.forEach((host: Host) => {
      let vhost: HostDetail = URL2VHost(host.host);
      if (!server.vports.find((vp) => vp.number === vhost.port)) {
        server.vports.push({
          number: vhost.port,
          app: opine(),
        });
      }
      server.vhosts.push({
        host: vhost,
        ruleSets: extractRuleSets(config, host),
      });
    });
    // Initialize all rules
    await Promise.all(server.vhosts
      .map((vhost) =>
        vhost.ruleSets
          .map((ruleSet) =>
            ruleSet.rules
              .map((rule) => rule.when?.init)
          )
      ));
    return server;
  } catch (e) {
    trace(e);
    console.error("Invalid configuration:", configFile, e.message);
    Deno.exit(1);
  }
}

function extractRuleSets(config: Config, host: Host): VRuleSet[] {
  let result: VRuleSet[] = host.ruleSets.map((rs) => {
    let ruleSetName: string | undefined = Object.keys(config.ruleSets).find(
      (k) => k === rs,
    );
    if (!ruleSetName) {
      throw new Error(`NJINZ-103: Ruleset '${rs}' reference not found!`);
    }
    let rules = extractVRules(config.ruleSets[rs].rules);
    return <VRuleSet> { rules };
  });
  return result;
}
function extractVRules(rules: Rule[]): VRule[] {
  return rules.map((rule) => ({
    when: rule.when ? new Matcher(rule.when) : undefined,
    then: rule.then,
  }));
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
