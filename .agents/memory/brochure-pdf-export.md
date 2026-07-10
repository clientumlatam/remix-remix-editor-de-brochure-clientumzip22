---
name: Brochure PDF export
description: PDF export must mirror the live brochure preview DOM, not a separately hand-coded layout.
---

The "Descargar PDF" feature exports by capturing the actual rendered brochure preview
pages from the DOM (each page has `id="print-page-N"`) via html2canvas, then assembles
them into a jsPDF document image-by-image.

**Why:** an earlier version manually redrew the brochure layout in jsPDF (separate
colors, spacing, fonts) which drifted from the on-screen design over time and produced
a visually different PDF than what users saw in the app.

**How to apply:** if the brochure preview's design changes, the PDF automatically
matches since it captures the same DOM — no need to keep two implementations in sync.
Export must first flip the preview into "show all pages" mode and wait (poll) for every
expected `#print-page-N` node to mount before capturing; a fixed timeout is unreliable
and can silently produce incomplete PDFs.
