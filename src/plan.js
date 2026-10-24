export function planImport(swatches, colors) {
  const add = []
  const update = []
  let unchanged = 0

  for (const { name, hex } of colors) {
    const matches = swatches.filter((swatch) => swatch.name === name)
    if (matches.length === 0) add.push({ name, hex })
    for (const swatch of matches) {
      if (swatch.color.toLowerCase() === hex) unchanged += 1
      else update.push({ swatch, hex })
    }
  }

  return { add, update, unchanged }
}
