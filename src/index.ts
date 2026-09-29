import {
	continuedIndent,
	indentNodeProp,
	foldNodeProp,
	foldInside,
	LRLanguage,
	LanguageSupport,
	syntaxTree,
} from '@codemirror/language';
import {lintJSON, lintJSONC} from '@bhsd/common';
import {parser} from './parser.js';
import type {LintSource, Diagnostic} from '@codemirror/lint';
import type {Completion, CompletionSource} from '@codemirror/autocomplete';

const props = [
		indentNodeProp.add({
			Object: continuedIndent({except: /^\s*\}/u}),
			Array: continuedIndent({except: /^\s*\]/u}),
		}),
		foldNodeProp.add({
			'Object Array': foldInside,
		}),
	],
	options = ['true', 'false', 'null'].map((label): Completion => ({label, type: 'keyword'})),
	languageData = {
		closeBrackets: {brackts: ['[', '{', '"']},
		indentOnInput: /^\s*[}\]]$/u,
	};

/** LR language for JSON. */
export const jsonLanguage = /* #__PURE__ */ (() => LRLanguage.define({
	name: 'json',
	parser: parser.configure({props}),
	languageData,
}))();

/** LR language for JSONC. */
export const jsoncLanguage = /* #__PURE__ */ (() => LRLanguage.define({
	name: 'jsonc',
	parser: parser.configure({props, dialect: 'jsonc'}),
	languageData: {
		...languageData,
		commentTokens: {
			line: '//',
			block: {open: '/*', close: '*/'},
		},
	},
}))();

export const jsonCompletionSource: CompletionSource = context => {
	const mt = context.matchBefore(/(?:^|[[,:])\s*[a-z]+$/u);
	if (!mt) {
		return null;
	}
	const {state, pos} = context,
		{name: n, parent: p} = syntaxTree(state).resolveInner(pos, -1),
		{from, text} = mt;
	return p?.name === 'Array' && !text.startsWith(':')
		|| n !== 'PropertyName' && p?.name === 'Property' && !/^[[,]/u.test(text)
		? {
			from: from + text.search(/[a-z]/iu),
			options,
			validFor: /^[a-z]*$/iu,
		}
		: null;
};

/**
 * Get language support for JSON or JSONC.
 * @param dialect The dialect to use, either omitted or `'jsonc'` for JSON with comments.
 */
export const json = (dialect?: 'jsonc'): LanguageSupport => {
	const lang = dialect === 'jsonc' ? jsoncLanguage : jsonLanguage;
	return new LanguageSupport(lang, lang.data.of({autocomplete: jsonCompletionSource}));
};

const getLintSource = (lint: typeof lintJSON): LintSource => ({state: {doc}}) => lint(doc.toString())
	.map(({message, from, to = from, severity}): Diagnostic => ({message, severity, from, to}));

/** Lint source for JSON */
export const jsonLinter = /* #__PURE__ */ getLintSource(lintJSON);

/** Lint source for JSONC */
export const jsoncLinter = /* #__PURE__ */ getLintSource(lintJSONC);
