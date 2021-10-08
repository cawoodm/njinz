import { Application } from "https://deno.land/x/opine@1.8.0/src/types.ts";
export type {

  TNJINZ,
  TConfig,
  THostDetail,
  TVHost,
  TVPort,
  THost,
  TRuleSet,
}
interface TConfig {
  hosts: THost[],
  ruleSets:  {[key: string]: TRuleSetConfig[]},
  //ruleSets:  Map<string, TRuleSetConfig[]>,
}
interface TRuleSetConfig {
  when: string,
  then: any
}
interface TNJINZ {
  vports: TVPort[],
  vhosts: TVHost[],
}
interface TVPort {
  number: number,
  app: Application
}
interface TRuleSet {
}
interface THost {
  host: string,
  ruleSets: string[]
}
interface TVHost {
  host:THostDetail,
  ruleSets: TRuleSet[],
}
interface THostDetail {
  origin: string,
  protocol: string,
  host: string,
  port: number,
}