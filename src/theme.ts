import { createSystem, defaultConfig, defineConfig, defineTokens } from '@chakra-ui/react'

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: defineTokens.colors({
        cocoa: {
          50: { value: '#e8e5e3' },
          100: { value: '#c5beb8' },
          200: { value: '#9e9389' },
          300: { value: '#796a5b' },
          400: { value: '#584432' },
          500: { value: '#3a2618' },
          600: { value: '#2e1e13' },
          700: { value: '#23160e' },
          800: { value: '#1a110b' },
          900: { value: '#100a06' },
        },
        olive: {
          50: { value: '#edf7f2' },
          100: { value: '#c9eadb' },
          200: { value: '#9cd5bc' },
          300: { value: '#6cbb97' },
          400: { value: '#3f9c72' },
          500: { value: '#2f7a5d' },
          600: { value: '#285d49' },
          700: { value: '#214539' },
          800: { value: '#17312a' },
          900: { value: '#10211c' },
        },
        amber: {
          50: { value: '#f9f6ef' },
          100: { value: '#f0e6cd' },
          200: { value: '#e4d0a1' },
          300: { value: '#d7b875' },
          400: { value: '#cea652' },
          500: { value: '#b98b4a' },
          600: { value: '#a07840' },
          700: { value: '#836335' },
          800: { value: '#674f2b' },
          900: { value: '#4c3a20' },
        },
      }),
      fonts: defineTokens.fonts({
        heading: { value: 'Noto Serif, Georgia, serif' },
        body: { value: 'Noto Sans, Arial, sans-serif' },
        mono: { value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
      }),
      radii: defineTokens.radii({
        l1: { value: '0.875rem' },
        l2: { value: '1.125rem' },
        l3: { value: '1.5rem' },
      }),
      spacing: defineTokens.spacing({
        0: { value: '0' },
        1: { value: '0.25rem' },
        2: { value: '0.5rem' },
        3: { value: '0.75rem' },
        4: { value: '1rem' },
        5: { value: '1.25rem' },
        6: { value: '1.5rem' },
        8: { value: '2rem' },
        10: { value: '2.5rem' },
        12: { value: '3rem' },
      }),
    },
    semanticTokens: {
      colors: {
        bg: { value: { base: '{colors.cocoa.900}' } },
        fg: { value: { base: '{colors.amber.50}' } },
        muted: { value: { base: '{colors.cocoa.200}' } },
        border: { value: { base: 'rgba(185, 139, 74, 0.2)' } },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'cocoa.900',
      color: 'amber.50',
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)
