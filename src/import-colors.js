import sketch from 'sketch'
import fs from '@skpm/fs'
import { applyPlan } from './apply.js'
import { parseColors } from './convert.js'
import { planImport } from './plan.js'

const MODAL_OK = 1
const SHOWN_SKIPS = 5

const chooseFile = () => {
  const panel = NSOpenPanel.openPanel()
  panel.setMessage('Choose a Figma variables export (.tokens.json).')
  panel.setAllowedFileTypes(['json'])
  panel.setCanChooseDirectories(false)
  panel.setAllowsMultipleSelection(false)
  return Number(panel.runModal()) === MODAL_OK ? String(panel.URL().path()) : null
}

const summary = ({ add, update, unchanged }, skipped) => {
  const lines = [`Added ${add.length}, updated ${update.length}, unchanged ${unchanged}.`]
  if (skipped.length > 0) {
    lines.push(`Skipped ${skipped.length}:`)
    for (const { path, reason } of skipped.slice(0, SHOWN_SKIPS)) lines.push(`${path}: ${reason}`)
    if (skipped.length > SHOWN_SKIPS) lines.push(`…and ${skipped.length - SHOWN_SKIPS} more.`)
  }
  return lines.join('\n')
}

export default function onRun() {
  const document = sketch.getSelectedDocument()
  if (!document) return sketch.UI.alert('Import Figma Colors', 'Open a document first.')

  const file = chooseFile()
  if (!file) return

  let tree
  try {
    tree = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    return sketch.UI.alert('Import Figma Colors', `That file is not valid JSON.\n${error.message}`)
  }

  const { colors, skipped } = parseColors(tree)
  const plan = planImport(document.swatches, colors)

  applyPlan(document, sketch.Swatch, plan)

  sketch.UI.alert('Import Figma Colors', summary(plan, skipped))
}
