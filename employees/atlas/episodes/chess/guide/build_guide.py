#!/usr/bin/env python3
"""Build the Chess Field Guide page (diagrams + six mug-shot trading cards).
Piece shapes come from DejaVu Sans glyphs, embedded as SVG paths so every device draws them the same.
Usage: python3 build_guide.py  -> writes chess-guide.html next to this file."""
import pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

HERE = pathlib.Path(__file__).parent
F = TTFont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
GS, CMAP = F.getGlyphSet(), F.getBestCmap()
SOLID = {'k': 0x265A, 'q': 0x265B, 'r': 0x265C, 'b': 0x265D, 'n': 0x265E, 'p': 0x265F}
OUTL = {'k': 0x2654, 'q': 0x2655, 'r': 0x2656, 'b': 0x2657, 'n': 0x2658, 'p': 0x2659}

def glyph(cp):
    name = CMAP[cp]; pen = SVGPathPen(GS); GS[name].draw(pen)
    bp = BoundsPen(GS); GS[name].draw(bp); return pen.getCommands(), bp.bounds
PATHS = {}
for k in SOLID:
    PATHS[k] = glyph(SOLID[k]); PATHS[k.upper()] = (glyph(OUTL[k]), glyph(SOLID[k]))

def piece_svg(ch, cx, cy, size):
    """Draw piece centered at cx,cy fitting a box of `size`. Uppercase = white."""
    if ch.isupper():
        (op, ob), (sp, sb) = PATHS[ch]; b = sb
    else:
        sp, b = PATHS[ch]
    w, h = b[2] - b[0], b[3] - b[1]; s = size / max(w, h)
    tx = cx - (b[0] + w / 2) * s; ty = cy + (b[1] + h / 2) * s
    t = f'translate({tx:.2f},{ty:.2f}) scale({s:.5f},{-s:.5f})'
    if ch.isupper():
        return (f'<path d="{sp}" transform="{t}" fill="#fbf8f1"/>'
                f'<path d="{op}" transform="{t}" fill="#1b1a17"/>')
    return f'<path d="{sp}" transform="{t}" fill="#1b1a17"/>'

LIGHT, DARK = '#efe6d2', '#b8925c'
FILES = 'abcdefgh'

def board(pos, files='abcdefgh', ranks='87654321', sq=44, marks=None, arrows=None, coords=True, label='', note=None):
    marks = marks or {}; arrows = arrows or []
    pad_l = 18 if coords else 0; pad_b = 18 if coords else 0
    W = pad_l + sq * len(files) + 2; H = sq * len(ranks) + pad_b + 2
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{label}"><defs><marker id="ah{id(pos)}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#a8801f"/></marker></defs>']
    xy = {}
    for ri, r in enumerate(ranks):
        for fi, f in enumerate(files):
            x = pad_l + 1 + fi * sq; y = 1 + ri * sq; xy[f + r] = (x, y)
            dark = (FILES.index(f) + int(r)) % 2 == 0
            out.append(f'<rect x="{x}" y="{y}" width="{sq}" height="{sq}" fill="{DARK if dark else LIGHT}"/>')
    out.append(f'<rect x="{pad_l + .5}" y=".5" width="{sq * len(files) + 1}" height="{sq * len(ranks) + 1}" fill="none" stroke="#5a4a32" stroke-width="1"/>')
    for s, kind in marks.items():
        x, y = xy[s]; c = (x + sq / 2, y + sq / 2)
        if kind == 'dot': out.append(f'<circle cx="{c[0]}" cy="{c[1]}" r="{sq * .14}" fill="#2d5f8a" opacity=".85"/>')
        elif kind == 'hit': out.append(f'<circle cx="{c[0]}" cy="{c[1]}" r="{sq * .44}" fill="none" stroke="#2d5f8a" stroke-width="3"/>')
        elif kind == 'gold': out.append(f'<rect x="{x + 2}" y="{y + 2}" width="{sq - 4}" height="{sq - 4}" fill="none" stroke="#a8801f" stroke-width="3"/>')
        elif kind == 'no': out.append(f'<path d="M{x + sq * .3},{y + sq * .3} L{x + sq * .7},{y + sq * .7} M{x + sq * .7},{y + sq * .3} L{x + sq * .3},{y + sq * .7}" stroke="#9b3b2f" stroke-width="3" stroke-linecap="round"/>')
    for s, ch in pos.items():
        x, y = xy[s]; out.append(piece_svg(ch, x + sq / 2, y + sq / 2, sq * .78))
    for a, b in arrows:
        (x1, y1), (x2, y2) = xy[a], xy[b]
        x1 += sq / 2; y1 += sq / 2; x2 += sq / 2; y2 += sq / 2
        dx, dy = x2 - x1, y2 - y1; L = (dx * dx + dy * dy) ** .5; ux, uy = dx / L, dy / L
        out.append(f'<line x1="{x1 + ux * sq * .3:.1f}" y1="{y1 + uy * sq * .3:.1f}" x2="{x2 - ux * sq * .32:.1f}" y2="{y2 - uy * sq * .32:.1f}" stroke="#a8801f" stroke-width="{sq * .12:.1f}" stroke-linecap="round" opacity=".9" marker-end="url(#ah{id(pos)})"/>')
    if coords:
        for fi, f in enumerate(files):
            out.append(f'<text x="{pad_l + 1 + fi * sq + sq / 2}" y="{H - 4}" text-anchor="middle" class="co">{f}</text>')
        for ri, r in enumerate(ranks):
            out.append(f'<text x="{pad_l - 6}" y="{1 + ri * sq + sq / 2 + 4}" text-anchor="end" class="co">{r}</text>')
    out.append('</svg>')
    return ''.join(out)

