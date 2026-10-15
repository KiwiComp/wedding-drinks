import { describe, expect, it } from 'vitest'
import { cn } from '@/shared/ui/utils'

describe('cn', () => {
  it('lets a later Tailwind class override a conflicting one', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })
})
