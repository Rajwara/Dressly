"""Generate the store's SVG illustrations.

Draws every product (front, side and back views), category tile, hero banner
and the story image from lib/data/*.json, and writes them to public/images.
A real photo with the same name (.jpg/.jpeg/.webp/.png) still takes priority
over these SVGs at build time.

Usage:  python3 scripts/generate-illustrations.py
"""

import json
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "images")

COLOURS = {
    "Ivory": "#f2ead8", "Sand": "#d8c39c", "Slate": "#6c7880", "White": "#fbfaf5",
    "Stone": "#c8bda9", "Olive": "#5d6a45", "Cream": "#eee1c2", "Taupe": "#a69482",
    "Pale Blue": "#c7d7e3", "Tan": "#b5834f", "Brown": "#79502f", "Black": "#2b2b29",
    "Charcoal": "#45474b", "Navy": "#2f3c56", "Grey": "#8c8e8b", "Camel": "#b88e5a",
    "Dark Brown": "#4d3423", "Off-White": "#f0ebdf", "Amber": "#c47d26",
    "Gold": "#d2a443", "Rose": "#d69a98", "Red and White": "#b3302c",
    "Black and White": "#2b2b29",
}
BRASS = "#a07a3f"
NAVY = "#0f2537"
LOGO_BLUE = "#3a8cbc"
BRASS_LIGHT = "#d3b273"
INK = "#23261f"
WOOD = "#8a6844"
METAL = "#9b9284"


# ---------------------------------------------------------------- helpers
def _rgb(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def _hex(c):
    return "#" + "".join(f"{max(0, min(255, round(v))):02x}" for v in c)


def shade(h, f):
    """f < 0 darkens, f > 0 lightens."""
    r = _rgb(h)
    return _hex([v * (1 + f) for v in r]) if f < 0 else _hex([v + (255 - v) * f for v in r])


def lum(h):
    r, g, b = _rgb(h)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255


def edge(fill):
    """Outline colour that reads on the warm background, even for white."""
    return shade(fill, -0.22) if lum(fill) < 0.85 else "#cbbfa6"


def g(content, tx=0, ty=0, s=1.0, extra=""):
    return f'<g transform="translate({tx:.1f},{ty:.1f}) scale({s:.3f}){extra}">{content}</g>'


def mirror(content, cx=400):
    return f'<g transform="translate({2 * cx},0) scale(-1,1)">{content}</g>'


def squeeze(content, sx, cx=400):
    return f'<g transform="translate({cx * (1 - sx):.1f},0) scale({sx},1)">{content}</g>'


def svg(w, h, defs, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f"<defs>{defs}</defs>{body}</svg>")


def studio(w, h, top="#f4ede1", bottom="#e3d4bd", pid="bg"):
    defs = (f'<linearGradient id="{pid}" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient>'
            f'<radialGradient id="{pid}-glow" cx="0.5" cy="0.38" r="0.65">'
            f'<stop offset="0" stop-color="#fff" stop-opacity="0.45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>')
    body = (f'<rect width="{w}" height="{h}" fill="url(#{pid})"/>'
            f'<rect width="{w}" height="{h}" fill="url(#{pid}-glow)"/>')
    return defs, body


def floor_shadow(cx, cy, rx, ry=None, o=0.16):
    ry = ry or rx * 0.12
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry:.1f}" fill="{INK}" opacity="{o}"/>'


def check_pattern(pid, base, ink, size=26, rotate=0):
    s, h = size, size / 2
    rot = f' patternTransform="rotate({rotate})"' if rotate else ""
    return (f'<pattern id="{pid}" width="{s}" height="{s}" patternUnits="userSpaceOnUse"{rot}>'
            f'<rect width="{s}" height="{s}" fill="{base}"/>'
            f'<rect width="{h}" height="{h}" fill="{ink}"/>'
            f'<path d="M{h} {h}h{h}v{h}z M0 {h}l{h} {h}H0z" fill="{ink}" opacity="0.85"/>'
            f'<path d="M{h} 0h{h}v{h}z" fill="{ink}" opacity="0.35"/></pattern>')


def weave_pattern(pid, base, line, size=10):
    return (f'<pattern id="{pid}" width="{size}" height="{size}" patternUnits="userSpaceOnUse">'
            f'<rect width="{size}" height="{size}" fill="{base}"/>'
            f'<path d="M0 {size / 2}H{size}" stroke="{line}" stroke-width="1" opacity="0.35"/></pattern>')


def grid_pattern(pid, base, line, size=60):
    return (f'<pattern id="{pid}" width="{size}" height="{size}" patternUnits="userSpaceOnUse">'
            f'<rect width="{size}" height="{size}" fill="{base}"/>'
            f'<path d="M0 6H{size}M6 0V{size}" stroke="{line}" stroke-width="5" opacity="0.55"/>'
            f'<path d="M0 22H{size}M22 0V{size}" stroke="{line}" stroke-width="1.5" opacity="0.45"/></pattern>')


def dot_pattern(pid, base, dot, size=12):
    return (f'<pattern id="{pid}" width="{size}" height="{size}" patternUnits="userSpaceOnUse">'
            f'<rect width="{size}" height="{size}" fill="{base}"/>'
            f'<circle cx="{size / 2}" cy="{size / 2}" r="2.1" fill="{dot}" opacity="0.5"/></pattern>')


def hanger_hook(y_top=108):
    return (f'<path d="M400 182V146C400 {y_top} 438 {y_top} 438 136" fill="none" stroke="{METAL}" '
            f'stroke-width="7" stroke-linecap="round"/>')


