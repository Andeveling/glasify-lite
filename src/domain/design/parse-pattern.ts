import type { PanelDescriptor } from './types'

const PATTERN_REGEX = /^[XO]+$/

export function parsePattern(pattern: string): PanelDescriptor[] {
  if (!PATTERN_REGEX.test(pattern)) {
    throw new Error(
      `Invalid pattern "${pattern}". Only X (movable) and O (fixed) characters are allowed.`,
    )
  }

  const panels = pattern.length
  const ratio = 1 / panels

  return Array.from({ length: panels }, (_, index) => ({
    index,
    type: pattern[index] === 'X' ? 'movable' : 'fixed',
    ratio,
  }))
}

export function hasAtLeastOneMovable(pattern: string): boolean {
  return pattern.includes('X')
}

export function isValidPattern(pattern: string): boolean {
  return (
    PATTERN_REGEX.test(pattern) &&
    pattern.length >= 1 &&
    pattern.length <= 10 &&
    hasAtLeastOneMovable(pattern)
  )
}
