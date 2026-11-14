import assert from 'assert';
import {describe, it} from '@bhsd/test-util/mocha';
import {jsonLanguage, jsoncLanguage} from '../../dist/index.js';

const jsonParser = jsonLanguage.parser.configure({strict: true}),
	jsoncParser = jsoncLanguage.parser.configure({strict: true});

const isValid = (data: string, jsonc?: boolean): void => {
	if ((jsonc ? data.replaceAll(/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/gu, '') : data).trim()) {
		(jsonc ? jsoncParser : jsonParser).parse(data);
	}
};

const isInvalid = (data: string, jsonc?: boolean): void => {
	try {
		(jsonc ? jsoncParser : jsonParser).parse(data);
		assert.fail('Expected Lezer parser to fail');
	} catch (e) {
		assert.ok(e instanceof SyntaxError, data);
	}
};

describe('JSON Lint', () => {
	it('JSON parsing failures', () => {
		isInvalid('["Unclosed array"');
		isInvalid('{unquoted_key: "keys must be quoted"}');
		isValid('["extra comma",]');
		isInvalid('["double extra comma",,]');
		isInvalid('[   , "<-- missing value"]');
		isInvalid('["Comma after the close"],');
		isInvalid('["Extra close"]]');
		isValid('{"Extra comma": true,}');
		isInvalid('{"Extra value after close": true} "misplaced quoted value"');
		isInvalid('{"Illegal expression": 1 + 2}');
		isInvalid('{"Illegal invocation": alert()}');
		isInvalid('{"Numbers cannot have leading zeroes": 013}');
		isInvalid('{"Numbers cannot be hex": 0x14}');
		isInvalid(String.raw`["Illegal backslash escape: \x15"]`);
		isInvalid(String.raw`[\naked]`);
		isInvalid(String.raw`["Illegal backslash escape: \017"]`);
		isInvalid('{"Missing colon" null}');
		isInvalid('{"Double colon":: null}');
		isInvalid('{"Comma instead of colon", null}');
		isInvalid('["Colon instead of comma": false]');
		isInvalid('["Bad value", truth]');
		isInvalid("['single quote']");
		// eslint-disable-next-line @stylistic/no-tabs
		isInvalid('["	tab	character	in	string	"]');
		isInvalid(String.raw`["tab\   character\   in\  string\  "]`);
		isInvalid('["line\nbreak"]');
		isInvalid(
			String.raw`["line\
break"]`,
		);
		isInvalid('[0e]');
		isInvalid('[0e+]');
		isInvalid('[0e+-1]');
		isInvalid('{"Comma instead if closing brace": true,');
		isInvalid('["mismatch"}');
		isInvalid('{"extra brace": 1}}');
	});
});

