# @bhsd/lezer-json

[![npm version](https://badge.fury.io/js/@bhsd%2Flezer-json.svg)](https://www.npmjs.com/package/@bhsd/lezer-json)
[![CodeQL](https://github.com/bhsd-harry/lezer-json/actions/workflows/codeql.yml/badge.svg)](https://github.com/bhsd-harry/lezer-json/actions/workflows/codeql.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/5f155a10407b4f449430725db3b1bb47)](https://app.codacy.com/gh/bhsd-harry/lezer-json/dashboard)

This is a fork of [@lezer/json](https://www.npmjs.com/package/@lezer/json) and
[@codemirror/lang-json](https://www.npmjs.com/package/@codemirror/lang-json)
that adds a dialect for [JSONC](https://jsonc.org/) to provide support for
comments and trailing commas.

## Installation

You can install the package via npm and import it as a module:

```bash
npm install @bhsd/lezer-json
```

## Language Support

You can directly import the language support that provides both the [language](#language)
and the basic [completion source](#completion-source) for JSON or JSONC.

```ts
import {json} from '@bhsd/lezer-json';
import type {LanguageSupport} from '@codemirror/language';

const jsonLanguageSupport: LanguageSupport = json(),
	jsoncLanguageSupport: LanguageSupport = json('jsonc');
```

## Language

You can also import the [LR language](https://codemirror.net/docs/ref/#language.LRLanguage)
for JSON or JSONC alone.

```ts
import {jsonLanguage, jsoncLanguage} from '@bhsd/lezer-json';
```

## Completion Source

If you are importing the [language](#language) alone, you can choose to import
the completion source which provides basic completion for both JSON and JSONC.

```ts
import {jsonCompletionSource, jsonLanguage, jsoncLanguage} from '@bhsd/lezer-json';
import type {Extension} from '@codemirror/state';

const jsonCompletion: Extension = jsonLanguage.data.of({autocomplete: jsonCompletionSource}),
	jsoncCompletion: Extension = jsoncLanguage.data.of({autocomplete: jsonCompletionSource});
```

## Lint Source

This package also provides lint sources for JSON or JSONC syntax checking. This
is not included in the language support by default.

```ts
import {linter} from '@codemirror/lint';
import {jsonLinter, jsoncLinter} from '@bhsd/lezer-json';
import type {Extension} from '@codemirror/state';

const jsonLintExtension: Extension = linter(jsonLinter),
	jsoncLintExtension: Extension = linter(jsoncLinter);
```
