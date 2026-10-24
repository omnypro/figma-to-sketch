# Figma to Sketch

A Sketch plugin that turns a Figma variables export into Color Variables.

Figma exports variables as a `.tokens.json` file. Sketch can't read it because Sketch is weird like that. This adds each color in the file to the open document, so you can pick it from the color picker.

## Install

You need Sketch 2025.3 or later.

```sh
git clone https://github.com/omnypro/figma-to-sketch.git
cd figma-to-sketch
npm install
npm run build
npm run link
```

`npm run link` symlinks the plugin into Sketch's Plugins folder.

## Use

Open a document, then choose Plugins → Figma to Sketch → Import Figma Colors and pick the `.tokens.json` file.

- A path like `Color/Red/red-1` becomes `Red/red-1`. The leading `Color` is dropped, and Sketch groups the rest by the slash.
- Run it again on a newer export. A color whose name is already in the document gets the new value, and Sketch updates every layer that uses it. A new name is added.
- If a color is renamed in Figma, the old one stays and the new name appears next to it.
- Opacity is kept.
- Aliases to another color in the same file are followed.
- Variables that aren't colors, colors outside sRGB, and aliases that don't resolve are skipped.

## Tests

```sh
npm test
```

The tests use [Bun](https://bun.sh).

## License

[MIT](LICENSE)
