import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { system } from '../theme'
import { VerifierWorkspacePage } from '../pages/verifier/VerifierWorkspacePage'

const enqueueMutation = vi.fn().mockResolvedValue(undefined)
const refreshLots = vi.fn().mockResolvedValue(undefined)
const showToast = vi.fn()

vi.mock('../hooks/useLots', () => ({
  useLots: () => ({
    lots: [
      {
        id: 'lot-1',
        lotCode: 'LOT-2026-001',
        status: 'registered',
        product: 'Cacao',
        variety: 'Forastero',
        weightKg: 120,
        gpsOriginLat: 6.901,
        gpsOriginLng: 0.629,
        blockchainConfirmed: false,
      },
    ],
    refreshLots,
  }),
}))

vi.mock('../hooks/useSync', () => ({
  useSync: () => ({ enqueueMutation }),
}))

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast }),
}))

describe('VerifierWorkspacePage', () => {
  it('allows a verifier to certify the selected lot', async () => {
    const user = userEvent.setup()

    render(
      <ChakraProvider value={system}>
        <MemoryRouter>
          <VerifierWorkspacePage />
        </MemoryRouter>
      </ChakraProvider>,
    )

    await user.click(screen.getByRole('button', { name: /approuver et certifier/i }))

    expect(enqueueMutation).toHaveBeenCalledWith({
      type: 'updateVerificationStatus',
      payload: {
        lotId: 'lot-1',
        status: 'validated',
        reason: 'Traçabilité cohérente',
      },
    })
    expect(enqueueMutation).toHaveBeenCalledWith({
      type: 'submitVerificationProof',
      payload: {
        lotId: 'lot-1',
        signature: 'verifier-signature',
        payloadHash: 'hash-lot-1',
      },
    })
    expect(enqueueMutation).toHaveBeenCalledWith({
      type: 'certifyLot',
      payload: {
        lotId: 'lot-1',
        signature: 'verifier-signature',
      },
    })
    expect(showToast).toHaveBeenCalledWith('Lot certifié en file.', 'success')
    expect(refreshLots).toHaveBeenCalled()
  })
})