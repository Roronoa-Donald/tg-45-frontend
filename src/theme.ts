import { createSystem, defaultConfig, defineConfig, defineTokens } from '@chakra-ui/react'

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: defineTokens.colors({
        cocoa: {
          50: { value: '#faf6f0' },
          100: { value: '#f0e6d6' },
          200: { value: '#e0ccb0' },
          300: { value: '#c69468' },
          400: { value: '#a06b3c' },
          500: { value: '#5b3a29' },
          600: { value: '#4c3022' },
          700: { value: '#2c1810' },
          800: { value: '#1f110a' },
          900: { value: '#120a06' },
        },
        olive: {
          50: { value: '#eef8f3' },
          100: { value: '#c9eadb' },
          200: { value: '#8fd4b5' },
          300: { value: '#55b88a' },
          400: { value: '#339966' },
          500: { value: '#2a6e50' },
          600: { value: '#225a42' },
          700: { value: '#1a4533' },
          800: { value: '#133125' },
          900: { value: '#0d2018' },
        },
        amber: {
          50: { value: '#fdf6e8' },
          100: { value: '#f8e6c0' },
          200: { value: '#eecf8a' },
          300: { value: '#d4aa4f' },
          400: { value: '#c4973a' },
          500: { value: '#a07a2a' },
          600: { value: '#7d5f20' },
          700: { value: '#5a4418' },
          800: { value: '#3d2e10' },
          900: { value: '#201808' },
        },
      }),
      fonts: defineTokens.fonts({
        heading: { value: "'Playfair Display', Georgia, serif" },
        body: { value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
        mono: { value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
      }),
      radii: defineTokens.radii({
        l1: { value: '12px' },
        l2: { value: '18px' },
        l3: { value: '28px' },
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
        border: { value: { base: 'rgba(44, 24, 16, 0.08)' } },
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
