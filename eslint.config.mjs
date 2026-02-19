import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    '.vercel/output/**',
    '.vercel/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default defineConfig([
  ...eslintConfig,
  {
    rules: {
      // Allow unused variables - most are intentional exports or work-in-progress
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      // Disable react-hooks rules that have many false positives
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
