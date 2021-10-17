import { Global } from "./types.ts";
const refs = {
  format(g: Global, str: string): string {
    let refs = str.match(/\$refs\.(\w+)/);
    if (!refs) return str;
    refs.forEach((r) => {
      str = str.replace(`\$ref.${r}`, g.refs[r]);
    });
    return str;
  },
};
export default refs;