START = {}
for f, p in zip(FILES, 'RNBQKBNR'):
    START[f + '1'] = p; START[f + '8'] = p.lower(); START[f + '2'] = 'P'; START[f + '7'] = 'p'

def fig(svg, cap, cls=''):
    return f'<figure class="{cls}">{svg}<figcaption>{cap}</figcaption></figure>'

# ---------- cards ----------
def mini(center, ch, moves=(), hits=(), extra=None):
    pos = {center: ch}; pos.update(extra or {})
    marks = {m: 'dot' for m in moves}; marks.update({h: 'hit' for h in hits})
    return board(pos, files='abcde', ranks='54321', sq=30, marks=marks, coords=False, label='')

def line_moves(c, dirs):
    f0, r0 = 'abcde'.index(c[0]), int(c[1]); res = []
    for df, dr in dirs:
        f, r = f0 + df, r0 + dr
        while 0 <= f < 5 and 1 <= r <= 5:
            res.append('abcde'[f] + str(r)); f += df; r += dr
    return res
ORTH = [(1, 0), (-1, 0), (0, 1), (0, -1)]; DIAG = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
CARDS = [
    dict(k='K', name='The King', alias='The Boss', pts='The game', count='1 per side',
         moves='One square, any direction.', power='Castling: once a game he tucks into the corner behind a rook.',
         weak='Slow, and he can never step into check.', old='Raja in India, the Shah in Persia: "shah mat" became checkmate.',
         mini=mini('c3', 'K', moves=['b2', 'b3', 'b4', 'c2', 'c4', 'd2', 'd3', 'd4'])),
    dict(k='Q', name='The Queen', alias='The Powerhouse', pts='9', count='1 per side',
         moves='Straight or diagonal, as far as she wants.', power='Rook and bishop in one piece.',
         weak='Too valuable to lose cheap. Don\'t bring her out early.', old='Started as the weakest piece, one step diagonally. Spain made her strong in the 1400s.',
         mini=mini('c3', 'Q', moves=line_moves('c3', ORTH + DIAG))),
    dict(k='R', name='The Rook', alias='The Bulldozer', pts='5', count='2 per side',
         moves='Straight lines: forward, back, left, right.', power='Owns open lines. Castling partner for the king.',
         weak='Stuck in the corner until the pawns move.', old='Ratha, the chariot, in India.',
         mini=mini('c3', 'R', moves=line_moves('c3', ORTH))),
    dict(k='B', name='The Bishop', alias='The Long Shot', pts='3', count='2 per side',
         moves='Diagonals, as far as it wants.', power='Hits from across the whole board.',
         weak='Stays on one color forever.', old='Gaja, the elephant, in India.',
         mini=mini('c3', 'B', moves=line_moves('c3', DIAG))),
    dict(k='N', name='The Knight', alias='The Jumper', pts='3', count='2 per side',
         moves='An L: two squares one way, one to the side.', power='The only piece that jumps. Always lands on the other color.',
         weak='Slow to cross the board.', old='Ashva, the horse, in India.',
         mini=mini('c3', 'N', moves=['a2', 'a4', 'b1', 'b5', 'd1', 'd5', 'e2', 'e4'], extra={'b3': 'P', 'c4': 'P', 'd3': 'p'})),
    dict(k='P', name='The Pawn', alias='The Little Soldier', pts='1', count='8 per side',
         moves='Forward one (two on its first move). Captures one square diagonally forward.', power='Promotion: reach the far side and become a queen.',
         weak='Never goes backward.', old='Padati, the foot soldier, in India.',
         mini=mini('c2', 'P', moves=['c3', 'c4'], hits=['b3', 'd3'], extra={'b3': 'n', 'd3': 'p'})),
]
def card(c):
    rule = ''.join(f'<span style="bottom:{i * 12.5}%"></span>' for i in range(1, 8))
    return f'''<article class="card">
  <div class="mug"><div class="ruler">{rule}</div><svg viewBox="0 0 100 100" class="big" role="img" aria-label="{c["name"]}">{piece_svg(c["k"], 50, 54, 74)}</svg>
    <div class="placard"><b>{c["name"]}</b><span>a.k.a. {c["alias"]}</span></div></div>
  <div class="stats"><div><small>Points</small><b>{c["pts"]}</b></div><div><small>On the board</small><b>{c["count"]}</b></div></div>
  <div class="moves">{c["mini"]}<p><b>Moves:</b> {c["moves"]}</p></div>
  <p><b>Power:</b> {c["power"]}</p><p><b>Watch out:</b> {c["weak"]}</p><p class="old">{c["old"]}</p>
</article>'''

