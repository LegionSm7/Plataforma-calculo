import re, sys, json
from playwright.sync_api import sync_playwright

MODS = list(range(7, 15))
BASE = "http://localhost:8077/modulos/modulo%d/index.html"

BAD = [
    (r"\\frac", "raw \\frac"),
    (r"\\int", "raw \\int"),
    (r"\\sqrt", "raw \\sqrt"),
    (r"\\sin|\\cos|\\tan|\\sec|\\ln|\\log|\\quad|\\Rightarrow|\\approx|\\cdot|\\left|\\right|\\Big|\\underbrace|\\text\{", "raw latex command"),
    (r"\^\{[^}]*\}", "raw ^{} syntax"),
    (r"\$[^$]{1,80}\$", "dollar-delimited latex still visible"),
]

def scan_text(t):
    hits = []
    for pat, name in BAD:
        m = re.search(pat, t)
        if m:
            hits.append((name, m.group(0)[:60]))
    return hits

with sync_playwright() as p:
    browser = p.chromium.launch()
    for mod in MODS:
        page = browser.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        url = BASE % mod
        try:
            page.goto(url, wait_until="networkidle", timeout=20000)
        except Exception as e:
            print(f"M{mod}: LOAD FAIL {e}")
            page.close(); continue
        page.wait_for_timeout(1000)
        katex_ok = page.evaluate("typeof katex !== 'undefined'")
        static_count = page.evaluate("document.querySelectorAll('.katex').length")
        # click calculate-like buttons to render dynamic results
        clicked = []
        for sel in ["#calcular", "#verificar", "#btn-verificar"]:
            b = page.query_selector(sel)
            if b:
                try: b.click(timeout=2000); clicked.append(sel)
                except Exception as ex: pass
        # also rows/buttons in modulo13
        if mod == 13:
            btns = page.query_selector_all("button")
            for b in btns[:2]:
                try: b.click(timeout=1500)
                except Exception: pass
        page.wait_for_timeout(1200)
        text = page.evaluate("""() => {
            const clone = document.body.cloneNode(true);
            clone.querySelectorAll('script,style,.katex').forEach(n => n.remove());
            return clone.innerText || clone.textContent;
        }""")
        hits = scan_text(text)
        print(f"M{mod}: katex={katex_ok} static_katex={static_count} clicked={clicked} js_errs={errors[:2]} bad={hits}")
        page.close()
    browser.close()
