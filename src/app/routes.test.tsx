import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/app/routes'
import { useEventConfig } from '@/shared/firebase/hooks'
import { I18nProvider } from '@/shared/i18n/I18nProvider'

vi.mock('@/shared/firebase/hooks', () => ({ useEventConfig: vi.fn() }))
vi.mock('@/features/ordering/hooks', () => ({
  useGuestSession: () => ({ status: 'success', data: 'guest-1' }),
}))

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>,
  )
}

describe('routes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB')
    vi.mocked(useEventConfig).mockReturnValue({
      status: 'success',
      data: { name: 'The wedding', tableCount: 8 },
    })
  })

  it('renders the 404 page for an unknown path', async () => {
    renderAt('/nope')

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })

  it('renders the 404 view for a table that does not exist', async () => {
    renderAt('/table/99')

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })

  it('renders the route error when the event config cannot be read', async () => {
    // React Router logs the thrown error, which is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(useEventConfig).mockReturnValue({
      status: 'error',
      error: new Error('boom'),
    })

    renderAt('/table/3')

    expect(
      await screen.findByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it.each(['/table/3', '/login', '/bar'])(
    'renders a page for %s',
    async (path) => {
      renderAt(path)

      expect(
        await screen.findByRole('heading', { name: 'Wedding Drinks' }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: 'Page not found' }),
      ).not.toBeInTheDocument()
    },
  )
})