# ---------- figures ----------
setup = board(START, marks={'h1': 'gold', 'd1': 'gold', 'd8': 'gold'}, label='Starting position: light square on each player\'s right, queens on their own color')
check_base = {'e1': 'K', 'e8': 'r', 'h8': 'k'}
ck_move = board(dict(check_base), marks={'d1': 'dot', 'd2': 'dot', 'f1': 'dot', 'f2': 'dot', 'e2': 'no'}, label='Move the king out of the rook\'s line', sq=30)
ck_block = board(dict(check_base, a2='R'), arrows=[('a2', 'e2')], label='Block with a rook on e2', sq=30)
ck_take = board(dict(check_base, b5='B'), arrows=[('b5', 'e8')], label='Take the attacker with the bishop', sq=30)
mate = board({'g8': 'k', 'f7': 'p', 'g7': 'p', 'h7': 'p', 'd8': 'R', 'g1': 'K'}, arrows=[('d1', 'd8')] if False else [], marks={'f8': 'no', 'h8': 'no', 'd8': 'gold'}, label='Back-rank checkmate: rook on d8, king on g8 boxed in by its own pawns')
stale = board({'a8': 'k', 'b6': 'Q', 'c6': 'K'}, marks={'a7': 'no', 'b7': 'no', 'b8': 'no'}, label='Stalemate: black king on a8 is not in check but has no safe square')
cas_before = board({'e1': 'K', 'h1': 'R', 'f2': 'P', 'g2': 'P', 'h2': 'P'}, files='efgh', ranks='21', sq=40, arrows=[('e1', 'g1')], label='Before castling: king on e1, rook on h1')
cas_after = board({'g1': 'K', 'f1': 'R', 'f2': 'P', 'g2': 'P', 'h2': 'P'}, files='efgh', ranks='21', sq=40, label='After castling: king on g1, rook on f1')
trap_pos = dict(START); [trap_pos.pop(s) for s in ['e2', 'f1', 'd1', 'e7', 'b8']]
trap_pos.update({'e4': 'P', 'c4': 'B', 'h5': 'Q', 'e5': 'p', 'c6': 'n'})
trap = board(trap_pos, arrows=[('h5', 'f7'), ('c4', 'f7')], marks={'f7': 'hit'}, label='The four-move trap: queen on h5 and bishop on c4 both aim at f7')

