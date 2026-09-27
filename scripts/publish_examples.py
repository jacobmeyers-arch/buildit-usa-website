#!/usr/bin/env python3
"""
publish_examples.py — build the one-page example reports served at /examples/.

WHAT THIS IS
    Jacob asked the site to show what the Build It USA estimating skill produces.
    The full v3 estimates are 20+ pages and land like a legal document on someone
    who is just curious. This script renders the BASIC report from the same
    source: one page, five questions answered.

        1. What is this project
        2. What it costs — materials vs labor vs reserve
        3. How it goes, in order
        4. How long it takes
        5. What we'd have to pin down to tighten the number

    Every figure is COMPUTED from the v3 estimate's embedded `estimate-data`
    JSON block — the same block `estimate_lint.py` recomputes and the same one
    /projects publishes from. Nothing here is typed by hand, so the one-pager
    cannot drift from the full estimate or from the site. (Repo CLAUDE.md:
    "Published Numbers Are Sourced, Never Typed.")

SOURCE DOCUMENTS
    The two EXECUTED projects — the same jobs the /projects case studies take
    from estimate to finished work, so a visitor can read the estimate here and
    the plan-vs-actual there. They are Jacob's own property, so before they can
    be served publicly the street address and phone number come out; the script
    asserts neither survives rather than trusting the substitution.

USAGE
    python3 scripts/publish_examples.py
    (writes into public/examples/, overwriting)

Created: 2026-09-27
Rewritten: 2026-09-27 — was a redact-and-copy of the full 20-page estimates.
    Jacob's call: show the basic report, keep it simple for a curious visitor.
"""
import html
import json
import re
from pathlib import Path

SRC = Path("/mnt/chromeos/MyFiles/ClaudeCode/AI Projects/Build It USA/Clients/"
           "Homeowners/250-Hop-City-Rd_Meyers/20260612_v3-Reissue")
DEST = Path(__file__).resolve().parent.parent / "public" / "examples"

# (source subfolder, published filename, plain-language project name, one-line "what this is")
REPORTS = [
    ("07_Pig-Barn-Demo", "pig-barn-estimate.html", "Pig barn teardown",
     "A leaning ~300 SF outbuilding comes down and goes away. There is no machine access, so "
     "everything gets carried 80 yards by hand to the dumpster — which is what drives the price."),
    ("06_Garage-Siding-Doors-Trim", "garage-exterior-estimate.html", "Garage exterior",
     "A 1940s detached garage gets its failing siding and trim replaced, the bay openings "
     "reframed for new doors, and all four faces scraped, primed and painted."),
]

# Facts the site does not publish. Ordered most-specific first so the phone number
# is always replaced in context rather than left as a bare orphan.
REDACTIONS = [
    ("250 Hop City Road, Ballston Spa, NY 12020", "Capital District, New York"),
    ("518.928.9130", "jacob.meyers@buildit-usa.com"),
]
FORBIDDEN = ["518.928.9130", "5189289130", "250 Hop City", "Hop City"]

# Work sections, in the order a job actually runs. Anything not listed here
# (permits, allowances) is a cost line, not a phase, and stays out of the
# sequence — it would read as a step you perform, which it isn't.
PHASE_LABELS = {
    "general-conditions": "Set up and protect the site",
    "demolition": "Demolition and tear-out",
    "framing": "Framing",
    "siding": "Siding",
    "finish-carpentry": "Trim and doors",
    "painting": "Prep and paint",
}
NON_PHASE = {"permits", "allowances"}


def parse_estimate(path):
    """Pull the machine-readable block, the duration, and the open items out of a v3 report."""
    raw = path.read_text(encoding="utf-8")

    block = re.search(r'id="estimate-data">(.*?)</script>', raw, re.S)
    data = json.loads(block.group(1))

    duration = re.search(r"Est\. Duration</th><td>(.*?)</td>", raw)
    data["duration"] = html.unescape(re.sub(r"<[^>]+>", "", duration.group(1))).strip()

    data["open_items"] = parse_action_items(raw)
    return data


