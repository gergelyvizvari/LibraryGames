# Painted art for scene games

The painted look (first used by Acorn Shop) is made with an image generator and then cut and sized by hand.

## Style text (start of every prompt)

Backgrounds:

> Children's picture-book illustration, lineless flat gouache painting with visible brush texture and fine paper
> grain, soft warm afternoon light, gentle and cosy mood. Palette: yellow-green meadows with rounded humps, dark teal
> pine trees, turquoise water with a yellow sand rim, cream houses with maroon and plum roofs, lilac distant hills,
> warm ochre wood. Simple, uncluttered composition with few elements, large calm areas. No outlines, no text, no
> characters, no UI. Landscape 16:10.

Then the place, and which part must stay calm and empty (where the game's pieces go).

Characters and things:

> Children's picture-book character illustration in the same style as a warm painted gouache storybook: soft visible
> brush texture, gentle warm afternoon light from the upper left, no outlines, cute and friendly, big glossy dark eyes
> with a white highlight, small pink cheeks, graceful natural animal proportions (not a blob-headed chibi). Single
> subject only, centred, whole subject visible with margin, isolated on a fully transparent background. No text.

Faces for the same character (happy, blink) are edits of the first picture, so they match exactly.

## Generating with Codex

```
codex exec --skip-git-repo-check -s workspace-write -C <folder> \
  "Use your built-in image generation tool to generate exactly one image with this prompt (verbatim), then save it as a PNG at ./<name>.png. If the tool supports a transparent background, use it. Do not modify any other files. PROMPT: <prompt>"
```

For an edit, add `-i ./<first>.png` AFTER the prompt (before it, codex reads the prompt as a file name).
Run it with `< /dev/null`: without a terminal on stdin, `codex exec` otherwise waits for more input forever.

Faces made as edits can come back a few pixels bigger or shifted. Line them up before cutting (same height from
horn tips to feet, same feet line, same body centre) and cut them all with one shared crop box, or the character
jumps when its face changes.

## Preparing the files

- Background: resize to about 1600 × 1000, WebP quality 80 (about 200 kB).
- Cut-outs: drop alpha below 40 (generators leave a faint haze), crop, resize to about 1.6× the size they are shown
  at, raise saturation 15 %, bake in a thin cream (#fff8e6) rim of about 1.5 painting units, WebP quality 86.
- Sheets of several things: cut into cells first.
- Note the background's ground colour (the average of its bottom rows) for `PaintedScene ground`.
