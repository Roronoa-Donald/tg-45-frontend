import { createSystem, defaultConfig, defineConfig, defineTokens } from '@chakra-ui/react'

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: defineTokens.colors({
        cocoa: {
          50: { value: '#f7f1e8' },
          100: { value: '#ead9c2' },
          200: { value: '#d8b98d' },
          300: { value: '#c69468' },
          400: { value: '#b9794a' },
          500: { value: '#5b3a29' },
          600: { value: '#4c3022' },
          700: { value: '#3d2418' },
          800: { value: '#2d1910' },
          900: { value: '#1f110a' },
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
          50: { value: '#fff6e8' },
          100: { value: '#ffe4b7' },
          200: { value: '#f7ca79' },
          300: { value: '#e7ab3f' },
          400: { value: '#c98a25' },
          500: { value: '#b98b4a' },
          600: { value: '#996d30' },
          700: { value: '#7a5525' },
          800: { value: '#5f431d' },
          900: { value: '#3e2d14' },
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
        bg: { value: { base: '{colors.cocoa.50}' } },
        fg: { value: { base: '{colors.cocoa.700}' } },
        muted: { value: { base: '{colors.cocoa.100}' } },
        border: { value: { base: 'rgba(61, 36, 24, 0.14)' } },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'cocoa.50',
      color: 'cocoa.700',
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)
