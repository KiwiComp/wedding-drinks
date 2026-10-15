import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/shared/ui/button'

describe('Button', () => {
  it('renders a button that handles clicks', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Send</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders its child instead of a button with asChild', () => {
    render(
      <Button asChild>
        <a href="/bar">Bar</a>
      </Button>,
    )

    expect(screen.getByRole('link', { name: 'Bar' })).toHaveAttribute(
      'href',
      '/bar',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
