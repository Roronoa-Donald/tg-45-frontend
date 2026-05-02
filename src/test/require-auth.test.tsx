import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { system } from '../theme'
import { RequireAuth } from '../routes/RequireAuth'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, loading: false }),
}))

describe('RequireAuth', () => {
  it('redirects to login when session is missing', async () => {
    render(
      <ChakraProvider value={system}>
        <MemoryRouter initialEntries={['/farmer']}>
          <Routes>
            <Route path="/login" element={<div>Connexion</div>} />
            <Route path="/farmer" element={<RequireAuth><div>Protégé</div></RequireAuth>} />
          </Routes>
        </MemoryRouter>
      </ChakraProvider>,
    )

    expect(await screen.findByText('Connexion')).toBeInTheDocument()
  })
})
