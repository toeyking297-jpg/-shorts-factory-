"""Asset catalogue: what images the show needs, their canvas spec, prompts, and where they come from.

Real art goes in cartoon/assets/<kind>/<ID>.png (same canvas size as the spec). Anything missing is
filled from cartoon/assets/_placeholder/ and marked PLACEHOLDER, which blocks a final export.
"""
from __future__ import annotations

from PIL import Image

from .common import ASSETS, BIBLE, PLACEHOLDER, STAGE_W, STAGE_H, load, save
from . import placeholder as ph

FULL_H = 1600          # full-body pose canvas = 1440 x 1664, feet at y=1600
BUST_H = 1900          # bust = character drawn at 1900, cropped to 1188 x 1500 with headroom
BUST_TOP = 110         # transparent headroom above the head so hair/cowlick never gets clipped
BUST = (1188, 1500)

# id: (character, expression, pose, facing, kind, rest_mouth)
POSES = {
    "C01_full_neutral": ("C01", "neutral_deadpan", "neutral", 1, "full", "rest"),
    "C01_full_gesture": ("C01", "tiny_smile", "gesture", 1, "full", "smile"),
    "C01_bust_deadpan": ("C01", "neutral_deadpan", "neutral", 1, "bust", "rest"),
    "C01_bust_smile": ("C01", "tiny_smile", "gesture", 1, "bust", "smile"),
    "C02_full_bossy": ("C02", "bossy", "bossy", -1, "full", "rest"),
    "C02_full_ticket": ("C02", "impatient", "ticket", -1, "full", "rest"),
    "C02_full_sheepish": ("C02", "sheepish", "sheepish", -1, "full", "rest"),
    "C02_full_shocked": ("C02", "shocked", "shocked", 1, "full", "round"),
    "C02_bust_smug": ("C02", "smug", "bossy", -1, "bust", "rest"),
    "C02_bust_proud": ("C02", "proud", "bossy", -1, "bust", "rest"),
    "C02_bust_shocked": ("C02", "shocked", "shocked", -1, "bust", "round"),
    "C03_full_cheerful": ("C03", "cheerful", "cheerful", -1, "full", "smile"),
    "C03_bust_cheerful": ("C03", "cheerful", "cheerful", -1, "bust", "smile"),
    "C03_bust_bags": ("C03", "cheerful", "bags", -1, "bust", "smile"),
}
MOUTHS = ["rest", "open", "wide", "round", "smile"]
BACKGROUNDS = ["BG01", "BG01_FG", "BG01M", "BG01M_FG", "BG02", "BG03", "INS01"]
PROPS = ["PROP_TICKET", "HAND_C02", "PROP_BAGS_WIDE"]

KIND_DIR = {"pose": "characters", "mouth": "mouths", "bg": "backgrounds", "prop": "props"}


def _pose_img(pid, blink=False):
    cid, expr, pose, facing, kind, _ = POSES[pid]
    if kind == "full":
        img, anc, sc = ph.draw_character(cid, expr, pose, FULL_H, facing, blink)
        return img, anc, sc
    img, anc, sc = ph.draw_character(cid, expr, pose, BUST_H, facing, blink)
    hx = int((0.45 + 0.012 * facing) * BUST_H)
    x0 = hx - BUST[0] // 2
    img = img.crop((x0, -BUST_TOP, x0 + BUST[0], BUST[1] - BUST_TOP))
    return img, (anc[0] - x0, anc[1] + BUST_TOP), sc


def catalogue() -> dict:
    """All asset ids -> spec (no drawing)."""
    cat = {}
    for pid, (cid, expr, pose, facing, kind, rest) in POSES.items():
        size = (int(0.9 * FULL_H), int(1.04 * FULL_H)) if kind == "full" else BUST
        for blink in (False, True):
            aid = pid + ("_blink" if blink else "")
            cat[aid] = dict(kind="pose", character_id=cid, expression=expr, pose=pose, facing=facing,
                            framing=kind, size=list(size), rest_mouth=rest, blink=blink)
    for cid in ("C01", "C02", "C03"):
        for m in MOUTHS:
            cat[f"{cid}_mouth_{m}"] = dict(kind="mouth", character_id=cid, shape=m, size=list(ph.MOUTH_CANVAS),
                                           reference_height=1000)
    for b in BACKGROUNDS:
        cat[b] = dict(kind="bg", size=[STAGE_W, STAGE_H], transparent=b.endswith("_FG"))
    for p in PROPS:
        cat[p] = dict(kind="prop")
    return cat


