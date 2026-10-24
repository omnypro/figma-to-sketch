import { expect, test } from 'bun:test'
import { planImport } from '../src/plan.js'

const red = { name: 'Red/red-1', hex: '#ff0000ff' }

test('adds a color the document does not have', () => {
  const plan = planImport([], [red])
  expect(plan).toEqual({ add: [red], update: [], unchanged: 0 })
})

test('updates the swatch that has the same name and a different value', () => {
  const swatch = { name: 'Red/red-1', color: '#00ff00ff' }
  const plan = planImport([swatch], [red])
  expect(plan.add).toEqual([])
  expect(plan.update).toEqual([{ swatch, hex: '#ff0000ff' }])
})

test('leaves a swatch alone when only the letter case of its value differs', () => {
  const plan = planImport([{ name: 'Red/red-1', color: '#FF0000FF' }], [red])
  expect(plan).toEqual({ add: [], update: [], unchanged: 1 })
})

test('updates every swatch that shares the name', () => {
  const swatches = [
    { name: 'Red/red-1', color: '#000000ff' },
    { name: 'Red/red-1', color: '#111111ff' },
  ]
  const plan = planImport(swatches, [red])
  expect(plan.update.map((u) => u.swatch)).toEqual(swatches)
})

test('does nothing about swatches that are not in the export', () => {
  const plan = planImport([{ name: 'Old/old-1', color: '#123456ff' }], [red])
  expect(plan.add).toEqual([red])
  expect(plan.update).toEqual([])
})
