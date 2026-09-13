import os
import sys
import subprocess
import shutil

# Read RESEARCH_PAPER.md
with open("RESEARCH_PAPER.md", "r", encoding="utf-8") as f:
    md_content = f.read()

# Build HTML template with MathJax 3 & Marked.js for perfect IEEE paper rendering
html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SENTINEL: Autonomous LLMOps with Hybrid Subword-Dense Embedding Cosine Similarity, Real-Time Faithfulness Verification, and Closed-Loop Prompt Self-Healing</title>

<!-- MathJax 3 for TeX Math Formatting -->
<script>
MathJax = {{
  tex: {{
    inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
    displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
  }},
  svg: {{ fontCache: 'global' }}
}};
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<!-- Marked.js for Markdown to HTML conversion -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<style>
  @page {{
    size: letter;
    margin: 20mm 18mm 20mm 18mm;
  }}

  body {{
    font-family: 'Times New Roman', Times, serif;
    font-size: 10.5pt;
    line-height: 1.45;
    color: #111;
    background: #fff;
    margin: 0;
    padding: 0;
  }}

  h1 {{
    font-size: 17pt;
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 14px;
    line-height: 1.25;
    color: #0b132b;
  }}

  h2 {{
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #0b132b;
    border-bottom: 1.5px solid #1c2541;
    padding-bottom: 3px;
    margin-top: 20px;
    margin-bottom: 10px;
  }}

  h3 {{
    font-size: 11pt;
    font-weight: bold;
    color: #1c2541;
    margin-top: 15px;
    margin-bottom: 6px;
  }}

  h4 {{
    font-size: 10pt;
    font-weight: bold;
    font-style: italic;
    color: #3a506b;
    margin-top: 12px;
    margin-bottom: 4px;
  }}

  p {{
    text-align: justify;
    margin-top: 0;
    margin-bottom: 10px;
  }}

  strong {{
    color: #0b132b;
  }}

  ul, ol {{
    margin-top: 0;
    margin-bottom: 10px;
    padding-left: 22px;
  }}

  li {{
    margin-bottom: 4px;
  }}

  code {{
    font-family: 'Courier New', Courier, monospace;
    font-size: 9pt;
    background-color: #f4f5f6;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #e1e4e8;
  }}

  pre {{
    font-family: 'Courier New', Courier, monospace;
    font-size: 8.5pt;
    background-color: #1c2541;
    color: #edf2f4;
    padding: 12px;
    border-radius: 5px;
    overflow-x: auto;
    line-height: 1.35;
    margin-top: 10px;
    margin-bottom: 14px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
    margin-bottom: 16px;
    font-size: 9pt;
  }}

  th, td {{
    border: 1px solid #cbd5e1;
    padding: 6px 10px;
    text-align: left;
  }}

  th {{
    background-color: #f1f5f9;
    font-weight: bold;
    color: #0f172a;
  }}

  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}

  blockquote {{
    font-style: italic;
    border-left: 3px solid #1c2541;
    margin-left: 0;
    padding-left: 12px;
    color: #334155;
  }}

  .mjx-chtml {{
    font-size: 105% !important;
  }}
</style>
</head>
<body>

<div id="content"></div>

<script>
  const rawMarkdown = {repr(md_content)};
  document.getElementById('content').innerHTML = marked.parse(rawMarkdown);
</script>
</body>
</html>
"""

os.makedirs("scratch", exist_ok=True)
html_path = os.path.abspath("scratch/paper_render.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_template)

pdf_root = os.path.abspath("SENTINEL_Research_Paper.pdf")
os.makedirs("research/paper", exist_ok=True)
pdf_research = os.path.abspath("research/paper/SENTINEL_Research_Paper.pdf")

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
browser_exe = chrome_path if os.path.exists(chrome_path) else edge_path

cmd = [
    browser_exe,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_root}",
    f"file:///{html_path}"
]

subprocess.run(cmd, check=True)
shutil.copyfile(pdf_root, pdf_research)

print(f"PDF successfully generated!")
print(f"Root PDF: {pdf_root} ({os.path.getsize(pdf_root)} bytes)")
print(f"Research PDF: {pdf_research} ({os.path.getsize(pdf_research)} bytes)")
