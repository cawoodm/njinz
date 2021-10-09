import { Application } from "https://deno.land/x/opine@1.8.0/src/types.ts";
export type { Config, Host, HostDetail, RuleSet, VHost, VPort, VServer };
interface Config {
  hosts: Host[];
  ruleSets: RuleSetsMap;
}
interface VServer {
  vports: VPort[];
  vhosts: VHost[];
}
interface RuleSetsMap {
  [key: string]: RuleSetConfig;
}
interface RuleSetConfig {
  mode?: HandlerMode;
  rules: Rule[];
}
interface RuleSet {
  mode?: HandlerMode;
  rules: Rule[];
}
interface Rule {
  when: string;
  then: any;
}
interface Host {
  host: string;
  ruleSets: string[];
}
interface VPort {
  number: number;
  app: Application;
}
interface VHost {
  host: HostDetail;
  ruleSets: RuleSet[];
}
interface HostDetail {
  origin: string;
  protocol: string;
  host: string;
  port: number;
}
enum HandlerMode {
  all = 0,
  any = 1,
}