HTML = f'''<title>Chess Field Guide</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: one column field guide. Six mug-shot cards up top, then one figure per rule. Board colors are fixed; the page follows the theme. */
:root{{--bg:#fbfaf7;--panel:#fff;--ink:#141412;--ink-2:#4a4944;--ink-3:#8a8880;--line:#e4e2db;--gold:#a8801f;--gold-soft:#f5efdf;--blue:#2d5f8a;
  --display:"Montserrat","Helvetica Neue",Arial,sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,monospace}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#161614;--panel:#1f1f1c;--ink:#f1efe8;--ink-2:#c5c2b8;--ink-3:#8b887e;--line:#2f2e29;--gold:#d4ab45;--gold-soft:#2b2619;--blue:#7fa7dc;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#161614;--panel:#1f1f1c;--ink:#f1efe8;--ink-2:#c5c2b8;--ink-3:#8b887e;--line:#2f2e29;--gold:#d4ab45;--gold-soft:#2b2619;--blue:#7fa7dc;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:var(--display);line-height:1.5;padding-inline:16px;padding-block:28px 64px}}
main{{max-width:980px;margin:0 auto;display:grid;gap:34px}}
header .k{{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}}
h1{{font-size:clamp(28px,5vw,42px);font-weight:800;margin:4px 0 6px;letter-spacing:-.01em}}
h2{{font-size:13px;font-family:var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);font-weight:500;margin:0 0 12px}}
.lede{{color:var(--ink-2);max-width:62ch;margin:0}}
.cards{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}}
.card{{background:var(--panel);border:1.5px solid var(--ink);border-radius:10px;padding:12px;display:grid;gap:8px;font-size:13px;break-inside:avoid}}
.card p{{margin:0}}
.mug{{position:relative;background:#e9e4d6;border-radius:6px;overflow:hidden;aspect-ratio:4/3;max-width:100%}}
.ruler span{{position:absolute;left:0;right:0;border-top:1px solid #9c9686;opacity:.55}}
.big{{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:58%;height:auto}}
.placard{{position:absolute;left:10%;right:10%;bottom:8px;background:#141412;color:#f6f2e8;border-radius:4px;padding:5px 8px;text-align:center}}
.placard b{{display:block;font-size:15px;letter-spacing:.04em;text-transform:uppercase}}
.placard span{{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:#d4ab45}}
.stats{{display:grid;grid-template-columns:1fr 1fr;gap:8px}}
.stats div{{border:1px solid var(--line);border-radius:6px;padding:5px 8px}}
.stats small{{display:block;font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}}
.stats b{{font-size:18px;font-variant-numeric:tabular-nums}}
.moves{{display:grid;grid-template-columns:96px 1fr;gap:10px;align-items:center}}
.moves svg{{width:96px;height:auto;display:block}}
.old{{color:var(--ink-3);font-style:italic;font-size:12px}}
figure{{margin:0;display:grid;gap:8px}}
figure svg{{width:100%;max-width:420px;height:auto;display:block}}
figcaption{{font-size:14px;color:var(--ink-2);max-width:60ch}}
.co{{font:10px var(--mono);fill:currentColor;opacity:.7}}
.row3{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}}
.row3 svg{{max-width:260px}}
.row2{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;align-items:start}}
.row2 svg{{max-width:340px}}
@media screen and (max-width:560px){{.mug{{aspect-ratio:16/9}}}}
.lbl{{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin:0}}
.rule{{border:1.5px solid var(--gold);background:var(--gold-soft);border-radius:10px;padding:16px 18px}}
.rule b{{font-size:20px;display:block;margin-bottom:4px}}
.ladder{{display:flex;flex-wrap:wrap;gap:8px}}
.ladder span{{border:1px solid var(--line);background:var(--panel);border-radius:6px;padding:6px 10px;font-size:14px}}
.ladder b{{font-variant-numeric:tabular-nums}}
section{{min-width:0}}
@media print{{body{{background:#fff;color:#000;padding:0}}main{{gap:18px}}.cards{{grid-template-columns:repeat(3,2.5in);gap:.12in}}.card{{width:2.5in;height:3.5in;padding:7px;font-size:8.6px;gap:4px;border-radius:6px}}.placard b{{font-size:11px}}.placard span{{font-size:8px}}.stats b{{font-size:12px}}.stats div{{padding:2px 5px}}.moves{{grid-template-columns:62px 1fr;gap:6px}}.moves svg{{width:62px}}.old{{font-size:8px}}.pbreak{{break-before:page}}figure svg{{max-width:3.4in}}.row3 svg{{max-width:2.2in}}}}
</style>
<main>
<header><div class="k">Atlas Desk · Chess folder</div><h1>Chess Field Guide</h1>
<p class="lede">Meet the six pieces, then learn the rules with a picture for each one. Goes with the episode "Chess for beginners." Print it, cut out the cards, and quiz each other at the table.</p></header>

<section><h2>Meet the army</h2><div class="cards">{''.join(card(c) for c in CARDS)}</div>
<p class="lede" style="margin-top:10px;font-size:13px">Blue dots: squares the piece can move to. Blue ring: a piece it can capture.</p></section>

<section><h2>Points</h2><div class="ladder"><span>Pawn <b>1</b></span><span>Knight <b>3</b></span><span>Bishop <b>3</b></span><span>Rook <b>5</b></span><span>Queen <b>9</b></span><span>King <b>the whole game</b></span></div></section>

<section class="pbreak"><h2>1 · Set up the board</h2>{fig(setup, "Light square on the right (gold box, h1). Rooks in the corners, then knights, then bishops. The queen goes on her own color (gold boxes, d1 and d8); the king takes the last square. White moves first.")}</section>

<section><h2>2 · Check, and the three ways out</h2><p class="lede" style="margin-bottom:12px">The black rook on e8 attacks the white king on e1. That's check. White must fix it on this move.</p>
<div class="row3">{fig(ck_move, "<b>Move it.</b> Step to a blue square. The e-file is still under attack (red X).")}{fig(ck_block, "<b>Block it.</b> Slide the rook to e2, between the attacker and the king.")}{fig(ck_take, "<b>Take it.</b> The bishop on b5 captures the rook on e8.")}</div></section>

<section class="pbreak"><h2>3 · Checkmate and stalemate</h2><div class="row2">
{fig(mate, "<b>Checkmate.</b> The rook on d8 attacks the king along the back row. f8 and h8 are attacked, and his own pawns block the rest. No move, no block, no capture: game over.")}
{fig(stale, "<b>Stalemate.</b> Black to move. The king on a8 is not in check, but every square around him is covered (red X) and he has no other piece. No legal move means a draw, even if White is way ahead.")}</div></section>

<section><h2>4 · Castling</h2><div class="row2">{fig(cas_before, "Before: king on e1, rook on h1, nothing between them, neither has moved.")}{fig(cas_after, "After: the king slides two squares to g1 and the rook hops over to f1. Not allowed if the king is in check or would cross or land on an attacked square.")}</div></section>

<section class="pbreak"><h2>5 · The four-move trap</h2>{fig(trap, "After 1.e4 e5 2.Bc4 Nc6 3.Qh5, the queen and the bishop both aim at f7, a square only the king guards. If Black ignores it (3...Nf6?), Qxf7 is checkmate. Stop it with 3...g6 or 3...Qe7. Then chase that early queen while you bring your pieces out.")}</section>

<section><div class="rule"><b>Before every move: what does my opponent want?</b>Then check for checks, captures and threats. In the opening: a pawn in the middle, knights and bishops out, castle.</div></section>
</main>'''
(HERE / 'chess-guide.html').write_text(HTML)
print('wrote', len(HTML), 'bytes')
