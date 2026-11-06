import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TableView } from '@/features/ordering/components/TableView'
import type { QueryState } from '@/shared/firebase/useLiveQuery'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import type { EventConfig } from '@/shared/schemas/eventConfig'

const success: QueryState<EventConfig> = {
  status: 'success',
  data: { name: 'The wedding', tableCount: 8 },
}

const signedIn: QueryState<string> = { status: 'success', data: 'guest-1' }

function renderView(
  tableId: string | undefined,
  config: QueryState<EventConfig>,
  session: QueryState<string> = signedIn,
) {
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <TableView tableId={tableId} config={config} session={session} />
      ),
      errorElement: <p>Route error</p>,
    },
  ])
  render(
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>,
  )
}

describe('TableView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  beforeEach(() => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB')
  })

  it('shows a loading message while the config loads', () => {
    renderView('3', { status: 'loading' })

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })

  it('shows the table number for a table that exists', () => {
    renderView('3', success)

    expect(
      screen.getByRole('heading', { name: 'Wedding Drinks' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Table 3')).toBeInTheDocument()
  })

  it.each(['9', 'abc'])('shows the 404 view for table %s', (tableId) => {
    renderView(tableId, success)

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "We couldn't find that table. Scan the QR code on your table again.",
      ),
    ).toBeInTheDocument()
  })

  it('shows the 404 view in Swedish', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('sv-SE')

    renderView('9', success)

    expect(
      screen.getByRole('heading', { name: 'Sidan finns inte' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Vi hittar inte det bordet. Skanna QR-koden på ditt bord igen.',
      ),
    ).toBeInTheDocument()
  })

  it('shows a loading message while the guest is being signed in', () => {
    renderView('3', success, { status: 'loading' })

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(screen.queryByText('Table 3')).not.toBeInTheDocument()
  })

  it('shows the 404 view for an unknown table while the guest is being signed in', () => {
    renderView('9', success, { status: 'loading' })

    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })

  it('hands the error to the route when the sign-in fails', () => {
    // React logs the thrown error, which is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    renderView('3', success, { status: 'error', error: new Error('boom') })

    expect(screen.getByText('Route error')).toBeInTheDocument()
  })

  it('hands the error to the route when the config cannot be read', () => {
    // React logs the thrown error, which is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    renderView('3', { status: 'error', error: new Error('boom') })

    expect(screen.getByText('Route error')).toBeInTheDocument()
  })
})
