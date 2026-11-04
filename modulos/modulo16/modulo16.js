// ===== MÓDULO 16: INTEGRALES CON FUNCIONES HIPERBÓLICAS INVERSAS =====

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
    const inputA = document.getElementById('param-a');
    const inputK = document.getElementById('param-k');
    const inputLimInf = document.getElementById('a');
    const inputLimSup = document.getElementById('b');
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    // ----- utilidades de formato LaTeX -----
    function fmt(v) {
        const r = Math.round(v * 10000) / 10000;
        return (Object.is(r, -0) ? 0 : r).toString();
    }
    function texKX(k) {
        if (k === 1) return 'x';
        if (k === -1) return '-x';
        return `${fmt(k)}x`;
    }
    function texSq(v) { return fmt(Math.round(v * v * 1e6) / 1e6); }

    // Inversas hiperbólicas por su forma logarítmica (estables y sin dependencias)
    const arsinh = z => Math.log(z + Math.sqrt(z * z + 1));
    const arcosh = z => Math.log(z + Math.sqrt(z * z - 1));          // z >= 1
    const artanh = z => 0.5 * Math.log((1 + z) / (1 - z));           // |z| < 1
    const arcoth = z => 0.5 * Math.log((z + 1) / (z - 1));           // |z| > 1

    function construirConfig(clave, a, k) {
        if (a <= 0) return { error: 'El parámetro a debe ser positivo (define la escala de la curva).' };
        if (k === 0) return { error: 'Con k = 0 el argumento kx es constante: usa k ≠ 0.' };
        const sk = Math.abs(k);
        const tKX = texKX(k);
        const texAx = `\\dfrac{${tKX}}{${fmt(a)}}`;

        switch (clave) {

            // ∫ dx/√(k²x²+a²) → sgn(k)/|k|·arsinh(kx/a)   — definida en todo ℝ
            case 'arsinh': {
                return {
                    func: x => 1 / Math.sqrt(k * k * x * x + a * a),
                    F: x => (Math.sign(k) / sk) * arsinh(k * x / a),
                    texF: `\\dfrac{${fmt(Math.sign(k))}}{${fmt(sk)}}\\operatorname{arsinh}\\!\\left(${texAx}\\right)`,
                    resultadoTex: `\\int \\dfrac{dx}{\\sqrt{${fmt(k * k)}x^2 + ${texSq(a)}}} = \\dfrac{${fmt(Math.sign(k))}}{${fmt(sk)}}\\operatorname{arsinh}\\!\\left(${texAx}\\right) + C`,
                    pasos: [
                        ['Paso 1 — Reconocer la silueta:', `${fmt(k * k)}x^2 + ${texSq(a)} = (${tKX})^2 + ${fmt(a)}^2 \\;\\longrightarrow\\; \\sqrt{u^2+a^2}`],
                        ['Paso 2 — Sustitución u = kx:', `du = ${fmt(k)}\\,dx \\;\\Rightarrow\\; \\int \\frac{dx}{\\sqrt{(kx)^2+a^2}} = \\frac{1}{|k|}\\int \\frac{du}{\\sqrt{u^2+a^2}}`],
                        ['Paso 3 — Fórmula canónica (forma logarítmica):', `\\int \\frac{du}{\\sqrt{u^2+a^2}} = \\operatorname{arsinh}\\frac{u}{a} + C = \\ln\\left(u+\\sqrt{u^2+a^2}\\right) + C'`],
                        ['Paso 4 — Regresar a x:', `\\dfrac{${fmt(Math.sign(k))}}{${fmt(sk)}}\\operatorname{arsinh}\\!\\left(${texAx}\\right) + C`]
                    ]
                };
            }

            // ∫ dx/√(k²x²−a²) → (1/|k|)·arcosh(|kx|/a) — exige |kx| > a
            case 'arcosh': {
                return {
                    func: x => (Math.abs(k * x) > a ? 1 / Math.sqrt(k * k * x * x - a * a) : NaN),
                    F: x => (Math.abs(k * x) > a ? (1 / sk) * arcosh(Math.abs(k * x) / a) : NaN),
                    texF: `\\dfrac{1}{${fmt(sk)}}\\operatorname{arcosh}\\!\\left(\\dfrac{|${tKX}|}{${fmt(a)}}\\right)`,
                    resultadoTex: `\\int \\dfrac{dx}{\\sqrt{${fmt(k * k)}x^2 - ${texSq(a)}}} = \\dfrac{1}{${fmt(sk)}}\\operatorname{arcosh}\\!\\left(\\dfrac{|${tKX}|}{${fmt(a)}}\\right) + C, \\qquad |kx| &gt; ${fmt(a)}`,
                    dominioExcluido: [-a / sk, a / sk],
                    tipoDominio: 'exterior',
                    pasos: [
                        ['Paso 1 — Reconocer la silueta:', `${fmt(k * k)}x^2 - ${texSq(a)} = (${tKX})^2 - ${fmt(a)}^2 \\;\\longrightarrow\\; \\sqrt{u^2-a^2}`],
                        ['Paso 2 — Sustitución u = kx:', `du = ${fmt(k)}\\,dx, \\qquad \\frac{1}{|k|}\\int \\frac{du}{\\sqrt{u^2-a^2}}`],
                        ['Paso 3 — Fórmula canónica (forma logarítmica):', `\\int \\frac{du}{\\sqrt{u^2-a^2}} = \\operatorname{arcosh}\\frac{|u|}{a} + C = \\ln\\left(|u|+\\sqrt{u^2-a^2}\\right) + C'`],
                        ['Paso 4 — Condición de existencia:', `|kx| &gt; ${fmt(a)} \\iff x \\in \\left(-\\infty, -\\tfrac{${fmt(a)}}{${fmt(sk)}}\\right) \\cup \\left(\\tfrac{${fmt(a)}}{${fmt(sk)}}, +\\infty\\right)`]
                    ]
                };
            }

            // ∫ dx/(a²−k²x²) → (1/(a|k|))·artanh(kx/a) — exige |kx| < a
            case 'artanh': {
                return {
                    func: x => (Math.abs(k * x) < a ? 1 / (a * a - k * k * x * x) : NaN),
                    F: x => (Math.abs(k * x) < a ? (1 / (a * sk)) * artanh(k * x / a) : NaN),
                    texF: `\\dfrac{1}{${fmt(a * sk)}}\\operatorname{artanh}\\!\\left(${texAx}\\right)`,
                    resultadoTex: `\\int \\dfrac{dx}{${texSq(a)} - ${fmt(k * k)}x^2} = \\dfrac{1}{${fmt(a * sk)}}\\operatorname{artanh}\\!\\left(${texAx}\\right) + C, \\qquad |kx| &lt; ${fmt(a)}`,
                    dominioExcluido: [-a / sk, a / sk],
                    tipoDominio: 'interior',
                    pasos: [
                        ['Paso 1 — Reconocer la silueta:', `${texSq(a)} - ${fmt(k * k)}x^2 = ${fmt(a)}^2 - (${tKX})^2 \\;\\longrightarrow\\; a^2-u^2`],
                        ['Paso 2 — Factorizar y sustituir u = kx:', `\\frac{1}{|k|}\\int \\frac{du}{a^2-u^2}`],
                        ['Paso 3 — Fórmula canónica (equivale a fracciones parciales):', `\\int \\frac{du}{a^2-u^2} = \\frac{1}{a}\\operatorname{artanh}\\frac{u}{a} + C = \\frac{1}{2a}\\ln\\left|\\frac{a+u}{a-u}\\right| + C`],
                        ['Paso 4 — Regresar a x:', `\\dfrac{1}{${fmt(a * sk)}}\\operatorname{artanh}\\!\\left(${texAx}\\right) + C`]
                    ]
                };
            }

            // ∫ dx/(k²x²−a²) → −(1/(a|k|))·arcoth(kx/a) — exige |kx| > a
            case 'arcoth': {
                return {
                    func: x => (Math.abs(k * x) > a ? 1 / (k * k * x * x - a * a) : NaN),
                    F: x => (Math.abs(k * x) > a ? -(1 / (a * sk)) * arcoth(k * x / a) : NaN),
                    texF: `-\\dfrac{1}{${fmt(a * sk)}}\\operatorname{arcoth}\\!\\left(${texAx}\\right)`,
                    resultadoTex: `\\int \\dfrac{dx}{${fmt(k * k)}x^2 - ${texSq(a)}} = -\\dfrac{1}{${fmt(a * sk)}}\\operatorname{arcoth}\\!\\left(${texAx}\\right) + C, \\qquad |kx| &gt; ${fmt(a)}`,
                    dominioExcluido: [-a / sk, a / sk],
                    tipoDominio: 'exterior',
                    pasos: [
                        ['Paso 1 — Reconocer la silueta:', `${fmt(k * k)}x^2 - ${texSq(a)} = (${tKX})^2 - ${fmt(a)}^2 \\;\\longrightarrow\\; u^2-a^2`],
                        ['Paso 2 — Fracciones parciales sobre las asíntotas ±a/|k|:', `\\frac{1}{u^2-a^2} = \\frac{1}{2a}\\left(\\frac{1}{u-a} - \\frac{1}{u+a}\\right)`],
                        ['Paso 3 — Integrar (forma log / arcoth):', `\\int \\frac{du}{u^2-a^2} = \\frac{1}{2a}\\ln\\left|\\frac{u-a}{u+a}\\right| + C = -\\frac{1}{a}\\operatorname{arcoth}\\frac{u}{a} + C`],
                        ['Paso 4 — Regresar a x con el factor 1/|k|:', `-\\dfrac{1}{${fmt(a * sk)}}\\operatorname{arcoth}\\!\\left(${texAx}\\right) + C`]
                    ]
                };
            }

            // ∫ arcosh(kx/a) dx = x·arcosh(kx/a) − √(k²x²−a²)/|k| + C   (rama kx/a ≥ 1)
            case 'num-arcosh': {
                return {
                    func: x => (k * x / a >= 1 ? arcosh(k * x / a) : NaN),
                    F: x => (k * x / a >= 1 ? x * arcosh(k * x / a) - Math.sqrt(k * k * x * x - a * a) / sk : NaN),
                    texF: `x\\,\\operatorname{arcosh}\\!\\left(${texAx}\\right) - \\dfrac{\\sqrt{${fmt(k * k)}x^2 - ${texSq(a)}}}{${fmt(sk)}}`,
                    resultadoTex: `\\int \\operatorname{arcosh}\\!\\left(${texAx}\\right)dx = x\\,\\operatorname{arcosh}\\!\\left(${texAx}\\right) - \\dfrac{\\sqrt{${fmt(k * k)}x^2 - ${texSq(a)}}}{${fmt(sk)}} + C, \\qquad \\tfrac{kx}{a} \\ge 1`,
                    xMinValido: a / k,
                    tipoDominio: 'rama-positiva',
                    pasos: [
                        ['Paso 1 — Fórmula patrón (se demuestra por partes):', `\\int \\operatorname{arcosh}(t)\\,dt = t\\,\\operatorname{arcosh}(t) - \\sqrt{t^2-1} + C`],
                        ['Paso 2 — Cambio t = kx/a, dt = (k/a)dx:', `\\int \\operatorname{arcosh}\\!\\left(\\tfrac{kx}{a}\\right)dx = \\frac{a}{k}\\left[t\\,\\operatorname{arcosh}t - \\sqrt{t^2-1}\\right]`],
                        ['Paso 3 — Expandir término a término:', `\\frac{a}{k}\\cdot t\\,\\operatorname{arcosh}t = x\\,\\operatorname{arcosh}\\!\\left(${texAx}\\right), \\qquad \\frac{a}{k}\\sqrt{t^2-1} = \\frac{\\sqrt{${fmt(k * k)}x^2 - ${texSq(a)}}}{${fmt(sk)}}`],
                        ['Paso 4 — Resultado:', `x\\,\\operatorname{arcosh}\\!\\left(${texAx}\\right) - \\dfrac{\\sqrt{${fmt(k * k)}x^2 - ${texSq(a)}}}{${fmt(sk)}} + C`]
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

    function graficar(cfg, lo, hi) {
        const contenedor = document.getElementById('grafico');
        const n = 400;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = lo + (hi - lo) * i / n;
            xs.push(x);
            const y = cfg.func(x);
            ys.push(isFinite(y) ? y : null);
        }
        const trazas = [{
            x: xs, y: ys, mode: 'lines', name: 'f(x) integrando', connectgaps: false,
            line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(234,128,252,0.30)'
        }];

        // Antiderivada F(x) trasladada verticalmente para convivir con f(x)
        const valsY = ys.filter(v => v !== null && isFinite(v)).map(Math.abs);
        const maxY = valsY.length ? Math.max(...valsY) : 1;
        const base = cfg.F(lo);
        const offset = isFinite(base) ? maxY * 0.25 - base : 0;
        const Fs = xs.map(x => {
            const v = cfg.F(x);
            return isFinite(v) ? v + offset : null;
        });
        trazas.push({
            x: xs, y: Fs, mode: 'lines', name: 'F(x) antiderivada (trasladada)', connectgaps: false,
            line: { color: '#69f0ae', width: 2.5, dash: 'dash' }
        });

        // Límites de dominio como líneas verticales ámbar (solo si caen dentro)
        const limites = [];
        if (cfg.dominioExcluido) limites.push(...cfg.dominioExcluido);
        if (cfg.xMinValido !== undefined) limites.push(cfg.xMinValido);
        const todos = [...ys, ...Fs].filter(v => v !== null && isFinite(v));
        const yLo = todos.length ? Math.min(...todos) : -1;
        const yHi = todos.length ? Math.max(...todos) : 1;
        for (const xa of limites) {
            if (xa > lo && xa < hi) {
                trazas.push({
                    x: [xa, xa], y: [yLo, yHi], mode: 'lines',
                    name: `límite x=${fmt(xa)}`,
                    line: { color: '#ffd54f', width: 1.5, dash: 'dot' }
                });
            }
        }

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'Integrando (orquídea), antiderivada hiperbólica (verde punteada) y límites de dominio (ámbar)', font: { color: '#b388ff' } },
            xaxis: { title: 'x', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
            yaxis: { title: 'y', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
            showlegend: true,
            legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(30,17,51,0.8)', font: { size: 11 } },
            margin: { t: 60, r: 20, b: 50, l: 60 }
        };

        Plotly.newPlot(contenedor, trazas, layout, { responsive: true });
    }

    function mostrarResultados(cfg, lo, hi) {
        divResultados.innerHTML = '';

        const valorExacto = cfg.F(hi) - cfg.F(lo);

        const nS = 400, hStep = (hi - lo) / nS;
        let suma = (isFinite(cfg.func(lo)) ? cfg.func(lo) : 0) + (isFinite(cfg.func(hi)) ? cfg.func(hi) : 0);
        for (let i = 1; i < nS; i++) {
            const y = cfg.func(lo + i * hStep);
            suma += (i % 2 === 1 ? 4 : 2) * (isFinite(y) ? y : 0);
        }
        suma *= hStep / 3;

        cfg.pasos.forEach(([titulo, latex]) => {
            divResultados.appendChild(crearPaso(titulo, [parrafoConFormula('', latex, '')]));
        });

        const pEval = parrafoConFormula('Evaluando con el TFC: ',
            `\\left[ ${cfg.texF} \\right]_{${fmt(lo)}}^{${fmt(hi)}} = ${valorExacto.toFixed(6)}`, '');
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
        nota.textContent = '💡 Compruébalo tú mismo: cada inversa hiperbólica es un logaritmo disfrazado. Deriva la versión logarítmica de tu respuesta y debe devolver exactamente el integrando original.';
        divResultados.appendChild(nota);
    }

    btnCalcular.addEventListener('click', function() {
        const clave = selectIntegral.value;
        const a = parseFloat(inputA.value);
        const k = parseFloat(inputK.value);
        const lo = parseFloat(inputLimInf.value);
        const hi = parseFloat(inputLimSup.value);

        if ([a, k, lo, hi].some(v => isNaN(v))) {
            alert('Por favor, ingrese valores numéricos válidos en todos los campos.');
            return;
        }
        if (lo === hi) {
            alert('Los límites de integración deben ser diferentes.');
            return;
        }

        const cfg = construirConfig(clave, a, k);
        if (cfg.error) {
            alert(cfg.error);
            return;
        }

        // Validación de dominio antes de calcular
        const minL = Math.min(lo, hi), maxL = Math.max(lo, hi);
        if (cfg.tipoDominio === 'interior') {
            const [dLo, dHi] = cfg.dominioExcluido;
            if (minL <= dLo || maxL >= dHi) {
                alert(`La función artanh solo existe para |kx| < a = ${fmt(a)}, es decir x ∈ (${fmt(dLo)}, ${fmt(dHi)}). El intervalo cruza una asíntota vertical: ajusta los límites para quedarse dentro.`);
                return;
            }
        } else if (cfg.tipoDominio === 'exterior') {
            const [dLo, dHi] = cfg.dominioExcluido;
            if (maxL > dLo && minL < dHi) {
                alert(`Esta familia exige |kx| > ${fmt(a)}: el intervalo no puede tocar la franja (${fmt(dLo)}, ${fmt(dHi)}) donde el radicando es negativo. Prueba límites fuera de esa zona (ej. desde ${fmt(dHi + 0.5)}).`);
                return;
            }
        } else if (cfg.tipoDominio === 'rama-positiva') {
            if (k * minL / a < 1) {
                alert(`arcosh exige su argumento ≥ 1: con k = ${fmt(k)} y a = ${fmt(a)} necesitas x ≥ ${fmt(a / k)}. Ajusta el límite inferior.`);
                return;
            }
        }

        graficar(cfg, minL, maxL);
        mostrarResultados(cfg, minL, maxL);
    });

    // Gráfica inicial con los valores por defecto
    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputA.value), parseFloat(inputK.value));
    if (!cfgInicial.error) {
        const lo = parseFloat(inputLimInf.value), hi = parseFloat(inputLimSup.value);
        graficar(cfgInicial, Math.min(lo, hi), Math.max(lo, hi));
    }
});