# ---------------------------------------------------------------- garments on hangers
def robe(fill, view="front", hem=905, sleeve="long", collar="round", tassel=False,
         placket=False, cuffs=False, hood=False, width=1.0, pid="p"):
    """Kandura, thobe, jalabiya, tunic or undershirt on a hanger."""
    e, dark, light = edge(fill), shade(fill, -0.12), shade(fill, 0.35)
    if view == "side":
        width *= 0.64
    hw = 162 * width  # half width at hem
    aw = 118 * width  # half width at armpit
    sw = 148 * width  # half width at shoulder
    L = lambda dx: 400 - dx
    R = lambda dx: 400 + dx

    if sleeve == "long":
        sl = [(sw + 56, 560), (sw, 574)]
        arm_y = 330
    elif sleeve == "wide":
        sl = [(sw + 92, 540), (aw - 6, 580)]
        arm_y = 370
    elif sleeve == "short":
        sl = [(sw + 40, 350), (sw - 10, 368)]
        arm_y = 322
    else:  # sleeveless
        sl = None
        arm_y = 360
    if view == "side":
        sl = None  # the sleeve is drawn hanging in front instead

    if sl is None:
        sw_ = (sw - 28) if sleeve == "none" else sw
        left = f"L{L(sw_):.0f} 208 Q{L(aw + 6):.0f} 300 {L(aw):.0f} {arm_y}"
        right = f"Q{R(aw + 6):.0f} 300 {R(sw_):.0f} 208"
    else:
        (ox, oy), (ix, iy) = sl
        left = f"L{L(sw):.0f} 210 L{L(ox):.0f} {oy} L{L(ix):.0f} {iy} L{L(aw):.0f} {arm_y}"
        right = f"L{R(ix):.0f} {iy} L{R(ox):.0f} {oy} L{R(sw):.0f} 210"
    nk = 38 if collar != "v" else 46
    body = (f"M{L(nk)} 180 {left} L{L(hw):.0f} {hem} Q400 {hem + 16} {R(hw):.0f} {hem} "
            f"L{R(aw):.0f} {arm_y} {right} L{R(nk)} 180 Q400 200 {L(nk)} 180Z")

    out = []
    if hood and view != "front":
        out.append(f'<path d="M{L(70)} 190 Q400 120 {R(70)} 190 Q{R(60)} 330 400 360 Q{L(60)} 330 {L(70)} 190Z" '
                   f'fill="{dark}" stroke="{e}" stroke-width="2"/>')
    # inside of the neck, then hanger hook
    out.append(f'<path d="M{L(nk)} 180 Q400 166 {R(nk)} 180 Q400 200 {L(nk)} 180Z" fill="{shade(fill, -0.28)}"/>')
    out.append(hanger_hook())
    out.append(f'<path d="{body}" fill="{fill}" stroke="{e}" stroke-width="2.5" stroke-linejoin="round"/>')
    # soft side shading and fold lines
    out.append(f'<path d="{body}" fill="url(#{pid}-sh)"/>')
    for i, dx in enumerate((-0.55, -0.18, 0.22, 0.6)):
        x0 = 400 + dx * aw
        x1 = 400 + dx * hw * 1.05
        out.append(f'<path d="M{x0:.0f} {arm_y + 40} Q{(x0 + x1) / 2 + (8 if i % 2 else -8):.0f} {(arm_y + hem) / 2:.0f} {x1:.0f} {hem - 6}" '
                   f'fill="none" stroke="{dark}" stroke-width="2" opacity="0.35"/>')
    out.append(f'<path d="M{L(aw * 0.35):.0f} {arm_y + 60} L{L(hw * 0.32):.0f} {hem - 30}" stroke="{light}" stroke-width="10" opacity="0.35" stroke-linecap="round"/>')

    if view == "side":
        # single sleeve hanging in front of the body
        if sleeve in ("long", "wide", "short"):
            end = {"long": 575, "wide": 560, "short": 360}[sleeve]
            wid = {"long": 54, "wide": 90, "short": 58}[sleeve]
            out.append(f'<path d="M{400 - 34} 212 Q{400 - 52} {(212 + end) / 2:.0f} {400 - wid / 2 - 6:.0f} {end} '
                       f'L{400 + wid / 2 + 6:.0f} {end + 8} Q{400 + 40} {(212 + end) / 2:.0f} {400 + 30} 214Z" '
                       f'fill="{shade(fill, -0.05)}" stroke="{e}" stroke-width="2.5"/>')
            if cuffs and sleeve == "long":
                out.append(f'<path d="M{400 - wid / 2 - 4:.0f} {end - 28} L{400 + wid / 2 + 5:.0f} {end - 20} L{400 + wid / 2 + 6:.0f} {end + 8} L{400 - wid / 2 - 6:.0f} {end}Z" fill="{dark}" opacity="0.6"/>')
        if collar == "stand":
            out.append(f'<rect x="{400 - 30}" y="168" width="60" height="22" rx="4" fill="{fill}" stroke="{e}" stroke-width="2"/>')
        return "".join(out)

    if cuffs and sl:
        (ox, oy), (ix, iy) = sl
        for sgn in (-1, 1):
            p = lambda dx, y: f"{400 + sgn * dx:.0f} {y}"
            out.append(f'<path d="M{p(ox - 5, oy - 32)} L{p(ix - 3, iy - 32)} L{p(ix, iy)} L{p(ox, oy)}Z" '
                       f'fill="{dark}" stroke="{e}" stroke-width="2"/>')

    if view == "back":
        out.append(f'<path d="M{L(sw - 10):.0f} 262 Q400 280 {R(sw - 10):.0f} 262" fill="none" stroke="{e}" stroke-width="2" opacity="0.8"/>')
        if collar == "stand":
            out.append(f'<path d="M{L(nk)} 182 Q400 196 {R(nk)} 182 L{R(nk) - 4} 164 Q400 176 {L(nk) + 4} 164Z" fill="{fill}" stroke="{e}" stroke-width="2"/>')
        if hood:
            out.append(f'<path d="M{L(78)} 196 Q400 150 {R(78)} 196 Q{R(70)} 380 400 410 Q{L(70)} 380 {L(78)} 196Z" '
                       f'fill="{shade(fill, -0.04)}" stroke="{e}" stroke-width="2.5"/>')
        return "".join(out)

    # front details
    if collar == "round":
        out.append(f'<path d="M{L(nk)} 180 Q400 214 {R(nk)} 180" fill="none" stroke="{e}" stroke-width="3"/>')
    elif collar == "stand":
        out.append(f'<path d="M{L(nk)} 182 Q400 204 {R(nk)} 182 L{R(nk) - 3} 160 Q400 182 {L(nk) + 3} 160Z" '
                   f'fill="{fill}" stroke="{e}" stroke-width="2.5"/>')
    elif collar == "band":
        out.append(f'<path d="M{L(nk)} 180 Q400 210 {R(nk)} 180" fill="none" stroke="{e}" stroke-width="7" opacity="0.7"/>')
    elif collar == "v":
        out.append(f'<path d="M{L(nk)} 180 L400 260 L{R(nk)} 180" fill="{shade(fill, -0.28)}" stroke="{e}" stroke-width="3"/>')
    if hood:
        out.append(f'<path d="M{L(66)} 182 Q400 250 {R(66)} 182 Q{R(58)} 214 400 232 Q{L(58)} 214 {L(66)} 182Z" '
                   f'fill="{dark}" stroke="{e}" stroke-width="2"/>')
    if placket:
        out.append(f'<path d="M400 200V400" stroke="{e}" stroke-width="2.5"/>')
        for y in (228, 272, 316, 360):
            out.append(f'<circle cx="{400 + 9}" cy="{y}" r="6" fill="{shade(fill, -0.3)}"/>')
    if tassel:
        out.append(f'<path d="M400 202 Q396 300 402 410" fill="none" stroke="{dark}" stroke-width="4"/>'
                   f'<path d="M394 408 Q402 400 410 408 L414 470 Q402 480 390 470Z" fill="{dark}" stroke="{e}" stroke-width="1.5"/>')
    return "".join(out)


def robe_defs(fill, pid):
    return (f'<linearGradient id="{pid}-sh" x1="0" y1="0" x2="1" y2="0">'
            f'<stop offset="0" stop-color="#000" stop-opacity="0.10"/>'
            f'<stop offset="0.35" stop-color="#000" stop-opacity="0"/>'
            f'<stop offset="0.75" stop-color="#000" stop-opacity="0"/>'
            f'<stop offset="1" stop-color="#000" stop-opacity="0.14"/></linearGradient>')


def jacket(fill, view="front", style="closed", pid="p"):
    e, dark = edge(fill), shade(fill, -0.18)
    lining = shade(fill, -0.38)
    out = [robe(fill, view, hem=800, sleeve="long", collar="none", cuffs=False, width=1.06, pid=pid)]
    if view == "front":
        if style == "open":
            out.append(f'<path d="M380 186 L360 800 Q400 808 440 800 L420 186 Q400 196 380 186Z" fill="{lining}"/>'
                       f'<path d="M362 182 L330 380 L372 420" fill="none" stroke="{e}" stroke-width="3"/>'
                       f'<path d="M438 182 L470 380 L428 420" fill="none" stroke="{e}" stroke-width="3"/>')
        else:
            out.append(f'<path d="M362 182 L400 330 L438 182" fill="{lining}" stroke="{e}" stroke-width="3"/>'
                       f'<path d="M400 330V796" stroke="{e}" stroke-width="2.5"/>')
            for y in (380, 460, 540):
                out.append(f'<circle cx="412" cy="{y}" r="8" fill="{dark}" stroke="{e}" stroke-width="1.5"/>')
        for sgn in (-1, 1):
            x = 400 + sgn * 92
            out.append(f'<path d="M{x - 40} 600 H{x + 40}" stroke="{e}" stroke-width="3" opacity="0.8"/>')
    elif view == "back":
        out.append(f'<path d="M400 520V800" stroke="{e}" stroke-width="2.5"/>')
    return "".join(out)


