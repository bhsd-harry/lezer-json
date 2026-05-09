import config, {browser} from '@bhsd/code-standard';

export default [
	{
		ignores: ['**/*.js'],
	},
	...config,
	browser,
];
