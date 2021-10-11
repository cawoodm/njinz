import { Application } from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { Matcher } from "./matcher.ts";
export interface Config {
  hosts: Host[];
  ruleSets: RuleSetsMap;
}
export interface VServer {
  vports: VPort[];
  vhosts: VHost[];
}
export interface RuleSetsMap {
  [key: string]: RuleSetConfig;
}
export interface RuleSetConfig {
  mode?: string;
  rules: Rule[];
}
export interface VRuleSet {
  mode?: HandlerMode;
  rules: VRule[];
}
export interface Rule {
  when: string;
  then: any;
}
export interface VRule {
  when: Matcher | undefined;
  then: any;
}
export interface Host {
  host: string;
  ruleSets: string[];
}
export interface VPort {
  number: number;
  app: Application;
}
export interface VHost {
  host: HostDetail;
  ruleSets: VRuleSet[];
}
export interface HostDetail {
  origin: string;
  protocol: string;
  host: string;
  port: number;
}
export enum HandlerMode {
  all = 0,
  any = 1,
}
