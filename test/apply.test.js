import { expect, test } from 'bun:test'
import { applyPlan } from '../src/apply.js'

const Swatch = { from: ({ name, color }) => ({ name, color }) }

test('adds a swatch by pushing a new one onto the document array', () => {
  const document = { swatches: [] }
  applyPlan(document, Swatch, { add: [{ name: 'Red/red-1', hex: '#ff0000ff' }], update: [] })
  expect(document.swatches).toEqual([{ name: 'Red/red-1', color: '#ff0000ff' }])
})

test('updates an existing swatch in place', () => {
  const swatch = { name: 'Red/red-1', color: '#000000ff' }
  const document = { swatches: [swatch] }
  applyPlan(document, Swatch, { add: [], update: [{ swatch, hex: '#ff0000ff' }] })
  expect(swatch.color).toBe('#ff0000ff')
  expect(document.swatches).toHaveLength(1)
})
