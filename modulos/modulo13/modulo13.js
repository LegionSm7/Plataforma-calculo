// ===== MÓDULO 14: INTEGRACIÓN POR PARTES =====

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

    function construirConfig(clave, k) {
        const configs = {
            'pol-exp': {
                texIntegrando: `x\\,e^{${k}x}`,
                func: x => x * Math.exp(k * x),
                F: x => Math.exp(k * x) * (k * x - 1) / (k * k),
                uv: x => x * Math.exp(k * x) / k,
                texF: `\\frac{e^{${k}x}(${k}x-1)}{${k * k}}`,
                resultadoTex: `\\int x e^{${k}x}dx = \\frac{e^{${k}x}(${k}x-1)}{${k * k}} + C`,
                pasos: [
                    ['Paso 1 — LIATE: u algebraica:', `u = x,\\quad dv = e^{${k}x}dx \\quad\\Rightarrow\\quad du = dx,\\quad v = \\frac{e^{${k}x}}{${k}}`],
                    ['Paso 2 — Aplicar ∫u dv = uv − ∫v du:', `\\frac{x e^{${k}x}}{${k}} - \\int \\frac{e^{${k}x}}{${k}}dx`],
                    ['Paso 3 — Integral exponencial restante:', `\\frac{x e^{${k}x}}{${k}} - \\frac{e^{${k}x}}{${k * k}} + C = \\frac{e^{${k}x}(${k}x-1)}{${k * k}} + C`]
                ]
            },
            log: {
                texIntegrando: `${k}\\ln(x)`,
                func: x => k * Math.log(x),
                F: x => k * (x * Math.log(x) - x),
                uv: x => k * x * Math.log(x),
                texF: `${k}(x\\ln x - x)`,
                resultadoTex: `\\int ${k}\\ln(x)dx = ${k}(x\\ln x - x) + C`,
                requierePositivo: true,
                pasos: [
                    ['Paso 1 — LIATE: L es primera:', `u = \\ln x,\\quad dv = ${k}dx \\quad\\Rightarrow\\quad du = \\frac{${k}}{x}dx,\\quad v = ${k}x`],
                    ['Paso 2 — Fórmula de partes:', `${k}x\\ln x - \\int ${k}x \\cdot \\frac{${k}/x}{${k}}dx = ${k}x\\ln x - \\int ${k}\\,dx`],
                    ['Paso 3 — Integral trivial restante:', `${k}x\\ln x - ${k}x + C = ${k}(x\\ln x - x) + C`]
                ]
            },
            'pol-sen': {
                texIntegrando: `x\\sin(${k}x)`,
                func: x => x * Math.sin(k * x),
                F: x => (Math.sin(k * x) - k * x * Math.cos(k * x)) / (k * k),
                uv: x => -x * Math.cos(k * x) / k,
                texF: `\\frac{\\sin(${k}x) - ${k}x\\cos(${k}x)}{${k * k}}`,
                resultadoTex: `\\int x\\sin(${k}x)dx = \\frac{\\sin(${k}x) - ${k}x\\cos(${k}x)}{${k * k}} + C`,
                pasos: [
                    ['Paso 1 — LIATE: A antes que T:', `u = x,\\quad dv = \\sin(${k}x)dx \\Rightarrow\\quad v = -\\frac{\\cos(${k}x)}{${k}}`],
                    ['Paso 2 — Partes:', `-\\frac{x\\cos(${k}x)}{${k}} + \\int \\frac{\\cos(${k}x)}{${k}}dx`],
                    ['Paso 3 — Integrar el coseno:', `-\\frac{x\\cos(${k}x)}{${k}} + \\frac{\\sin(${k}x)}{${k * k}} + C`]
                ]
            },
            boomerang: {
                texIntegrando: `e^{x}\\sin(${k}x)`,
                func: x => Math.exp(x) * Math.sin(k * x),
                F: x => Math.exp(x) * (Math.sin(k * x) - k * Math.cos(k * x)) / (1 + k * k),
                uv: x => -Math.exp(x) * Math.cos(k * x) / k,
                texF: `\\frac{e^{x}(\\sin(${k}x) - ${k}\\cos(${k}x))}{1+${k * k}}`,
                resultadoTex: `\\int e^{x}\\sin(${k}x)dx = \\frac{e^{x}(\\sin(${k}x) - ${k}\\cos(${k}x))}{1+${k * k}} + C`,
                pasos: [
                    ['Paso 1 — Primera ronda:', `I = -\\frac{e^x\\cos(${k}x)}{${k}} + \\frac{1}{${k}}\\int e^x\\cos(${k}x)dx`],
                    ['Paso 2 — Segunda ronda aparece I original:', `\\int e^x\\cos(${k}x)dx = \\frac{e^x\\sin(${k}x)}{1} + \\frac{1}{${k}}\\int e^x\\sin(${k}x)dx \\;\\longleftarrow\\; \\text{¡reaparece } I!`],
                    ['Paso 3 — Despejar algebraicamente:', `I\\left(1 + \\frac{1}{${k * k}}\\right) = \\frac{e^x\\sin(${k}x)}{${k}} + \\frac{e^x\\cos(${k}x)}{${k * k}} \\Rightarrow \\text{resultado final}`]
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
        const trazas = [{
            x: xs, y: ys, mode: 'lines', name: 'f(x) = u·dv/dx',
            line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(234,128,252,0.30)'
        }];
        if (cfg.uv) {
            const xu = [], yu = [];
            for (let i = 0; i <= n; i++) {
                const x = a + (b - a) * i / n;
                const y = cfg.uv(x);
                xu.push(x);
                yu.push(isFinite(y) ? y : null);
            }
            trazas.push({
                x: xu, y: yu, mode: 'lines', name: 'uv (término de partes)', connectgaps: false,
                line: { color: '#ffd54f', width: 2, dash: 'dash' }
            });
        }

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: '∫u dv = uv − ∫v du: la curva orquídea y su término uv dorado', font: { color: '#b388ff' } },
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
        nota.textContent = '💡 Comprueba siempre derivando tu respuesta con la regla del producto: d[uv]/dx debe devolver el integrando original.';
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

        if (cfg.requierePositivo && Math.min(a, b) <= 0) {
            alert('Para ln(x) ambos límites deben ser positivos.');
            return;
        }

        graficar(cfg, a, b);
        mostrarResultados(cfg, a, b);
    });

    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputK.value));
    graficar(cfgInicial, parseFloat(inputA.value), parseFloat(inputB.value));
});
