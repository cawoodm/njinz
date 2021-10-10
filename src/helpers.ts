/**
 * Helper Functions
 */
export function toArray<Type>(a: Type): Type[] {
  if (Array.isArray(a)) return a;
  if (typeof a === "undefined") return [];
  return [a];
}

export function die(msg: string) {
  throw new Error(msg);
}
