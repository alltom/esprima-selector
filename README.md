esprima-selector
================

Use CSS-like selectors to match nodes in an [esprima](http://esprima.org/) abstract syntax tree (AST).

Usage
-----

    var eselector = require('esprima-selector');

If you're using a library like [falafel](https://github.com/substack/node-falafel), then you have a callback function that takes an AST node as its argument. Well, `eselector.tester()` accepts an array of such functions, each with a CSS-like selector for the nodes it should be called for. Example:

```js
var eselector = require('esprima-selector');

var src = falafel(fs.readFileSync('test.js', 'utf8'), eselector.tester([
	{
		selector: '*',
		callback: function (node) { console.log('node', node.name, node.classes) },
	},
	{
		selector: 'program',
		callback: function (node) {
			node.update("var indent = []; function start() { console.log(indent.join('') + '*'); indent.push('\t') } function end() { indent.pop() }" + node.source());
		},
	},
	{
		selector: 'program declaration.function > block',
		callback: function (node) {
			node.update("start();" + node.source() + "end();");
		},
	},
]));
```

Quick Reference
---------------

### Nodes (a.k.a. CSS 'tags')

You select these as if they were CSS tags (ex: `block > statement`):

* `program` (the outermost node)
* `expression` (e.g. variable references, math expressions, initializers)
* `statement` (e.g. `return`, `if(...) {...}`, `debugger`)
* `clause` (e.g. `catch(e) {...}`)
* `block` (e.g. `{...}`)
* `declaration` (e.g. `var x = ...`)
* `declarator` (e.g. the `x = ...` part of `var x = ...`)
* `property` (e.g. the `a:` part of `{a: 42}`)
* `switch-case` (e.g. `case 42: ...`)

### Classes

You select these as if they were CSS classes (ex: `.function` or `declaration.function`):

* identifier (e.g. variable reference)
* literal (e.g. `42` or `"foo"`)
* this
* call (e.g. `a()`)
* unary (e.g. `-i`)
* update (e.g. `i++`)
* binary (e.g. `a + b`)
* array
* assignment
* member (e.g. `a.b`)
* logical (e.g. `a && b`)
* ternary (e.g. `a ? b : c`)
* comma (e.g. `a, b`)
* object
* new
* function
* return
* break
* label (e.g. `foo:`)
* expression
* if
* while
* do-while
* throw
* try
* catch
* for
* forin
* switch
* debugger
* variable
* branch (e.g. the `{...}` of `if (...) {...}`)
* consequent (the first branch of an `if` statement)
* alternate (the `else` branch of an `if` statement)
