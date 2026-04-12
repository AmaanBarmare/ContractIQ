"""Generate the four Zoom sample contract PDFs used by the Renewal Rescue demo.

Run from repo root:

    python scripts/demo_data/zoom/generate_samples.py

The PDFs are deliberately designed to:

* Expose every field the Extraction Agent needs (annual value, renewal date,
  notice period, auto-renewal, seat count, governing law, SOC 2 reference,
  breach notification SLA, etc.).
* Trigger a meaningful risk profile: cancellation deadline ~5 days out,
  no liability cap, no DPA, no renewal owner — so the Risk Agent produces
  multiple Critical flags and the Decision Agent confidently recommends
  RENEGOTIATE.

Edit the ``DOCUMENTS`` dict below and re-run to iterate on wording.
"""

from __future__ import annotations

from pathlib import Path

import fitz  # PyMuPDF

OUTPUT_DIR = Path(__file__).parent


MSA_TEXT = """MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of August 15, 2024 ("Effective Date") between Zoom Video Communications, Inc., a Delaware corporation with its principal place of business at 55 Almaden Boulevard, 6th Floor, San Jose, CA 95113 ("Zoom" or "Vendor"), and the Customer identified in the applicable Order Form ("Customer").

1. DEFINITIONS

"Services" means the Zoom Meetings Enterprise Plus subscription services ordered under an applicable Order Form. "Customer Data" means any data submitted by or on behalf of Customer to the Services.

2. TERM AND TERMINATION

2.1 Term. This Agreement shall commence on the Effective Date and continue in effect until terminated as provided herein or until all active Order Forms have expired.

2.2 Termination for Cause. Either party may terminate this Agreement for material breach by the other party, provided that the terminating party has given the breaching party thirty (30) days written notice and an opportunity to cure.

2.3 No Termination for Convenience. Neither party may terminate this Agreement or any active Order Form for convenience. Early termination is permitted only as expressly set forth in Section 2.2.

2.4 Non-Renewal. Either party may elect not to renew any active Order Form upon thirty (30) days prior written notice to the other party, delivered in accordance with Section 7 (Notices). Order Forms that are not affirmatively non-renewed within the applicable notice window shall continue in effect as provided in the governing Order Form.

3. LIABILITY

Each party acknowledges that the Services are provided on an as-is basis. Neither party shall be liable for indirect, consequential, incidental, or punitive damages arising out of or related to this Agreement. The parties have not agreed upon any aggregate cap on direct damages under this Agreement, and each party retains all rights to recover direct damages without limitation.

4. SECURITY AND COMPLIANCE

4.1 SOC 2 Type II. Zoom maintains a SOC 2 Type II report covering its core service environment. Customer may request the most recent report subject to a mutual non-disclosure agreement.

4.2 Security Incident Notification. Zoom shall notify Customer in writing of any confirmed Security Incident affecting Customer Data within seventy-two (72) hours of confirmation.

4.3 Subprocessors. A current list of Zoom subprocessors is available upon written request.

5. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws provisions. The parties consent to the exclusive jurisdiction of the state and federal courts located in Santa Clara County, California.

6. ENTIRE AGREEMENT

This Agreement, together with all Order Forms executed hereunder, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior or contemporaneous agreements, proposals, or representations, whether written or oral.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

Zoom Video Communications, Inc.
By: _______________________
Name: Eric Yuan
Title: Chief Executive Officer

Customer
By: _______________________
Name:
Title:
"""

ORDER_FORM_TEXT = """ORDER FORM #OF-2025-0142

Vendor: Zoom Video Communications, Inc.
Customer: [Customer Entity]
Order Form Effective Date: 2025-06-15
Initial Term: twelve (12) months
Renewal Date: 2026-06-15

Services Ordered

Product: Zoom Meetings Enterprise Plus
Licensed Users: 180 seats
Annual Subscription Fee: $84,000 USD
Pricing Model: Per-seat, annual commitment
Billing Frequency: Annual, paid upfront
Payment Terms: Net 30
Currency: USD

Auto-Renewal

This Order Form shall automatically renew for successive one-year terms at the then-current list price unless either party provides written notice of non-renewal at least sixty (60) days prior to the then-current Renewal Date.

Notice Period

Customer must provide written notice prior to the Renewal Date in order to cancel, elect non-renewal, or modify the scope of this Order Form. Per the governing Master Services Agreement, such notice shall be delivered no later than thirty (30) days prior to the Renewal Date. Notices must be sent to legal@zoom.us with a copy to the Customer Success Manager.

Governing Agreement

This Order Form is governed by the Master Services Agreement between the parties dated August 15, 2024, which is incorporated herein by reference. Capitalized terms not defined here have the meanings set forth in the Master Services Agreement.

Signed
Zoom Video Communications, Inc.: _______________________
Customer: _______________________
"""

