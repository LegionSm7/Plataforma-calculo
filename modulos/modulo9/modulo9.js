// ===== MÓDULO 9: INTEGRALES LOGARÍTMICAS =====

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

    // Catálogo: cada config define func (integrando), F (antiderivada) y pasos en LaTeX.
    // k es un multiplicador externo del integrando (para las que lo usan).
    function construirConfig(clave, k) {
        const configs = {
            hiperbola: {
                texIntegrando: `\\frac{${k}}{x}`,
                usaK: true,
                func: x => k / x,
                F: x => k * Math.log(Math.abs(x)),
                texF: `${k === 1 ? '' : k}\\ln|x|`,
                resultadoTex: `\\int \\frac{${k}}{x}\\,dx = ${k === 1 ? '' : k}\\ln|x| + C`,
                singularidad: 0,
                pasos: [
                    ['Paso 1 — Reconocer la forma du/u:', `u = x, \\quad du = dx \\quad\\Rightarrow\\quad \\int \\frac{${k}}{x}dx = ${k}\\int \\frac{du}{u}`],
                    ['Paso 2 — Integrar:', `${k}\\ln|u| + C`],
                    ['Paso 3 — Resultado:', `${k}\\ln|x| + C`]
                ]
            },
            lineal: {
                texIntegrando: `\\frac{${k}}{2x+1}`,
                usaK: true,
                func: x => k / (2 * x + 1),
                F: x => (k / 2) * Math.log(Math.abs(2 * x + 1)),
                texF: `\\frac{${k}}{2}\\ln|2x+1|`,
                resultadoTex: `\\int \\frac{${k}}{2x+1}\\,dx = \\frac{${k}}{2}\\ln|2x+1| + C`,
                singularidad: -0.5,
                pasos: [
                    ['Paso 1 — Sustitución lineal:', `u = 2x+1, \\quad du = 2\\,dx \\quad\\Rightarrow\\quad dx = \\frac{du}{2}`],
                    ['Paso 2 — Reescribir:', `\\int \\frac{${k}}{u}\\cdot\\frac{du}{2} = \\frac{${k}}{2}\\int \\frac{du}{u}`],
                    ['Paso 3 — Integrar y regresar:', `\\frac{${k}}{2}\\ln|u| + C = \\frac{${k}}{2}\\ln|2x+1| + C`]
                ]
            },
            cociente: {
                texIntegrando: '\\frac{2x+3}{x^2+3x-4}',
                usaK: false,
                func: x => (2 * x + 3) / (x * x + 3 * x - 4),
                F: x => Math.log(Math.abs(x * x + 3 * x - 4)),
                texF: '\\ln|x^2+3x-4|',
                resultadoTex: '\\int \\frac{2x+3}{x^2+3x-4}\\,dx = \\ln|x^2+3x-4| + C',
                singularidad: null,
                pasos: [
                    ['Paso 1 — Observar el denominador:', `g(x) = x^2+3x-4 \\quad\\Rightarrow\\quad g'(x) = 2x+3`],
                    ['Paso 2 — Es exactamente g′/g:', `u = x^2+3x-4, \\quad du = (2x+3)\\,dx`],
                    ['Paso 3 — Integrar:', `\\int \\frac{du}{u} = \\ln|u| + C = \\ln|x^2+3x-4| + C`]
                ]
            },
            tangente: {
                texIntegrando: `${k === 1 ? '' : k}\\tan(x)`,
                usaK: true,
                func: x => k * Math.tan(x),
                F: x => -k * Math.log(Math.abs(Math.cos(x))),
                texF: `-${k === 1 ? '' : k}\\ln|\\cos x|`,
                resultadoTex: `\\int ${k === 1 ? '' : k}\\tan(x)\\,dx = -${k === 1 ? '' : k}\\ln|\\cos x| + C`,
                singularidad: null,
                pasos: [
                    ['Paso 1 — Reescribir:', `${k === 1 ? '' : k}\\int \\frac{\\sin x}{\\cos x}\\,dx`],
                    ['Paso 2 — Sustituir u = cos x:', `du = -\\sin x\\,dx \\quad\\Rightarrow\\quad -${k === 1 ? '' : k}\\int \\frac{du}{u}`],
                    ['Paso 3 — Integrar:', `-${k === 1 ? '' : k}\\ln|u| + C = -${k === 1 ? '' : k}\\ln|\\cos x| + C`]
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
        const n = 300;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            xs.push(x);
            ys.push(cfg.func(x));
        }
        const ext = (b - a) * 0.25;
        const xe = [], ye = [], Fe = [];
        for (let i = 0; i <= n; i++) {
            const x = (a - ext) + ((b + ext) - (a - ext)) * i / n;
            xe.push(x);
            ye.push(cfg.func(x));
            Fe.push(cfg.F(x));
        }

        const trazaArea = {
            x: xs, y: ys, mode: 'lines', name: 'Área bajo f(x)',
            line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(234,128,252,0.30)'
        };
        const trazaCurva = {
            x: xe, y: ye, mode: 'lines', name: 'f(x) — integrando',
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
            title: { text: 'El logaritmo natural nace como área bajo la hipérbola', font: { color: '#b388ff' } },
            xaxis: { title: 'x', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
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
        nota.textContent = '💡 Recuerda: ∫du/u = ln|u| + C aparece siempre que el numerador sea (proporcional a) la derivada del denominador. El valor absoluto amplía el dominio de validez de la fórmula.';
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
        if ((clave === 'hiperbola' || clave === 'lineal' || clave === 'tangente') && (isNaN(k) || k === 0)) {
            alert('El parámetro k debe ser un número distinto de 0.');
            return;
        }

        const cfg = construirConfig(clave, k);

        // Validación: el intervalo no debe cruzar una singularidad
        if (cfg.singularidad !== null && cfg.singularidad !== undefined) {
            const lo = Math.min(a, b), hi = Math.max(a, b);
            if (lo <= cfg.singularidad && cfg.singularidad <= hi) {
                alert(`Cuidado: el intervalo [${a}, ${b}] cruza la singularidad x = ${cfg.singularidad}. La integral definida no existe ahí. Elige límites del mismo lado.`);
                return;
            }
        }
        if (clave === 'cociente') {
            // raíces de x²+3x−4 = (x+4)(x−1): −4 y 1
            const raices = [-4, 1];
            const lo = Math.min(a, b), hi = Math.max(a, b);
            const cruza = raices.some(r => lo <= r && r <= hi);
            if (cruza) {
                alert('El intervalo cruza una asíntota del denominador (x = −4 o x = 1). Cambia los límites.');
                return;
            }
        }
        if (clave === 'tangente') {
            // tan tiene asíntotas en pi/2 + n*pi
            const lo = Math.min(a, b), hi = Math.max(a, b);
            const nMin = Math.ceil((lo - Math.PI / 2) / Math.PI);
            const nMax = Math.floor((hi - Math.PI / 2) / Math.PI);
            if (nMax >= nMin) {
                alert('El intervalo cruza una asíntota de tan(x) (x = π/2 + nπ). Cambia los límites.');
                return;
            }
        }

        graficar(cfg, a, b);
        mostrarResultados(cfg, a, b);
    });

    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputK.value));
    graficar(cfgInicial, parseFloat(inputA.value), parseFloat(inputB.value));
});
