"""Builds src/fonts/fredoka-hu-wght.woff2: Fredoka's own ő Ő ű Ű, which the Fredoka release lacks.

Fredoka ships a double acute (˝, in its latin-ext file) but no letters that use it. This script puts that accent on
Fredoka's o, O, u and U, in the same spot and with the same weight-axis movement as the acute on ó, Ó, ú and Ú, and
saves just those four letters as a tiny variable font that fonts.css loads for U+0150-0151 and U+0170-0171.
Fredoka is under the SIL Open Font License, which allows this.

Run from the repo root after npm install:  pip install fonttools brotli && python3 tools/fredoka-hu.py
"""

import copy

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph
from fontTools.ttLib.tables.TupleVariation import TupleVariation

FILES = 'node_modules/@fontsource-variable/fredoka/files/'
OUT = 'src/fonts/fredoka-hu-wght.woff2'
LETTERS = [('Ohungarumlaut', 'Oacute', 0x150), ('ohungarumlaut', 'oacute', 0x151), ('Uhungarumlaut', 'Uacute', 0x170), ('uhungarumlaut', 'uacute', 0x171)]

font = TTFont(FILES + 'fredoka-latin-wght-normal.woff2')
ext = TTFont(FILES + 'fredoka-latin-ext-wght-normal.woff2')
glyf, gvar, hmtx = font['glyf'], font['gvar'], font['hmtx']
order = font.getGlyphOrder()


def add(name, glyph, metrics, variations):
    order.append(name)
    glyf.glyphs[name] = glyph
    hmtx.metrics[name] = metrics
    gvar.variations[name] = variations


add('hungarumlaut', copy.deepcopy(ext['glyf']['hungarumlaut']), ext['hmtx']['hungarumlaut'], copy.deepcopy(ext['gvar'].variations['hungarumlaut']))
acute = font['glyf']['acutecomb']
double = ext['glyf']['hungarumlaut']

for name, source, codepoint in LETTERS:
    base, accent = glyf[source].components
    mark = copy.deepcopy(accent)
    mark.glyphName = 'hungarumlaut'
    # Same centre and same bottom edge as the acute it replaces.
    mark.x = accent.x + (acute.xMin + acute.xMax) // 2 - (double.xMin + double.xMax) // 2
    mark.y = accent.y + acute.yMin - double.yMin
    glyph = Glyph()
    glyph.numberOfContours = -1
    glyph.components = [copy.deepcopy(base), mark]
    # One delta per component plus the four phantom points: the same as the acute letter, so the accent moves with the weight.
    variations = [TupleVariation(dict(v.axes), list(v.coordinates)) for v in gvar.variations[source]]
    add(name, glyph, hmtx[source], variations)
    for table in font['cmap'].tables:
        if table.isUnicode():
            table.cmap[codepoint] = name

font.setGlyphOrder(order)
glyf.glyphOrder = order
font['maxp'].numGlyphs = len(order)
for name, _, _ in LETTERS:
    glyf[name].recalcBounds(glyf)

options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
options.name_IDs = ['*']
options.notdef_outline = True
subsetter = subset.Subsetter(options)
subsetter.populate(unicodes=[c for _, _, c in LETTERS])
subsetter.subset(font)
font.flavor = 'woff2'
font.save(OUT)
print('wrote', OUT)
