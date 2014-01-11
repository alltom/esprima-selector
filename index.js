// returns true if selector matches the given esprima node
// example selectors:
//   *
//   statement.return
//   expression.identifier
//   program declaration.function > block
//   statement.return > expression
//   expression.literal, expression.identifier
function test(selectorString, node) {
	// TODO: complain about syntax errors
	var alternates = selectorString.split(",");
	return alternates.some(function (selectorString) {
		var selector = splitSelector(selectorString + '>');
		return matchUpward(selector, node);
	});
}

// accepts an array of objects that look like this:
//   { selector: "statement.return", callback: function (node) { } }
// returns a function that takes a node and calls the callbacks that have matching selectors.
// useful as a falafel callback.
function tester(selectors) {
	return function (node) {
		var self = this, args = Array.prototype.slice.apply(arguments);
		selectors.forEach(function (s) {
			if (test(s.selector, node)) {
				s.callback.apply(self, args);
			}
		});
	};
}

function splitSelector(selectorString) {
	var regexp = /([\.a-z]+)(?:\s*(>))?/ig;
	var m, pieces = [];
	while (m = regexp.exec(selectorString)) {
		var selector = {};
		var namePieces = m[1].split('.');
		if (namePieces[0].length > 0) selector.name = namePieces[0];
		if (namePieces.length > 1) selector.classes = namePieces.slice(1);
		if (m[2]) {
			selector.directDescendant = true;
		}
		pieces.push(selector);
	}
	return pieces;
}

function matchUpward(selector, node) {
	if (selector.length === 0) {
		return true;
	}
	if (!node) {
		return false;
	}

	var last = selector[selector.length - 1];
	var tag = nodeTag(node);

	if (tag && isMatch(tag, last)) {
		return matchUpward(selector.slice(0, selector.length - 1), node.parent);
	} else if (!last.directDescendant) {
		return matchUpward(selector, node.parent);
	} else {
		return false;
	}
}

function nodeTag(node) {
	if (node.type === 'Identifier') {
		var exprTag = { name: 'expression', classes: ['identifier'] };
		switch (node.parent.type) {
		case 'VariableDeclarator': if (node.parent.init === node) return decorate(exprTag); break;
		case 'AssignmentExpression': if (node.parent.right === node) return decorate(exprTag); break;
		case 'MemberExpression': if ((node.parent.object === node) || (node.parent.computed && node.parent.property === node)) return decorate(exprTag); break;
		case 'Property': if (node.parent.value === node) return decorate(exprTag); break;
		case 'CallExpression': return decorate(exprTag);
		case 'BinaryExpression': return decorate(exprTag);
		case 'ReturnStatement': return decorate(exprTag);
		case 'UnaryExpression': return decorate(exprTag);
		case 'NewExpression': return decorate(exprTag);
		case 'LogicalExpression': return decorate(exprTag);
		case 'FunctionDeclaration': break;
		case 'FunctionExpression': break;
		default: throw new Error('unrecognized identifier parent ' + node.parent.type);
		}
		return undefined;
	} else if (node.type === 'Literal') {
		return decorate({ name: 'expression', classes: ['literal'] });
	} else if (node.type === 'CallExpression') {
		return decorate({ name: 'expression', classes: ['call'] });
	} else if (node.type === 'UnaryExpression') {
		return decorate({ name: 'expression', classes: ['unary'] });
	} else if (node.type === 'BinaryExpression') {
		return decorate({ name: 'expression', classes: ['binary'] });
	} else if (node.type === 'ArrayExpression') {
		return decorate({ name: 'expression', classes: ['array'] });
	} else if (node.type === 'AssignmentExpression') {
		return decorate({ name: 'expression', classes: ['assignment'] });
	} else if (node.type === 'MemberExpression') {
		return decorate({ name: 'expression', classes: ['member'] });
	} else if (node.type === 'LogicalExpression') {
		return decorate({ name: 'expression', classes: ['logical'] });
	} else if (node.type === 'ObjectExpression') {
		return decorate({ name: 'expression', classes: ['object'] });
	} else if (node.type === 'NewExpression') {
		return decorate({ name: 'expression', classes: ['new'] });
	} else if (node.type === 'FunctionExpression') {
		return decorate({ name: 'expression', classes: ['function'] });

	} else if (node.type === 'ReturnStatement') {
		return decorate({ name: 'statement', classes: ['return'] });
	} else if (node.type === 'BreakStatement') {
		return decorate({ name: 'statement', classes: ['break'] });
	} else if (node.type === 'ExpressionStatement') {
		return decorate({ name: 'statement', classes: ['expression'] });
	} else if (node.type === 'IfStatement') {
		return decorate({ name: 'statement', classes: ['if'] });
	} else if (node.type === 'WhileStatement') {
		return decorate({ name: 'statement', classes: ['white'] });
	} else if (node.type === 'ThrowStatement') {
		return decorate({ name: 'statement', classes: ['throw'] });
	} else if (node.type === 'ForInStatement') {
		return decorate({ name: 'statement', classes: ['forin'] });
	} else if (node.type === 'SwitchStatement') {
		return decorate({ name: 'statement', classes: ['switch'] });

	} else if (node.type === 'BlockStatement') {
		return decorate({ name: 'block', classes: [] });

	} else if (node.type === 'VariableDeclaration') {
		return decorate({ name: 'declaration', classes: ['variable'] });
	} else if (node.type === 'FunctionDeclaration') {
		return decorate({ name: 'declaration', classes: ['function'] });

	} else if (node.type === 'VariableDeclarator') {
		return decorate({ name: 'declarator', classes: [] });

	} else if (node.type === 'Property') {
		return decorate({ name: 'property', classes: [] });

	} else if (node.type === 'SwitchCase') {
		return decorate({ name: 'switch-case', classes: [] });

	} else if (node.type === 'Program') {
		return decorate({ name: 'program', classes: [] });
	}
	// console.error(node);
	// console.error(node.source());
	throw new Error('tag not found for ' + node.type);

	function decorate(tag) {
		if (node.parent) {
			if (node.parent.type === 'IfStatement') {
				if (node.parent.consequent === node) {
					tag.classes.push('branch', 'consequent');
				} else if (node.parent.alternate === node) {
					tag.classes.push('branch', 'alternate');
				}
			}
		}
		return tag;
	}
}

function isMatch(tag, selector) {
	if (('name' in selector) && selector.name !== '*' && tag.name !== selector.name) {
		return false;
	}

	if (('classes' in selector)) {
		for (var i in selector.classes) {
			if (tag.classes.indexOf(selector.classes[i]) === -1) {
				return false;
			}
		}
	}

	return true;
}

module.exports = test;
module.exports.tester = tester;
module.exports.nodeTag = nodeTag;
