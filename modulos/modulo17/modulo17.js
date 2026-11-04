// ===== MÓDULO 17: INTEGRALES DE FRACCIONES IRRACIONALES =====

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
    const inputP = document.getElementById('param-p');
    const inputN = document.getElementById('param-n');
    const inputS = document.getElementById('param-s');
    const inputAlpha = document.getElementById('alpha');
    const inputBeta = document.getElementById('beta');
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

    // Construye la configuración completa de cada familia con sus parámetros.
    function construirConfig(clave, p) {
        const k = p.k, alfa = p.alfa, beta = p.beta, par = p.par, n = p.n, s = p.s;

        const configs = {
            raizlineal: {
                texIntegrando: `\\int \\frac{${fmt(k)}}{${fmt(par)}\\sqrt{x ${signedTex(-alfa)}}}\\,dx`,
                func: x => k / (par * Math.sqrt(Math.max(x - alfa, 1e-12))),
                F: x => (2 * k / par) * Math.sqrt(Math.max(x - alfa, 0)),
                resultadoTex: `\\int \\frac{${fmt(k)}\\,dx}{${fmt(par)}\\sqrt{x ${signedTex(-alfa)}}} = \\frac{${fmt(2 * k / par)}}{1}\\sqrt{x ${signedTex(-alfa)}} + C`,
                dominio: x => x > alfa,
                avisoDominio: `La raíz $\\sqrt{x ${signedTex(-alfa)}}$ exige $x ${alfa < 0 ? '>' : '>'} ${fmt(alfa)}$. Ajusta los límites.`,
                sustitucion: `t = \\sqrt{x ${signedTex(-alfa)}}`,
                pasos: [
                    ['Paso 1 — Sustitución racionalizante:', `t=\\sqrt{x ${signedTex(-alfa)}} \\quad\\Rightarrow\\quad x=t^2${signedTex(alfa)},\\qquad dx=2t\\,dt`],
                    ['Paso 2 — La integral se vuelve racional en t:', `\\int \\frac{${fmt(k)}}{${fmt(par)}\\,t}\\,2t\\,dt = \\frac{${fmt(2 * k / par)}}{1}\\int dt`],
                    ['Paso 3 — Integrar y regresar:', `\\frac{${fmt(2 * k / par)}}{1}\\,t + C = \\frac{${fmt(2 * k / par)}}{1}\\sqrt{x ${signedTex(-alfa)}} + C`]
                ]
            },

            arcoseno: {
                texIntegrando: `\\int \\frac{${fmt(k)}}{\\sqrt{(x ${signedTex(-alfa)})(${fmt(beta)}-x)}}\\,dx`,
                func: x => {
                    const prod = (x - alfa) * (beta - x);
                    return prod > 0 ? k / Math.sqrt(prod) : NaN;
                },
                // F(x) = k·arcsen((2x−α−β)/(β−α))  (derivada exacta verificada)
                F: x => k * Math.asin(Math.min(1, Math.max(-1, (2 * x - alfa - beta) / (beta - alfa)))),
                resultadoTex: `\\int \\frac{${fmt(k)}\\,dx}{\\sqrt{(x ${signedTex(-alfa)})(${fmt(beta)}-x)}} = ${fmt(k)}\\arcsin\\!\\left(\\frac{2x ${signedTex(-alfa - beta)}}{${fmt(beta - alfa)}}\\right) + C`,
                dominio: x => (x - alfa) * (beta - x) > 0,
                avisoDominio: `El producto $(x ${signedTex(-alfa)})(${fmt(beta)}-x)$ debe ser positivo: integra dentro de (${fmt(alfa)}, ${fmt(beta)}).`,
                sustitucion: `u = x - \\frac{${fmt(alfa + beta)}}{2}`,
                pasos: [
                    ['Paso 1 — Expandir y completar cuadrado:', `(x ${signedTex(-alfa)})(${fmt(beta)}-x) = -x^2 ${signedTex(alfa + beta)}x ${signedTex(-alfa * beta)} = \\left(\\frac{${fmt(beta - alfa)}}{2}\\right)^2 - \\left(x - \\frac{${fmt(alfa + beta)}}{2}\\right)^2`],
                    ['Paso 2 — Fórmula $\\int \\frac{du}{\\sqrt{R^2-u^2}}=\\arcsin(u/R)+C$:', `u = x - \\frac{${fmt(alfa + beta)}}{2}, \\qquad R = \\frac{${fmt(beta - alfa)}}{2}`],
                    ['Paso 3 — Resultado:', `${fmt(k)}\\arcsin\\!\\left(\\frac{2x ${signedTex(-alfa - beta)}}{${fmt(beta - alfa)}}\\right) + C`]
                ]
            },

            linealsobreRaiz: {
                texIntegrando: `\\int \\frac{${fmt(k)}(x ${signedTex(n)})}{\\sqrt{x^2 ${signedTex(par)}x + q}}\\,dx`,
                // Se resuelve internamente con q fijo = par (mantener simple): x²+p x+q con q=|p|+1 para que sea irredible si p pequeño
                func: null, F: null, resultadoTex: '', dominio: null, avisoDominio: '', sustitucion: '', pasos: []
            },

            cocienteRaiz: {
                texIntegrando: `\\int \\frac{${fmt(k)}\\sqrt{x}}{\\sqrt{x} ${signedTex(s)}}\\,dx`,
                func: x => {
                    if (x < 0) return NaN;
                    const t = Math.sqrt(x);
                    return Math.abs(t + s) < 1e-9 ? NaN : k * t / (t + s);
                },
                // t=√x: ∫ k·t/(t+s)·2t dt = 2k∫ t²/(t+s) dt = 2k[ t²/2 − s·t + s²ln|t+s| ]
                F: x => {
                    const t = Math.sqrt(Math.max(x, 0));
                    return 2 * k * (t * t / 2 - s * t + s * s * Math.log(Math.abs(t + s) + 1e-12));
                },
                resultadoTex: `\\int \\frac{${fmt(k)}\\sqrt{x}}{\\sqrt{x} ${signedTex(s)}}\\,dx = ${fmt(k)}\\left(x ${signedTex(-2 * s)}\\sqrt{x} ${signedTex(2 * s * s)}\\ln\\left|\\sqrt{x} ${signedTex(s)}\\right|\\right) + C`,
                dominio: x => x >= 0 && Math.abs(Math.sqrt(x) + s) > 1e-9,
                avisoDominio: `Requiere $x \\geq 0$ y $\\sqrt{x} ${signedTex(s)} \\neq 0$. Revisa los límites (y el signo de s).`,
                sustitucion: `t = \\sqrt{x}`,
                pasos: [
                    ['Paso 1 — Sustitución:', `t=\\sqrt{x} \\Rightarrow x=t^2,\\; dx=2t\\,dt \\Rightarrow \\int \\frac{${fmt(k)}\\,t}{t ${signedTex(s)}}\\,2t\\,dt = ${fmt(2 * k)}\\int \\frac{t^2}{t ${signedTex(s)}}\\,dt`],
                    [`Paso 2 — División polinomial:`, `\\frac{t^2}{t ${signedTex(s)}} = t ${signedTex(-s)} + \\frac{${fmt(s * s)}}{t ${signedTex(s)}}`],
                    ['Paso 3 — Integrar en t y regresar:', `${fmt(2 * k)}\\left(\\frac{t^2}{2} ${signedTex(-s)}t + ${fmt(s * s)}\\ln|t ${signedTex(s)}|\\right)+C,\\quad t=\\sqrt{x}`]
                ]
            },

            potenciaFracc: {
                texIntegrando: `\\int ${fmt(k)}\\,(x ${signedTex(-alfa)})^{5/2}\\,dx`,
                func: x => {
                    const b = x - alfa;
                    return b >= 0 ? k * Math.pow(b, 5 / 2) : NaN;
                },
                F: x => {
                    const b = x - alfa;
                    return b >= 0 ? k * (2 / 7) * Math.pow(b, 7 / 2) : NaN;
                },
                resultadoTex: `\\int ${fmt(k)}(x ${signedTex(-alfa)})^{5/2}dx = \\frac{${fmt(2 * k)}}{7}(x ${signedTex(-alfa)})^{7/2} + C`,
                dominio: x => x - alfa >= 0,
                avisoDominio: `La potencia $5/2$ exige $x ${signedTex(-alfa)} \\geq 0$, i.e. $x \\geq ${fmt(alfa)}$.`,
                sustitucion: `u = x ${signedTex(-alfa)}`,
                pasos: [
                    ['Paso 1 — Escribir como fracción irracional:', `(x ${signedTex(-alfa)})^{5/2} = \\left(\\sqrt{x ${signedTex(-alfa)}}\\right)^5 = \\sqrt{(x ${signedTex(-alfa)})^5}`],
                    ['Paso 2 — Regla de la potencia con u = x ' + signedTex(-alfa) + ':', `${fmt(k)}\\int u^{5/2}\\,du = ${fmt(k)}\\cdot\\frac{u^{7/2}}{7/2} + C = \\frac{${fmt(2 * k)}}{7}u^{7/2}+C`],
                    ['Paso 3 — Regresar:', `\\frac{${fmt(2 * k)}}{7}(x ${signedTex(-alfa)})^{7/2} + C`]
                ]
            }
        };

        // Familia "lineal sobre raíz" con trinomio x²+px+q (q derivado de p para mantenerlo manejable)
        if (clave === 'linealsobreRaiz') {
            const q = Math.abs(par) + 1;               // trinomio casi siempre irredible
            const lam = k / 2;                          // λ: m=k, a=1 ⇒ λ = k/2
            const mu = k * n - lam * par;               // μ = k·n − λ·p
            const h0 = -par / 2;
            configs.linealsobreRaiz = {
                texIntegrando: `\\int \\frac{${fmt(k)}(x ${signedTex(n)})}{\\sqrt{x^2 ${signedTex(par)}x + ${fmt(q)}}}\\,dx`,
                func: x => k * (x + n) / Math.sqrt(x * x + par * x + q),
                F: x => 2 * lam * Math.sqrt(x * x + par * x + q)
                     + mu * Math.log(Math.abs(x - h0 + Math.sqrt(x * x + par * x + q)) + 1e-12),
                resultadoTex: `\\int \\frac{${fmt(k)}(x ${signedTex(n)})\\,dx}{\\sqrt{x^2 ${signedTex(par)}x + ${fmt(q)}}} = ${fmt(2 * lam)}\\sqrt{x^2 ${signedTex(par)}x + ${fmt(q)}} ${signedTex(mu)}\\ln\\left|x + \\frac{${fmt(par)}}{2} + \\sqrt{x^2 ${signedTex(par)}x + ${fmt(q)}}\\right| + C`,
                dominio: () => true,
                avisoDominio: '',
                sustitucion: `u = x^2 ${signedTex(par)}x + ${fmt(q)}`,
                pasos: [
                    ['Paso 1 — Separar el numerador (λ·f′ + μ):', `${fmt(k)}(x ${signedTex(n)}) = \\underbrace{${fmt(lam)}}_{\\lambda}(2x ${signedTex(par)}) + \\underbrace{${fmt(mu)}}_{\\mu}`],
                    ['Paso 2 — La parte λ es directa (u = trinomio):', `\\int \\frac{${fmt(lam)}(2x ${signedTex(par)})}{\\sqrt{u}}\\,dx = ${fmt(2 * lam)}\\sqrt{u}`],
                    ['Paso 3 — La parte μ es logaritmo hiperbólico:', `${fmt(mu)}\\int \\frac{dx}{\\sqrt{x^2 ${signedTex(par)}x + ${fmt(q)}}} = ${fmt(mu)}\\ln\\left|x ${signedTex(-h0)} + \\sqrt{x^2 ${signedTex(par)}x + ${fmt(q)}}\\right|`],
                    ['Paso 4 — Unir ambas piezas:', `Resultado final abajo 🏁`]
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
        const n = 300;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            const y = cfg.func(x);
            xs.push(x);
            ys.push(isFinite(y) ? y : null);
        }

        const trazas = [{
            x: xs, y: ys, mode: 'lines', name: 'f(x) irracional', connectgaps: false,
            line: { color: '#69f0ae', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(105,240,174,0.28)'
        }];

        // Antiderivada escalada para verla junto al integrando
        const xf = [], yF = [];
        let maxF = 0;
        const Fs = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            const v = cfg.F(x);
            Fs.push(isFinite(v) ? v : null);
            if (isFinite(v)) maxF = Math.max(maxF, Math.abs(v));
        }
        const escalaY = maxF > 0 ? 1 : 1;
        for (let i = 0; i <= n; i++) {
            xf.push(a + (b - a) * i / n);
            yF.push(Fs[i] === null ? null : Fs[i]);
        }
        trazas.push({
            x: xf, y: yF, mode: 'lines', name: 'F(x) antiderivada',
            line: { color: '#b388ff', width: 2.5, dash: 'dash' }
        });

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'Integrando irracional (verde) y su antiderivada F(x) (morado punteado)', font: { color: '#b388ff' } },
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

        // Nota de la sustitución clave
        const pSust = parrafoConFormula('Sustitución racionalizante: ', cfg.sustitucion, '');
        divResultados.appendChild(crearPaso('🔧 Cambio de variable', [pSust]));

        cfg.pasos.forEach(([titulo, latex]) => {
            divResultados.appendChild(crearPaso(titulo, [parrafoConFormula('', latex, '')]));
        });

        const valorExacto = cfg.F(b) - cfg.F(a);

        // Simpson evitando extremos singulares (raíces en bordes)
        const nS = 800;
        let lo = Math.min(a, b), hi = Math.max(a, b);
        const eps = (hi - lo) * 1e-4;
        const g = x => { const v = cfg.func(x); return isFinite(v) ? v : 0; };
        let suma = 0;
        const L = lo + eps, H = hi - eps, h = (H - L) / nS;
        suma = g(L) + g(H);
        for (let i = 1; i < nS; i++) suma += (i % 2 === 1 ? 4 : 2) * g(L + i * h);
        suma *= h / 3;
        const factorCorreccion = (hi - lo) / (H - L);

        const pEval = parrafoConFormula('Evaluando con el TFC: ',
            `F(${fmt(b)}) - F(${fmt(a)}) = ${valorExacto.toFixed(6)}`, '');
        const pVer = document.createElement('p');
        pVer.className = 'verificacion';
        pVer.appendChild(document.createTextNode('✔ Verificación numérica (Simpson, n=' + nS + '): '));
        const spanVer = document.createElement('span');
        renderizarFormula(spanVer, `\\approx ${(suma * factorCorreccion).toFixed(4)}`, false);
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
        nota.textContent = '💡 Deriva tu respuesta para comprobar: al aplicar la regla de la cadena sobre la raíz, debes recuperar exactamente el integrando original.';
        divResultados.appendChild(nota);
    }

    btnCalcular.addEventListener('click', function() {
        const clave = selectIntegral.value;
        const vals = {
            k: parseFloat(inputK.value),
            par: parseFloat(inputP.value),
            n: parseFloat(inputN.value),
            s: parseFloat(inputS.value),
            alfa: parseFloat(inputAlpha.value),
            beta: parseFloat(inputBeta.value),
            a: parseFloat(inputA.value),
            b: parseFloat(inputB.value)
        };

        for (const [nom, v] of Object.entries(vals)) {
            if (isNaN(v)) { alert(`El valor "${nom}" no es un número válido.`); return; }
        }
        if (vals.a === vals.b) { alert('Los límites de integración deben ser diferentes.'); return; }
        if (vals.k === 0) { alert('El parámetro k debe ser distinto de 0.'); return; }
        if (clave === 'raizlineal' && vals.par === 0) { alert('El parámetro p no puede ser 0 (división por cero).'); return; }
        if (clave === 'arcoseno' && vals.beta <= vals.alfa) { alert('Se requiere β > α para que (x−α)(β−x) sea un arco seno real.'); return; }

        const cfg = construirConfig(clave, vals);

        // Validación de dominio en todo el intervalo cerrado
        const lo = Math.min(vals.a, vals.b), hi = Math.max(vals.a, vals.b);
        let ok = true;
        for (let i = 0; i <= 100; i++) {
            const x = lo + (hi - lo) * i / 100;
            if (!cfg.dominio(x) || !isFinite(cfg.func(x))) { ok = false; break; }
        }
        if (!ok) {
            alert('⚠️ Fuera de dominio:\n\n' + (cfg.avisoDominio || 'La función no está definida en ese intervalo.').replace(/\$[^$]*\$/g, ''));
            return;
        }

        graficar(cfg, vals.a, vals.b);
        mostrarResultados(cfg, vals.a, vals.b);
    });

    // Gráfica inicial
    const cfgInicial = construirConfig(selectIntegral.value, {
        k: parseFloat(inputK.value), par: parseFloat(inputP.value), n: parseFloat(inputN.value),
        s: parseFloat(inputS.value), alfa: parseFloat(inputAlpha.value), beta: parseFloat(inputBeta.value)
    });
    graficar(cfgInicial, parseFloat(inputA.value), parseFloat(inputB.value));
});