def saderi(fill, view="front", pattern=None, buttons=True, pid="p"):
    e, dark = edge(fill), shade(fill, -0.3)
    paint = f"url(#{pattern})" if pattern else fill
    if view == "side":
        body = "M378 180 L350 196 Q360 300 340 360 L336 600 Q400 612 470 600 L462 360 Q444 300 452 196 L422 180Z"
        return (hanger_hook() + f'<path d="{body}" fill="{paint}" stroke="{e}" stroke-width="2.5"/>'
                f'<path d="M422 182 L410 330 V600" fill="none" stroke="{e}" stroke-width="2.5"/>')
    out = [f'<path d="M365 180 L400 330 L435 180 Q400 194 365 180Z" fill="{dark}"/>', hanger_hook()]
    if view == "back":
        body = "M365 180 L300 196 Q312 300 292 360 L286 600 Q400 612 514 600 L508 360 Q488 300 500 196 L435 180 Q400 196 365 180Z"
    else:
        body = "M365 180 L300 196 Q312 300 292 360 L286 600 Q400 612 514 600 L508 360 Q488 300 500 196 L435 180 L400 330Z"
    out.append(f'<path d="{body}" fill="{paint}" stroke="{e}" stroke-width="2.5" stroke-linejoin="round"/>')
    out.append(f'<path d="{body}" fill="url(#{pid}-sh)"/>')
    if view == "front":
        out.append(f'<path d="M400 330V606" stroke="{e}" stroke-width="2.5"/>')
        if buttons:
            for y in (370, 430, 490, 550):
                out.append(f'<circle cx="410" cy="{y}" r="6.5" fill="{dark}"/>')
        out.append(f'<path d="M318 470 H370 M430 470 H482" stroke="{e}" stroke-width="3"/>')
    else:
        out.append(f'<path d="M310 260 Q400 280 490 260" fill="none" stroke="{e}" stroke-width="2"/>')
    return "".join(out)


def bisht(fill, view="front", pid="p"):
    e = edge(fill)
    body = "M370 180 L232 214 Q168 430 136 900 Q400 922 664 900 Q632 430 568 214 L430 180 Q400 196 370 180Z"
    if view == "side":
        body = "M376 180 L300 214 Q262 430 246 900 Q400 916 560 900 Q540 430 500 214 L424 180 Q400 194 376 180Z"
    out = [f'<path d="M370 180 Q400 166 430 180 Q400 196 370 180Z" fill="{shade(fill, -0.3)}"/>', hanger_hook()]
    out.append(f'<path d="{body}" fill="{fill}" stroke="{e}" stroke-width="2.5" stroke-linejoin="round"/>')
    out.append(f'<path d="{body}" fill="url(#{pid}-sh)"/>')
    for x0, x1 in ((300, 230), (340, 300), (460, 500), (500, 570)):
        out.append(f'<path d="M{x0} 330 Q{(x0 + x1) / 2} 620 {x1} 890" fill="none" stroke="{shade(fill, 0.25)}" stroke-width="2" opacity="0.4"/>')
    if view == "front":
        out.append(f'<path d="M388 192 L366 904 Q400 910 434 904 L412 192Z" fill="#f6f1e4" stroke="#d9cfba" stroke-width="2"/>')
        for sgn in (-1, 1):
            x0 = 400 + sgn * 14
            out.append(f'<path d="M{x0} 186 L{400 + sgn * 36} 560" stroke="{BRASS}" stroke-width="16" stroke-linecap="round"/>'
                       f'<path d="M{x0} 186 L{400 + sgn * 36} 560" stroke="{BRASS_LIGHT}" stroke-width="4" stroke-dasharray="3 9"/>')
            out.append(f'<path d="M{400 + sgn * 120} 330 V470" stroke="{shade(fill, -0.35)}" stroke-width="4"/>')
        out.append(f'<path d="M370 182 Q400 198 430 182" fill="none" stroke="{BRASS}" stroke-width="12"/>')
    elif view == "back":
        out.append(f'<path d="M352 186 Q400 236 448 186" fill="none" stroke="{BRASS}" stroke-width="12"/>'
                   f'<path d="M400 230 V320" stroke="{BRASS}" stroke-width="8" stroke-linecap="round"/>')
    else:
        out.append(f'<path d="M424 184 L470 560" stroke="{BRASS}" stroke-width="14" stroke-linecap="round"/>')
    return "".join(out)


def drape(fill, paint, view="front", fringe=True, border=None):
    """Shawl or wuzar hanging over a wooden rod."""
    e = edge(fill)
    out = [f'<path d="M170 262 H630" stroke="{WOOD}" stroke-width="14" stroke-linecap="round"/>',
           f'<path d="M400 256 V130" stroke="{METAL}" stroke-width="6"/>']
    back_y, front_y = (840, 780) if view != "side" else (820, 820)
    x0, x1 = (240, 560) if view != "side" else (290, 510)
    out.append(f'<path d="M{x0 + 20} 268 Q{x0} 560 {x0 + 14} {back_y} H{x1 + 14} Q{x1 + 30} 560 {x1} 268Z" fill="{shade(fill, -0.15)}" stroke="{e}" stroke-width="2"/>')
    if view != "side":
        out.append(f'<path d="M{x0 - 10} 268 Q{x0 - 22} 520 {x0 - 6} {front_y} H{x1 - 30} Q{x1 - 10} 520 {x1 - 20} 268Z" fill="{paint}" stroke="{e}" stroke-width="2.5"/>')
        hem_x = (x0 - 6, x1 - 30)
        hem_y = front_y
    else:
        hem_x, hem_y = (x0 + 14, x1 + 14), back_y
    out.append(f'<path d="M{x0 - 14} 262 Q400 244 {x1 + 14} 262 Q400 290 {x0 - 14} 262Z" fill="{shade(fill, 0.1)}" stroke="{e}" stroke-width="2"/>')
    if border:
        out.append(f'<path d="M{hem_x[0] + 4} {hem_y - 40} H{hem_x[1] - 4} M{hem_x[0] + 4} {hem_y - 56} H{hem_x[1] - 4}" stroke="{border}" stroke-width="5"/>')
    if fringe:
        xs = range(int(hem_x[0]) + 6, int(hem_x[1]) - 2, 11)
        out.append("".join(f'<path d="M{x} {hem_y} v{24 + (x % 3) * 4}" stroke="{e}" stroke-width="3" stroke-linecap="round"/>' for x in xs))
    for x in (330, 400, 470):
        out.append(f'<path d="M{x} 290 Q{x - 12} 520 {x + 6} {hem_y - 20}" fill="none" stroke="{shade(fill, -0.25)}" stroke-width="2" opacity="0.3"/>')
    return "".join(out)


def folded(fill, paint, border=None, layers=1):
    """Folded fabric lying flat (front) or stacked (side)."""
    e = edge(fill)
    out = []
    if layers > 1:
        for i in range(layers):
            y = 640 - i * 92
            out.append(f'<rect x="170" y="{y}" width="460" height="96" rx="20" fill="{paint if i == layers - 1 else shade(fill, -0.06 * (layers - i))}" stroke="{e}" stroke-width="2.5"/>')
            out.append(f'<path d="M190 {y + 48} H610" stroke="{shade(fill, -0.2)}" stroke-width="2" opacity="0.4"/>')
            if border:
                out.append(f'<path d="M186 {y + 74} H614" stroke="{border}" stroke-width="5"/>')
        out.append(floor_shadow(400, 742, 250, 18))
        return "".join(out)
    out.append(floor_shadow(400, 846, 270, 22))
    out.append(f'<rect x="170" y="250" width="460" height="580" rx="10" fill="{paint}" stroke="{e}" stroke-width="2.5"/>')
    out.append(f'<path d="M170 540 H630" stroke="{shade(fill, -0.18)}" stroke-width="3" opacity="0.5"/>')
    out.append(f'<path d="M170 540 Q400 560 630 540 V560 Q400 580 170 560Z" fill="#000" opacity="0.05"/>')
    if border:
        out.append(f'<path d="M190 760 H610 M190 780 H610" stroke="{border}" stroke-width="6"/>')
        out.append(f'<rect x="186" y="266" width="428" height="548" rx="6" fill="none" stroke="{border}" stroke-width="2" opacity="0.7"/>')
    return "".join(out)


