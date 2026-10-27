import config, {browserES10, getOxlintConfig} from '@bhsd/code-standard';

const oxlintConfig = getOxlintConfig([
	{
		ignores: ['**/*.js'],
	},
	...config,
	browserES10,
]);

export default oxlintConfig;
