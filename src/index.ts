import {
	continuedIndent,
	indentNodeProp,
	foldNodeProp,
	foldInside,
	LRLanguage,
	LanguageSupport,
} from '@codemirror/language';
import {lintJSON, lintJSONC} from '@bhsd/common';
import {parser} from './parser.js';
import type {LintSource, Diagnostic} from '@codemirror/lint';

const props = [
		indentNodeProp.add({
			Object: continuedIndent({except: /^\s*\}/u}),
			Array: continuedIndent({except: /^\s*\]/u}),
		}),
		foldNodeProp.add({
			'Object Array': foldInside,
		}),
	],
	languageData = {
		closeBrackets: {brackts: ['[', '{', '"']},
		indentOnInput: /^\s*[}\]]$/u,
	};

/** LR language for JSON. */
export const jsonLanguage = LRLanguage.define({
	name: 'json',
	parser: parser.configure({props}),
	languageData,
});

/** LR language for JSONC. */
export const jsoncLanguage = LRLanguage.define({
	name: 'jsonc',
	parser: parser.configure({props, dialect: 'jsonc'}),
	languageData: {
		...languageData,
		commentTokens: {
			line: '//',
			block: {open: '/*', close: '*/'},
		},
	},
});

/**
 * Get language support for JSON or JSONC.
 * @param dialect The dialect to use, either omitted or `'jsonc'` for JSON with comments.
 */
export const json = (dialect?: 'jsonc'): LanguageSupport =>
	new LanguageSupport(dialect === 'jsonc' ? jsoncLanguage : jsonLanguage);

const getLintSource = (lint: typeof lintJSON): LintSource => ({state: {doc}}) => lint(doc.toString())
	.map(({message, from, to = from, severity}): Diagnostic => ({message, severity, from, to}));

/** Lint source for JSON */
export const jsonLinter = /* @__PURE__ */ getLintSource(lintJSON);

/** Lint source for JSONC */
export const jsoncLinter = /* @__PURE__ */ getLintSource(lintJSONC);
