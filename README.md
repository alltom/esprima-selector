esprima-selector
================

Reeeeally early days, I'm sort of thinking out loud here.

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
			node.before("var indent = []; function start(n) { console.log(indent.join(''), n); indent.push('\t') } function end() { indent.pop() }");
		},
	},
	{
		selector: 'program declaration.function > block',
		callback: function (node) {
			node.before("start(n);");
			node.after("end(n);", true);
		},
	},
]));
```
