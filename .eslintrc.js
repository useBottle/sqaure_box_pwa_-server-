module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
	},
	plugins: [
		"prettier",
		"@typescript-eslint",
		"eslint-config-prettier",
		"eslint-plugin-prettier",
	],
	extends: [
		"standard-with-typescript",
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended",
	],
	overrides: [
		{
			env: {
				node: true,
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script",
			},
		},
	],
	parserOptions: {
		ecmaVersion: "latest",
	},
	rules: {},
};