def real_path(aid, spec):
    return ASSETS / KIND_DIR[spec["kind"]] / f"{aid}.png"


def build(force=False) -> dict:
    """Draw placeholders (cached) and write assets/manifest.json with the source of every asset."""
    cat = catalogue()
    anchors_override = load(ASSETS / "anchors_override.json") if (ASSETS / "anchors_override.json").exists() else {}
    man = {}
    for aid, spec in cat.items():
        php = PLACEHOLDER / KIND_DIR[spec["kind"]] / f"{aid}.png"
        php.parent.mkdir(parents=True, exist_ok=True)
        rec = dict(spec)
        if spec["kind"] == "pose":
            base = aid.replace("_blink", "")
            if force or not php.exists():
                img, anc, sc = _pose_img(base, spec["blink"])
                img.save(php)
            _, anc, sc = (None, *_anchor_cache(base))
            rec["mouth_anchor"] = anchors_override.get(aid, {}).get("mouth_anchor", list(anc))
            rec["mouth_scale"] = anchors_override.get(aid, {}).get("mouth_scale", sc)
        elif force or not php.exists():
            if spec["kind"] == "mouth":
                ph.draw_mouth(spec["character_id"], spec["shape"]).save(php)
            elif spec["kind"] == "bg":
                ph.background(aid).save(php)
            else:
                ph.prop(aid).save(php)
        if spec["kind"] == "prop":
            rec["size"] = list(Image.open(php).size)
        rp = real_path(aid, spec)
        rec["placeholder"] = str(php.relative_to(ASSETS))
        rec["real"] = str(rp.relative_to(ASSETS))
        rec["status"] = "READY" if rp.exists() else "PLACEHOLDER"
        man[aid] = rec
    save(ASSETS / "manifest.json", man)
    return man


_AC = {}


