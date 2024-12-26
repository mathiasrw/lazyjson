
# LazyJSON

> Write your JSON, skip the quotes, add comments - great for configuration.

LazyJSON is a simplified approach to configuration notation that resembles JSON but makes things easier to type. It allows configurations in scripts and files to remain clean and readable by reducing syntax overhead.



ES6 import and use `parse` and `stringify` as normal:

```js
import LJSON from "lazyjson";

let config = LJSON.parse('foo:bar, abc:[a,b,c]');

console.log(config);

//  {
//    "foo": "bar",
//    "abc": [
//      "a",
//      "b",
//      "c"
//    ]
//  }
```

### Install

Install via npm, yarn, or download the standalone binary:

```bash
bun add lazyjson

yarn add lazyjson

npm install lazyjson
```

### Comments

LazyJSON supports single-line comments using `// ...` and multi-line comments with `/* ... */`.


### Quotes

Quotes are generally not required. However, if a string includes any of the following characters, you must enclose it in quotes:
- `//`
- `/*`
- `"`
- `'`
- `` ` ``

You can use `"`, `'`, or `` ` `` as quotes. 

Example:

```javascript
LJSON.parse(`
  path: /usr/local/bin,     // No quotes needed for paths

  message: "Hello, world!", // Quotes required for strings with special characters

  notes: 'Use "single quotes" if preferred',

  notes2: \`Or use a 'backtick'\`,     
  
  /*
    Yep, 
    trailing commas are also OK
  */
`);
```
