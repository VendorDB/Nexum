module.exports = {

	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	root: true,

	env: {
		node: true,
		commonjs: true,
		es2021: true,
	},
	rules: {
		// Your TypeScript-specific rules here
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'never'],
		'no-control-regex': 'off',
		'no-unused-vars': 'off',
		'no-async-promise-executor': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': 'off'
	}
}
