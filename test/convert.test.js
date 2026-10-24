import { expect, test } from 'bun:test'
import { parseColors } from '../src/convert.js'

const token = (hex, alpha = 1, colorSpace = 'srgb') => ({
  $type: 'color',
  $value: { colorSpace, components: [0, 0, 0], alpha, hex },
})

const number = (value) => ({ $type: 'number', $value: value })

test('keeps the full path when it does not start with Color', () => {
  const { colors } = parseColors({ Brand: { primary: token('#112233') } })
  expect(colors[0].name).toBe('Brand/primary')
})

test('appends the alpha as two hex digits', () => {
  const { colors } = parseColors({ Color: { Ghost: { 'ghost-1': token('#000000', 0.5) } } })
  expect(colors[0].hex).toBe('#00000080')
})

test('builds the hex from components when the export has none', () => {
  const { colors } = parseColors({
    Color: { Red: { 'red-1': { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 0, 0.5], alpha: 1 } } } },
  })
  expect(colors[0].hex).toBe('#ff0080ff')
})

test('skips a non-color variable and counts it apart from the colors', () => {
  const { colors, skipped } = parseColors({ Color: { Red: { 'red-1': token('#FF0000') } }, Space: { small: number(4) } })
  expect(colors.map((c) => c.name)).toEqual(['Red/red-1'])
  expect(skipped).toEqual([{ path: 'Space/small', reason: 'not a color (number)' }])
})

test('skips a color in a color space other than sRGB', () => {
  const { colors, skipped } = parseColors({ Color: { Wide: { 'wide-1': token('#FF0000', 1, 'display-p3') } } })
  expect(colors).toEqual([])
  expect(skipped).toEqual([{ path: 'Color/Wide/wide-1', reason: 'color space display-p3 is not supported' }])
})

test('resolves an alias to a color in the same file', () => {
  const { colors } = parseColors({
    Color: {
      Red: { 'red-1': token('#FF0000') },
      Semantic: { danger: { $type: 'color', $value: '{Color.Red.red-1}' } },
    },
  })
  expect(colors).toContainEqual({ name: 'Semantic/danger', hex: '#ff0000ff' })
})

test('skips an alias that points at nothing', () => {
  const { colors, skipped } = parseColors({ Color: { Semantic: { danger: { $type: 'color', $value: '{Color.Nope}' } } } })
  expect(colors).toEqual([])
  expect(skipped).toEqual([{ path: 'Color/Semantic/danger', reason: 'alias {Color.Nope} does not resolve' }])
})

test('skips aliases that point at each other', () => {
  const { colors, skipped } = parseColors({
    Color: {
      a: { $type: 'color', $value: '{Color.b}' },
      b: { $type: 'color', $value: '{Color.a}' },
    },
  })
  expect(colors).toEqual([])
  expect(skipped.map((s) => s.path)).toEqual(['Color/a', 'Color/b'])
})

test('keeps the first of two colors that end up with the same name', () => {
  const { colors, skipped } = parseColors({
    Color: { Red: { 'red-1': token('#FF0000') } },
    Red: { 'red-1': token('#00FF00') },
  })
  expect(colors).toEqual([{ name: 'Red/red-1', hex: '#ff0000ff' }])
  expect(skipped).toEqual([{ path: 'Red/red-1', reason: 'name Red/red-1 is already taken by Color/Red/red-1' }])
})

test('names a color by its path, without the leading Color group', () => {
  const { colors } = parseColors({
    Color: { Red: { 'red-1': token('#FCBEB9') } },
  })
  expect(colors).toEqual([{ name: 'Red/red-1', hex: '#fcbeb9ff' }])
})
