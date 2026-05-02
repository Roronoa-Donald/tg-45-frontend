import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { system } from '../theme'
import { PublicVerifyPage } from '../pages/PublicVerifyPage'

vi.mock('../hooks/useLots', () => ({
  useLots: () => ({
    loadPublicLot: async () => ({
      lotCode: 'LOT-2026-001',
      status: 'validated',
      gps: { lat: 6.9, lng: 0.6, precisionM: 24 },
      proof: { txHash: '0xabc', proofHash: '0xdef' },
      events: [{ eventType: 'register_lot', occurredAt: '2026-01-01T00:00:00Z' }],
      images: [],
    }),
  }),
}))

describe('PublicVerifyPage', () => {
  it('shows the public lot record', async () => {
    render(
      <ChakraProvider value={system}>
        <MemoryRouter initialEntries={['/public/verify/LOT-2026-001']}>
          <Routes>
            <Route path="/public/verify/:lotCode" element={<PublicVerifyPage />} />
          </Routes>
        </MemoryRouter>
      </ChakraProvider>,
    )

    await waitFor(() => expect(screen.getByText('LOT-2026-001')).toBeInTheDocument())
    expect(screen.getByText('Validé')).toBeInTheDocument()
    expect(screen.getByText('Preuve blockchain: 0xdef')).toBeInTheDocument()
    expect(screen.getByText('Enregistrement')).toBeInTheDocument()
  })
})
