import re
import datetime
from fpdf import FPDF
import markdown2


class ProjectPlanPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
        self.brand_teal = (0, 133, 125)
        self.app_bg = (241, 245, 249)
        self.text_main = (15, 23, 42)
        self.text_muted = (100, 116, 139)
        self.border_color = (226, 232, 240)
        self.toc = []

    def header(self):
        if self.page_no() > 2:
            self.set_font("helvetica", "B", 8)
            self.set_text_color(*self.text_muted)
            self.cell(0, 10, "NEREOHUB - PLAN", 0, 0, "L")
            self.cell(0, 10, f"Página {self.page_no()}", 0, 1, "R")
            self.set_draw_color(*self.brand_teal)
            self.set_line_width(0.5)
            self.line(10, 18, 200, 18)
            self.ln(8)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font("helvetica", "I", 8)
            self.set_text_color(180)
            self.cell(
                0,
                10,
                f"Documento de Planificación - {datetime.date.today().strftime('%Y-%m-%d')}",
                0,
                0,
                "C",
            )

    def add_cover_page(self, project_name="Plan de Ejecución"):
        self.add_page()
        self.set_fill_color(*self.brand_teal)
        self.rect(0, 0, 210, 120, "F")
        self.set_y(55)
        self.set_font("helvetica", "B", 32)
        self.set_text_color(255)
        self.cell(0, 15, "NereoHub", 0, 1, "C")
        self.set_font("helvetica", "", 14)
        self.cell(0, 10, "Multi-project task hub", 0, 1, "C")
        self.set_y(150)
        self.set_font("helvetica", "B", 26)
        self.set_text_color(*self.text_main)
        self.cell(0, 20, project_name.upper(), 0, 1, "C")
        self.set_y(175)
        self.set_draw_color(*self.brand_teal)
        self.set_line_width(1.5)
        self.line(70, 172, 140, 172)
        self.set_y(240)
        self.set_font("helvetica", "", 11)
        self.set_text_color(*self.text_muted)
        date_str = datetime.date.today().strftime("%d de %B, %Y")
        self.cell(0, 8, f"Fecha de Emisión: {date_str}", 0, 1, "C")
        self.cell(0, 8, "Nivel de Acceso: Confidencial / Proyecto", 0, 1, "C")

    def add_version_separator(self, version):
        self.add_page()
        self.set_y(100)
        self.set_font("helvetica", "B", 30)
        self.set_text_color(*self.brand_teal)
        self.cell(0, 20, f"Versión {version}", 0, 1, "C")
        self.set_draw_color(*self.brand_teal)
        self.set_line_width(0.5)
        self.line(60, 125, 150, 125)

    def add_task_header(self, title_text, task_id, version):
        title = f"{task_id}: {title_text}"
        link = self.add_link()
        self.set_link(link, page=self.page_no())
        self.toc.append((title_text, self.page_no(), task_id, link, version, False))
        self.set_font("helvetica", "B", 18)
        self.set_text_color(*self.text_main)
        self.multi_cell(0, 12, title)
        self.ln(2)
        self.set_draw_color(*self.brand_teal)
        self.set_line_width(2)
        self.line(self.get_x(), self.get_y(), self.get_x() + 35, self.get_y())
        self.ln(6)

    def add_meta_bar(self, meta):
        self.set_font("helvetica", "B", 8)
        self.set_fill_color(*self.app_bg)
        self.set_draw_color(*self.border_color)
        self.rect(self.get_x(), self.get_y(), 190, 12, "DF")
        self.set_xy(self.get_x() + 5, self.get_y() + 1)

        def draw_val(label, val):
            self.set_font("helvetica", "B", 8)
            self.set_text_color(*self.text_muted)
            self.write(10, f"{label}: ")
            self.set_text_color(*self.brand_teal)
            self.write(10, f"{str(val).upper()}    ")

        draw_val("V", meta.get("version", "v0.2"))
        draw_val("TIPO", meta.get("type", "feature"))
        draw_val("ESTADO", meta.get("status", "pending"))
        draw_val("PESO", meta.get("weight", "0"))
        self.ln(18)

    def write_markdown(self, md):
        md = re.sub(r"[^\x00-\x7F\u00C0-\u00FF]", "", md)
        html = markdown2.markdown(
            md, extras=["tables", "fenced-code-blocks", "task_list"]
        )
        html = html.replace("[ ]", "☐").replace("[x]", "☑")
        self.set_text_color(*self.text_main)
        self.set_font("helvetica", "", 10.5)
        try:
            html = html.replace("<h1>", '<h1 color="#00857d">')
            html = html.replace("<h2>", '<h2 color="#00857d">')
            self.write_html(html)
        except Exception:
            self.multi_cell(0, 5, md)


