#!/usr/bin/env python3
"""
publish_examples.py — publish two v3 estimate reports as public site examples.

Purpose: Jacob asked the site to show example reports produced by the Build It USA
estimating skill. The source documents are his OWN property's estimates (250 Hop
City Rd). Before they can be served publicly, two facts the site deliberately does
not publish must be removed: the street address and the phone number (which Jacob
is removing from the site entirely in this same change).

Usage:  python3 publish_examples.py
Created: 2026-09-27
"""
from pathlib import Path

SRC = Path("/mnt/chromeos/MyFiles/ClaudeCode/AI Projects/Build It USA/Clients/"
           "Homeowners/250-Hop-City-Rd_Meyers/20260612_v3-Reissue")
DEST = Path.home() / "buildit-usa" / "public" / "examples"

# (source subfolder, published filename)
#
# These two are deliberately the two EXECUTED projects — the same jobs the
# /projects case studies take from estimate to finished work. A visitor can read
# the estimate and the plan-vs-actual for one job. (Swapped 2026-09-27: the
# downstairs bathroom was published first but was never built, so it proved
# nothing the built jobs don't prove better.)
REPORTS = [
    ("07_Pig-Barn-Demo", "pig-barn-estimate.html"),
    ("06_Garage-Siding-Doors-Trim", "garage-exterior-estimate.html"),
]

# Exact-string redactions. Ordered most-specific first so the phone number is
# always replaced in context, never left as a bare orphan.
REDACTIONS = [
    ("250 Hop City Road, Ballston Spa, NY 12020", "Capital District, New York"),
    ('<tr><th>Contact</th><td style="font-weight: 700;">518.928.9130 &mdash; Jacob Meyers</td></tr>',
     '<tr><th>Contact</th><td style="font-weight: 700;">jacob.meyers@buildit-usa.com</td></tr>'),
    ("call Jacob at <strong>518.928.9130</strong> to schedule",
     "email <strong>jacob.meyers@buildit-usa.com</strong> to schedule"),
    ('<div class="footer-details">518.928.9130<span class="footer-sep">&middot;</span>'
     'jacob.meyers@buildit-usa.com</div>',
     '<div class="footer-details">jacob.meyers@buildit-usa.com</div>'),
]

# Anything matching these must not survive into a published file.
FORBIDDEN = ["518.928.9130", "250 Hop City", "Hop City"]

DEST.mkdir(parents=True, exist_ok=True)
failures = []

for folder, out_name in REPORTS:
    html = (SRC / folder / "Build_It_USA_Estimate_v3.html").read_text(encoding="utf-8")
    for old, new in REDACTIONS:
        html = html.replace(old, new)

    leftover = [token for token in FORBIDDEN if token in html]
    if leftover:
        failures.append(f"{out_name}: still contains {leftover}")
        continue

    (DEST / out_name).write_text(html, encoding="utf-8")
    print(f"published {out_name}  ({len(html):,} bytes)")

if failures:
    raise SystemExit("REDACTION FAILED:\n" + "\n".join(failures))
print("all published clean")