def _anchor_cache(base):
    """Mouth anchor + scale are pure geometry; compute once without keeping the image."""
    if base not in _AC:
        cid, expr, pose, facing, kind, _ = POSES[base]
        H = FULL_H if kind == "full" else BUST_H
        fx = 0.45 + 0.012 * facing + 0.035 * facing
        anc = (int(fx * H), int((0.215 + 0.095) * H))
        if kind == "bust":
            hx = int((0.45 + 0.012 * facing) * BUST_H)
            anc = (anc[0] - (hx - BUST[0] // 2), anc[1] + BUST_TOP)
        _AC[base] = (anc, H / 1000.0)
    return _AC[base]


def open_asset(man: dict, aid: str) -> tuple[Image.Image, str]:
    rec = man[aid]
    rp = ASSETS / rec["real"]
    if rp.exists():
        return Image.open(rp).convert("RGBA"), "READY"
    return Image.open(ASSETS / rec["placeholder"]).convert("RGBA"), "PLACEHOLDER"


# ------------------------------------------------------------------ prompts
def prompts() -> list[dict]:
    """One English prompt per image. Characters/mouths/backgrounds/props are separate requests."""
    b = load(BIBLE / "character_bible.json")
    sc = load(BIBLE / "scene_bible.json")
    style = b["style_prompt"]
    chars = {c["character_id"]: c for c in b["characters"]}

    en_look = {
        "C01": "Thai office guy, late 20s, wide bean-shaped head, half-closed sleepy deadpan eyes, thick straight brows, "
               "big round black glasses, short messy black hair with one cowlick, mustard-yellow hoodie (#E3A21A) with "
               "cream drawstrings and kangaroo pocket, grey slacks (#7A7F87), white sneakers, a stack of five folded "
               "silver insulated food-delivery bags (#C9CED6) hanging from his right shoulder.",
        "C02": "Thai auntie, mid 50s, round face with puffy cheeks, high arched expressive brows, short curly permed "
               "reddish-brown hair (#8B3A2B), coral-red blouse (#D6453D) with small white flower print, thick gold "
               "chain necklace, navy wide trousers (#2B2F4A), brown leather sandals, always holds a coral folding fan "
               "(#F28C6B) in her left hand. Slightly shorter and rounder than the office guy.",
        "C03": "Thai food-stall staff girl, early 20s, small oval face, big dot eyes, black bob haircut with straight "
               "bangs, small silver hoop earrings, white T-shirt, teal apron (#2A9D8F) with a cream front pocket, dark "
               "grey trousers.",
    }
    expr_en = {
        "neutral_deadpan": "deadpan, half-closed eyes, completely calm", "tiny_smile": "calm with a tiny polite smile",
        "bossy": "bossy and loud, brows angled down", "smug": "smug, one brow raised, eyes half-closed",
        "proud": "proud, chin up, eyes closed in self-satisfaction", "impatient": "impatient, brows down, palm up",
        "shocked": "shocked, eyes wide open, brows high", "sheepish": "sheepish and embarrassed, brows tilted up",
        "cheerful": "cheerful customer-service smile, happy closed eyes",
    }
    pose_en = {
        "neutral": "standing, arms relaxed at sides, three-quarter view",
        "gesture": "open right palm gesturing politely toward screen-right, three-quarter view",
        "bossy": "fanning herself with the fan raised near her face, other hand on hip",
        "ticket": "holding a small cream queue ticket up high in her right hand, fan in left hand",
        "sheepish": "holding the small cream queue ticket out toward screen-left with two fingers, fan in left hand",
        "shocked": "both hands up near her chest, ticket in one hand, fan in the other",
        "cheerful": "waving one hand at shoulder height",
        "bags": "lifting a big stack of white take-away bags with boxed rice in both hands",
    }
    out = []
    for cid in ("C01", "C02", "C03"):
        out.append(dict(asset_id=f"REF_{cid}_turnaround", type="character_reference", size="1536x1024",
                        refs=[], status="WAITING_FOR_ASSET",
                        prompt=f"{style}\nCharacter turnaround sheet on a plain flat cream background: the SAME single "
                               f"character shown 3 times side by side - front view, side view, full-body three-quarter "
                               f"view - neutral pose, identical design in all three. {en_look[cid]} No mouth variations.",
                        use="reference image for every other request of this character"))
        out.append(dict(asset_id=f"REF_{cid}_expressions", type="character_reference", size="1536x1024",
                        refs=[f"REF_{cid}_turnaround"], status="WAITING_FOR_ASSET",
                        prompt=f"{style}\nExpression sheet, head and shoulders only, plain cream background, 5 heads in "
                               f"a row of the SAME character as the reference image: neutral, smiling, confused, "
                               f"annoyed, shocked. {en_look[cid]}",
                        use="expression reference"))
    cat = catalogue()
    for aid, s in cat.items():
        if s["kind"] == "pose":
            cid = s["character_id"]
            fr = ("full body, feet visible near the bottom edge, centred" if s["framing"] == "full"
                  else "head and upper chest close-up, head fills the upper 75% of the frame")
            eyes = " EYES CLOSED (blink frame), everything else identical to the open-eye version." if s["blink"] else ""
            facing = "facing screen-right" if s["facing"] > 0 else "facing screen-left"
            out.append(dict(asset_id=aid, type="character_pose", size=f"{s['size'][0]}x{s['size'][1]}",
                            refs=[f"REF_{cid}_turnaround", f"REF_{cid}_expressions"] +
                                 ([aid.replace('_blink', '')] if s["blink"] else []),
                            status="WAITING_FOR_ASSET",
                            prompt=f"{style}\nSingle character on a fully TRANSPARENT background (PNG with alpha), {fr}, "
                                   f"{facing}. Same character as the reference images. {en_look[cid]} Expression: "
                                   f"{expr_en[s['expression']]}. Pose: {pose_en[s['pose']]}. Draw the face WITHOUT a "
                                   f"mouth (the mouth is a separate sprite added in editing), leave smooth skin where "
                                   f"the mouth would be.{eyes} No other characters, no background, no text.",
                            mouth_anchor_note="after import, check mouth_anchor in assets/manifest.json "
                                              "(edit assets/anchors_override.json if the face moved)"))
        elif s["kind"] == "mouth":
            shape_en = {"rest": "closed mouth, a short gentle curved line", "open": "slightly open mouth, small dark oval with a hint of tongue",
                        "wide": "wide open mouth, top teeth visible, tongue", "round": "small round 'O' mouth",
                        "smile": "closed small smile"}[s["shape"]]
            out.append(dict(asset_id=aid, type="mouth_sprite", size="170x110 (or 4x that, same aspect)",
                            refs=[f"REF_{s['character_id']}_expressions"], status="WAITING_FOR_ASSET",
                            prompt=f"{style}\nA single cartoon MOUTH only, centred, on a fully transparent background, "
                                   f"for the character in the reference: {shape_en}. Same line weight and colours as the "
                                   f"character. Nothing else in the image."))
        elif s["kind"] == "bg":
            desc = {
                "BG01": "Wide straight-on eye-level view of a small Thai chicken-rice shophouse in late morning: striped "
                        "cream/teal canvas awning at the top, half-open steel rolling shutter in the middle with steel "
                        "tables inside, a BLANK wooden menu board on the left wall, a potted plant at the far left, a "
                        "stainless food cart with a glass case, a steamer pot and boiled chickens hanging on a rail on "
                        "the right, pavement in the lower 20%.",
                "BG01_FG": "ONLY the stainless food cart/counter from the wide shop view (right 40% of the frame, "
                           "occupying the lower middle), everything else fully transparent - it is a foreground layer "
                           "that hides the staff girl's legs.",
                "BG01M": "The same shophouse as BG01 but a tighter medium framing centred slightly left of the door: "
                         "shutter, part of the menu board and the left edge of the food cart.",
                "BG01M_FG": "ONLY the food-cart edge of the BG01M framing, everything else transparent.",
                "BG02": "Close background seen from the customer side: stainless steamer pot, boiled chickens hanging "
                        "on a rail, white wall tiles, soft background blur.",
                "BG03": "Close background seen from the counter looking back at the queue: cream shop wall, the edge "
                        "of the blank wooden menu board, a potted plant, pavement, soft background blur.",
                "INS01": "Close-up insert: the office guy's hand (mustard hoodie sleeve) coming from the lower left, "
                         "fingers pinching nothing yet (a ticket layer is added in edit), blurred pavement behind.",
            }[aid]
            out.append(dict(asset_id=aid, type="background", size=f"{STAGE_W}x{STAGE_H} (9:16)",
                            refs=["BG01"] if aid != "BG01" else [], status="WAITING_FOR_ASSET",
                            prompt=f"{style}\nVertical 9:16 background plate, NO characters, NO people. {desc} "
                                   f"Location lock: {sc['name']}. No readable text, no signs with letters, no logo."))
        else:
            desc = {"PROP_TICKET": "a small cream paper queue ticket with NO number printed (number is added in edit), "
                                   "a long white order slip stapled under it",
                    "HAND_C02": "the auntie's hand reaching in from the right, coral-red floral sleeve, grabbing pose",
                    "PROP_BAGS_WIDE": "a pile of about 50 white take-away bags with boxed rice, as a stack sized to sit "
                                      "on the counter in the wide shot"}[aid]
            out.append(dict(asset_id=aid, type="prop", size="see assets/manifest.json", refs=[],
                            status="WAITING_FOR_ASSET",
                            prompt=f"{style}\nSingle prop on a fully transparent background: {desc}. No text."))
    for r in out:
        spec = cat.get(r["asset_id"])
        if spec and real_path(r["asset_id"], spec).exists():
            r["status"] = "READY"
    return out
