import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page()
    page.goto("http://localhost:8077/modulos/modulo14/index.html", wait_until="networkidle")
    page.wait_for_timeout(900)
    sel = page.query_selector("select")
    btn = page.query_selector("#calcular")
    opts = page.eval_on_selector_all("select option", "els => els.map(e => e.value)") if sel else []
    found = []
    for v in (opts or [None]):
        if sel and v is not None:
            try: page.select_option("select", v)
            except Exception: continue
        if btn:
            try: btn.click(timeout=2000)
            except Exception: pass
        page.wait_for_timeout(500)
        out = page.evaluate("""() => {
            const res = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let n;
            while (n = walker.nextNode()) {
                const t = n.textContent;
                if (/\\\\[a-zA-Z]+|\\^\\{[^}]*\\}|_\\{[^}]*\\}/.test(t)) {
                    let cur = n.parentElement, path='';
                    for (let i=0;i<6 && cur;i++){ path = cur.tagName+(cur.id?'#'+cur.id:'')+'.'+((typeof cur.className==='string'&&cur.className.split(' ')[0])||'')+' > '+path; cur=cur.parentElement; }
                    res.push({opt: document.querySelector('select') ? document.querySelector('select').value : '', text: t.slice(0,140), path: path.slice(0,180)});
                }
            }
            return res;
        }""")
        found.extend(out)
    for f in found: print(f["opt"], "||", f["path"], "||", repr(f["text"]))
    page.close(); b.close()