def trousers(fill, view="front", short=False):
    e, dark = edge(fill), shade(fill, -0.15)
    if short:
        body = "M286 236 H514 L540 476 L418 488 L400 352 L382 488 L260 476Z"
    else:
        body = "M280 236 H520 L546 560 L524 884 L420 884 L405 430 L395 430 L380 884 L276 884 L254 560Z"
    if view == "side":
        body = "M330 236 H470 L492 560 L476 884 L340 884 L318 560Z" if not short else "M330 236 H470 L490 476 L314 476Z"
    out = [hanger_hook(), f'<path d="M300 236 Q400 176 500 236" fill="none" stroke="{WOOD}" stroke-width="10"/>']
    out.append(f'<path d="{body}" fill="{fill}" stroke="{e}" stroke-width="2.5" stroke-linejoin="round"/>')
    x0, x1 = (280, 520) if view != "side" else (330, 470)
    out.append(f'<rect x="{x0}" y="236" width="{x1 - x0}" height="34" fill="{dark}" stroke="{e}" stroke-width="2"/>')
    for x in range(x0 + 14, x1 - 8, 18):
        out.append(f'<path d="M{x} 240 v26" stroke="{shade(fill, -0.3)}" stroke-width="1.5" opacity="0.5"/>')
    if view == "front":
        out.append(f'<path d="M392 270 q-10 40 -24 70 M408 270 q10 40 24 70" fill="none" stroke="{shade(fill, -0.35)}" stroke-width="3"/>')
    for x in ((330, 470) if view != "side" else (360, 440)):
        out.append(f'<path d="M{x} 290 Q{x + 6} 520 {x - 4} {470 if short else 870}" fill="none" stroke="{dark}" stroke-width="2" opacity="0.45"/>')
    return "".join(out)


# ---------------------------------------------------------------- headwear
def headcloth(fill, paint, view="front", fringe=False, embroidered=False):
    e = edge(fill)
    out = []
    if view == "side":
        out.append(floor_shadow(400, 744, 250, 18))
        for i in range(3):
            y = 600 - i * 70
            out.append(f'<rect x="170" y="{y}" width="460" height="74" rx="14" fill="{paint if i == 2 else shade(fill, -0.08 * (3 - i))}" stroke="{e}" stroke-width="2.5"/>')
        out.append(f'<path d="M170 430 L630 504" stroke="{shade(fill, -0.25)}" stroke-width="2" opacity="0.5"/>')
        return "".join(out)
    if view == "back":
        shape = "M400 190 L712 500 L400 810 L88 500Z"
        out.append(floor_shadow(400, 840, 260, 20))
        out.append(f'<path d="{shape}" fill="{paint}" stroke="{e}" stroke-width="2.5"/>')
        out.append(f'<path d="M400 190 L400 810" stroke="#000" stroke-width="2" opacity="0.08"/>')
        if embroidered:
            out.append(f'<path d="M400 222 L680 500 L400 778 L120 500Z" fill="none" stroke="{BRASS_LIGHT}" stroke-width="3" stroke-dasharray="10 6"/>')
        if fringe:
            for (x, y), (dx, dy) in (((712, 500), (1, 0)), ((88, 500), (-1, 0)), ((400, 810), (0, 1))):
                out.append("".join(f'<path d="M{x + dy * k} {y + dx * k} l{dx * 22 + dy * 3} {dy * 22}" stroke="{e}" stroke-width="3"/>' for k in range(-30, 31, 10)))
        return "".join(out)
    # front: folded into a triangle, the way it is worn
    shape = "M140 320 L660 320 L400 850Z"
    out.append(floor_shadow(400, 872, 200, 18))
    out.append(f'<path d="{shape}" fill="{paint}" stroke="{e}" stroke-width="2.5" stroke-linejoin="round"/>')
    out.append(f'<path d="M140 320 L660 320 L640 360 L160 360Z" fill="{paint}" stroke="{e}" stroke-width="2"/>'
               f'<path d="M160 360 L640 360 L400 400Z" fill="#000" opacity="0.07"/>')
    out.append(f'<path d="M250 420 L400 850 M550 420 L400 850" stroke="#000" stroke-width="2" opacity="0.07"/>')
    if embroidered:
        out.append(f'<path d="M190 380 L610 380 L400 812Z" fill="none" stroke="{BRASS_LIGHT}" stroke-width="3" stroke-dasharray="10 6"/>')
    if fringe:
        for k in range(0, 13):
            t = k / 12
            x1, y1 = 140 + (400 - 140) * t, 320 + (850 - 320) * t
            x2, y2 = 660 + (400 - 660) * t, 320 + (850 - 320) * t
            out.append(f'<path d="M{x1:.0f} {y1:.0f} l-18 8 M{x2:.0f} {y2:.0f} l18 8" stroke="{e}" stroke-width="3" stroke-linecap="round"/>')
    return "".join(out)


def egal(fill, view="front", slim=False, tassels=False):
    w = 15 if slim else 26
    hi = shade(fill, 0.35)
    rx = {"front": 230, "side": 120, "back": 230}[view]
    out = [floor_shadow(400, 720, rx + 30, 26)]
    for cy in (560, 500):
        out.append(f'<ellipse cx="400" cy="{cy}" rx="{rx}" ry="96" fill="none" stroke="{fill}" stroke-width="{w}"/>'
                   f'<ellipse cx="400" cy="{cy}" rx="{rx}" ry="96" fill="none" stroke="{hi}" stroke-width="{w * 0.35:.1f}" stroke-dasharray="6 10" opacity="0.6"/>')
    if view != "front" or tassels:
        tx = 400 if view != "side" else 400 + rx - 10
        for dx, length in ((-14, 230 if tassels else 140), (14, 250 if tassels else 150)):
            out.append(f'<path d="M{tx + dx} 600 Q{tx + dx * 2} {600 + length / 2} {tx + dx} {600 + length}" fill="none" stroke="{fill}" stroke-width="{w * 0.45:.0f}"/>')
            if tassels:
                out.append(f'<path d="M{tx + dx - 12} {600 + length} h24 l6 70 h-36z" fill="{fill}"/>'
                           f'<path d="M{tx + dx - 12} {600 + length} h24" stroke="{BRASS}" stroke-width="5"/>')
    return "".join(out)


def tarboosh(fill, view="front", length=1.0, bead=False, twist=False):
    e, dark = edge(fill), shade(fill, -0.15)
    sway = {"front": 0, "side": 26, "back": -18}[view]
    end_y = 560 + 180 * (length - 1)
    out = [f'<circle cx="400" cy="170" r="14" fill="{WOOD}"/>',
           f'<ellipse cx="400" cy="214" rx="34" ry="44" fill="none" stroke="{fill}" stroke-width="10"/>',
           f'<ellipse cx="400" cy="214" rx="34" ry="44" fill="none" stroke="{e}" stroke-width="1.5" opacity="0.6"/>']
    cord = f"M400 258 Q{400 + sway} {(258 + end_y) / 2} {400 + sway * 1.5:.0f} {end_y}"
    out.append(f'<path d="{cord}" fill="none" stroke="{e}" stroke-width="13"/><path d="{cord}" fill="none" stroke="{fill}" stroke-width="10"/>')
    if twist:
        out.append(f'<path d="{cord}" fill="none" stroke="{dark}" stroke-width="10" stroke-dasharray="4 8"/>')
    x = 400 + sway * 1.5
    if bead:
        out.append(f'<circle cx="{x:.0f}" cy="{end_y - 70}" r="16" fill="{BRASS}"/>')
    tl = 200 * length
    out.append(f'<path d="M{x - 18:.0f} {end_y} h36 l26 {tl:.0f} q-44 18 -88 0z" fill="{fill}" stroke="{e}" stroke-width="2.5"/>')
    out.append("".join(f'<path d="M{x - 10 + k * 7:.0f} {end_y + 20} L{x - 30 + k * 13:.0f} {end_y + tl - 4:.0f}" stroke="{dark}" stroke-width="1.5" opacity="0.6"/>' for k in range(5)))
    out.append(f'<rect x="{x - 22:.0f}" y="{end_y - 4}" width="44" height="16" rx="6" fill="{dark}" stroke="{e}" stroke-width="2"/>')
    out.append(floor_shadow(400, 900, 120, 12, 0.08))
    return "".join(out)


