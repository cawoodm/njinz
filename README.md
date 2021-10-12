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

## Getting Started for DEVs

- Install Deno
  - `curl -fsSL https://deno.land/x/install/install.sh | sh`
  - `iwr https://deno.land/x/install/install.ps1 -useb | iex`
- Install Denon:
  - `deno install --allow-read --allow-run --allow-write -f --unstable https://deno.land/x/denon/denon.ts`
- Install Deno extension for VSCode
- Install Denon:
  - `deno install --allow-read --allow-run --allow-write -f --unstable https://deno.land/x/denon/denon.ts`
- Run in dev mode:
  - `deno dev`
- Run functional tests:
  - Start your server
  - `deno test -A tests/functional.test.ts`
