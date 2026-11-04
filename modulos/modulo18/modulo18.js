// ===== MÓDULO 18: INTEGRALES TRIGONOMÉTRICAS CON PRODUCTOS DE SENO Y COSENO =====

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
    const inputK = document.getElementById('param-k');
    const inputA = document.getElementById('a');
    const inputB = document.getElementById('b');
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    function fmt(v) {
        // Formatea números para LaTeX: enteros sin decimales, redondeo a 3 cifras.
        const r = Math.round(v * 1000) / 1000;
        return String(r);
    }

    function signedTex(v) {
        // "+3" o "-2.5" para concatenar dentro de LaTeX.
        const r = Math.round(v * 1000) / 1000;
        return (r >= 0 ? '+' : '-') + ' ' + Math.abs(r);
    }

    // Construye la configuración completa de cada familia con su parámetro k.
    function construirConfig(clave, k) {

        const configs = {
            sen2: {
                texIntegrando: `\\int \\sin^2(${fmt(k)}x)\\,dx`,
                func: x => Math.pow(Math.sin(k * x), 2),
                F: x => x / 2 - Math.sin(2 * k * x) / (4 * k),
                resultadoTex: `\\int \\sin^2(${fmt(k)}x)\\,dx = \\frac{x}{2} - \\frac{\\sin(${fmt(2 * k)}x)}{${fmt(4 * k)}} + C`,
                estrategia: 'Potencia par → identidad de ángulo doble $\\sin^2\\theta=\\tfrac{1-\\cos 2\\theta}{2}$',
                pasos: [
                    ['Paso 1 — Aplicar la identidad de ángulo doble:', `\\sin^2(${fmt(k)}x) = \\frac{1-\\cos(${fmt(2 * k)}x)}{2}`],
                    ['Paso 2 — Integrar término a término:', `\\int \\frac{1-\\cos(${fmt(2 * k)}x)}{2}\\,dx = \\frac{x}{2} - \\frac{\\sin(${fmt(2 * k)}x)}{2\\cdot ${fmt(2 * k)}}`],
                    ['Paso 3 — Resultado:', `\\frac{x}{2} - \\frac{\\sin(${fmt(2 * k)}x)}{${fmt(4 * k)}} + C`]
                ]
            },

            senxcos: {
                texIntegrando: `\\int \\sin(${fmt(k)}x)\\cos(${fmt(k)}x)\\,dx`,
                func: x => Math.sin(k * x) * Math.cos(k * x),
                F: x => Math.pow(Math.sin(k * x), 2) / (2 * k),
                resultadoTex: `\\int \\sin(${fmt(k)}x)\\cos(${fmt(k)}x)\\,dx = \\frac{\\sin^2(${fmt(k)}x)}{${fmt(2 * k)}} + C`,
                estrategia: 'Producto mixto → sustitución inmediata $u=\\sin(kx)$',
                pasos: [
                    ['Paso 1 — Sustitución:', `u = \\sin(${fmt(k)}x) \\quad\\Rightarrow\\quad du = ${fmt(k)}\\cos(${fmt(k)}x)\\,dx`],
                    ['Paso 2 — Integral en u:', `\\int u\\,\\frac{du}{${fmt(k)}} = \\frac{u^2}{${fmt(2 * k)}} + C`],
                    ['Paso 3 — Regresar:', `\\frac{\\sin^2(${fmt(k)}x)}{${fmt(2 * k)}} + C`]
                ]
            },

            sen3cos2: {
                texIntegrando: `\\int \\sin^3(x)\\,\\cos^2(x)\\,dx`,
                func: x => Math.pow(Math.sin(x), 3) * Math.pow(Math.cos(x), 2),
                // Caso clásico (ambos exponentes enteros): u = cos x ⇒ ∫(u⁴−u²)du
                F: x => Math.pow(Math.cos(x), 5) / 5 - Math.pow(Math.cos(x), 3) / 3,
                resultadoTex: `\\int \\sin^3 x\\,\\cos^2 x\\,dx = \\frac{\\cos^5 x}{5} - \\frac{\\cos^3 x}{3} + C`,
                estrategia: 'Exponente impar → separar un factor $\\sin x$ y usar $\\sin^2 x = 1-\\cos^2 x$',
                pasos: [
                    ['Paso 1 — Separar el factor seno impar:', `\\sin^3 x\\,\\cos^2 x = (1-\\cos^2 x)\\,\\cos^2 x\\,\\sin x`],
                    ['Paso 2 — Sustitución $u=\\cos x$, $du=-\\sin x\\,dx$:', `-\\int (1-u^2)u^2\\,du = \\int (u^4-u^2)\\,du = \\frac{u^5}{5}-\\frac{u^3}{3}+C`],
                    ['Paso 3 — Regresar ($u=\\cos x$):', `\\frac{\\cos^5 x}{5}-\\frac{\\cos^3 x}{3}+C`]
                ]
            },

            prodsum: {
                texIntegrando: `\\int \\sin(${fmt(k)}x)\\cos(2x)\\,dx`,
                func: x => Math.sin(k * x) * Math.cos(2 * x),
                F: x => {
                    // ½[∫sin((k+2)x)dx + ∫sin((k−2)x)dx] = ½[−cos(px)/p − cos(mx)/m]; si m=0 ese término es 0
                    const p = k + 2, m = k - 2;
                    const t1 = -Math.cos(p * x) / p;
                    const t2 = Math.abs(m) < 1e-9 ? 0 : -Math.cos(m * x) / m;
                    return 0.5 * (t1 + t2);
                },
                resultadoTex: '', estrategia: '', pasos: []
            }
        };

        // ── Familia "producto–suma": se arma dinámicamente según k ───────────
        if (clave === 'prodsum') {
            const p = k + 2, m = k - 2;
            const casoDegenerado = Math.abs(m) < 1e-9;
            configs.prodsum = {
                texIntegrando: `\\int \\sin(${fmt(k)}x)\\cos(2x)\\,dx`,
                func: x => Math.sin(k * x) * Math.cos(2 * x),
                F: x => {
                    const t1 = -Math.cos(p * x) / p;
                    const t2 = casoDegenerado ? 0 : -Math.cos(m * x) / m;
                    return 0.5 * (t1 + t2);
                },
                resultadoTex: casoDegenerado
                    ? `\\int \\sin(${fmt(k)}x)\\cos(2x)\\,dx = \\frac{\\sin(${fmt(2 * k)}x)}{${fmt(4 * k)}} + C`
                    : `\\int \\sin(${fmt(k)}x)\\cos(2x)\\,dx = -\\frac{\\cos(${fmt(p)}x)}{${fmt(2 * p)}} + \\frac{\\cos(${fmt(m)}x)}{${fmt(2 * m)}} + C`,
                estrategia: 'Frecuencias distintas → identidad producto–suma $\\sin A\\cos B = \\tfrac12[\\sin(A+B)+\\sin(A-B)]$',
                pasos: casoDegenerado ? [
                    ['Paso 1 — Con $k=2$ es el producto mixto clásico:', `\\sin(2x)\\cos(2x) = \\frac{\\sin(4x)}{2}`],
                    ['Paso 2 — Integrar el seno:', `\\int \\frac{\\sin(4x)}{2}\\,dx = \\frac{\\sin(4x)}{8} + C`],
                    ['Paso 3 — Resultado:', `\\frac{\\sin(${fmt(2 * k)}x)}{${fmt(4 * k)}} + C`]
                ] : [
                    ['Paso 1 — Identidad producto–suma:', `\\sin(${fmt(k)}x)\\cos(2x) = \\frac{1}{2}\\left[\\sin(${fmt(p)}x) + \\sin(${fmt(m)}x)\\right]`],
                    ['Paso 2 — Integrar cada seno:', `\\frac{1}{2}\\left[-\\frac{\\cos(${fmt(p)}x)}{${fmt(p)}} - \\frac{\\cos(${fmt(m)}x)}{${fmt(m)}}\\right] + C`],
                    ['Paso 3 — Resultado:', `-\\frac{\\cos(${fmt(p)}x)}{${fmt(2 * p)}} + \\frac{\\cos(${fmt(m)}x)}{${fmt(2 * m)}} + C`]
                ]
            };
        }

        return configs[clave];
    }

    function renderizarFormula(elemento, formula, displayMode = false) {
        if (typeof katex !== 'undefined') {
            katex.render(formula, elemento, { displayMode: displayMode, throwOnError: false });
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
        nodos.forEach(n => paso.appendChild(n));
        return paso;
    }

    function graficar(cfg, a, b) {
        const contenedor = document.getElementById('grafico');
        const n = 400;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            const y = cfg.func(x);
            xs.push(x);
            ys.push(isFinite(y) ? y : null);
        }

        const trazas = [{
            x: xs, y: ys, mode: 'lines', name: 'f(x) = producto trig.',
            line: { color: '#4dd0e1', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(77,208,225,0.25)'
        }];

        const Fs = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            const v = cfg.F(x);
            Fs.push(isFinite(v) ? v : null);
        }
        trazas.push({
            x: xs.slice(), y: Fs, mode: 'lines', name: 'F(x) antiderivada',
            line: { color: '#ea80fc', width: 2.5, dash: 'dash' }
        });

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'Producto de seno y coseno (cian) y su antiderivada F(x) (orquídea punteada)', font: { color: '#b388ff' } },
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

        const pEstr = parrafoConFormula('Estrategia elegida: ', cfg.estrategia.replace(/\$/g, ''), '');
        divResultados.appendChild(crearPaso('🧭 Estrategia', [pEstr]));

        cfg.pasos.forEach(([titulo, latex]) => {
            divResultados.appendChild(crearPaso(titulo, [parrafoConFormula('', latex, '')]));
        });

        const valorExacto = cfg.F(b) - cfg.F(a);

        // Simpson para verificación cruzada
        const nS = 800;
        const lo = Math.min(a, b), hi = Math.max(a, b);
        const g = x => { const v = cfg.func(x); return isFinite(v) ? v : 0; };
        let suma = 0;
        const h = (hi - lo) / nS;
        suma = g(lo) + g(hi);
        for (let i = 1; i < nS; i++) suma += (i % 2 === 1 ? 4 : 2) * g(lo + i * h);
        suma *= h / 3;

        const pEval = parrafoConFormula('Evaluando con el TFC: ',
            `F(${fmt(b)}) - F(${fmt(a)}) = ${valorExacto.toFixed(6)}`, '');
        const pVer = document.createElement('p');
        pVer.className = 'verificacion';
        pVer.appendChild(document.createTextNode('✔ Verificación numérica (Simpson, n=' + nS + '): '));
        const spanVer = document.createElement('span');
        renderizarFormula(spanVer, `\\approx ${suma.toFixed(4)}`, false);
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
        nota.textContent = '💡 Comprueba derivando tu respuesta: las funciones trigonométricas son periódicas, así que varias antiderivadas "distintas" pueden diferir solo en una constante. Deriva y compara punto a punto con el integrando.';
        divResultados.appendChild(nota);
    }

    btnCalcular.addEventListener('click', function() {
        const clave = selectIntegral.value;
        const k = parseFloat(inputK.value);
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);

        if (isNaN(k) || isNaN(a) || isNaN(b)) { alert('Todos los valores deben ser números válidos.'); return; }
        if (a === b) { alert('Los límites de integración deben ser diferentes.'); return; }
        if (k === 0) { alert('El parámetro k debe ser distinto de 0.'); return; }

        const cfg = construirConfig(clave, k);

        graficar(cfg, a, b);
        mostrarResultados(cfg, a, b);
    });

    // Gráfica inicial
    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputK.value));
    graficar(cfgInicial, parseFloat(inputA.value), parseFloat(inputB.value));
});
