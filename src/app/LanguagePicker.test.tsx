import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguagePicker } from '@/app/LanguagePicker'
import { I18nProvider } from '@/shared/i18n/I18nProvider'

function renderPicker() {
  render(
    <I18nProvider>
      <LanguagePicker />
    </I18nProvider>,
  )
}

describe('LanguagePicker', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('offers each language named in its own language', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
    renderPicker()

    const picker = screen.getByRole('combobox', { name: 'Language' })
    expect(picker).toHaveValue('en')
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Svenska' })).toBeInTheDocument()
  })

  it('switches the language when one is chosen', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
    renderPicker()

    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
      target: { value: 'sv' },
    })

    expect(screen.getByRole('combobox', { name: 'Språk' })).toHaveValue('sv')
    expect(document.documentElement).toHaveAttribute('lang', 'sv')
  })
})
