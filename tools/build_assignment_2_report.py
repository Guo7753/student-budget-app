"""Build the Assignment 2 group evaluation report from Markdown."""
from pathlib import Path
import re
from html import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "assignment-2-report.md"
OUTPUT = ROOT / "Student_Budget_Assignment_2.pdf"

font_path = Path(r"C:\Windows\Fonts\arial.ttf")
bold_path = Path(r"C:\Windows\Fonts\arialbd.ttf")
if font_path.exists() and bold_path.exists():
    pdfmetrics.registerFont(TTFont("Report", str(font_path)))
    pdfmetrics.registerFont(TTFont("Report-Bold", str(bold_path)))
    pdfmetrics.registerFontFamily("Report", normal="Report", bold="Report-Bold")
    FONT, BOLD = "Report", "Report-Bold"
else:
    FONT, BOLD = "Helvetica", "Helvetica-Bold"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Heading", fontName=BOLD, fontSize=12, leading=15,
                          spaceBefore=12, spaceAfter=5, textColor=colors.HexColor("#102f49")))
styles.add(ParagraphStyle(name="Body", fontName=FONT, fontSize=9.1, leading=12.2,
                          spaceAfter=6, splitLongWords=1))
styles.add(ParagraphStyle(name="Reference", parent=styles["Body"], fontSize=8.2,
                          leading=10.6, leftIndent=15, firstLineIndent=-15, spaceAfter=4))
styles.add(ParagraphStyle(name="Table", fontName=FONT, fontSize=7.45, leading=9.15,
                          spaceAfter=0, splitLongWords=1))


def markup(text):
    text = escape(text)
    text = re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", text)
    text = re.sub(r"\[([^]]+)\]\((https?://[^)]+)\)", r'<link href="\2"><u>\1</u></link>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = text.replace("  ", "<br/>")
    return text


def cover(canvas, doc):
    canvas.saveState()
    navy = colors.HexColor("#102f49")
    teal = colors.HexColor("#2bb6a1")
    pale = colors.HexColor("#c3dce7")
    canvas.setFillColor(navy)
    canvas.rect(0, 460, 612, 332, fill=1, stroke=0)
    canvas.setStrokeColor(colors.HexColor("#41647b"))
    for radius in (80, 130, 180):
        canvas.circle(560, 700, radius, fill=0, stroke=1)
    canvas.setFillColor(teal)
    canvas.roundRect(55, 718, 88, 23, 5, fill=1, stroke=0)
    canvas.setFillColor(navy)
    canvas.setFont(BOLD, 9)
    canvas.drawCentredString(99, 725, "CISE  •  02")
    canvas.setFillColor(colors.white)
    canvas.setFont(BOLD, 29)
    canvas.drawString(55, 635, "Student Budget")
    canvas.setFont(FONT, 16)
    canvas.drawString(55, 604, "Collaborative Development and Evaluation")
    canvas.setFillColor(pale)
    canvas.setFont(FONT, 10)
    canvas.drawString(55, 545, "ASSIGNMENT 2  /  GROUP EVALUATION REPORT")
    canvas.drawString(55, 525, "22 November 2026")
    canvas.setFillColor(teal)
    canvas.rect(55, 497, 85, 4, fill=1, stroke=0)

    members = [
        ("01", "Guo HouYang", "Team lead", "25307753"),
        ("02", "Li Hao", "", "25307493"),
        ("03", "Chen GuangYuan", "", "25307711"),
        ("04", "Shang JiaLe", "", "25307221"),
    ]
    canvas.setFillColor(navy)
    canvas.setFont(BOLD, 11)
    canvas.drawString(55, 422, "Project team")
    canvas.setStrokeColor(colors.HexColor("#d8e4eb"))
    canvas.line(55, 408, 557, 408)
    for number, name, role, student_id in members:
        y = 382 - (int(number) - 1) * 36
        canvas.setFillColor(colors.HexColor("#607384"))
        canvas.setFont(FONT, 8)
        canvas.drawString(55, y, number)
        canvas.setFillColor(navy)
        canvas.setFont(BOLD, 10)
        canvas.drawString(87, y, name)
        if role:
            canvas.setFillColor(colors.HexColor("#607384"))
            canvas.setFont(FONT, 8)
            canvas.drawString(205, y + 1, role)
        canvas.setFillColor(colors.HexColor("#607384"))
        canvas.setFont(FONT, 9)
        canvas.drawRightString(557, y, student_id)
        canvas.setStrokeColor(colors.HexColor("#e7eef2"))
        canvas.line(55, y - 13, 557, y - 13)
    canvas.setFillColor(colors.HexColor("#f1f6f8"))
    canvas.roundRect(55, 115, 502, 96, 9, fill=1, stroke=0)
    canvas.setFillColor(navy)
    canvas.setFont(BOLD, 9)
    canvas.drawString(70, 187, "PROJECT FOCUS")
    canvas.setFont(FONT, 9)
    canvas.drawString(70, 169, "Two short iterations: spending insight, then record correction and quality evidence.")
    canvas.setFont(BOLD, 9)
    canvas.drawString(70, 144, "REPOSITORY")
    canvas.setFont(FONT, 9)
    canvas.setFillColor(colors.HexColor("#087c83"))
    repository = "https://github.com/Guo7753/student-budget-app"
    canvas.drawString(70, 127, repository)
    canvas.linkURL(repository, (70, 123, 390, 139), relative=0)
    canvas.setStrokeColor(teal)
    canvas.setLineWidth(2)
    canvas.line(55, 50, 557, 50)
    canvas.restoreState()


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT, 8)
    canvas.setFillColor(colors.HexColor("#607384"))
    canvas.drawString(55, 35, "Student Budget | Assignment 2")
    canvas.drawRightString(557, 35, str(doc.page))
    canvas.restoreState()


raw = SOURCE.read_text(encoding="utf-8")
blocks = re.split(r"\n\s*\n", raw)
story = [Spacer(1, 1), PageBreak()]
in_references = False
for block in blocks:
    block = block.strip()
    if not block:
        continue
    if block.startswith("# ") or block.startswith("**CISE Assignment 2") or block.startswith("**Members and student IDs:"):
        continue
    if block.startswith("## "):
        heading = block[3:]
        in_references = heading == "References"
        story.append(Paragraph(markup(heading), styles["Heading"]))
        continue
    if block.startswith("|"):
        lines = [line for line in block.splitlines() if not re.match(r"^\|\s*[-: ]+\|", line)]
        rows = [[Paragraph(markup(cell.strip()), styles["Table"]) for cell in line.strip("|").split("|")] for line in lines]
        columns = len(rows[0])
        widths = {4: [82, 140, 135, 145], 5: [70, 94, 120, 125, 93]}.get(columns, [502 / columns] * columns)
        table = Table(rows, colWidths=widths, hAlign="LEFT", repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#102f49")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#c3d0da")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f6f9fb")),
        ]))
        story.extend([table, Spacer(1, 7)])
        continue
    style = styles["Reference"] if in_references else styles["Body"]
    story.append(Paragraph(markup(block.replace("\n", " ")), style))

doc = SimpleDocTemplate(str(OUTPUT), pagesize=(612, 792), leftMargin=55, rightMargin=55,
                        topMargin=40, bottomMargin=40, title="Student Budget Assignment 2", author="Guo HouYang")
doc.build(story, onFirstPage=cover, onLaterPages=footer)
print(OUTPUT)