def parse_action_items(raw):
    """
    The full report's "Action Items to Lock Price" table IS the list of clarifying
    questions — each row is something the tool could not resolve from photos and a
    walkthrough. Returns [(area, what it needs), ...].
    """
    start = raw.find("Action Items to Lock Price")
    table = re.search(r"<tbody.*?</tbody>", raw[start:], re.S)
    if not table:
        return []

    items = []
    for row in re.findall(r"<tr.*?</tr>", table.group(0), re.S):
        cells = [
            html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", c))).strip()
            for c in re.findall(r"<td.*?</td>", row, re.S)
        ]
        # Layout: #, Area, Current, Action Required, Target, Scope Risk
        if len(cells) < 4:
            continue
        items.append((cells[1], first_sentence(cells[3])))
    return items


def first_sentence(text, limit=82):
    """
    The basic report states the question, not the method — so take the first
    sentence. Splitting on any period truncated "raised panel vs. carriage" at
    "vs."; require a capital letter after the break and exclude the abbreviations
    that actually occur in these documents. Long survivors are cut at a word
    boundary rather than mid-word.
    """
    parts = re.split(r"(?<!\bvs)(?<!\betc)(?<!\bapprox)(?<!\bNo)(?<!\bMr)\.\s+(?=[A-Z])", text)
    out = parts[0].strip().rstrip(".")
    if len(out) > limit:
        out = out[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "\u2026"
    return out


def summarize(data):
    """Everything the one-pager prints, computed from `lines` upward. Never typed."""
    lines = data["lines"]

    labor = sum(l["man_hours"] * l["rate"] for l in lines)
    materials = sum(l["material"] for l in lines)
    soft = sum(s["amount"] for s in data.get("soft_costs", []))
    hours = sum(l["man_hours"] for l in lines)

    # The full estimate's own total is the check: if our sum disagrees, the source
    # changed shape and the page would otherwise publish a wrong number silently.
    assert labor + materials == data["direct_total"], (
        f"labor+materials ({labor + materials}) != direct_total ({data['direct_total']})"
    )

    # Phases in the order the lines appear — that order IS the sequence of operations.
    phases, seen = [], {}
    for l in lines:
        sec = l["section"]
        if sec in NON_PHASE:
            continue
        if sec not in seen:
            seen[sec] = len(phases)
            phases.append({"label": PHASE_LABELS.get(sec, sec.title()), "hours": 0,
                           "steps": [], "extra": 0})
        p = phases[seen[sec]]
        p["hours"] += l["man_hours"]
        # The bit before the em dash is the step; the rest is method detail.
        # Two examples is enough to show what a phase contains; the full line
        # list is what the advanced report is for, and on the garage it was the
        # single biggest reason the page overflowed.
        if len(p["steps"]) < 2:
            p["steps"].append(re.split(r"\s+—\s+", l["desc"])[0])
        else:
            p["extra"] = p.get("extra", 0) + 1

    cost = data["direct_total"] + soft
    midpoint = data["midpoint"]
    return {"labor": labor, "materials": materials, "soft": soft, "hours": hours,
            "direct": data["direct_total"], "cost": cost,
            # Printing the markup explicitly is what makes the column foot to the
            # headline range. Without it, "cost of the work" sits next to the range
            # looking like a competing number — and on a Simple job at 60% it can
            # land exactly on range_low by coincidence (1.25 x 0.8 = 1.0), which
            # reads as a bug. Deriving it as midpoint - cost keeps it exact.
            "margin": midpoint - cost, "midpoint": midpoint, "phases": phases}


def money(n):
    return f"${n:,.0f}"


def render(data, title, blurb):
    s = summarize(data)
    esc = html.escape

    phase_rows = "\n".join(
        f"""        <tr>
          <td class="step-n">{i + 1}</td>
          <td class="step-label">{esc(p['label'])}<div class="step-detail">{esc(', '.join(p['steps']))}{f" + {p['extra']} more" if p.get('extra') else ''}</div></td>
          <td class="step-hrs">{p['hours']} hrs</td>
        </tr>"""
        for i, p in enumerate(s["phases"])
    )

    question_rows = "\n".join(
        f"""        <tr><td class="q-area">{esc(area)}</td><td>{esc(what)}</td></tr>"""
        for area, what in data["open_items"]
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build It USA — {esc(title)} Estimate</title>
  <!--
    GENERATED — do not hand-edit. Re-run scripts/publish_examples.py.
    Every figure computes from the v3 estimate's embedded estimate-data block.
  -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Caveat:wght@700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{ --black:#1A1A1A; --dark:#333; --mid:#777; --light:#F2F2F2; --border:#CCC; }}
    body {{ font-family:'Libre Baskerville',Georgia,serif; font-size:11.5px; color:var(--dark);
           background:#C0C0C0; line-height:1.4; -webkit-font-smoothing:antialiased; }}
    .page {{ max-width:8.5in; margin:20px auto; background:#fff; padding:0.32in 0.48in;
            box-shadow:0 4px 24px rgba(0,0,0,.15); }}
    h1 {{ font-family:'Architects Daughter',cursive; font-size:24px; color:var(--black);
         letter-spacing:1.5px; text-align:center; font-weight:400; }}
    .sub {{ text-align:center; font-size:12px; font-style:italic; color:var(--mid); margin-top:2px; }}
    .meta {{ font-size:11px; color:var(--mid); text-align:center; margin-top:4px; }}
    .hr {{ height:2px; background:var(--black); margin:9px 0; }}
    h2 {{ font-family:'Architects Daughter',cursive; font-size:14px; color:var(--black);
         font-weight:400; margin-bottom:3px; letter-spacing:.3px; }}
    .blurb {{ margin:7px 0 10px; font-size:12px; line-height:1.5; }}

    .hero {{ text-align:center; background:var(--light); padding:8px 10px; margin-bottom:11px;
            border-top:2px solid var(--black); border-bottom:2px solid var(--black); }}
    .hero-range {{ font-family:'Caveat',cursive; font-weight:700; font-size:33px;
                  color:var(--black); line-height:1.05; }}
    .hero-label {{ font-size:11px; color:var(--dark); margin-top:3px; }}
    .hero-note {{ font-size:10.5px; color:var(--mid); font-style:italic; margin-top:5px; }}

    .cols {{ display:flex; gap:22px; }}
    .col {{ flex:1; min-width:0; }}
    table {{ width:100%; border-collapse:collapse; margin-top:4px; }}
    td {{ padding:2.6px 5px; border-bottom:1px solid var(--border); vertical-align:top; font-size:11px; }}
    tr:last-child td {{ border-bottom:none; }}
    .amt {{ font-family:'Caveat',cursive; font-weight:700; font-size:15px; color:var(--black);
           text-align:right; white-space:nowrap; }}
    .col td:first-child {{ white-space:nowrap; }}
    .dur .amt {{ font-size:13px; white-space:normal; }}
    .tot td {{ border-top:2px solid var(--black); border-bottom:none; font-weight:700; color:var(--black); }}
    .step-n {{ font-family:'Caveat',cursive; font-weight:700; font-size:16px; color:var(--black);
              width:20px; text-align:center; }}
    .step-label {{ color:var(--black); }}
    .step-detail {{ font-size:10px; color:var(--mid); line-height:1.3; margin-top:0; }}
    .step-hrs {{ text-align:right; white-space:nowrap; font-size:11px; color:var(--dark); }}
    .q-area {{ color:var(--black); font-weight:700; width:26%; }}
    .block {{ margin-top:9px; }}
    .note {{ font-size:10px; color:var(--mid); font-style:italic; margin-top:4px; line-height:1.4; }}
    .foot {{ margin-top:11px; padding-top:7px; border-top:2px solid var(--black);
            text-align:center; font-size:10.5px; color:var(--mid); line-height:1.6; }}
    .foot-brand {{ font-family:'Architects Daughter',cursive; font-size:14px; color:var(--black); }}
    @media print {{ body {{ background:#fff; }} .page {{ box-shadow:none; margin:0; }} @page {{ margin:.4in; }} }}
    @media (max-width:640px) {{ .cols {{ display:block; }} .col + .col {{ margin-top:13px; }}
      .page {{ padding:.3in .28in; }} .hero-range {{ font-size:29px; }} }}
  </style>
</head>
<body>
  <div class="page">
    <h1>Build It USA</h1>
    <div class="sub">{esc(title)} — Project Estimate</div>
    <div class="meta">Capital District, New York &middot; {data['tier']} project &middot; {data['confidence_pct']}% confidence</div>
    <div class="hr"></div>

    <p class="blurb">{esc(blurb)}</p>

    <div class="hero">
      <div class="hero-range">{money(data['range_low'])} &ndash; {money(data['range_high'])}</div>
      <div class="hero-label">to have it done for you, coordinating the trades yourself</div>
      <div class="hero-note">A feasibility range, not a bid. It is this wide because confidence is
        {data['confidence_pct']}% &mdash; the questions at the bottom are what narrow it.</div>
    </div>

    <div class="cols">
      <div class="col">
        <h2>Where the money goes</h2>
        <table>
          <tr><td>Labor &mdash; {s['hours']} hours of work</td><td class="amt">{money(s['labor'])}</td></tr>
          <tr><td>Materials and allowances</td><td class="amt">{money(s['materials'])}</td></tr>
          <tr><td>Disposal and reserve for surprises</td><td class="amt">{money(s['soft'])}</td></tr>
          <tr><td><b>What the work costs</b></td><td class="amt">{money(s['cost'])}</td></tr>
          <tr><td>Contractor overhead and margin ({data['multiplier']}&times;)</td><td class="amt">{money(s['margin'])}</td></tr>
          <tr class="tot"><td>Typical price</td><td class="amt">{money(s['midpoint'])}</td></tr>
        </table>

      </div>
      <div class="col">
        <h2>How long</h2>
        <table class="dur">
          <tr><td>On site</td><td class="amt">{esc(data['duration'])}</td></tr>
          <tr><td>Total labor</td><td class="amt">{s['hours']} hrs</td></tr>
          <tr><td>Phases</td><td class="amt">{len(s['phases'])}</td></tr>
        </table>
        <p class="note">Working days, not calendar days &mdash; weather, inspections and material
          lead times sit on top.</p>
      </div>
    </div>

    <div class="block">
      <h2>How it goes, in order</h2>
      <table>
{phase_rows}
      </table>
    </div>

    <div class="block">
      <h2>What we'd need to pin down</h2>
      <table>
{question_rows}
      </table>
      <p class="note">Each one answered raises confidence and narrows the range. Until they are,
        they are carried as a reserve or left out and named &mdash; never buried in the number.</p>
    </div>

    <div class="foot">
      <div class="foot-brand">Build It USA</div>
      jacob.meyers@buildit-usa.com &middot; Fully Insured &middot; New York State<br>
      Pricing model v3 &middot; Not a bid or a guarantee. Do not make financial commitments on an
      estimate alone.
    </div>
  </div>
</body>
</html>
"""


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    for folder, out_name, title, blurb in REPORTS:
        data = parse_estimate(SRC / folder / "Build_It_USA_Estimate_v3.html")
        page = render(data, title, blurb)

        for old, new in REDACTIONS:
            page = page.replace(old, new)
        leftover = [t for t in FORBIDDEN if t in page]
        if leftover:
            raise SystemExit(f"REDACTION FAILED in {out_name}: {leftover}")

        (DEST / out_name).write_text(page, encoding="utf-8")
        print(f"published {out_name}  ({len(page):,} bytes, "
              f"{len(data['open_items'])} open items, "
              f"${data['range_low']:,}-${data['range_high']:,})")
    print("all published clean")


if __name__ == "__main__":
    main()
