# @bhsd/lezer-json

This is a fork of [@lezer/json](https://www.npmjs.com/package/@lezer/json) and [@codemirror/lang-json](https://www.npmjs.com/package/@codemirror/lang-json) that adds a dialect for [JSONC](https://jsonc.org/) to provide support for comments and trailing commas.

## Installation

You can install the package via npm and import it as a module:

```bash
npm install @bhsd/lezer-json
```

## Language Support

```ts
import {json} from '@bhsd/lezer-json';
import type {LanguageSupport} from '@codemirror/language';

const jsonLanguageSupport: LanguageSupport = json(),
	jsoncLanguageSupport: LanguageSupport = json('jsonc');
```

## Language

You can also import the [LR language](https://codemirror.net/docs/ref/#language.LRLanguage) for JSON or JSONC alone.

```ts
import {jsonLanguage, jsoncLanguage} from '@bhsd/lezer-json';
```

## Lint Source

This package also provides [lint sources](https://codemirror.net/docs/ref/#lint.LintSource) for JSON or JSONC syntax checking.

```ts
import {linter} from '@codemirror/lint';
import {jsonLinter, jsoncLinter} from '@bhsd/lezer-json';
import type {Extension} from '@codemirror/state';

const jsonLintExtension: Extension = linter(jsonLinter),
	jsoncLintExtension: Extension = linter(jsoncLinter);
```
