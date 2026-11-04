import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    for mod in range(7, 15):
        page = b.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.goto(f"http://localhost:8077/modulos/modulo{mod}/index.html", wait_until="networkidle")
        page.wait_for_timeout(900)
        # click calcular + change select to other options and reclick (dynamic content check)
        sel = page.query_selector("select")
        btn = page.query_selector("#calcular")
        opts = page.eval_on_selector_all("select option", "els => els.map(e => e.value)") if sel else []
        for v in (opts or [None]):
            if sel and v is not None:
                try:
                    page.select_option("select", v)
                except Exception: continue
            if btn:
                try: btn.click(timeout=2000)
                except Exception: pass
            page.wait_for_timeout(450)
        text = page.evaluate("""() => {
            const clone = document.body.cloneNode(true);
            // remove scripts/styles AND katex mathml annotations (they legitimately contain raw latex source)
            clone.querySelectorAll('script,style,.katex-mathml').forEach(n => n.remove());
            return clone.innerText || clone.textContent;
        }""")
        bad = []
        for pat, name in [(r"\\[a-zA-Z]+", "raw latex cmd"), (r"\^\{[^}]*\}", "raw ^{}"), (r"_\{[^}]*\}", "raw _{}"), (r"\$[^$\n]{1,120}\$", "visible $..$")]:
            m = re.search(pat, text)
            if m: bad.append((name, m.group(0)[:70]))
        katex_nodes = page.evaluate("document.querySelectorAll('.katex').length")
        print(f"M{mod}: katex_nodes={katex_nodes} js_errs={errs[:2]} BAD={bad}")
        page.close()
    b.close()
