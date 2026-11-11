import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist', 'coverage', 'src/api/schema.d.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Keep every page consistent: styling goes through the Mantine theme
      // (src/theme.ts) and component props, never ad-hoc styles.
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='style']",
          message: 'Use Mantine component props or the theme instead of inline styles.',
        },
        {
          selector: 'Literal[value=/^#([0-9a-fA-F]{3}){1,2}$/]',
          message: 'Use theme colors instead of hard-coded hex values.',
        },
      ],
    },
  },
);
