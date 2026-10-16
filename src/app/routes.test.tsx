import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/app/routes'
import { I18nProvider } from '@/shared/i18n/I18nProvider'

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
  })

  it('renders the 404 page for an unknown path', async () => {
    renderAt('/nope')

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
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
