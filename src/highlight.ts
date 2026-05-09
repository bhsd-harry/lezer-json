import {styleTags, tags as t} from '@lezer/highlight';

export const jsonHighlighting = styleTags({
	LineComment: t.lineComment,
	BlockComment: t.blockComment,
	String: t.string,
	Number: t.number,
	'True False': t.bool,
	PropertyName: t.propertyName,
	Null: t.null,
	', :': t.separator,
	'[ ]': t.squareBracket,
	'{ }': t.brace,
});
