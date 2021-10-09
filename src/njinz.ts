import { opine } from "https://deno.land/x/opine@1.8.0/mod.ts";
import { urlParse } from "https://deno.land/x/url_parse@1.0.0/mod.ts";
import type { HostDetail, VServer } from "./types.ts";
// import { VServer } from '../../../C:/Marc/work/njinz/types.ts'

const njinz: VServer = {
  ports: [],
  vhosts: [],
  ruleSets: [],
};

const config = {
  "hosts": [
    {
      "host": "http://localhost:80",
      "ruleSets": [
        "main",
      ],
    },
  ],
  "ruleSets": {
    "main": {
      rules: [
        {
          "when": "/ping",
          "then": {
            "static": "Pong!",
          },
        },
        {
          "when": "/",
          "then": {
            "proxy": "https://github.com/asos-craigmorten/opine-http-proxy",
          },
        },
      ],
    },
  },
};

config.hosts.forEach((host) => {
  let vhost: HostDetail = URL2VHost(host.host);
  if (njinz.ports.indexOf(vhost.port) < 0) njinz.ports.push(vhost.port);
  njinz.vhosts.push({
    host: vhost,
    ruleSets: host.ruleSets,
  });
});

const app = opine();
app.get("/", function (req, res) {
  res.send("Hello World");
});
app.listen(
  3000,
  () => console.log("server has started on http://localhost:3000 🚀"),
);

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
