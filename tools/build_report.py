"""Build a review PDF from docs/report.md with a simple system diagram."""
from pathlib import Path
import re
from html import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Flowable, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "report.md"
OUTPUT = ROOT / "Student_Budget_Assignment_1_DRAFT.pdf"

font_path = Path(r"C:\Windows\Fonts\arial.ttf")
bold_path = Path(r"C:\Windows\Fonts\arialbd.ttf")
if font_path.exists() and bold_path.exists():
    pdfmetrics.registerFont(TTFont("Report", str(font_path)))
    pdfmetrics.registerFont(TTFont("Report-Bold", str(bold_path)))
    pdfmetrics.registerFontFamily("Report", normal="Report", bold="Report-Bold")
    FONT = "Report"
else:
    FONT = "Helvetica"

class SystemDiagram(Flowable):
    def __init__(self):
        super().__init__()
        self.width = 500
        self.height = 95

    def draw(self):
        c = self.canv
        c.setFont(FONT, 8)
        rows = [
            [("Student", 0), ("Browser UI", 1), ("Validation and\ncalculation", 2), ("Browser storage", 3)],
            [("Sample receipt", 0), ("Future extraction", 1), ("User confirms", 2), ("Browser UI", 3)],
        ]
        box_w, box_h, gap = 110, 33, 17
        for row_i, row in enumerate(rows):
            y = 65 - row_i * 53
            for label, col in row:
                x = col * (box_w + gap)
                c.setFillColor(colors.HexColor("#edf3f8"))
                c.setStrokeColor(colors.HexColor("#a9bac8"))
                c.roundRect(x, y, box_w, box_h, 5, stroke=1, fill=1)
                c.setFillColor(colors.HexColor("#17212b"))
                lines = label.split("\n")
                for j, line in enumerate(lines):
                    c.drawCentredString(x + box_w / 2, y + 13 + (len(lines)-1-j)*5, line)
                if col < 3:
                    c.setStrokeColor(colors.HexColor("#526d82"))
                    c.line(x + box_w + 2, y + box_h/2, x + box_w + gap - 5, y + box_h/2)
                    c.line(x + box_w + gap - 9, y + box_h/2 + 3, x + box_w + gap - 5, y + box_h/2)
                    c.line(x + box_w + gap - 9, y + box_h/2 - 3, x + box_w + gap - 5, y + box_h/2)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleCustom", fontName=FONT, fontSize=17, leading=21,
                          spaceAfter=10, textColor=colors.HexColor("#102f49")))
styles.add(ParagraphStyle(name="MetaCustom", fontName=FONT, fontSize=9, leading=12,
                          spaceAfter=3))
styles.add(ParagraphStyle(name="HeadingCustom", fontName=FONT, fontSize=11, leading=13,
                          spaceBefore=11, spaceAfter=4, textColor=colors.HexColor("#102f49")))
styles.add(ParagraphStyle(name="BodyCustom", fontName=FONT, fontSize=9.2, leading=12.4,
                          spaceAfter=6, splitLongWords=1))
styles.add(ParagraphStyle(name="ReferenceCustom", parent=styles["BodyCustom"], fontSize=8.3,
                          leading=10.8, leftIndent=15, firstLineIndent=-15, spaceAfter=4))
styles.add(ParagraphStyle(name="CaptionCustom", fontName=FONT, fontSize=8, leading=10,
                          alignment=TA_CENTER, spaceAfter=7))

def inline_markup(line):
    line = escape(line)
    line = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", line)
    line = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", line)
    line = line.replace("  ", "<br/>")
    return line

raw = SOURCE.read_text(encoding="utf-8")
blocks = re.split(r"\n\s*\n", raw)
story = []
in_refs = False
for block in blocks:
    block = block.strip()
    if not block:
        continue
    if block.startswith("```mermaid"):
        story.append(Spacer(1, 4))
        story.append(SystemDiagram())
        story.append(Paragraph("Figure 1. Proposed system overview; receipt extraction is optional.", styles["CaptionCustom"]))
    elif block.startswith("# "):
        story.append(Paragraph(inline_markup(block[2:]), styles["TitleCustom"]))
    elif block.startswith("## "):
        heading = block[3:]
        if heading == "3. Plan and design":
            story.append(PageBreak())
        in_refs = heading == "References"
        story.append(Paragraph(inline_markup(heading), styles["HeadingCustom"]))
    elif block.startswith("|"):
        lines = [line for line in block.splitlines() if not re.match(r"^\|\s*[-: ]+\|", line)]
        cells = [[Paragraph(inline_markup(cell.strip()), styles["BodyCustom"])
                  for cell in line.strip("|").split("|")] for line in lines]
        table = Table(cells, colWidths=[110, 190, 190], hAlign="LEFT", repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e6eef4")),
            ("GRID", (0, 0), (-1, -1), .4, colors.HexColor("#c3d0da")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(table)
        story.append(Spacer(1, 7))
    else:
        para_style = styles["ReferenceCustom"] if in_refs else styles["BodyCustom"]
        story.append(Paragraph(inline_markup(block.replace("\n", " ")), para_style))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT, 8)
    canvas.setFillColor(colors.HexColor("#607384"))
    canvas.drawString(55, 35, "Student Budget | Assignment 1 draft")
    canvas.drawRightString(557, 35, str(doc.page))
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUTPUT), pagesize=(612, 792), leftMargin=55,
                        rightMargin=55, topMargin=45, bottomMargin=45,
                        title="Student Budget Assignment 1 Draft", author="Guo HouYang")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)

