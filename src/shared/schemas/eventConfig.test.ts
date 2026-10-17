import { describe, expect, it } from 'vitest'
import { eventConfigSchema, parseTableId } from '@/shared/schemas/eventConfig'

const config = { name: 'The wedding', tableCount: 8 }

describe('parseTableId', () => {
  it.each([
    ['1', 1],
    ['8', 8],
  ])('turns %s into table %i', (raw, expected) => {
    expect(parseTableId(raw, config)).toBe(expected)
  })

  it.each(['0', '9', '2.5', 'abc', '', undefined])(
    'returns null for %s',
    (raw) => {
      expect(parseTableId(raw, config)).toBeNull()
    },
  )
})

describe('eventConfigSchema', () => {
  it('parses a valid config', () => {
    expect(eventConfigSchema.parse(config)).toEqual(config)
  })

  it.each([0, 51])('rejects a tableCount of %i', (tableCount) => {
    expect(eventConfigSchema.safeParse({ ...config, tableCount }).success).toBe(
      false,
    )
  })
})
