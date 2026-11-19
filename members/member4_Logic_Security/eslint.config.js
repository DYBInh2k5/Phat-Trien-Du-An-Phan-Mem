import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/**', 'coverage/**', 'dist/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      // --- Chống "JS quá linh hoạt": ép viết chặt tay ---
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-shadow': 'error',
      'no-implicit-coercion': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-return-await': 'error',
      'require-await': 'error',
      'no-await-in-loop': 'off', // bulk/transaction cần tuần tự có chủ đích
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'error', // dùng logger; script CLI được nới ở dưới
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='res'][callee.property.name='json']",
          message:
            'Không gọi res.json() trực tiếp. Dùng ok()/created() trong common/http/response.js.',
        },
      ],
    },
  },
  {
    // Nơi duy nhất được phép dựng response
    files: [
      'src/common/http/response.js',
      'src/common/middleware/error-handler.js',
      'src/common/middleware/not-found.js',
      'src/app.js',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['scripts/**/*.js'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['tests/**/*.js'],
    rules: { 'no-console': 'off', 'require-await': 'off', 'no-restricted-syntax': 'off' },
  },
  prettier,
];
