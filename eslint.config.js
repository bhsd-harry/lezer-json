import config, {browser, browserES10, getOxlintConfig} from '@bhsd/code-standard';

const oxlintConfig = getOxlintConfig([
	{
		ignores: ['**/*.js'],
	},
	...config,
	browser,
	{
		files: ['src/*.ts'],
		rules: browserES10.rules,
	},
]);

export default oxlintConfig;
