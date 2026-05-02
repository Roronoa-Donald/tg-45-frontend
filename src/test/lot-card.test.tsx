import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { system } from '../theme'
import { LotCard } from '../components/LotCard'

describe('LotCard', () => {
  it('renders as an interactive lot entry', () => {
    render(
      <ChakraProvider value={system}>
        <MemoryRouter>
          <LotCard
            lot={{
              id: 'lot-1',
              lotCode: 'LOT-2026-001',
              status: 'validated',
              product: 'Cacao',
              weightKg: 120,
            }}
            detailHref="/lots/lot-1"
          />
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(screen.getByRole('button')).toHaveTextContent('LOT-2026-001')
  })
})
