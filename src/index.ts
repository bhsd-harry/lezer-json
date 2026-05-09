import {
	continuedIndent,
	indentNodeProp,
	foldNodeProp,
	foldInside,
	LRLanguage,
	LanguageSupport,
} from '@codemirror/language';
import {parser} from './parser.js';

/** LR language for JSON. */
export const jsonLanguage = LRLanguage.define({
	name: 'json',
	parser: parser.configure({
		props: [
			indentNodeProp.add({
				Object: continuedIndent({except: /^\s*\}/u}),
				Array: continuedIndent({except: /^\s*\]/u}),
			}),
			foldNodeProp.add({
				'Object Array': foldInside,
			}),
		],
	}),
	languageData: {
		closeBrackets: {brackts: ['[', '{', '"']},
		indentOnInput: /^\s*[}\]]$/u,
	},
});

/**
 * Get language support for JSON or JSONC.
 * @param dialect The dialect to use, either omitted or `'jsonc'` for JSON with comments.
 */
export const json = (dialect?: 'jsonc'): LanguageSupport => new LanguageSupport(jsonLanguage);