describe('vscode-json-languageservice for JSON', () => {
	it('Invalid body', () => {
		isInvalid(' *');
		isInvalid('{}[]');
	});

	it('Trailing Whitespace', () => {
		isValid('{}\n\n');
	});

	it('No content', () => {
		isValid('');
		isValid(' '.repeat(3));
		isValid('\n\n');
		isInvalid('/*hello*/  ');
	});

	it('Objects', () => {
		isValid('{}');
		isValid('{"key": "value"}');
		isValid('{"key1": true, "key2": 3, "key3": [null], "key4": { "nested": {}}}');
		isValid('{"constructor": true }');
		isInvalid('{');
		isInvalid('{3:3}');
		isInvalid("{'key': 3}");
		isInvalid('{"key" 3}');
		isInvalid('{"key":3 "key2": 4}');
		isValid('{"key":42, }');
		isInvalid('{"key:42');
	});

	it('Arrays', () => {
		isValid('[]');
		isValid('[1, 2]');
		isValid('[1, "string", false, {}, [null]]');
		isInvalid('[');
		isInvalid('[,]');
		isInvalid('[1 2]');
		isInvalid('[true false]');
		isValid('[1, ]');
		isInvalid('[[]');
		isInvalid('["something"');
		isInvalid('[magic]');
	});

	it('Strings', () => {
		isValid('["string"]');
		isValid(String.raw`["\"\\\/\b\f\n\r\t\u1234\u12AB"]`);
		isValid(String.raw`["\\"]`);
		isInvalid('["');
		isInvalid('["]');
		isInvalid(String.raw`["\z"]`);
		isInvalid(String.raw`["\u"]`);
		isInvalid(String.raw`["\u123"]`);
		isInvalid(String.raw`["\u123Z"]`);
		isInvalid("['string']");
		isInvalid('"\tabc"');
	});

	it('Numbers', () => {
		isValid('[0, -1, 186.1, 0.123, -1.583e+4, 1.583E-4, 5e8]');
		isInvalid('[+1]');
		isInvalid('[01]');
		isInvalid('[1.]');
		isInvalid('[1.1+3]');
		isInvalid('[1.4e]');
		isInvalid('[-A]');
	});

	it('Comments', () => {
		isInvalid('/*d*/ { } /*e*/');
		isInvalid('/*d { }');
		isValid('{ "//": "comment1", "//": "comment2" }');
		isValid('{ "regularKey": "value1", "regularKey": "value2" }');
	});

	it('Simple AST', () => {
		isValid('{}');
		isValid('[null]');
		isValid('{"a":true}');
	});

	it('Nested AST', () => {
		isValid('{\n\t"key" : {\n\t"key2": 42\n\t}\n}');
	});

	it('Nested AST in Array', () => {
		isValid('{"key":[{"key2":42}]}');
	});

	it('Multiline', () => {
		isValid('{\n\t\n}');
		isValid('{\n"first":true\n\n}');
	});

	it('Expand errors to entire tokens', () => {
		isInvalid('{\n"key":32,\nerror\n}');
	});

	it('Errors at the end of the file', () => {
		isInvalid('{\n"key":32\n ');
	});

	it('Getting keys out of an object', () => {
		isValid('{\n"key":32,\n\n"key2":45}');
	});

	it('Missing colon', () => {
		isInvalid('{\n"key":32,\n"key2"\n"key3": 4 }');
	});

	it('Missing comma', () => {
		isInvalid('{\n"key":32,\n"key2": 1 \n"key3": 4 }');
	});

	it('Duplicate keys', () => {
		isValid('{"a": 1, "a": 2}');
		isValid('{"a": { "a": 2, "a": 3}}');
		isValid('[{ "a": 2, "a": 3, "a": 7}]');
	});

	it('Strings with spaces', () => {
		isValid('{"key1":"first string", "key2":["second string"]}');
	});

	it('parse with comments', () => {
		isInvalid('// comment\n{\n"far": "boo"\n}');
		isInvalid('/* comm\nent\nent */\n{\n"far": "boo"\n}');
		isValid('{\n"far": "boo"\n}');
	});

	it('parse with comments collected', () => {
		isInvalid('// comment\n{\n"far": "boo"\n}');
		isInvalid('/* comm\nent\nent */\n{\n"far": "boo"\n}');
		isValid('{\n"far": "boo"\n}');
	});

	it('validate DocumentLanguageSettings: trailingCommas', () => {
		isValid('{ "pages": [  "pages/index", "pages/log", ] }');
	});

	it('validate DocumentLanguageSettings: comments', () => {
		isInvalid('{ "count": 1 /* change */ }');
	});
});

describe('vscode-json-languageservice for JSONC', () => {
	it('Invalid body', () => {
		isInvalid(' *', true);
		isInvalid('{}[]', true);
	});

	it('No content', () => {
		isValid('/*hello*/  ', true);
	});

	it('Objects', () => {
		isInvalid('{', true);
		isInvalid('{3:3}', true);
		isInvalid("{'key': 3}", true);
		isInvalid('{"key" 3}', true);
		isInvalid('{"key":3 "key2": 4}', true);
		isValid('{"key":42, }', true);
		isInvalid('{"key:42', true);
	});

	it('Arrays', () => {
		isInvalid('[', true);
		isInvalid('[,]', true);
		isInvalid('[1 2]', true);
		isInvalid('[true false]', true);
		isValid('[1, ]', true);
		isInvalid('[[]', true);
		isInvalid('["something"', true);
		isInvalid('[magic]', true);
	});

	it('Strings', () => {
		isInvalid('["', true);
		isInvalid('["]', true);
		isInvalid(String.raw`["\z"]`, true);
		isInvalid(String.raw`["\u"]`, true);
		isInvalid(String.raw`["\u123"]`, true);
		isInvalid(String.raw`["\u123Z"]`, true);
		isInvalid("['string']", true);
		isInvalid('"\tabc"', true);
	});

	it('Numbers', () => {
		isInvalid('[+1]', true);
		isInvalid('[01]', true);
		isInvalid('[1.]', true);
		isInvalid('[1.1+3]', true);
		isInvalid('[1.4e]', true);
		isInvalid('[-A]', true);
	});

	it('Comments', () => {
		isValid('/*d*/ { } /*e*/', true);
		isInvalid('/*d { }', true);
		isValid('{ "//": "comment1", "//": "comment2" }', true);
		isValid('{ "regularKey": "value1", "regularKey": "value2" }', true);
	});

	it('Expand errors to entire tokens', () => {
		isInvalid('{\n"key":32,\nerror\n}', true);
	});

	it('Errors at the end of the file', () => {
		isInvalid('{\n"key":32\n ', true);
	});

	it('Missing colon', () => {
		isInvalid('{\n"key":32,\n"key2"\n"key3": 4 }', true);
	});

	it('Missing comma', () => {
		isInvalid('{\n"key":32,\n"key2": 1 \n"key3": 4 }', true);
	});

	it('Duplicate keys', () => {
		isValid('{"a": 1, "a": 2}', true);
		isValid('{"a": { "a": 2, "a": 3}}', true);
		isValid('[{ "a": 2, "a": 3, "a": 7}]', true);
	});

	it('parse with comments', () => {
		isValid('// comment\n{\n"far": "boo"\n}', true);
		isValid('/* comm\nent\nent */\n{\n"far": "boo"\n}', true);
	});

	it('parse with comments collected', () => {
		isValid('// comment\n{\n"far": "boo"\n}', true);
		isValid('/* comm\nent\nent */\n{\n"far": "boo"\n}', true);
	});

	it('validate DocumentLanguageSettings: trailingCommas', () => {
		isValid('{ "pages": [  "pages/index", "pages/log", ] }', true);
	});

	it('validate DocumentLanguageSettings: comments', () => {
		isValid('{ "count": 1 /* change */ }', true);
	});
});

