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
    font-size: 11pt;
    line-height: 1.55;
    color: #111;
    background: #fff;
    margin: 0;
    padding: 0;
  }}

  h1 {{
    font-size: 18pt;
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 14px;
    line-height: 1.25;
    color: #0f172a;
  }}

  h2 {{
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #0f172a;
    border-bottom: 1.5px solid #0f172a;
    padding-bottom: 3px;
    margin-top: 24px;
    margin-bottom: 12px;
  }}

  h3 {{
    font-size: 11.5pt;
    font-weight: bold;
    color: #1e293b;
    margin-top: 18px;
    margin-bottom: 8px;
  }}

  h4 {{
    font-size: 10.5pt;
    font-weight: bold;
    font-style: italic;
    color: #334155;
    margin-top: 14px;
    margin-bottom: 6px;
  }}

  p {{
    text-align: justify;
    margin-top: 0;
    margin-bottom: 12px;
  }}

  strong {{
    color: #0f172a;
  }}

  ul, ol {{
    margin-top: 0;
    margin-bottom: 12px;
    padding-left: 24px;
  }}

  li {{
    margin-bottom: 5px;
  }}

  code {{
    font-family: 'Courier New', Courier, monospace;
    font-size: 9.5pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 3px;
    border: 1px solid #cbd5e1;
  }}

  pre {{
    font-family: 'Courier New', Courier, monospace;
    font-size: 8.5pt;
    background-color: #f8fafc;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    line-height: 1.35;
    margin-top: 12px;
    margin-bottom: 16px;
    white-space: pre;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    margin-bottom: 20px;
    font-size: 9.5pt;
  }}

  th, td {{
    border: 1px solid #94a3b8;
    padding: 7px 12px;
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
    border-left: 3.5px solid #0f172a;
    margin-left: 0;
    padding-left: 14px;
    color: #334155;
  }}

  /* Vector Academic Figure Cards */
  .figure-card {{
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    padding: 14px 16px;
    margin-top: 16px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }}

  .figure-header {{
    font-family: Arial, sans-serif;
    font-size: 9.5pt;
    font-weight: bold;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
    margin-bottom: 12px;
  }}

  .pipeline-block {{
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 10px;
  }}

  .traditional-bg {{
    background: #f8fafc;
    border: 1px dashed #94a3b8;
  }}

  .sentinel-bg {{
    background: #f0fdf4;
    border: 1px solid #86efac;
  }}

  .pipeline-title {{
    font-family: Arial, sans-serif;
    font-size: 9pt;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 8px;
  }}

  .flow-flex {{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }}

  .flow-card {{
    font-family: Arial, sans-serif;
    font-size: 8.5pt;
    font-weight: 600;
    padding: 5px 9px;
    border-radius: 5px;
    border: 1px solid transparent;
  }}

  .card-slate {{ background: #e2e8f0; color: #334155; border-color: #cbd5e1; }}
  .card-red {{ background: #fee2e2; color: #991b1b; border-color: #fca5a5; }}
  .card-blue {{ background: #dbeafe; color: #1e40af; border-color: #93c5fd; }}
  .card-purple {{ background: #f3e8ff; color: #6b21a8; border-color: #d8b4fe; }}
  .card-indigo {{ background: #e0e7ff; color: #3730a3; border-color: #a5b4fc; }}
  .card-amber {{ background: #fef3c7; color: #92400e; border-color: #fde047; }}
  .card-emerald {{ background: #d1fae5; color: #065f46; border-color: #6ee7b7; }}

  .flow-arrow {{
    font-size: 10pt;
    color: #64748b;
    font-weight: bold;
  }}

  /* Taxonomy Grid */
  .taxonomy-grid {{
    display: flex;
    gap: 10px;
  }}

  .taxonomy-col {{
    flex: 1;
    border-radius: 6px;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    font-family: Arial, sans-serif;
  }}

  .col-lexical {{ background: #f8fafc; border-color: #cbd5e1; }}
  .col-cloud {{ background: #fef2f2; border-color: #fca5a5; }}
  .col-sentinel {{ background: #f0fdf4; border-color: #86efac; }}

  .tax-title {{
    font-size: 9.5pt;
    font-weight: bold;
    color: #0f172a;
    margin-bottom: 4px;
  }}

  .tax-desc {{
    font-size: 8.5pt;
    color: #475569;
    line-height: 1.35;
  }}

  /* Micro-Architecture Layers */
  .arch-layer {{
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 12px;
    background: #f8fafc;
    font-family: Arial, sans-serif;
  }}

  .layer-gui {{ background: #eff6ff; border-color: #93c5fd; }}
  .layer-backend {{ background: #f5f3ff; border-color: #c4b5fd; }}
  .layer-daemon {{ background: #f0fdf4; border-color: #86efac; }}

  .layer-badge {{
    display: inline-block;
    font-size: 8pt;
    font-weight: bold;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
    background: #0f172a;
    color: #fff;
    margin-bottom: 4px;
  }}

  .layer-content {{
    font-size: 9pt;
    color: #1e293b;
  }}

  .arch-arrow {{
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 8.5pt;
    font-weight: bold;
    color: #64748b;
    margin: 6px 0;
  }}

  /* Quality Gating Box */
  .gating-container {{
    font-family: Arial, sans-serif;
  }}

  .gating-inputs {{
    font-size: 9pt;
    background: #f1f5f9;
    padding: 8px 12px;
    border-radius: 5px;
    margin-bottom: 10px;
    border: 1px solid #cbd5e1;
  }}

  .metric-chips {{
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }}

  .chip {{
    font-size: 8pt;
    font-weight: bold;
    background: #e0e7ff;
    color: #3730a3;
    padding: 3px 8px;
    border-radius: 12px;
    border: 1px solid #c7d2fe;
  }}

  .gating-outcomes {{
    display: flex;
    gap: 8px;
  }}

  .gate-card {{
    flex: 1;
    font-size: 8.5pt;
    font-weight: bold;
    padding: 8px 10px;
    border-radius: 5px;
    text-align: center;
  }}

  .gate-green {{ background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }}
  .gate-yellow {{ background: #fef3c7; color: #92400e; border: 1px solid #fde047; }}
  .gate-red {{ background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }}

  /* Loop Step Grid */
  .loop-grid {{
    display: flex;
    gap: 8px;
    font-family: Arial, sans-serif;
  }}

  .loop-step {{
    flex: 1;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 8.5pt;
    color: #334155;
  }}

  .step-1 {{ border-left: 3px solid #ef4444; }}
  .step-2 {{ border-left: 3px solid #f59e0b; }}
  .step-3 {{ border-left: 3px solid #6366f1; }}
  .step-4 {{ border-left: 3px solid #10b981; }}

  /* Latency Bar Visualizer */
  .latency-bar-group {{
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }}

  .bar-item {{
    display: flex;
    flex-direction: column;
    gap: 3px;
  }}

  .bar-label {{
    font-size: 8.5pt;
    font-weight: bold;
    color: #1e293b;
  }}

  .bar-track {{
    background: #e2e8f0;
    height: 18px;
    border-radius: 4px;
    overflow: hidden;
  }}

  .bar-fill {{
    height: 100%;
    font-size: 7.5pt;
    font-weight: bold;
    color: #fff;
    display: flex;
    align-items: center;
    padding-left: 8px;
  }}

  .fill-p50 {{ background: #3b82f6; }}
  .fill-p90 {{ background: #8b5cf6; }}
  .fill-p95 {{ background: #10b981; }}

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