def kufi(fill, view="front", texture="knit", pid="p"):
    e, dark = edge(fill), shade(fill, -0.14)
    sx = 0.86 if view == "side" else 1
    paint = f"url(#{pid}-tex)" if texture == "mesh" else fill
    dome = "M200 600 Q200 330 400 330 Q600 330 600 600Z"
    out = [floor_shadow(400, 640, 230, 26)]
    inner = [f'<path d="{dome}" fill="{paint}" stroke="{e}" stroke-width="2.5"/>',
             f'<path d="{dome}" fill="url(#{pid}-sh)"/>']
    if texture == "knit":
        inner += [f'<path d="M{212 + k * 4} {580 - k * 26} Q400 {556 - k * 30} {588 - k * 4} {580 - k * 26}" fill="none" stroke="{dark}" stroke-width="2" opacity="0.5"/>' for k in range(9)]
    if texture == "stitched":
        inner += [f'<path d="M{230 + k * 34} 590 Q{230 + k * 34} {380 + k * 12} 400 {350 + k * 26} Q{570 - k * 34} {380 + k * 12} {570 - k * 34} 590" fill="none" stroke="{dark}" stroke-width="2" stroke-dasharray="6 6"/>' for k in range(4)]
    if view == "front":
        inner.append(f'<path d="M400 332 V540" stroke="{dark}" stroke-width="1.5" opacity="0.5"/>')
    inner.append(f'<path d="M196 540 Q400 520 604 540 L604 600 Q400 622 196 600Z" fill="{shade(fill, -0.05)}" stroke="{e}" stroke-width="2.5"/>')
    inner.append(f'<path d="M200 570 Q400 552 600 570" fill="none" stroke="{dark}" stroke-width="2" stroke-dasharray="5 5"/>')
    out.append(squeeze("".join(inner), sx))
    return "".join(out)


# ---------------------------------------------------------------- footwear
SOLE = "M0 -260 C95 -260 104 -120 96 0 C90 150 82 262 0 262 C-82 262 -92 150 -96 0 C-104 -120 -95 -260 0 -260Z"


def sandal_top(strap, style):
    s = edge(strap)
    sole_c = "#c79f6e" if lum(strap) < 0.35 else shade(strap, 0.25)
    out = [f'<path d="{SOLE}" fill="#5b3f27" transform="translate(6,10)" opacity="0.5"/>',
           f'<path d="{SOLE}" fill="{sole_c}" stroke="{shade(sole_c, -0.25)}" stroke-width="3"/>',
           f'<path d="{SOLE}" fill="none" stroke="{shade(sole_c, -0.12)}" stroke-width="2" transform="scale(0.88)"/>']
    if style == "double":
        bands = (-70, 50)
    else:
        bands = (-40,)
    for y in bands:
        out.append(f'<path d="M-112 {y - 34} Q0 {y - 70} 112 {y - 34} L112 {y + 34} Q0 {y + 2} -112 {y + 34}Z" fill="{strap}" stroke="{s}" stroke-width="2.5"/>')
        if style == "stitched":
            out.append(f'<path d="M-100 {y - 20} Q0 {y - 54} 100 {y - 20} M-100 {y + 20} Q0 {y - 12} 100 {y + 20}" fill="none" stroke="{shade(strap, 0.45)}" stroke-width="2" stroke-dasharray="6 6"/>')
    if style != "double":
        out.append(f'<path d="M-10 -190 C-40 -190 -40 -140 -6 -120 L-4 -86 H6 L8 -120 C42 -140 40 -190 10 -190Z" fill="{strap}" stroke="{s}" stroke-width="2.5"/>')
    return "".join(out)


def sandals(fill, view="front", style="classic", kid=False):
    s = 0.74 if kid else 1
    if view == "front":
        pair = (g(sandal_top(fill, style), 290, 500, s, " rotate(-6)") +
                g(mirror(sandal_top(fill, style), 0), 510, 520, s, " rotate(6)"))
        return floor_shadow(400, 820, 260 * s, 26) + pair
    if view == "side":
        sole_c = "#c79f6e" if lum(fill) < 0.35 else shade(fill, 0.25)
        e = edge(fill)
        prof = (f'<path d="M-290 30 Q-300 0 -270 -6 H260 Q300 -4 296 26 Q294 44 260 44 H-260 Q-290 44 -290 30Z" fill="{sole_c}" stroke="{shade(sole_c, -0.3)}" stroke-width="3"/>'
                f'<path d="M-282 40 H286" stroke="#3a2a1d" stroke-width="10" stroke-linecap="round"/>')
        if style == "double":
            prof += (f'<path d="M-60 -6 Q-20 -120 60 -6" fill="none" stroke="{fill}" stroke-width="40"/>'
                     f'<path d="M80 -6 Q120 -110 190 -6" fill="none" stroke="{fill}" stroke-width="36"/>')
        else:
            prof += f'<path d="M-10 -6 Q60 -140 150 -6" fill="none" stroke="{fill}" stroke-width="52"/>'
            prof += f'<path d="M190 -6 Q206 -46 222 -6" fill="none" stroke="{fill}" stroke-width="14"/>'
        prof += f'<path d="M-10 -6 Q60 -140 150 -6" fill="none" stroke="{e}" stroke-width="2" opacity="0.4"/>'
        return floor_shadow(400, 640, 320 * s, 18) + g(prof, 400, 600, s)
    # back: pair seen from the heel
    e = edge(fill)
    sole_c = "#c79f6e" if lum(fill) < 0.35 else shade(fill, 0.25)
    one = (f'<rect x="-90" y="-20" width="180" height="40" rx="18" fill="{sole_c}" stroke="{shade(sole_c, -0.3)}" stroke-width="3"/>'
           f'<path d="M-82 14 H82" stroke="#3a2a1d" stroke-width="10" stroke-linecap="round"/>'
           f'<path d="M-100 -16 Q0 -150 100 -16" fill="none" stroke="{fill}" stroke-width="40"/>'
           f'<path d="M-100 -16 Q0 -150 100 -16" fill="none" stroke="{e}" stroke-width="2" opacity="0.4"/>')
    return floor_shadow(400, 640, 300 * s, 22) + g(one, 290, 600, s) + g(one, 510, 600, s)


# ---------------------------------------------------------------- accessories
def perfume(fill, view="front", pid="p"):
    out = [floor_shadow(400, 810, 230, 24)]
    out.append(f'<rect x="{430 if view != "side" else 360}" y="330" width="230" height="470" rx="6" fill="#ebe2cf" stroke="#cdbfa3" stroke-width="2"/>')
    out.append(f'<path d="M{450 if view != "side" else 380} 380 H{640 if view != "side" else 570}" stroke="{BRASS}" stroke-width="3"/>')
    sx = 0.58 if view == "side" else 1
    bottle = [f'<rect x="270" y="420" width="260" height="390" rx="34" fill="url(#{pid}-glass)" stroke="{shade(fill, -0.35)}" stroke-width="3"/>',
              f'<rect x="290" y="500" width="220" height="292" rx="22" fill="{fill}" opacity="0.85"/>',
              f'<rect x="290" y="500" width="220" height="292" rx="22" fill="url(#{pid}-liq)"/>',
              f'<path d="M300 440 Q296 620 306 790" stroke="#fff" stroke-width="12" opacity="0.45" stroke-linecap="round"/>',
              f'<rect x="360" y="380" width="80" height="44" rx="4" fill="{BRASS}"/>',
              f'<rect x="336" y="270" width="128" height="116" rx="12" fill="{BRASS}" stroke="#7d5e2e" stroke-width="2"/>',
              f'<path d="M352 286 V372" stroke="{BRASS_LIGHT}" stroke-width="8" opacity="0.7" stroke-linecap="round"/>']
    if view == "front":
        bottle.append(f'<rect x="330" y="600" width="140" height="80" rx="4" fill="#f6efe0" opacity="0.92"/>'
                      f'<path d="M346 628 H454 M360 652 H440" stroke="{BRASS}" stroke-width="3"/>')
    out.append(squeeze("".join(bottle), sx))
    return "".join(out)


