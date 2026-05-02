import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { system } from '../theme'
import { FarmerCapturePage } from '../pages/farmer/FarmerCapturePage'

const saveDraft = vi.fn().mockResolvedValue(undefined)
const submitDraft = vi.fn().mockResolvedValue(undefined)
const showToast = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { cooperativeId: 'coop-1' } }),
}))

vi.mock('../hooks/useLots', () => ({
  useLots: () => ({ saveDraft, submitDraft }),
}))

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast }),
}))

describe('FarmerCapturePage', () => {
  it('submits a lot draft', async () => {
    const user = userEvent.setup()

    render(
      <ChakraProvider value={system}>
        <MemoryRouter>
          <FarmerCapturePage />
        </MemoryRouter>
      </ChakraProvider>,
    )

    await waitFor(() => expect(saveDraft).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: /enregistrer et synchroniser/i }))

    await waitFor(() => expect(submitDraft).toHaveBeenCalled())
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('mis en file'), 'success')
  })
})
