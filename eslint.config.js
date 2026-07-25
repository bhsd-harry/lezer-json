import config, {browserES10} from '@bhsd/code-standard';

export default [
	{
		ignores: ['**/*.js'],
	},
	...config,
	browserES10,
];
