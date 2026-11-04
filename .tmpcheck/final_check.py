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
        sel = page.query_selector("select")
        btn = page.query_selector("#calcular")
        opts = page.eval_on_selector_all("select option", "els => els.map(e => e.value)") if sel else []
        for v in (opts or [None]):
            if sel and v is not None:
                try: page.select_option("select", v)
                except Exception: continue
            if btn:
                try: btn.click(timeout=2000)
                except Exception: pass
            page.wait_for_timeout(400)
        # modulo13: also click verify buttons
        if mod == 13:
            bs = page.query_selector_all("button")
            for x in bs[:3]:
                try: x.click(timeout=1500)
                except Exception: pass
            page.wait_for_timeout(600)
        text = page.evaluate("""() => {
            const clone = document.body.cloneNode(true);
            clone.querySelectorAll('script,style,.katex-mathml').forEach(n => n.remove());
            return clone.innerText || clone.textContent;
        }""")
        bad = []
        for pat, name in [(r"\\[a-zA-Z]+", "raw latex cmd"), (r"\^\{[^}]*\}", "raw ^{}"), (r"_\{[^}]*\}", "raw _{}"), (r"\$[^$\n]{1,120}\$", "visible $..$")]:
            m = re.search(pat, text)
            if m: bad.append((name, m.group(0)[:70]))
        katex_errors = page.evaluate("document.querySelectorAll('.katex-error').length")
        print(f"M{mod}: BAD={bad} katex_error_nodes={katex_errors} js_errs={errs[:2]}")
        page.close()
    b.close()