AMENDMENT_TEXT = """AMENDMENT NO. 1 TO ORDER FORM #OF-2025-0142

This Amendment No. 1 ("Amendment") is entered into as of December 1, 2025 and amends Order Form #OF-2025-0142 between Zoom Video Communications, Inc. and Customer.

1. Pricing Adjustment

Effective on the next Renewal Date (2026-06-15), the Annual Subscription Fee shall be increased from $84,000 to $88,200 USD, reflecting a five percent (5%) price uplift consistent with Zoom's standard annual pricing escalator. The per-seat unit rate shall correspondingly increase from $467 to $490 per licensed user per year.

2. Seat Count

The Licensed Users count remains one hundred eighty (180) seats. No additional seats are added under this Amendment.

3. Renewal Mechanics Unchanged

For the avoidance of doubt, the Renewal Date remains 2026-06-15 and the auto-renewal mechanics set forth in the Order Form remain unchanged. The parties acknowledge that the applicable notice period for non-renewal shall be determined by reference to the governing Master Services Agreement and the Order Form, with the parties having historically operated under a forty-five (45) day notice convention for administrative coordination purposes.

4. All Other Terms

Except as expressly modified herein, all other terms and conditions of Order Form #OF-2025-0142 and the Master Services Agreement remain in full force and effect.

Signed
Zoom Video Communications, Inc.: _______________________
Customer: _______________________
"""

PRICING_SHEET_TEXT = """PRICING SHEET — ZOOM MEETINGS ENTERPRISE PLUS

Customer: [Customer Entity]
Effective Period: 2025-06-15 through 2026-06-15

Product Details

Product: Zoom Meetings Enterprise Plus
Unit Type: Per Licensed User
Unit Rate: $467 per seat per year
Licensed Users: 180
Total Annual Subscription Fee: $84,000 USD

Discounts and Adjustments

Multi-year commitment discount: 0% (single-year order)
Volume tier: 150-250 seats (tier applied)
Promotional discount: None

Payment and Billing

Payment Terms: Net 30
Billing Frequency: Annual, paid upfront
Currency: USD

Notes

Pricing is exclusive of applicable taxes. Renewal pricing is subject to Zoom's standard annual uplift as set forth in the governing Order Form and any amendments thereto.
"""


DOCUMENTS = {
    "Zoom_MSA.pdf": MSA_TEXT,
    "Zoom_OrderForm.pdf": ORDER_FORM_TEXT,
    "Zoom_Amendment.pdf": AMENDMENT_TEXT,
    "Zoom_PricingSheet.pdf": PRICING_SHEET_TEXT,
}


# Page + text layout constants
PAGE_WIDTH = 612  # US Letter
PAGE_HEIGHT = 792
MARGIN = 54  # 0.75"
FONT_NAME = "helv"
FONT_SIZE = 10
LINE_HEIGHT = 13


def write_pdf(path: Path, text: str) -> None:
    """Render plain text into a multi-page PDF using PyMuPDF.

    Breaks the input into lines and wraps them inside a text box per page,
    spilling to a new page as needed. Output is selectable text (not images)
    so PyMuPDF's extractor reads it back cleanly in the parser.
    """
    doc = fitz.open()
    lines = text.splitlines()
    line_idx = 0

    while line_idx < len(lines):
        page = doc.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        y = MARGIN
        max_y = PAGE_HEIGHT - MARGIN
        while line_idx < len(lines) and y < max_y:
            line = lines[line_idx]
            # Simple word wrap at ~95 chars
            if len(line) > 95:
                wrapped = _wrap(line, 95)
            else:
                wrapped = [line]
            for w in wrapped:
                if y >= max_y:
                    break
                page.insert_text(
                    fitz.Point(MARGIN, y),
                    w,
                    fontname=FONT_NAME,
                    fontsize=FONT_SIZE,
                )
                y += LINE_HEIGHT
            line_idx += 1

    doc.save(str(path))
    doc.close()


def _wrap(line: str, width: int) -> list[str]:
    words = line.split(" ")
    out: list[str] = []
    current = ""
    for w in words:
        if not current:
            current = w
        elif len(current) + 1 + len(w) <= width:
            current += " " + w
        else:
            out.append(current)
            current = w
    if current:
        out.append(current)
    return out


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, text in DOCUMENTS.items():
        path = OUTPUT_DIR / filename
        write_pdf(path, text)
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
