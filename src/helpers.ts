/**
 * Helper Functions
 */
export function toArray<Type>(a: Type): Type[] {
  if (Array.isArray(a)) return a;
  if (typeof a === "undefined") return [];
  return [a];
}
export function trace(...args: any[]) {
  Deno.env.get("DEBUG_MODE") &&
    console.trace.apply(console, Array.from(arguments));
}
export function debug(...args: any[]) {
  Deno.env.get("DEBUG_MODE") &&
    console.debug.apply(console, Array.from(arguments));
}
export function die(msg: string) {
  throw new Error(msg);
}