describe('jsonc-parser', () => {
	it('parse: literals', () => {
		isValid('true', true);
		isValid('false', true);
		isValid('null', true);
		isValid('"foo"', true);
		isValid(String.raw`"\"-\\-\/-\b-\f-\n-\r-\t"`, true);
		isValid(String.raw`"\u00DC"`, true);
		isValid('9', true);
		isValid('-9', true);
		isValid('0.129', true);
		isValid('23e3', true);
		isValid('1.2E+3', true);
		isValid('1.2E-3', true);
		isValid('1.2E-3 // comment', true);
	});

	it('parse: objects', () => {
		isValid('{}', true);
		isValid('{ "foo": true }', true);
		isValid('{ "bar": 8, "xoo": "foo" }', true);
		isValid('{ "hello": [], "world": {} }', true);
		isValid('{ "a": false, "b": true, "c": [ 7.4 ] }', true);
		isValid(
			'{ "lineComment": "//", "blockComment": ["/*", "*/"], "brackets": [ ["{", "}"], ["[", "]"], ["(", ")"] ] }',
			true,
		);
		isValid('{ "hello": [], "world": {} }', true);
		isValid('{ "hello": { "again": { "inside": 5 }, "world": 1 }}', true);
		isValid('{ "foo": /*hello*/true }', true);
		isValid('{ "": true }', true);
	});

	it('parse: arrays', () => {
		isValid('[]', true);
		isValid('[ [],  [ [] ]]', true);
		isValid('[ 1, 2, 3 ]', true);
		isValid('[ { "a": null } ]', true);
	});

	it('parse: objects with errors', () => {
		isInvalid('{,}', true);
		isValid('{ "foo": true, }', true);
		isInvalid('{ "bar": 8 "xoo": "foo" }', true);
		isInvalid('{ ,"bar": 8 }', true);
		isInvalid('{ ,"bar": 8, "foo" }', true);
		isInvalid('{ "bar": 8, "foo": }', true);
		isInvalid('{ 8, "foo": 9 }', true);
	});

	it('parse: array with errors', () => {
		isInvalid('[,]', true);
		isInvalid('[ 1 2, 3 ]', true);
		isInvalid('[ ,1, 2, 3 ]', true);
		isInvalid('[ ,1, 2, 3, ]', true);
	});

	it('parse: errors', () => {
		isValid('', true);
		isInvalid('1,1', true);
	});

	it('parse: disallow comments', () => {
		isValid('[ 1, 2, null, "foo" ]');
		isValid('{ "hello": [], "world": {} }');
		isInvalid('{ "foo": /*comment*/ true }');
	});

	it('parse: trailing comma', () => {
		isValid('{ "hello": [], }', true);
		isValid('{ "hello": [] }', true);
		isValid('{ "hello": [], "world": {}, }', true);
		isValid('{ "hello": [], "world": {} }', true);
		isValid('[ 1, 2, ]', true);
		isValid('[ 1, 2 ]', true);
		isValid('{ "hello": [], }', true);
		isValid('{ "hello": [], "world": {}, }', true);
		isValid('[ 1, 2, ]', true);
	});
});