def perfume_defs(fill, pid):
    return (f'<linearGradient id="{pid}-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.65"/>'
            f'<stop offset="1" stop-color="#d9d3c6" stop-opacity="0.55"/></linearGradient>'
            f'<linearGradient id="{pid}-liq" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/>'
            f'<stop offset="1" stop-color="#000" stop-opacity="0.25"/></linearGradient>')


def wallet(fill, view="front", style="bifold"):
    e, hi = edge(fill), shade(fill, 0.25)
    out = [floor_shadow(400, 720, 250, 22)]
    if style == "card":
        w, h = 340, 230
    elif style == "zip":
        w, h = 460, 280
    else:
        w, h = 420, 320
    x, y = 400 - w / 2, 640 - h
    if view == "side":
        # opened, showing card slots
        out.append(f'<rect x="{400 - w + 10}" y="{y}" width="{w - 10}" height="{h}" rx="16" fill="{shade(fill, -0.1)}" stroke="{e}" stroke-width="2.5"/>'
                   f'<rect x="400" y="{y}" width="{w - 10}" height="{h}" rx="16" fill="{fill}" stroke="{e}" stroke-width="2.5"/>')
        for i, col in enumerate(("#c9b27c", "#6d8399", "#f1ead9")):
            out.append(f'<rect x="{430}" y="{y + 22 + i * 46}" width="{w - 70}" height="60" rx="6" fill="{col}"/>'
                       f'<path d="M424 {y + 70 + i * 46} Q{400 + w / 2} {y + 60 + i * 46} {390 + w - 24} {y + 70 + i * 46} V{y + h - 14} H424Z" fill="{shade(fill, -0.04 * i)}" stroke="{e}" stroke-width="1.5"/>')
        out.append(f'<path d="M400 {y + 8} V{y + h - 8}" stroke="{shade(fill, -0.3)}" stroke-width="4"/>')
        return out[0] + g("".join(out[1:]), 400 * 0.25, 640 * 0.25, 0.75)
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{e}" stroke-width="2.5"/>')
    out.append(f'<rect x="{x + 14}" y="{y + 14}" width="{w - 28}" height="{h - 28}" rx="10" fill="none" stroke="{hi}" stroke-width="2" stroke-dasharray="7 6"/>')
    out.append(f'<path d="M{x + 30} {y + 26} Q400 {y + 6} {x + w - 30} {y + 26}" fill="none" stroke="{hi}" stroke-width="5" opacity="0.4"/>')
    if style == "bifold" and view == "front":
        out.append(f'<path d="M{x + w - 4} {y + 30} V{y + h - 30}" stroke="{shade(fill, -0.3)}" stroke-width="6"/>')
    if style == "card" and view == "front":
        out.append(f'<rect x="{x + 40}" y="{y - 40}" width="{w - 80}" height="90" rx="8" fill="#c9b27c"/>'
                   f'<path d="M{x} {y + 50} Q400 {y + 90} {x + w} {y + 50}" fill="{fill}" stroke="{e}" stroke-width="2.5"/>')
    if style == "zip":
        out.append(f'<path d="M{x + 18} {y + h - 18} V{y + 18} H{x + w - 18} V{y + h - 18}" fill="none" stroke="{METAL}" stroke-width="6" stroke-dasharray="3 3"/>'
                   f'<rect x="{x + w - 30}" y="{y + 40}" width="22" height="58" rx="6" fill="{METAL}"/>')
    if view == "back":
        out.append(f'<path d="M{x + 40} {y + h / 2} H{x + w - 40}" stroke="{shade(fill, -0.2)}" stroke-width="2" opacity="0.5"/>')
    return "".join(out)


def gift_card(fill, view="front"):
    out = [floor_shadow(400, 760, 300, 24)]
    card = (f'<rect x="-280" y="-176" width="560" height="352" rx="24" fill="{fill}" stroke="#d1c3a3" stroke-width="2.5"/>'
            f'<rect x="-252" y="-148" width="504" height="296" rx="14" fill="none" stroke="{BRASS}" stroke-width="2"/>')
    if view == "back":
        card += (f'<rect x="-280" y="-120" width="560" height="64" fill="{NAVY}"/>'
                 f'<rect x="-230" y="10" width="300" height="40" rx="4" fill="#fff" stroke="#d1c3a3"/>'
                 f'<path d="M-230 90 H120" stroke="{BRASS}" stroke-width="3"/>')
    else:
        card += (f'<path d="M-280 70 Q0 10 280 90 V152 Q280 176 256 176 H-256 Q-280 176 -280 152Z" fill="{NAVY}"/>'
                 f'<text x="0" y="-30" text-anchor="middle" font-family="Georgia,serif" font-size="50" letter-spacing="10" fill="{NAVY}">DRESSLY</text>'
                 f'<text x="0" y="12" text-anchor="middle" font-family="Georgia,serif" font-size="20" letter-spacing="6" fill="{LOGO_BLUE}">GIFT CARD</text>')
    if view == "side":
        env = (f'<rect x="-300" y="-150" width="600" height="380" rx="10" fill="#e9dfca" stroke="#cdbfa3" stroke-width="2"/>'
               + f'<path d="M-300 -150 L0 60 L300 -150" fill="none" stroke="#cdbfa3" stroke-width="2"/>')
        return "".join(out) + g(env, 400, 560, 1) + g(card, 400, 430, 0.8, " rotate(-8)")
    return "".join(out) + g(card, 400, 540, 1, " rotate(-4)")


# ---------------------------------------------------------------- product routing
VIEWS = ("front", "side", "back")


