import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier/flat';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';

const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-debugger': 'warn',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
        },
      ],
      'no-duplicate-imports': 'error',
      curly: ['error', 'all'],
      'padding-line-between-statements': [
        'warn',
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var'],
          next: '*',
        },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
    },
  },
];

export default eslintConfig;
