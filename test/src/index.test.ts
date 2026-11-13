import * as assert from 'assert';
import {EditorState} from '@codemirror/state';
import {syntaxTree} from '@codemirror/language';
import {CompletionContext} from '@codemirror/autocomplete';
import {describe, it} from '@bhsd/test-util/mocha';
import {jsoncLanguage, jsonCompletionSource} from '../../dist/index.js';
import type {Completion, CompletionResult} from '@codemirror/autocomplete';

const baseResult: Omit<CompletionResult, 'from'> = {
	options: ['true', 'false', 'null'].map((label): Completion => ({label, type: 'keyword'})),
	validFor: /^[a-z]*$/iu,
};

const test = (code: string, pos: number, type: string, parentName: string, from?: number): void => {
	const state = EditorState.create({doc: code, extensions: [jsoncLanguage]}),
		{name: n, parent: p} = syntaxTree(state).resolveInner(pos, -1);
	assert.strictEqual(n, type);
	assert.strictEqual(p?.name, parentName);
	assert.deepStrictEqual(
		jsonCompletionSource(new CompletionContext(state, pos, false)),
		from === undefined ? null : {...baseResult, from},
	);
};

describe('autocomplete', () => {
	it('string', () => {
		test('["string, t"', 11, 'String', 'Array');
		test('{"key": "string: t"', 18, 'String', 'Property');
	});
	it('top-level', () => {
		test('t', 1, '⚠', 'JsonText', 0);
		test(' t', 2, '⚠', 'JsonText', 1);
		test('\nt', 2, '⚠', 'JsonText', 1);
		test('true', 1, 'True', 'JsonText', 0);
		test('false', 1, 'False', 'JsonText', 0);
		test('null', 1, 'Null', 'JsonText', 0);
	});
	it('array element', () => {
		test('[t', 2, '⚠', 'Array', 1);
		test('[ t', 3, '⚠', 'Array', 2);
		test('[\n\tt', 4, '⚠', 'Array', 3);
		test('[0,t', 4, '⚠', 'Array', 3);
		test('[0, t', 5, '⚠', 'Array', 4);
		test('[\t  0,\n  t', 10, '⚠', 'Array', 9);
		test('[true', 2, 'True', 'Array', 1);
		test('[false', 2, 'False', 'Array', 1);
		test('[null', 2, 'Null', 'Array', 1);
	});
	it('property value', () => {
		test('{"key":t', 8, '⚠', 'Property', 7);
		test('{"key": t', 9, '⚠', 'Property', 8);
		test('{\n\t"key":\n\t\tt', 13, '⚠', 'Property', 12);
		test('{"key":true', 8, 'True', 'Property', 7);
		test('{"key":false', 8, 'False', 'Property', 7);
		test('{"key":null', 8, 'Null', 'Property', 7);
	});
});
