# @bhsd/lezer-json

This is a fork of [@lezer/json](https://www.npmjs.com/package/@lezer/json) and [@codemirror/lang-json](https://www.npmjs.com/package/@codemirror/lang-json) that adds a dialect for [JSONC](https://jsonc.org/) to provide support for comments and trailing commas.

## Installation

You can install the package via npm and import it as a module:

```bash
npm install @bhsd/lezer-json
```

## Language Support

```ts
import {jsonc} from '@bhsd/lezer-json';
import type {LanguageSupport} from '@codemirror/language';

const langSupport: LanguageSupport = jsonc();
```

## Language

You can also import the [LR language](https://codemirror.net/docs/ref/#language.LRLanguage) for JSONC alone.

```ts
import {jsoncLanguage} from '@bhsd/lezer-json';
```

## Lint Source

This package also provides a [lint source](https://codemirror.net/docs/ref/#lint.LintSource) for JSONC syntax checking.

```ts
import {linter} from '@codemirror/lint';
import {jsoncLinter} from '@bhsd/lezer-json';
import type {Extension} from '@codemirror/state';

const extension: Extension = linter(jsoncLinter);
```
