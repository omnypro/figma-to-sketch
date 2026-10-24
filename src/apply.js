export function applyPlan(document, Swatch, { add, update }) {
  for (const { swatch, hex } of update) swatch.color = hex
  for (const { name, hex } of add) document.swatches.push(Swatch.from({ name, color: hex }))
}
