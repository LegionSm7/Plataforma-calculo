// ===== MÓDULO 15: INTEGRALES DE LA FORMA ax² + bx + c =====

document.addEventListener('DOMContentLoaded', function() {

    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }

    const selectIntegral = document.getElementById('integral');
    const inputA2 = document.getElementById('coef-a');
    const inputB2 = document.getElementById('coef-b');
    const inputC2 = document.getElementById('coef-c');
    const inputN = document.getElementById('coef-n');
    const inputA = document.getElementById('a');
    const inputB = document.getElementById('b');
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    // ----- utilidades de formato LaTeX -----
    function fmt(v) {
        const r = Math.round(v * 10000) / 10000;
        return (Object.is(r, -0) ? 0 : r).toString();
    }
    // u = x + h escrito con signo legible
    function texShift(h) {
        if (Math.abs(h) < 1e-12) return 'x';
        return h > 0 ? `x+${fmt(h)}` : `x-${fmt(-h)}`;
    }
    // trinomio ax^2+bx+c con signos limpios (omite coeficientes 1 y términos nulos)
    function texPoly(a, b, c) {
        let s = (a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${fmt(a)}x^2`);
        if (b !== 0) s += (b > 0 ? '+' : '-') + (Math.abs(b) === 1 ? 'x' : `${fmt(Math.abs(b))}x`);
        if (c !== 0) s += (c > 0 ? '+' : '-') + fmt(Math.abs(c));
        return s;
    }
    // binomio mx+n con signos limpios
    function texLineal(m, n) {
        let s = (m === 1 ? 'x' : m === -1 ? '-x' : `${fmt(m)}x`);
        if (n !== 0) s += (n > 0 ? '+' : '-') + fmt(Math.abs(n));
        return s;
    }
    // prefactor "a[" o "" según si a==1
    function prefA(a) { return a === 1 ? '' : fmt(a); }
    // constante multiplicativa visible: omite el "1·"
    function coefMul(v) { return v === 1 ? '' : fmt(v); }

    function construirConfig(clave, a2, b2, c2, n) {
        const h = b2 / (2 * a2);                 // desplazamiento: u = x + h
        const kv = c2 - (b2 * b2) / (4 * a2);    // valor del vértice
        const disc = b2 * b2 - 4 * a2 * c2;      // discriminante Δ
        const f = x => a2 * x * x + b2 * x + c2;
        const u = x => x + h;
        const texU = texShift(h);
        const texF2 = texPoly(a2, b2, c2);
        const A = prefA(a2);

        if (a2 === 0) {
            return { error: 'Si a = 0 el trinomio deja de ser cuadrático. Usa módulos anteriores.' };
        }

        switch (clave) {

            // ∫ dx/(ax²+bx+c), con a>0 y Δ<0 → arctangente
            case 'rational-arctan': {
                if (!(a2 > 0 && disc < 0)) {
                    return { error: 'Esta familia necesita a > 0 y Δ = b² − 4ac < 0 (parábola siempre positiva). Prueba a=1, b=4, c=13.' };
                }
                const k = Math.sqrt(kv / a2);   // f(x) = a[(x+h)² + k²]
                return {
                    func: x => 1 / f(x),
                    F: x => (1 / (a2 * k)) * Math.atan(u(x) / k),
                    texF: `\\dfrac{1}{${fmt(a2 * k)}}\\arctan\\!\\left(\\dfrac{${texU}}{${fmt(k)}}\\right)`,
                    resultadoTex: `\\int \\dfrac{dx}{${texF2}} = \\dfrac{1}{${fmt(a2 * k)}}\\arctan\\!\\left(\\dfrac{${texU}}{${fmt(k)}}\\right) + C`,
                    pasos: [
                        ['Paso 1 — Completar la cuadrada:', `${texF2} = ${A}\\left(${texU}\\right)^2 + ${fmt(kv)} = ${A === '' ? '' : A + '\\,'}\\left[\\left(${texU}\\right)^2 + ${fmt(k * k)}\\right]`],
                        ['Paso 2 — Sustitución directa u = x + h:', `\\int \\dfrac{du}{${A === '' ? '' : A + '\\,'}(u^2 + ${fmt(k * k)})}`],
                        ['Paso 3 — Forma canónica del arctangente:', `\\dfrac{1}{${fmt(a2 * k)}}\\arctan\\!\\left(\\dfrac{u}{${fmt(k)}}\\right) + C`]
                    ]
                };
            }

            // ∫ (mx+n)dx/(ax²+bx+c) → parte log + parte arctan
            case 'rational-ln': {
                if (!(a2 > 0 && disc < 0)) {
                    return { error: 'Usa un denominador sin raíces reales: requiere a > 0 y Δ < 0 (ej. a=1, b=4, c=13).' };
                }
                const m = 1;                       // pendiente fija: el control extra aporta n
                const lambda = m / (2 * a2);       // mx+n = λ(2ax+b) + μ
                const mu = n - lambda * b2;
                const k = Math.sqrt(kv / a2);
                const texNum = texLineal(m, n);
                const pasoArctan = mu === 0
                    ? '\\text{el residuo } \\mu = 0\\text{: no hay parte arctan}'
                    : `\\mu\\int \\dfrac{du}{${A === '' ? '' : A + '\\,'}\\left(u^2 + ${fmt(k * k)}\\right)} = \\dfrac{${fmt(mu)}}{${fmt(a2 * k)}}\\arctan\\!\\left(\\dfrac{u}{${fmt(k)}}\\right)`;
                return {
                    func: x => (m * x + n) / f(x),
                    F: x => lambda * Math.log(f(x)) + (mu / (a2 * k)) * Math.atan(u(x) / k),
                    texF: mu === 0
                        ? `${fmt(lambda)}\\ln\\!\\left(${texF2}\\right)`
                        : `${fmt(lambda)}\\ln\\!\\left(${texF2}\\right) + \\dfrac{${fmt(mu)}}{${fmt(a2 * k)}}\\arctan\\!\\left(\\dfrac{${texU}}{${fmt(k)}}\\right)`,
                    resultadoTex: `\\int \\dfrac{${texNum}}{${texF2}}dx = ${mu === 0
                        ? fmt(lambda) + '\\ln\\!\\left(' + texF2 + '\\right)'
                        : fmt(lambda) + '\\ln\\!\\left(' + texF2 + '\\right) + \\dfrac{' + fmt(mu) + '}{' + fmt(a2 * k) + '}\\arctan\\!\\left(\\dfrac{' + texU + '}{' + fmt(k) + '}\\right)'} + C`,
                    pasos: [
                        ['Paso 1 — Separar la derivada del denominador:', `${texNum} = \\underbrace{${fmt(lambda)}}_{\\lambda}\\left(2${fmt(a2)}x ${b2 >= 0 ? '+' : '-'} ${fmt(Math.abs(b2))}\\right) + \\underbrace{${fmt(mu)}}_{\\mu}`],
                        ['Paso 2 — Parte logarítmica (∫ f′/f):', `\\lambda\\int \\dfrac{f'(x)}{f(x)}\\,dx = ${fmt(lambda)}\\ln\\!\\left(${texF2}\\right) \;\;(\mathrm{positivo:}\ a>0,\ \Delta<0)`],
                        ['Paso 3 — Parte restante con cuadrada completa:', pasoArctan],
                        ['Paso 4 — Unir ambas piezas:', `\\text{Resultado} = \\text{parte } \\ln \\;+\\; \\text{parte } \\arctan \\;+\\; C`]
                    ]
                };
            }

            // ∫ dx/√(ax²+bx+c), a<0 y máximo positivo → arco seno (semicírculo)
            case 'sqrt-circle': {
                if (!(a2 < 0 && kv > 0)) {
                    return { error: 'La raíz exige valores positivos del trinomio: esta familia necesita a < 0 y c − b²/(4a) > 0 (ej. a=−1, b=−4, c=5).' };
                }
                const R = Math.sqrt(kv / (-a2));   // f = |a|(R² − (x+h)²)
                const sa = Math.sqrt(-a2);
                return {
                    func: x => (f(x) > 1e-12 ? 1 / Math.sqrt(f(x)) : NaN),
                    F: x => (1 / sa) * Math.asin(Math.max(-1, Math.min(1, u(x) / R))),
                    texF: `\\dfrac{1}{${fmt(sa)}}\\arcsin\\!\\left(\\dfrac{${texU}}{${fmt(R)}}\\right)`,
                    resultadoTex: `\\int \\dfrac{dx}{\\sqrt{${texF2}}} = \\dfrac{1}{\\sqrt{${fmt(-a2)}}}\\arcsin\\!\\left(\\dfrac{${texU}}{${fmt(R)}}\\right) + C`,
                    dominio: [-h - R, -h + R],
                    pasos: [
                        ['Paso 1 — Completar la cuadrada (a < 0):', `${texF2} = ${fmt(-a2)}\\left[${fmt(R * R)} - \\left(${texU}\\right)^2\\right]`],
                        ['Paso 2 — Extraer la constante del radical:', `\\sqrt{${texF2}} = ${coefMul(sa)}\\sqrt{${fmt(R * R)} - \\left(${texU}\\right)^2}`],
                        ['Paso 3 — Forma canónica del arco seno:', `\\dfrac{1}{\\sqrt{${fmt(-a2)}}}\\arcsin\\!\\left(\\dfrac{${texU}}{${fmt(R)}}\\right) + C`],
                        ['Dominio (semicírculo de radio R):', `f(x) > 0 \\iff \\left(${texU}\\right)^2 < ${fmt(R * R)} \\iff ${fmt(-h - R)} < x < ${fmt(-h + R)}`]
                    ]
                };
            }

            // ∫ dx/√(ax²+bx+c), a>0 y Δ<0 → logaritmo (forma hiperbólica)
            case 'sqrt-hyper': {
                if (!(a2 > 0 && disc < 0)) {
                    return { error: 'Esta familia pide a > 0 y Δ < 0 (radicando siempre positivo). Ej. a=1, b=0, c=1 o a=1, b=2, c=5.' };
                }
                const k = Math.sqrt(kv / a2);
                const sa = Math.sqrt(a2);
                return {
                    func: x => 1 / Math.sqrt(f(x)),
                    F: x => (1 / sa) * Math.log(sa * u(x) + Math.sqrt(f(x))),
                    texF: `\\dfrac{1}{\\sqrt{${fmt(a2)}}}\\ln\\left|\\sqrt{${fmt(a2)}}\\left(${texU}\\right)+\\sqrt{${texF2}}\\right|`,
                    resultadoTex: `\\int \\dfrac{dx}{\\sqrt{${texF2}}} = \\dfrac{1}{\\sqrt{${fmt(a2)}}}\\ln\\left|\\sqrt{${fmt(a2)}}\\left(${texU}\\right)+\\sqrt{${texF2}}\\right| + C`,
                    pasos: [
                        ['Paso 1 — Completar la cuadrada:', `${texF2} = ${A === '' ? '' : A + '\\,'}\\left[\\left(${texU}\\right)^2 + ${fmt(k * k)}\\right]`],
                        ['Paso 2 — Forma canónica hiperbólica:', `\\int \\dfrac{du}{\\sqrt{u^2+k^2}} = \\ln\\left|u+\\sqrt{u^2+k^2}\\right| + C`],
                        ['Paso 3 — Regresar a x (constantes absorbidas en C):', `\\dfrac{1}{\\sqrt{${fmt(a2)}}}\\ln\\left|\\sqrt{${fmt(a2)}}\\left(${texU}\\right)+\\sqrt{${texF2}}\\right| + C`]
                    ]
                };
            }

            // ∫ e^{-(ax²+bx+c)} dx → campana gaussiana desplazada (función erf)
            case 'exp-square': {
                if (a2 <= 0) {
                    return { error: 'La campana e^{−(ax²+bx+c)} necesita a > 0 (parábola hacia arriba). Prueba a=1, b=0, c=0.' };
                }
                const s = Math.sqrt(a2);
                const erfApprox = z => { // Abramowitz-Stegun 7.1.26 (|error| < 1.5e-7)
                    const sign = z < 0 ? -1 : 1;
                    const t = 1 / (1 + 0.3275911 * Math.abs(z));
                    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
                    return sign * y;
                };
                return {
                    func: x => Math.exp(-kv) * Math.exp(-a2 * u(x) * u(x)),
                    F: x => (Math.sqrt(Math.PI) / (2 * s)) * Math.exp(-kv) * erfApprox(s * u(x)),
                    texF: `\\dfrac{\\sqrt{\\pi}\\,e^{-${fmt(kv)}}}{2\\sqrt{${fmt(a2)}}}\\operatorname{erf}\\!\\left(\\sqrt{${fmt(a2)}}\\left(${texU}\\right)\\right)`,
                    resultadoTex: `\\int e^{-(${texF2})}dx = \\dfrac{\\sqrt{\\pi}\\,e^{-${fmt(kv)}}}{2\\sqrt{${fmt(a2)}}}\\operatorname{erf}\\!\\left(\\sqrt{${fmt(a2)}}\\left(${texU}\\right)\\right) + C`,
                    pasos: [
                        ['Paso 1 — Completar la cuadrada:', `${texF2} = ${fmt(a2)}\\left(${texU}\\right)^2 + ${fmt(kv)}`],
                        ['Paso 2 — Factorizar la campana:', `e^{-(${texF2})} = e^{-${fmt(kv)}}\\, e^{-${fmt(a2)}\\left(${texU}\\right)^2}`],
                        ['Paso 3 — Integral gaussiana tabulada:', `\\int e^{-c^2t^2}dt = \\dfrac{\\sqrt{\\pi}}{2c}\\operatorname{erf}(ct) + C,\\qquad c = \\sqrt{${fmt(a2)}}`],
                        ['Paso 4 — Resultado (antiderivada no elemental):', `\\dfrac{\\sqrt{\\pi}\\,e^{-${fmt(kv)}}}{2\\sqrt{${fmt(a2)}}}\\operatorname{erf}\\!\\left(\\sqrt{${fmt(a2)}}\\left(${texU}\\right)\\right) + C`],
                        ['Nota sobre erf:', `\\operatorname{erf}(z)=\\dfrac{2}{\\sqrt{\\pi}}\\int_0^z e^{-t^2}dt,\\qquad \\text{(la verificación numérica usa Simpson)}`]
                    ]
                };
            }

            default:
                return { error: 'Familia desconocida.' };
        }
    }

    function renderizarFormula(elemento, formula, displayMode = false) {
        if (typeof katex !== 'undefined') {
            try {
                katex.render(formula, elemento, { displayMode: displayMode, throwOnError: false });
            } catch (e) {
                elemento.textContent = formula;
            }
        } else {
            elemento.textContent = formula;
        }
    }

    function parrafoConFormula(textoAntes, latex, textoDespues) {
        const p = document.createElement('p');
        if (textoAntes) p.appendChild(document.createTextNode(textoAntes));
        const span = document.createElement('span');
        renderizarFormula(span, latex, false);
        p.appendChild(span);
        if (textoDespues) p.appendChild(document.createTextNode(textoDespues));
        return p;
    }

    function crearPaso(titulo, nodos) {
        const paso = document.createElement('div');
        paso.className = 'paso-resuelto';
        const h = document.createElement('h4');
        h.textContent = titulo;
        paso.appendChild(h);
        nodos.forEach(nd => paso.appendChild(nd));
        return paso;
    }

    function graficar(cfg, a, b, a2, b2, c2) {
        const contenedor = document.getElementById('grafico');
        const n = 400;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            xs.push(x);
            const y = cfg.func(x);
            ys.push(isFinite(y) ? y : null);
        }
        const trazas = [{
            x: xs, y: ys, mode: 'lines', name: 'integrando', connectgaps: false,
            line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(234,128,252,0.30)'
        }];

        // Parábola auxiliar ax²+bx+c escalada para convivir con el integrando
        const ps = [], py = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            ps.push(x);
            py.push(a2 * x * x + b2 * x + c2);
        }
        const maxParab = Math.max(...py.map(Math.abs), 1e-9);
        const valsY = ys.filter(v => v !== null && isFinite(v)).map(Math.abs);
        const escala = valsY.length ? Math.max(...valsY) / maxParab : 1;
        trazas.push({
            x: ps, y: py.map(v => v * escala), mode: 'lines', name: 'ax²+bx+c (escalada)',
            line: { color: '#4dd0e1', width: 2, dash: 'dot' }
        });

        // Vértice de la parábola
        const hV = -b2 / (2 * a2);
        if (hV >= Math.min(a, b) && hV <= Math.max(a, b)) {
            trazas.push({
                x: [hV], y: [(c2 - b2 * b2 / (4 * a2)) * escala], mode: 'markers',
                name: 'vértice', marker: { color: '#ffd54f', size: 9, symbol: 'diamond' }
            });
        }

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'Completar la cuadrada: el integrando (orquídea) sobre su trinomio (cian punteado)', font: { color: '#b388ff' } },
            xaxis: { title: 'x', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
            yaxis: { title: 'y', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
            showlegend: true,
            legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(30,17,51,0.8)', font: { size: 11 } },
            margin: { t: 60, r: 20, b: 50, l: 60 }
        };

        Plotly.newPlot(contenedor, trazas, layout, { responsive: true });
    }

    function mostrarResultados(cfg, a, b) {
        divResultados.innerHTML = '';

        const valorExacto = cfg.F(b) - cfg.F(a);

        const nS = 400, lo = Math.min(a, b), hi = Math.max(a, b), hStep = (hi - lo) / nS;
        let suma = cfg.func(lo) + cfg.func(hi);
        for (let i = 1; i < nS; i++) {
            const y = cfg.func(lo + i * hStep);
            suma += (i % 2 === 1 ? 4 : 2) * (isFinite(y) ? y : 0);
        }
        suma *= hStep / 3;

        cfg.pasos.forEach(([titulo, latex]) => {
            divResultados.appendChild(crearPaso(titulo, [parrafoConFormula('', latex, '')]));
        });

        const pEval = parrafoConFormula('Evaluando con el TFC: ',
            `\\left[ ${cfg.texF} \\right]_{${fmt(a)}}^{${fmt(b)}} = ${valorExacto.toFixed(6)}`, '');
        const pVer = document.createElement('p');
        pVer.className = 'verificacion';
        pVer.appendChild(document.createTextNode('✔ Verificación numérica (Simpson, n=' + nS + '): '));
        const spanVer = document.createElement('span');
        renderizarFormula(spanVer, `\\approx ${suma.toFixed(6)}`, false);
        pVer.appendChild(spanVer);
        divResultados.appendChild(crearPaso('Valor de la integral definida:', [pEval, pVer]));

        const finalBox = document.createElement('div');
        finalBox.className = 'resultado-final';
        const hFinal = document.createElement('h4');
        hFinal.textContent = '🏁 Resultado general:';
        finalBox.appendChild(hFinal);
        const spanFinal = document.createElement('span');
        renderizarFormula(spanFinal, cfg.resultadoTex, true);
        finalBox.appendChild(spanFinal);
        divResultados.appendChild(finalBox);

        const nota = document.createElement('p');
        nota.className = 'nota-educativa';
        nota.textContent = '💡 Truco de comprobación: deriva tu F(x). Si vuelve a aparecer el integrando original, la cuadrada quedó bien completada. El término que suele fallar es el desplazamiento h = b/(2a): ¡conserva su signo!';
        divResultados.appendChild(nota);
    }

    btnCalcular.addEventListener('click', function() {
        const clave = selectIntegral.value;
        const a2 = parseFloat(inputA2.value);
        const b2 = parseFloat(inputB2.value);
        const c2 = parseFloat(inputC2.value);
        const n = parseFloat(inputN.value);
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);

        if ([a2, b2, c2, n, a, b].some(v => isNaN(v))) {
            alert('Por favor, ingrese valores numéricos válidos en todos los campos.');
            return;
        }
        if (a === b) {
            alert('Los límites de integración deben ser diferentes.');
            return;
        }

        const cfg = construirConfig(clave, a2, b2, c2, n);
        if (cfg.error) {
            alert(cfg.error);
            return;
        }

        // Singularidades / dominio
        const lo = Math.min(a, b), hi = Math.max(a, b);
        const disc = b2 * b2 - 4 * a2 * c2;
        if (disc >= 0 && (clave === 'rational-arctan' || clave === 'rational-ln')) {
            const r1 = (-b2 - Math.sqrt(disc)) / (2 * a2), r2 = (-b2 + Math.sqrt(disc)) / (2 * a2);
            const rMin = Math.min(r1, r2), rMax = Math.max(r1, r2);
            if (rMin <= hi && rMax >= lo && !(rMax < lo || rMin > hi)) {
                // alguna raíz cae dentro del intervalo
                const raizDentro = (r1 >= lo && r1 <= hi) || (r2 >= lo && r2 <= hi);
                if (raizDentro) {
                    alert('El intervalo cruza una raíz real del denominador: hay asíntota vertical y la integral definida diverge.');
                    return;
                }
            }
        }
        if (cfg.dominio && (lo < cfg.dominio[0] || hi > cfg.dominio[1])) {
            alert(`La raíz exige x ∈ (${fmt(cfg.dominio[0])}, ${fmt(cfg.dominio[1])}) — el semicírculo. Ajusta los límites.`);
            return;
        }

        graficar(cfg, a, b, a2, b2, c2);
        mostrarResultados(cfg, a, b);
    });

    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputA2.value), parseFloat(inputB2.value), parseFloat(inputC2.value), parseFloat(inputN.value));
    if (!cfgInicial.error) {
        graficar(cfgInicial, parseFloat(inputA.value), parseFloat(inputB.value), parseFloat(inputA2.value), parseFloat(inputB2.value), parseFloat(inputC2.value));
    }
});
