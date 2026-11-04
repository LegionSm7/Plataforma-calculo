// ===== MÓDULO 12: FRACCIONES PARCIALES =====

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

    // k es un multiplicador externo del integrando.
    function construirConfig(clave, k) {
        const configs = {
            lineales: {
                texIntegrando: `\\frac{${k}}{(x-1)(x+2)}`,
                func: x => k / ((x - 1) * (x + 2)),
                F: x => (k / 3) * Math.log(Math.abs(x - 1)) - (k / 3) * Math.log(Math.abs(x + 2)),
                texF: `\\frac{${k}}{3}\\ln|x-1| - \\frac{${k}}{3}\\ln|x+2|`,
                resultadoTex: `\\int \\frac{${k}}{(x-1)(x+2)}dx = \\frac{${k}}{3}\\ln\\left|\\frac{x-1}{x+2}\\right| + C`,
                componentes: [
                    { nombre: 'A/(x−1):', f: x => (k / 3) / (x - 1), color: '#4dd0e1' },
                    { nombre: 'B/(x+2):', f: x => (-k / 3) / (x + 2), color: '#ffd54f' }
                ],
                singularidades: [1, -2],
                pasos: [
                    ['Paso 1 — Plantilla:', `\\frac{${k}}{(x-1)(x+2)} = \\frac{A}{x-1} + \\frac{B}{x+2}`],
                    ['Paso 2 — Coeficientes (evaluar en raíces):', `${k} = A(x+2)+B(x-1) \\quad x=1 \\Rightarrow A=\\frac{${k}}{3}; \\quad x=-2 \\Rightarrow B=-\\frac{${k}}{3}`],
                    ['Paso 3 — Integrar cada parcial:', `\\frac{${k}}{3}\\ln|x-1| - \\frac{${k}}{3}\\ln|x+2| + C`]
                ]
            },
            repetido: {
                texIntegrando: `\\frac{${k}}{(x+1)^2(x+3)}`,
                func: x => k / ((x + 1) * (x + 1) * (x + 3)),
                F: x => (-k / 4) / (x + 1) + (k / 4) * Math.log(Math.abs(x + 1)) - (k / 4) * Math.log(Math.abs(x + 3)),
                texF: `-\\frac{${k}}{4(x+1)} + \\frac{${k}}{4}\\ln|x+1| - \\frac{${k}}{4}\\ln|x+3|`,
                resultadoTex: `\\int \\frac{${k}}{(x+1)^2(x+3)}dx = -\\frac{${k}}{4(x+1)} + \\frac{${k}}{4}\\ln\\left|\\frac{x+1}{x+3}\\right| + C`,
                componentes: [],
                singularidades: [-1, -3],
                pasos: [
                    ['Paso 1 — Plantilla con factor repetido:', `\\frac{${k}}{(x+1)^2(x+3)} = \\frac{A}{x+1} + \\frac{B}{(x+1)^2} + \\frac{C}{x+3}`],
                    ['Paso 2 — Coeficientes:', `${k} = A(x+1)(x+3)+B(x+3)+C(x+1)^2 \\Rightarrow A=\\frac{${k}}{4},\\; B=\\frac{${k}}{2},\\; C=-\\frac{${k}}{4}`],
                    ['Paso 3 — Integrar (ojo: B da potencia −2):', `\\frac{${k}}{4}\\ln|x+1| - \\frac{${k}}{2(x+1)} - \\frac{${k}}{4}\\ln|x+3| + C`]
                ]
            },
            cuadratico: {
                texIntegrando: `\\frac{${k}}{x(x^2+4)}`,
                func: x => k / (x * (x * x + 4)),
                F: x => (k / 4) * Math.log(Math.abs(x)) - (k / 8) * Math.log(x * x + 4),
                texF: `\\frac{${k}}{4}\\ln|x| - \\frac{${k}}{8}\\ln(x^2+4)`,
                resultadoTex: `\\int \\frac{${k}}{x(x^2+4)}dx = \\frac{${k}}{4}\\ln|x| - \\frac{${k}}{8}\\ln(x^2+4) + C`,
                componentes: [
                    { nombre: 'A/x:', f: x => (k / 4) / x, color: '#4dd0e1' },
                    { nombre: '(Bx+C)/(x²+4):', f: x => (-k / 4 * x) / (x * x + 4), color: '#ffd54f' }
                ],
                singularidades: [0],
                pasos: [
                    ['Paso 1 — Plantilla (cuadrático ⇒ numerador Ax+B):', `\\frac{${k}}{x(x^2+4)} = \\frac{A}{x} + \\frac{Bx+C}{x^2+4}`],
                    ['Paso 2 — Sistema:', `${k} = A(x^2+4)+(Bx+C)x \\Rightarrow 4A=${k},\\; A+B=0,\\; C=0 \\Rightarrow A=\\frac{${k}}{4},\\; B=-\\frac{${k}}{4},\\; C=0`],
                    ['Paso 3 — Integrar (el segundo es ln por ser derivada interna):', `\\frac{${k}}{4}\\ln|x| - \\frac{${k}}{8}\\ln(x^2+4) + C`]
                ]
            },
            impropia: {
                texIntegrando: `\\frac{${k}x}{x^2+1}`,
                func: x => k * x / (x * x + 1),
                F: x => (k / 2) * Math.log(x * x + 1),
                texF: `\\frac{${k}}{2}\\ln(x^2+1)`,
                resultadoTex: `\\int \\frac{${k}x}{x^2+1}dx = \\frac{${k}}{2}\\ln(x^2+1) + C`,
                componentes: [],
                singularidades: [],
                pasos: [
                    ['Paso 1 — Atajo: el numerador es (½)·derivada del denominador:', `u = x^2+1, \\quad du = 2x\\,dx \\quad\\Rightarrow\\quad \\frac{${k}}{2}\\int \\frac{du}{u}`],
                    ['Paso 2 — Integrar directamente (sin fracciones parciales):', `\\frac{${k}}{2}\\ln|u| + C`],
                    ['Paso 3 — Regresar:', `\\frac{${k}}{2}\\ln(x^2+1) + C \\qquad (x^2+1>0, no hace falta valor absoluto)`]
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
            const y = cfg.func(x);
            xs.push(x);
            ys.push(isFinite(y) ? y : null);
        }

        const trazas = [{
            x: xs, y: ys, mode: 'lines', name: 'f(x) racional', connectgaps: false,
            line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(234,128,252,0.30)'
        }];

        cfg.componentes.forEach(comp => {
            const xc = [], yc = [];
            for (let i = 0; i <= n; i++) {
                const x = a + (b - a) * i / n;
                const y = comp.f(x);
                xc.push(x);
                yc.push(isFinite(y) ? y : null);
            }
            trazas.push({
                x: xc, y: yc, mode: 'lines', name: comp.nombre, connectgaps: false,
                line: { color: comp.color, width: 2, dash: 'dash' }
            });
        });

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'La función racional (orquídea) y sus piezas parciales (punteadas)', font: { color: '#b388ff' } },
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
        nota.textContent = '💡 Comprueba siempre tu descomposición sumando las parciales: deben reconstruir exactamente la fracción original.';
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

        const lo = Math.min(a, b), hi = Math.max(a, b);
        const cruza = (cfg.singularidades || []).some(s => lo <= s && s <= hi);
        if (cruza) {
            alert(`El intervalo cruza una asíntota vertical (${(cfg.singularidades).join(' o x = ')}). Cambia los límites.`);
            return;
        }

        graficar(cfg, a, b);
        mostrarResultados(cfg, a, b);
    });

    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputK.value));
    graficar(cfgInicial, parseFloat(inputA.value), parseFloat(inputB.value));
});
