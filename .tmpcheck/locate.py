import re
from playwright.sync_api import sync_playwright

PATS = [r"\\frac", r"\\int", r"\\cdot", r"\^\{u\}", r"\\Big"]

with sync_playwright() as p:
    b = p.chromium.launch()
    for mod in (8, 14):
        page = b.new_page()
        page.goto(f"http://localhost:8077/modulos/modulo{mod}/index.html", wait_until="networkidle")
        page.wait_for_timeout(800)
        btn = page.query_selector("#calcular")
        if btn: btn.click()
        page.wait_for_timeout(1200)
        out = page.evaluate("""(pats) => {
            const res = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let n;
            while (n = walker.nextNode()) {
                const t = n.textContent;
                if (/\\\\(frac|int|Big|cdot)|\\^\\{/.test(t)) {
                    const el = n.parentElement;
                    let path = '';
                    let cur = el;
                    for (let i=0;i<5 && cur;i++){ path = cur.tagName + (cur.id?'#'+cur.id:'') + (cur.className&&typeof cur.className==='string'?'.'+cur.className.split(' ')[0]:'') + ' > ' + path; cur = cur.parentElement; }
                    res.push({text: t.slice(0,120), path: path.slice(0,160)});
                }
            }
            return res;
        }""")
        print(f"--- M{mod} ---")
        for o in out: print(o["path"], "||", repr(o["text"]))
        page.close()
    b.close()
