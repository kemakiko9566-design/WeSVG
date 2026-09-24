import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  // 全局忽略
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'vitest.config.ts',
    ],
  },

  // 基础 JS / TS 规则
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Vue 规则
  ...vue.configs['flat/recommended'],

  // 项目代码
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    rules: {
      // TypeScript 严格相关（先用较宽松配置，避免一次性引入过多错误）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // 既有代码大量使用 inline `import('@/types')` 类型注解，先放宽到 warn
      '@typescript-eslint/consistent-type-imports': 'warn',

      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attributes-order': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',

      // 通用
      'no-console': 'off',
      'no-debugger': 'warn',
    },
  },

  // 测试文件放宽
  {
    files: ['tests/**/*.{ts,vue}', '**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
]
