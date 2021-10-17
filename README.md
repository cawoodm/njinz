# INJIN-Z

## What is it?

INJIN-Z is a webserver/reverse proxy similar to NGINX but with several
differences:

- Deno-based (like NodeJS)
- Programmable extensions with javascript/typescript
- YAML or JSON configuration
- Simple rulesets and when/then logic for handlers
- Multiple workers
- Active health checks
- Advanced caching

## Getting Started for Users

- Download and run the `injinz` executable
- Hit http://localhost:8889 to see it in action
- Alternatively, configure your webserver based off `config.yaml`
- Run `injinz -f yourconfig.yaml` to see the results
- See the section Configuration for more information

## Configuration
Your server is controlled by binding **Hosts** to **Rule Sets**.
Each rule set contains one or more **Rules** which control if and when a **Handler** applies. You can re-use rule sets between different hosts or have the same set of rule sets for multiple hosts. As simple configuration to return hello at `http://localhost/` could be:
```yaml
  - host: ':80'
  - ruleSets:
    - main:
      - when: /
      - then:
          send: <h1>Hello!<h1>
```
Note:
- The port (e.g. `80`) is mandatory but the hostname is not.
- The `when` is optional and, if dropped, the handler will always apply
- If multiple rules are specified, the first match will exit the rule set
  - Set `mode: all` if you want all matched handlers to apply
* TODO: Make `host` a `string | string[]`
* TODO: Make `ruleSets` default to `main`
* TODO: Make standard `error` handler to throw errors

The flexibility is astounding. You can make a rule set called `check` which does a sanity/security check on all incoming requests and apply it to all your hosts:
```yaml
- rulesets:
  check:
    when: path matches \.\.
    then:
      error: 400 Invalid path
```

Specify a `.yaml` or `.json` file confirming to the [schema](https://raw.githubusercontent.com/cawoodm/njinz/master/config.schema.json):
- `global`: Global values
  - `dirs`: Common directories
    - `htdocs`: Standard static content served from here
    - `errdocs`: Error pages served from here
    - `cache`: Simple cache location
  - `files`: Common files:
    - `mimes`: Path to `mimes.yaml`
  - `env`: Import environment variables
    - `HOSTNAME`
  - `refs`: Arbitrary key-value configurations store
   - `foo: bar`
- hosts
- ruleSets

## Matchers
Each rule can have a conditional clause called a `when` which determines if the handler applies.

By default the condition applies to the start of the request path:
- `when: /foo`: Will match any path starting with '/foo' e.g. `/foo/bar`
  - Same as `path startsWith /foo` or `req.path startsWith /foo`
  - Opposite of `path !startsWith /foo` or `!/foo`
However you have several standard matchers:
- **Equality**: `== /foo`: Will match only the exact path '/foo'
  - Same as `path equals /foo`
  - Opposite of as `path !== /foo`
- **Wildcards**: `when: resource like *foo*`: Will match any path plus query string containing in 'foo' e.g. `/some/path?a=1b=foo`
  - Same as `querystring = *foo*`
  - Opposite of `querystring != *foo*` which matches queries NOT containing 'foo'
  - Uses `*` for multiple and `?` single character wildcards
  - Is NOT case sensitive
- **Regular Expressions** `when: querystring matches foo$`: Will (RegExp) match any query string ending in 'foo' e.g. `/some/path?a=1b=foo`
  - Is case sensitive
  - Same as `when: querystring ~ foo`

### Matching Maps
You can also work with various Map entities such as:
- `when: query contains nocache`: Will match `?nocache=anything` in the query string
- `when: query.nocache == X`: Will match `?nocache=X`
- `when: headers contains X-Forwarded-For`: Will match requests from any downstream proxy
- `when: headers.x-forwarded-for == foo.bar`: Will match requests from a specific downstream proxy
- `when: paths contains foo`: Will match any `*/path/containing/foo/*`

## Plugins
- Copy Matchers to `etc/injinz/plugins/matchers`
  - Each matcher is a simple `<matcherName>.js` file with the following standards:
    - Naming: `isJustLike.js`
    - Signature: `export default function(obj, params) {...}`
    - Usage: `- when: isJustLike foo`
## Getting Started for DEVs

- Install Deno
  - `curl -fsSL https://deno.land/x/install/install.sh | sh`
  - `iwr https://deno.land/x/install/install.ps1 -useb | iex`
- Install Deno extension for VSCode
- Install Denon:
  - `deno install --allow-read --allow-run --allow-write -f --unstable https://deno.land/x/denon/denon.ts`
- Run in dev mode:
  - `deno dev`
- Run functional tests:
  - Start your server
  - `deno test -A tests/functional.test.ts`
