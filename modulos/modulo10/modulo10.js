// ===== MÓDULO 10: INTEGRALES TRIGONOMÉTRICAS =====

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

    // k multiplica al integrando en todas las familias.
    function construirConfig(clave, k) {
        const ks = k === 1 ? '' : String(k);
        const configs = {
            'potencia-par': {
                texIntegrando: `${ks}\\sin^2(x)`,
                func: x => k * Math.pow(Math.sin(x), 2),
                F: x => k * (x / 2 - Math.sin(2 * x) / 4),
                texF: `${ks}\\left(\\frac{x}{2} - \\frac{\\sin 2x}{4}\\right)`,
                resultadoTex: `\\int ${ks}\\sin^2 x\\,dx = ${ks}\\left(\\frac{x}{2} - \\frac{\\sin 2x}{4}\\right) + C`,
                pasos: [
                    ['Paso 1 — Identidad de ángulo doble:', `\\int ${ks}\\sin^2 x\\,dx = ${ks}\\int \\frac{1-\\cos 2x}{2}\\,dx`],
                    ['Paso 2 — Separar e integrar:', `${ks}\\left[\\frac{1}{2}\\int 1\\,dx - \\frac{1}{2}\\int\\cos 2x\\,dx\\right]`],
                    ['Paso 3 — Resultado:', `${ks}\\left(\\frac{x}{2} - \\frac{\\sin 2x}{4}\\right) + C`]
                ]
            },
            'sen-impar': {
                texIntegrando: `${ks}\\sin^3(x)`,
                func: x => k * Math.pow(Math.sin(x), 3),
                F: x => k * (-Math.cos(x) + Math.pow(Math.cos(x), 3) / 3),
                texF: `${ks}\\left(-\\cos x + \\frac{\\cos^3 x}{3}\\right)`,
                resultadoTex: `\\int ${ks}\\sin^3 x\\,dx = ${ks}\\left(-\\cos x + \\frac{\\cos^3 x}{3}\\right) + C`,
                pasos: [
                    ['Paso 1 — Guardar un factor y sembrar:', `\\sin^3 x = \\sin^2 x\\cdot\\sin x = (1-\\cos^2 x)\\sin x`],
                    ['Paso 2 — Sustituir u = cos x:', `du = -\\sin x\\,dx \\quad\\Rightarrow\\quad -${ks}\\int (1-u^2)\\,du`],
                    ['Paso 3 — Integrar y regresar:', `${ks}\\left(-u + \\frac{u^3}{3}\\right) + C = ${ks}\\left(-\\cos x + \\frac{\\cos^3 x}{3}\\right) + C`]
                ]
            },
            'producto': {
                texIntegrando: `${ks}\\sin(x)\\cos(x)`,
                func: x => k * Math.sin(x) * Math.cos(x),
                F: x => k * Math.pow(Math.sin(x), 2) / 2,
                texF: `${ks}\\frac{\\sin^2 x}{2}`,
                resultadoTex: `\\int ${ks}\\sin x\\cos x\\,dx = ${ks}\\frac{\\sin^2 x}{2} + C`,
                pasos: [
                    ['Paso 1 — Opción A (sustitución):', `u = \\sin x, \\; du = \\cos x\\,dx \\quad\\Rightarrow\\quad ${ks}\\int u\\,du`],
                    ['Paso 2 — Integrar:', `${ks}\\frac{u^2}{2} + C`],
                    ['Paso 3 — Regresar (equivale a ángulo doble):', `${ks}\\frac{\\sin^2 x}{2} + C = \\frac{${ks}}{4}\\left(x - \\frac{\\sin 2x}{2}\\right) + C' \\;\\checkmark`]
                ]
            },
            'sec2': {
                texIntegrando: `${ks}\\sec^2(x)`,
                func: x => k / Math.pow(Math.cos(x), 2),
                F: x => k * Math.tan(x),
                texF: `${ks}\\tan x`,
                resultadoTex: `\\int ${ks}\\sec^2 x\\,dx = ${ks}\\tan x + C`,
                esSecante: true,
                pasos: [
                    ['Paso 1 — Reconocer derivada directa:', `\\frac{d}{dx}[\\tan x] = \\sec^2 x`],
                    ['Paso 2 — Aplicar la fórmula:', `\\int ${ks}\\sec^2 x\\,dx = ${ks}\\tan x + C`],
                    ['Paso 3 — Dominio:', `v\\!\\text{álida en intervalos donde } \\cos x \\neq 0 \\; (\\text{asíntotas en } \\pi/2 + n\\pi)`]
                ]
            }
        };
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
            let y = cfg.func(x);
            if (!isFinite(y)) y = null;
            xs.push(x);
            ys.push(y);
        }
        const ext = (b - a) * 0.25;
        const xe = [], ye = [], Fe = [];
        for (let i = 0; i <= n; i++) {
            const x = (a - ext) + ((b + ext) - (a - ext)) * i / n;
            xe.push(x);
            let y = cfg.func(x);
            ye.push(isFinite(y) ? y : null);
            Fe.push(cfg.F(x));
        }

        const trazaArea = {
            x: xs, y: ys, mode: 'lines', name: 'Área bajo f(x)', connectgaps: false,
            line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(234,128,252,0.30)'
        };
        const trazaCurva = {
            x: xe, y: ye, mode: 'lines', name: 'f(x) — integrando', connectgaps: false,
            line: { color: '#b388ff', width: 2.5 }
        };
        const trazaF = {
            x: xe, y: Fe, mode: 'lines', name: 'F(x) — antiderivada',
            line: { color: '#4dd0e1', width: 2.5, dash: 'dot' }
        };

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'Integrando (morado), área (orquídea) y antiderivada (cian punteada)', font: { color: '#b388ff' } },
            xaxis: { title: 'x (radianes)', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
            yaxis: { title: 'y', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
            showlegend: true,
            legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(30,17,51,0.8)', font: { size: 11 } },
            margin: { t: 60, r: 20, b: 50, l: 60 }
        };

        Plotly.newPlot(contenedor, [trazaArea, trazaCurva, trazaF], layout, { responsive: true });
    }

    function mostrarResultados(cfg, a, b) {
        divResultados.innerHTML = '';

        const valorExacto = cfg.F(b) - cfg.F(a);

        const nS = 400, h = (b - a) / nS;
        let suma = cfg.func(a) + cfg.func(b);
        for (let i = 1; i < nS; i++) {
            suma += (i % 2 === 1 ? 4 : 2) * cfg.func(a + i * h);
        }
        suma *= h / 3;

        cfg.pasos.forEach(([titulo, latex]) => {
            divResultados.appendChild(crearPaso(titulo, [parrafoConFormula('', latex, '')]));
        });

        const pEval = parrafoConFormula('Evaluando con el TFC: ',
            `\\left[ ${cfg.texF} \\right]_{${a}}^{${b}} = ${valorExacto.toFixed(6)}`, '');
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
        nota.textContent = '💡 En potencias impares "guarda un factor para el du y siembra el resto"; en potencias pares baja exponentes con las identidades de ángulo doble.';
        divResultados.appendChild(nota);
    }

    btnCalcular.addEventListener('click', function() {
        const clave = selectIntegral.value;
        const k = parseFloat(inputK.value);
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);

        if (isNaN(a) || isNaN(b)) {
            alert('Por favor, ingrese valores numéricos válidos para los límites.');
            return;
        }
        if (a === b) {
            alert('Los límites de integración deben ser diferentes.');
            return;
        }
        if (isNaN(k) || k === 0) {
            alert('El parámetro k debe ser un número distinto de 0.');
            return;
        }

        const cfg = construirConfig(clave, k);

        // sec² tiene asíntotas en pi/2 + n*pi
        if (cfg.esSecante) {
            const lo = Math.min(a, b), hi = Math.max(a, b);
            const nMin = Math.ceil((lo - Math.PI / 2) / Math.PI);
            const nMax = Math.floor((hi - Math.PI / 2) / Math.PI);
            if (nMax >= nMin) {
                alert('El intervalo cruza una asíntota de sec²(x) (x = π/2 + nπ). Cambia los límites.');
                return;
            }
        }

        graficar(cfg, a, b);
        mostrarResultados(cfg, a, b);
    });

    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputK.value));
    graficar(cfgInicial, parseFloat(inputA.value), parseFloat(inputB.value));
});
