const ALIAS = /^\{(.+)\}$/

const isToken = (node) => node !== null && typeof node === 'object' && '$value' in node

const byte = (unit) => Math.round(unit * 255).toString(16).padStart(2, '0')

const toHex = ({ hex, components, alpha }) => {
  const rgb = hex ? hex.slice(1) : components.map(byte).join('')
  return `#${rgb.toLowerCase()}${byte(alpha)}`
}

// Finds a node by its dotted path. The type is the node's own, or the nearest one set on a group above it.
const lookup = (tree, reference) => {
  let node = tree
  let type
  for (const key of reference.split('.')) {
    if (node === undefined) return undefined
    type = node.$type ?? type
    node = node[key]
  }
  return node === undefined ? undefined : { node, type: node.$type ?? type }
}

// Follows aliases until it reaches a color value. Returns { value } or { reason }.
const resolve = (tree, value, seen = new Set()) => {
  if (typeof value !== 'string') return { value }
  const reference = value.match(ALIAS)?.[1]
  if (reference === undefined || seen.has(reference)) return { reason: `alias ${value} does not resolve` }
  const target = lookup(tree, reference)
  if (target === undefined || !isToken(target.node) || target.type !== 'color') {
    return { reason: `alias ${value} does not resolve` }
  }
  return resolve(tree, target.node.$value, seen.add(reference))
}

const sketchName = (path) => (path[0] === 'Color' && path.length > 1 ? path.slice(1) : path).join('/')

export function parseColors(tree) {
  const colors = []
  const skipped = []
  const taken = new Map()

  const skip = (path, reason) => skipped.push({ path: path.join('/'), reason })

  const add = (path, token) => {
    const resolved = resolve(tree, token.$value)
    if (resolved.reason) return skip(path, resolved.reason)
    const { colorSpace } = resolved.value
    if (colorSpace !== 'srgb') return skip(path, `color space ${colorSpace} is not supported`)

    const name = sketchName(path)
    if (taken.has(name)) return skip(path, `name ${name} is already taken by ${taken.get(name)}`)
    taken.set(name, path.join('/'))
    colors.push({ name, hex: toHex(resolved.value) })
  }

  const walk = (node, path, groupType) => {
    const inherited = node.$type ?? groupType
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue
      const next = [...path, key]
      if (!isToken(child)) {
        walk(child, next, inherited)
        continue
      }
      const type = child.$type ?? inherited
      if (type === 'color') add(next, child)
      else skip(next, `not a color (${type ?? 'untyped'})`)
    }
  }

  walk(tree, [])
  return { colors, skipped }
}