def generate_plan_pdf(tasks, output_path):
    pdf = ProjectPlanPDF()
    pdf.add_cover_page()
    groups = {}
    for t in tasks:
        v = t.get("version", "v0.2")
        if v not in groups:
            groups[v] = []
        groups[v].append(t)
    sorted_versions = sorted(groups.keys(), reverse=True)
    total_tasks = len(tasks)
    total_versions = len(sorted_versions)
    index_pages_needed = max(1, (total_tasks + total_versions * 2) // 22 + 1)
    index_start_page = 2
    for _ in range(index_pages_needed):
        pdf.add_page()
    for version in sorted_versions:
        pdf.add_version_separator(version)
        version_link = pdf.add_link()
        pdf.set_link(version_link, page=pdf.page_no())
        pdf.toc.append(
            (f"VERSIÓN {version}", pdf.page_no(), None, version_link, version, True)
        )
        for task in groups[version]:
            pdf.add_page()
            pdf.add_task_header(
                task.get("title", "Sin Título"), task.get("id", "??"), version
            )
            pdf.add_meta_bar(task)
            content = task.get("content", "")
            content = re.sub(r"^---\s*\n.*?\n---\s*\n", "", content, flags=re.DOTALL)
            lines = content.strip().split("\n")
            if lines and lines[0].startswith("# "):
                content = "\n".join(lines[1:])
            pdf.write_markdown(content)
    pdf.page = index_start_page
    pdf.set_y(25)
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(*pdf.brand_teal)
    pdf.cell(0, 15, "CONTENIDO DEL PLAN", 0, 1, "L")
    pdf.ln(10)
    for title, page, tid, link, ver, is_section_header in pdf.toc:
        if pdf.get_y() > 270:
            pdf.page += 1
            pdf.set_y(25)
            pdf.set_font("helvetica", "B", 10)
        if is_section_header:
            pdf.ln(5)
            pdf.set_font("helvetica", "B", 12)
            pdf.set_text_color(*pdf.brand_teal)
            pdf.cell(0, 10, title, 0, 1, "L", link=link)
            pdf.set_draw_color(*pdf.border_color)
            pdf.line(pdf.get_x(), pdf.get_y(), 200, pdf.get_y())
            pdf.ln(2)
            continue
        pdf.set_font("helvetica", "B", 10)
        pdf.set_text_color(*pdf.text_main)
        pdf.cell(25, 8, tid if tid else "", 0, 0)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(pdf.get_string_width(title) + 2, 8, title, 0, 0, link=link)
        text_w = pdf.get_string_width(title)
        remaining_w = 190 - 25 - text_w - 15
        if remaining_w > 10:
            pdf.set_x(25 + text_w + 5)
            pdf.set_text_color(200, 210, 220)
            dots = "." * int(remaining_w / 1.5)
            pdf.cell(remaining_w, 8, dots, 0, 0, "R")
        pdf.set_text_color(*pdf.text_muted)
        pdf.set_x(190)
        pdf.cell(10, 8, str(page), 0, 1, "R")
    pdf.output(output_path)
    return output_path
