# ToDo

## Handlers as Plugins
Convert existing handlers to separate plugin `.js` files.
- Create `errorHandler.js` to throw given statusCode
  - `when: method != get`
  - `then: error 405 Method not supported`

## Plugin Framework
- Explicit loading of `global.plugins[]` only
- Verify all matchers and handlers are uniquely named

## Matcher/Handler Compatability
If  matchers return different object types (e.g boolean/array/object) we need to manage compatability with handlers.
- Stick to an array?
- Stick to a hashmap (object) which could also support arrays as:
  - `{'0': '/full/path', '1': 'path'}`

## YAML Special Characters
Need to watch out for these unquoted:
 `{`, `}`, `[`, `]`, `&`, `*`, `#`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`, `:` also `` ` `` and `,`

