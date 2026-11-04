// ===== MÓDULO 11: INTEGRALES TRIGONOMÉTRICAS INVERSAS =====

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
    const inputAParam = document.getElementById('param-k'); // parámetro a
    const inputLimInf = document.getElementById('a');       // límite inferior
    const inputLimSup = document.getElementById('b');       // límite superior
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados');

    // Claves: arctan, arcsin, arcsec
    function construirConfig(clave, a) {
        const a2 = a * a;
        const configs = {
            arctan: {
                dominioRaiz: null,
                func: x => 1 / (a2 + x * x),
                F: x => (1 / a) * Math.atan(x / a),
                resultadoTex: `\\int \\frac{dx}{${a2}+x^2} = \\frac{1}{${a}}\\arctan\\left(\\frac{x}{${a}}\\right) + C`,
                pasos: [
                    ['Paso 1 — Identificar la plantilla:', `f(x) = \\frac{1}{a^2+x^2}\\quad \\text{con} \\quad a = ${a}, \\quad a^2 = ${a2}`],
                    ['Paso 2 — Aplicar la fórmula de arctangente:', `\\int \\frac{dx}{a^2+x^2} = \\frac{1}{a}\\arctan\\left(\\frac{x}{a}\\right)+C`],
                    ['Paso 3 — Sustituir a = ' + a + ':', `\\int \\frac{dx}{${a2}+x^2} = \\frac{1}{${a}}\\arctan\\left(\\frac{x}{${a}}\\right)+C`]
                ]
            },
            arcsin: {
                dominioRaiz: [-a, a],
                func: x => 1 / Math.sqrt(Math.max(a2 - x * x, 1e-12)),
                F: x => Math.asin(Math.min(1, Math.max(-1, x / a))),
                resultadoTex: `\\int \\frac{dx}{\\sqrt{${a2}-x^2}} = \\arcsin\\left(\\frac{x}{${a}}\\right) + C`,
                pasos: [
                    ['Paso 1 — Identificar la plantilla:', `f(x) = \\frac{1}{\\sqrt{a^2-x^2}}\\quad \\text{con} \\quad a = ${a}`],
                    ['Paso 2 — Aplicar la fórmula del arcseno:', `\\int \\frac{dx}{\\sqrt{a^2-x^2}} = \\arcsin\\left(\\frac{x}{a}\\right)+C`],
                    ['Paso 3 — Sustituir a = ' + a + ':', `\\int \\frac{dx}{\\sqrt{${a2}-x^2}} = \\arcsin\\left(\\frac{x}{${a}}\\right)+C`]
                ]
            },
            arcsec: {
                dominioRaiz: [a, Infinity],
                func: x => 1 / (Math.abs(x) * Math.sqrt(Math.max(x * x - a2, 1e-12))),
                F: x => (1 / a) * Math.acos(Math.min(1, Math.max(-1, a / Math.abs(x)))), // = (1/a)·arcsec(|x|/a)
                resultadoTex: `\\int \\frac{dx}{x\\sqrt{x^2-${a2}}} = \\frac{1}{${a}}\\,\\arcsec\\left(\\frac{|x|}{${a}}\\right) + C`,
                pasos: [
                    ['Paso 1 — Identificar la plantilla:', `f(x) = \\frac{1}{x\\sqrt{x^2-a^2}}\\quad \\text{con} \\quad a = ${a}`],
                    ['Paso 2 — Aplicar la fórmula de la arcosecante:', `\\int \\frac{dx}{x\\sqrt{x^2-a^2}} = \\frac{1}{a}\\,\\arcsec\\left(\\frac{|x|}{a}\\right)+C`],
                    ['Paso 3 — Sustituir a = ' + a + ':', `\\int \\frac{dx}{x\\sqrt{x^2-${a2}}} = \\frac{1}{${a}}\\,\\arcsec\\left(\\frac{|x|}{${a}}\\right)+C`]
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
        paso.className = 'paso';
        const h = document.createElement('h4');
        h.textContent = titulo;
        paso.appendChild(h);
        nodos.forEach(n => paso.appendChild(n));
        return paso;
    }

    function graficar(cfg, a, b, radio, clave) {
        const contenedor = document.getElementById('grafico');
        const n = 300;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            xs.push(x);
            ys.push(cfg.func(x));
        }

        const trazaArea = {
            x: xs, y: ys, mode: 'lines', name: 'f(x) — integrando',
            line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(234,128,252,0.30)'
        };

        // Antiderivada F(x) (verde punteada), centrada en el límite inferior
        const Fs = xs.map(x => cfg.F(x) - cfg.F(a));
        const trazaF = {
            x: xs, y: Fs, mode: 'lines', name: 'F(x) — antiderivada',
            line: { color: '#69f0ae', width: 2.5, dash: 'dot' }
        };

        const trazas = [trazaArea, trazaF];

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'Integrando… ¡está naciendo una función trigonométrica inversa!', font: { color: '#b388ff' } },
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
            `\\left[ F(x) \\right]_{${a}}^{${b}} = ${valorExacto.toFixed(6)}`, '');
        const pVer = document.createElement('p');
        pVer.className = 'nota nota-cian';
        pVer.appendChild(document.createTextNode('✔ Verificación numérica (Simpson, n=' + nS + '): '));
        const spanVer = document.createElement('span');
        renderizarFormula(spanVer, `\\approx ${suma.toFixed(6)}`, false);
        pVer.appendChild(spanVer);
        divResultados.appendChild(crearPaso('Valor de la integral definida:', [pEval, pVer]));

        const finalBox = document.createElement('div');
        finalBox.className = 'formula-box';
        const spanFinal = document.createElement('span');
        renderizarFormula(spanFinal, cfg.resultadoTex, true);
        finalBox.appendChild(spanFinal);
        divResultados.appendChild(finalBox);

        const nota = document.createElement('p');
        nota.className = 'nota';
        nota.textContent = '💡 Señales para reconocer estas integrales: denominador con suma de cuadrados → arctan; raíz de diferencia sin factor extra → arcsen; raíz de diferencia con x afuera → arcsec. Y no olvides el factor 1/a.';
        divResultados.appendChild(nota);
    }

    btnCalcular.addEventListener('click', function() {
        const clave = selectIntegral.value;
        const radio = parseFloat(inputAParam.value);
        const limInf = parseFloat(inputLimInf.value);
        const limSup = parseFloat(inputLimSup.value);

        if (isNaN(limInf) || isNaN(limSup)) {
            alert('Por favor, ingrese valores numéricos válidos para los límites.');
            return;
        }
        if (limInf === limSup) {
            alert('Los límites de integración deben ser diferentes.');
            return;
        }
        if (isNaN(radio) || radio <= 0) {
            alert('El parámetro a debe ser un número positivo.');
            return;
        }

        const cfg = construirConfig(clave, radio);

        // Validaciones de dominio según la plantilla
        const lo = Math.min(limInf, limSup), hi = Math.max(limInf, limSup);
        if (cfg.dominioRaiz) {
            if (clave === 'arcsin' && (lo < -radio || hi > radio)) {
                alert(`Para √(${radio * radio}−x²) el intervalo debe estar dentro de [−${radio}, ${radio}]. Ajusta los límites o aumenta a.`);
                return;
            }
            if (clave === 'arcsec' && lo < radio && hi > -radio) {
                alert(`La plantilla arcsec exige |x| ≥ a = ${radio}: usa un intervalo completamente fuera de (−${radio}, ${radio}), por ejemplo [${radio}, ${radio + 2}].`);
                return;
            }
        }

        graficar(cfg, limInf, limSup, radio, clave);
        mostrarResultados(cfg, limInf, limSup);
    });

    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputAParam.value));
    graficar(cfgInicial, parseFloat(inputLimInf.value), parseFloat(inputLimSup.value), parseFloat(inputAParam.value), selectIntegral.value);
});
