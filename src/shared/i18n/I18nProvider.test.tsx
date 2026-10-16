import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import { useI18n } from '@/shared/i18n/useStrings'

function Consumer() {
  const { strings: t, setLocale } = useI18n()

  return (
    <>
      <h1>{t.common.appName}</h1>
      <p>{t.common.table(3)}</p>
      <button onClick={() => setLocale('sv')}>Svenska</button>
    </>
  )
}

describe('I18nProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows English by default', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
    render(
      <I18nProvider>
        <Consumer />
      </I18nProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Wedding Drinks' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Table 3')).toBeInTheDocument()
  })

  it('shows Swedish when the browser language is Swedish', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('sv-SE')
    render(
      <I18nProvider>
        <Consumer />
      </I18nProvider>,
    )

    expect(screen.getByText('Bord 3')).toBeInTheDocument()
  })

  it('switches language with setLocale', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
    render(
      <I18nProvider>
        <Consumer />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Svenska' }))

    expect(screen.getByText('Bord 3')).toBeInTheDocument()
    expect(screen.queryByText('Table 3')).not.toBeInTheDocument()
  })

  it('throws when useI18n is used outside the provider', () => {
    // React logs the thrown error before rethrowing it.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Consumer />)).toThrow(
      'useI18n must be used inside I18nProvider',
    )
  })
})
