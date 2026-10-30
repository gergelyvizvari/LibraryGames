"""
Fredoka has no Hungarian ő Ő ű Ű, though it has the double-acute mark. This builds those four letters
from Fredoka's own o/O/u/U and mark (placed like its ó/Ó/ú/Ú), and saves just them as a tiny variable
woff2, public/fonts/fredoka-hu.woff2, used as the 'Fredoka HU' fallback in styles.css.

Usage: pip install fonttools brotli
       python scripts/build-fredoka-hu.py 'Fredoka[wdth,wght].ttf' public/fonts/fredoka-hu.woff2
Fredoka is from github.com/google/fonts (ofl/fredoka), SIL Open Font License 1.1 (kept in the font's name table).
"""
import copy, sys
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent
from fontTools import subset

src, out = sys.argv[1], sys.argv[2]
f = TTFont(src)
glyf, hmtx, gvar = f['glyf'], f['hmtx'], f['gvar']

def bbox(name):
    g = glyf[name]; g.recalcBounds(glyf); return g.xMin, g.xMax

acute_mid = sum(bbox('acutecomb')) / 2
dbl_mid = sum(bbox('uni030B')) / 2
new = {  # new glyph: (codepoint, acute twin it copies placement and variations from)
    'odblacute': (0x151, 'oacute'), 'Odblacute': (0x150, 'Oacute'),
    'udblacute': (0x171, 'uacute'), 'Udblacute': (0x170, 'Uacute'),
}
order = f.getGlyphOrder()
for name, (cp, twin) in new.items():
    base, mark = glyf[twin].components
    g = Glyph(); g.numberOfContours = -1; g.components = []
    b = GlyphComponent(); b.glyphName, b.x, b.y, b.flags = base.glyphName, base.x, base.y, base.flags
    m = GlyphComponent(); m.glyphName = 'uni030B'; m.flags = mark.flags
    # Centre the double acute where the single acute sits.
    m.x, m.y = round(mark.x + acute_mid - dbl_mid), mark.y
    g.components = [b, m]
    glyf.glyphs[name] = g
    order.append(name)
    hmtx.metrics[name] = hmtx.metrics[twin]
    gvar.variations[name] = copy.deepcopy(gvar.variations[twin])
    for t in f['cmap'].tables:
        if t.isUnicode(): t.cmap[cp] = name
f.setGlyphOrder(order)
glyf.glyphOrder = order
if 'HVAR' in f: del f['HVAR']  # advances then come from gvar phantom points, copied above
f['maxp'].numGlyphs = len(order)
f.save(out + '.tmp.ttf')

opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = []; opts.name_IDs = ['*']; opts.notdef_outline = True
fs = TTFont(out + '.tmp.ttf')
s = subset.Subsetter(opts); s.populate(unicodes=list(c for c, _ in new.values())); s.subset(fs)
fs.flavor = 'woff2'; fs.save(out)
import os; os.remove(out + '.tmp.ttf')
print('ok', out)
