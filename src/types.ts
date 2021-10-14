import { Application } from "https://deno.land/x/opine@1.8.0/src/types.ts";
import { Matcher } from "./matcher.ts";
import IHandler from "./handler.ts";

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
  when?: Matcher | undefined;
  then?: IHandler | undefined;
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
export interface IRequest {
  accepts: string;
  agent: string;
  contentType: string;
  contentLength: number;
  hostname: string;
  // Header Line 1
  method: string;
  protocol: string; // proto
  secure: boolean;
  ip: string;
  originalUrl: string; // Fixed
  // Dynamic Properties:
  path: string;
  query: IQuery;
  querystring: string;
  url: URL; // Parsed current URL
  baseUrl: string; // http://hostname:port
  body: string; // Need body parser => _parsedBody
  headers: IHeaders;
  vars: IVars;
}
export interface IResponse {
  status: number;
  statusText: string;
  body: string;
  headers: IHeaders;
  written: boolean;
}
export interface IHeaders {
  [key: string]: string;
}
export interface IQuery {
  [key: string]: string;
}
export interface IVars {
  [key: string]: string;
}
