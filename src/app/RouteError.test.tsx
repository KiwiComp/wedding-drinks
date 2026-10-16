import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RouteError } from '@/app/RouteError'
import { I18nProvider } from '@/shared/i18n/I18nProvider'

describe('RouteError', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB')
    // React Router logs the thrown error, which is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('shows an error message and a reload button when a route throws', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        loader: () => {
          throw new Error('boom')
        },
        Component: () => null,
        errorElement: <RouteError />,
      },
    ])
    render(
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })
})