def product_art(p, view, pid="p"):
    """Return (defs, body) for one product view in an 800x1000 box."""
    slug, cat = p["slug"], p["categorySlug"]
    fill = COLOURS.get(p["colour"], "#cccccc")
    defs = robe_defs(fill, pid)
    kid = slug.startswith(("boys-", "kids-"))

    if cat in ("kandura-thobes", "adult-thobes", "traditional-kandura", "summer-thobes", "kids-clothing"):
        opts = dict(collar="round", tassel=False, placket=False, cuffs=False)
        if "kandura" in slug:
            opts["tassel"] = "tassel" in slug or "heritage" in slug or "occasion" in slug or "classic" in slug
        if "stand-collar" in slug or "short-collar" in slug:
            opts["collar"] = "stand"
        if "placket" in slug or "thobe" in slug:
            opts["placket"] = True
        if "cuff" in slug:
            opts["cuffs"] = True
        body = robe(fill, view, pid=pid, **opts)
        if kid:
            body = g(body, 400 * 0.2, 120, 0.8)
        return defs, body + floor_shadow(400, 960, 170, 10, 0.06)
    if cat == "jalabiya":
        return defs, robe(fill, view, sleeve="wide", collar="v", hood="hooded" in slug, width=1.12, pid=pid)
    if cat == "arabian-casuals":
        return defs, robe(fill, view, hem=650, sleeve="short", collar="band" if "band" in slug else "round",
                          placket="band" in slug, width=1.02, pid=pid)
    if cat == "faneela":
        sleeve = "none" if "sleeveless" in slug else "short"
        return defs, robe(fill, view, hem=640, sleeve=sleeve, collar="round", width=0.9 if "fitted" in slug else 0.98, pid=pid)
    if cat == "kandura-jackets":
        return defs, jacket(fill, view, "open" if "open" in slug else "closed", pid=pid)
    if cat == "saderi":
        pat = None
        if "fine-weave" in slug:
            defs += weave_pattern(f"{pid}-wv", fill, shade(fill, 0.4), 8)
            pat = f"{pid}-wv"
        return defs, saderi(fill, view, pat, pid=pid)
    if cat == "bisht":
        return defs, bisht(fill, view, pid=pid)
    if cat == "shawls":
        paint = fill
        if "check" in slug:
            defs += grid_pattern(f"{pid}-gr", fill, shade(fill, 0.45))
            paint = f"url(#{pid}-gr)"
        if view == "side":
            return defs, folded(fill, paint, layers=3)
        return defs, drape(fill, paint, view, fringe=True)
    if cat == "wuzar":
        border = BRASS if "border" in slug else shade(fill, -0.25)
        defs += weave_pattern(f"{pid}-wv", fill, shade(fill, -0.3), 9)
        paint = f"url(#{pid}-wv)" if "woven" in slug else fill
        if view == "front":
            return defs, folded(fill, paint, border=border)
        if view == "side":
            return defs, folded(fill, paint, border=border, layers=3)
        return defs, drape(fill, paint, "front", fringe=False, border=border)
    if cat == "trunks-salwar":
        return defs, trousers(fill, view, short="trunk" in slug)
    if cat in ("shimagh-ghutra", "ghutra", "yashmagh", "kids-headwear"):
        if p["colour"] in ("Red and White", "Black and White"):
            ink = COLOURS[p["colour"]]
            size = 18 if ("fine" in slug or kid) else 26
            defs += check_pattern(f"{pid}-ck", "#fbf8f1", ink, size, rotate=45 if "patterned" in slug else 0)
            paint, base = f"url(#{pid}-ck)", "#fbf8f1"
        else:
            defs += weave_pattern(f"{pid}-wv", fill, "#d8cdb5", 7)
            paint, base = f"url(#{pid}-wv)", fill
        body = headcloth(base, paint, view, fringe=cat != "ghutra" and "ghutra" not in slug,
                         embroidered="embroidered" in slug)
        return defs, g(body, 80, 120, 0.8) if kid else body
    if cat == "egal":
        return defs, egal(fill, view, slim="slim" in slug, tassels="tassel" in slug)
    if cat == "tarboosh":
        return defs, tarboosh(fill, view, length=1.35 if "long" in slug else 1.0, bead="scented" in slug, twist="twist" in slug)
    if cat == "kufi-caps":
        tex = "mesh" if "mesh" in slug else "stitched" if "stitched" in slug else "knit"
        defs += dot_pattern(f"{pid}-tex", fill, shade(fill, -0.5))
        return defs, kufi(fill, view, tex, pid=pid)
    if cat in ("arabic-sandals", "kids-footwear"):
        style = "double" if "double" in slug else "stitched" if "stitched" in slug else "classic"
        if "strap" in slug and "double" not in slug:
            style = "double"
        return defs, sandals(fill, view, style, kid)
    if cat == "perfumes":
        return defs + perfume_defs(fill, pid), perfume(fill, view, pid)
    if cat == "wallets":
        style = "card" if "card" in slug else "zip" if "zip" in slug else "bifold"
        return defs, wallet(fill, view, style)
    if cat == "gift-card":
        return defs, gift_card(fill, view)
    raise ValueError(f"no drawing for {slug} ({cat})")


HANGING = {"kandura-thobes", "adult-thobes", "traditional-kandura", "summer-thobes", "kids-clothing",
           "jalabiya", "arabian-casuals", "faneela", "kandura-jackets", "saderi", "bisht", "trunks-salwar"}

TILE_TONES = [("#f4ede1", "#e3d4bd"), ("#f2ebdf", "#dfcfb6"), ("#f5efe5", "#e6d9c4"), ("#f1e9dc", "#ddcbb0")]


def rail_scene(items, w, h, rail_y, scale, spacing, cx=None, rail=True, pid="r"):
    """Hang several garments from a brass rail."""
    cx = w / 2 if cx is None else cx
    defs, body = [], []
    n = len(items)
    if rail:
        span = spacing * (n - 1) / 2 + 170 * scale
        body.append(f'<path d="M{cx - span - 40:.0f} {rail_y} H{cx + span + 40:.0f}" stroke="{BRASS}" stroke-width="{max(6, 12 * scale):.0f}" stroke-linecap="round"/>')
    for i, (p, view) in enumerate(items):
        d, b = product_art(p, view, f"{pid}{i}")
        defs.append(d)
        x = cx + (i - (n - 1) / 2) * spacing
        kid = p["slug"].startswith(("boys-", "kids-"))
        hook_y = 108 if not kid else 120 + 108 * 0.8
        body.append(g(b, x - 400 * scale, rail_y - hook_y * scale + 4, scale))
    return "".join(defs), "".join(body)


def category_art(cat, by_slug, idx):
    items = [by_slug[s] for s in cat["products"]]
    top, bottom = TILE_TONES[idx % len(TILE_TONES)]
    d0, b0 = studio(800, 1000, top, bottom, "cbg")
    if cat["slug"] in HANGING and len(items) >= 3:
        scale, gap = (0.62, 230) if cat["slug"] == "bisht" else (0.84, 215)
        d, b = rail_scene([(p, "front") for p in items[:3]], 800, 1000, 130, scale, gap)
        return svg(800, 1000, d0 + d, b0 + b + floor_shadow(400, 900, 300, 14, 0.08))
    if len(items) >= 2:
        d1, b1 = product_art(items[1], "front", "c1")
        d2, b2 = product_art(items[0], "front", "c0")
        return svg(800, 1000, d0 + d1 + d2, b0 + g(b1, 210, 40, 0.62) + g(b2, 40, 270, 0.72))
    d, b = product_art(items[0], "front", "c0")
    return svg(800, 1000, d0 + d, b0 + b)


# ---------------------------------------------------------------- scenes
def arches(w, h, n, top, colour, light):
    out = []
    aw = w / n
    for i in range(n):
        x = i * aw + aw * 0.18
        ww = aw * 0.64
        out.append(f'<path d="M{x:.0f} {h} V{top + ww / 2:.0f} A{ww / 2:.0f} {ww / 2:.0f} 0 0 1 {x + ww:.0f} {top + ww / 2:.0f} V{h}Z" fill="{light}"/>')
        out.append(f'<path d="M{x:.0f} {h} V{top + ww / 2:.0f} A{ww / 2:.0f} {ww / 2:.0f} 0 0 1 {x + ww:.0f} {top + ww / 2:.0f} V{h}" fill="none" stroke="{colour}" stroke-width="6"/>')
    return "".join(out)


def hero_adult(by):
    W, H = 1600, 900
    defs = ('<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6d8bd"/><stop offset="1" stop-color="#d7c5a3"/></linearGradient>'
            '<linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6df"/><stop offset="1" stop-color="#f3e2bd"/></linearGradient>')
    body = [f'<rect width="{W}" height="{H}" fill="url(#wall)"/>', arches(W, 760, 4, 150, "#c9b48d", "url(#sun)"),
            f'<rect y="760" width="{W}" height="140" fill="#cdb894"/>',
            f'<path d="M0 760 H{W}" stroke="#b9a37d" stroke-width="4"/>']
    for i in range(5):
        x = 120 + i * 360
        body.append(f'<path d="M{x} 900 L{x + 220} 760 L{x + 330} 760 L{x + 110} 900Z" fill="#a88c60" opacity="0.18"/>')
    d, b = rail_scene([(by["classic-round-collar-kandura-ivory"], "front")], W, H, 150, 0.72, 0, cx=1080, rail=False, pid="h")
    body.append(f'<path d="M1080 150 V120" stroke="{BRASS}" stroke-width="8"/><circle cx="1080" cy="116" r="10" fill="{BRASS}"/>')
    body.append(b)
    body.append(floor_shadow(1080, 840, 160, 14, 0.12))
    return svg(W, H, defs + d, "".join(body))


