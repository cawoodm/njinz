//* Configuration Loader
import { parse } from "https://deno.land/std@0.110.0/flags/mod.ts";
import { urlParse } from "https://deno.land/x/url_parse@1.0.0/mod.ts";
import { opine } from "https://deno.land/x/opine@1.8.0/mod.ts";
import type { Config, Host, HostDetail, Rule, IVars } from "./types.ts";
import type { VRule, VRuleSet, VServer } from "./types.ts";
import { Matcher } from "./matcher.ts";
import { HandlerFactory } from "./handler.ts";
import { debug, trace } from "./helpers.ts";
import { parse as parseYAML } from "https://deno.land/std@0.110.0/encoding/yaml.ts";

export async function loadServerConfig(args: string[]): Promise<VServer> {
  let configFile: string = "config.json";
  let config: Config;
  try {
    let commandLine = parse(args);
    configFile = commandLine.f || configFile;
    debug("*** ConfigFile", configFile);
    if (configFile.match(/^\/\S:/)) configFile = configFile.replace(/^\//, ""); // Windows leading / hack
    config = load(configFile);
  } catch (e) {
    trace(e);
    console.error("Error parsing config file:", configFile, e.message);
    Deno.exit(1);
  }
  try {
    const server: VServer = {
      global: {
        dirs: config.global.dirs,
        files: config.global.files,
        refs: config.global.refs || {},
        plugins: config.global.plugins || [],
        env: <IVars>Object.fromEntries((config.global.env || []).map(e => [e, Deno.env.get(e)]))
      },
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
    // Initialize Mappers for all rules (when)
    await Promise.all(server.vhosts
      .map((vhost) =>
        vhost.ruleSets
          .map((ruleSet) =>
            ruleSet.rules
              .map((rule) => rule.when?.init)
          )
      ));
    // Initialize Handlers for all actions (then)
    await Promise.all(server.vhosts
      .map((vhost) =>
        vhost.ruleSets
          .map((ruleSet) =>
            ruleSet.rules
              .map((rule) => rule.then?.init)
          )
      ));
    return server;
  } catch (e) {
    trace(e);
    console.error("Invalid configuration:", configFile, e.message);
    Deno.exit(1);
  }
}

function load(filename: string): Config {
  if (filename.match(/\.json$/)) {
    return <Config> JSON.parse(Deno.readTextFileSync(filename));
  } else if (filename.match(/\.ya?ml$/)) {
    return <Config> parseYAML(Deno.readTextFileSync(filename));
  } else {
    throw new Error(
      `NJINZ-107: Unknown file type '${filename}. Only .json/.yaml is supported!`,
    );
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
    let ruleSet = config.ruleSets[rs];
    let rules = extractVRules(ruleSet.rules);
    return <VRuleSet> {
      id: ruleSetName,
      mode: ruleSet.mode === "any" ? 1 : 0,
      rules,
    };
  });
  return result;
}
function extractVRules(rules: Rule[]): VRule[] {
  return rules.map((rule) => ({
    when: rule.when ? new Matcher(rule.when) : undefined,
    then: rule.then ? HandlerFactory(rule.then) : undefined,
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