def hero_kids(by):
    W, H = 1600, 900
    defs = '<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#edf2f6"/><stop offset="1" stop-color="#d6e2eb"/></linearGradient>'
    body = [f'<rect width="{W}" height="{H}" fill="url(#wall)"/>', f'<rect y="720" width="{W}" height="180" fill="#a9bccb"/>',
            f'<path d="M0 720 H{W}" stroke="#8ea4b6" stroke-width="6"/>']
    items = [(by["boys-round-collar-kandura-white"], "front"), (by["boys-stand-collar-thobe-cream"], "front"),
             (by["boys-occasion-kandura-sand"], "front")]
    d, b = rail_scene(items, W, H, 120, 0.92, 260, cx=980, pid="k")
    body.append(b)
    hd = []
    dd, bb = product_art(by["kids-check-shimagh-red-and-white"], "side", "kh")
    hd.append(dd)
    body.append(g(bb, 1240, 220, 0.7))
    return svg(W, H, defs + d + "".join(hd), "".join(body))


def hero_winter(by):
    W, H = 1600, 900
    defs = ('<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c7686"/>'
            '<stop offset="0.55" stop-color="#d4a985"/><stop offset="1" stop-color="#e9c79d"/></linearGradient>')
    body = [f'<rect width="{W}" height="{H}" fill="url(#sky)"/>', '<circle cx="1180" cy="430" r="70" fill="#f6dcb0" opacity="0.9"/>',
            f'<path d="M0 560 Q300 470 620 540 T1200 520 T1600 540 V900 H0Z" fill="#c79a6c"/>',
            f'<path d="M0 650 Q380 560 760 640 T1600 620 V900 H0Z" fill="#b5875a"/>',
            f'<path d="M0 760 Q420 690 880 750 T1600 730 V900 H0Z" fill="#9f7449"/>']
    # garment stand
    shift = 300  # keep the left side clear for the headline
    stand = [f'<path d="M560 130 H1040 M600 130 V860 M1000 130 V860 M560 860 H640 M960 860 H1040" stroke="{BRASS}" stroke-width="12" stroke-linecap="round"/>']
    d1, b1 = rail_scene([(by["tailored-layering-jacket-charcoal"], "front")], W, H, 130, 0.74, 0, cx=720, rail=False, pid="w1")
    d2, b2 = product_art(by["wool-blend-shawl-camel"], "front", "w2")
    stand.append(b1 + g(b2, 880 - 400 * 0.6, 110, 0.6))
    body.append(g("".join(stand), shift, 0, 1))
    return svg(W, H, defs + d1 + d2, "".join(body))


def hero_new(by):
    W, H = 1600, 900
    defs = '<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf0f5"/><stop offset="1" stop-color="#d3dfe9"/></linearGradient>'
    body = [f'<rect width="{W}" height="{H}" fill="url(#wall)"/>', f'<rect y="790" width="{W}" height="110" fill="#bccddb"/>']
    slugs = ["tailored-tasselled-kandura-sand", "formal-cuffed-thobe-olive", "soft-weave-kandura-slate",
             "button-placket-thobe-stone", "heritage-cuff-kandura-taupe"]
    d, b = rail_scene([(by[s], "front") for s in slugs], W, H, 120, 0.66, 200, cx=1060, pid="n")
    body.append(b)
    return svg(W, H, defs + d, "".join(body))


def story():
    W, H = 1200, 900
    rnd = random.Random(7)
    defs = ('<linearGradient id="tbl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9b7550"/><stop offset="1" stop-color="#7b5a3b"/></linearGradient>'
            '<linearGradient id="roll" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ea"/><stop offset="0.6" stop-color="#eee4cf"/><stop offset="1" stop-color="#d6c8aa"/></linearGradient>')
    out = [f'<rect width="{W}" height="{H}" fill="url(#tbl)"/>']
    for _ in range(14):
        y = rnd.randint(0, H)
        out.append(f'<path d="M0 {y} Q600 {y + rnd.randint(-30, 30)} 1200 {y + rnd.randint(-20, 20)}" stroke="#6b4c31" stroke-width="2" opacity="0.25" fill="none"/>')
    # fabric bolt and spread cloth
    out.append('<path d="M120 520 L760 380 L1100 560 L470 760Z" fill="#f3ecdc" stroke="#d7cbb1" stroke-width="3"/>')
    out.append('<path d="M140 530 L740 400" stroke="#e2d6bd" stroke-width="2"/><path d="M470 760 L1100 560" stroke="#e2d6bd" stroke-width="2"/>')
    out.append('<g transform="rotate(-12 420 300)"><rect x="140" y="230" width="560" height="140" rx="70" fill="url(#roll)" stroke="#cdbfa3" stroke-width="2"/>'
                + '<ellipse cx="700" cy="300" rx="36" ry="70" fill="#e8dcc3" stroke="#cdbfa3" stroke-width="2"/>'
               '<ellipse cx="700" cy="300" rx="12" ry="26" fill="#a68b62"/></g>')
    # measuring tape
    tape = "M560 640 C640 560 820 560 860 640 S760 760 700 700 S760 600 820 650"
    out.append(f'<path d="{tape}" fill="none" stroke="#d8b555" stroke-width="30" stroke-linecap="round"/>'
               f'<path d="{tape}" fill="none" stroke="#3b3524" stroke-width="10" stroke-dasharray="2 12" opacity="0.6"/>')
    # scissors
    out.append(f'<g transform="translate(900 300) rotate(30)"><path d="M0 0 L240 -18 L240 -6 Z M0 0 L240 18 L240 6Z" fill="#c9ccd0" stroke="#8f9397" stroke-width="2"/>'
               f'<circle cx="-46" cy="-30" r="32" fill="none" stroke="{INK}" stroke-width="14"/><circle cx="-46" cy="30" r="32" fill="none" stroke="{INK}" stroke-width="14"/>'
               f'<circle cx="0" cy="0" r="7" fill="#8f9397"/></g>')
    # chalk and pins
    out.append(f'<g transform="translate(300 700) rotate(-20)"><path d="M0 0 L90 0 L70 40 L-20 40Z" fill="#eef0f2" stroke="#c3c8cc" stroke-width="2"/></g>')
    out.append(f'<circle cx="1020" cy="760" r="58" fill="#7a2f2c"/><ellipse cx="1020" cy="740" rx="58" ry="30" fill="#93403c"/>')
    for k in range(7):
        a = k * 0.9
        out.append(f'<path d="M{1020 + 30 * (k % 3 - 1)} {735 + 6 * (k % 2)} l{-10 + k * 4} -38" stroke="#b9bcc0" stroke-width="3"/>'
                   f'<circle cx="{1020 + 30 * (k % 3 - 1) - 10 + k * 4}" cy="{697 + 6 * (k % 2)}" r="6" fill="{BRASS if k % 2 else NAVY}"/>')
    return svg(W, H, defs, "".join(out))



# ---------------------------------------------------------------- main
def write(rel, content):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    with open(os.path.join(ROOT, "lib", "data", "products.json"), encoding="utf-8") as f:
        products = json.load(f)
    with open(os.path.join(ROOT, "lib", "data", "categories.json"), encoding="utf-8") as f:
        categories = json.load(f)
    by = {p["slug"]: p for p in products}

    n = 0
    for i, p in enumerate(products):
        top, bottom = TILE_TONES[i % len(TILE_TONES)]
        for view in VIEWS:
            d0, b0 = studio(800, 1000, top, bottom)
            d, b = product_art(p, view)
            write(f"products/{p['slug']}-{view}.svg", svg(800, 1000, d0 + d, b0 + b))
            n += 1
    for i, c in enumerate(categories):
        write(f"categories/{c['slug']}.svg", category_art(c, by, i))
        n += 1
    write("hero/hero-adult.svg", hero_adult(by))
    write("hero/hero-kids.svg", hero_kids(by))
    write("hero/hero-winter.svg", hero_winter(by))
    write("hero/hero-new.svg", hero_new(by))
    write("content/story.svg", story())
    print(f"wrote {n + 5} illustrations to {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
