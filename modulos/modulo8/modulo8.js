// ===== MÓDULO 8: INTEGRALES EXPONENCIALES =====

document.addEventListener('DOMContentLoaded', function() {

    // 1. Inicializar KaTeX para las fórmulas estáticas del HTML
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }

    // 2. Referencias al DOM
    const selectIntegral = document.getElementById('integral');
    const inputK = document.getElementById('param-k');
    const inputA = document.getElementById('a');
    const inputB = document.getElementById('b');
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    // 3. Catálogo de familias exponenciales
    //    Cada configuración se construye con el valor k actual.
    //    integrando(x) = f(g(x)) * g'(x) * k (ya incluido en "func")
    function construirConfig(clave, k) {
        const configs = {
            simple: {
                nombre: '∫ e^{kx} dx',
                texIntegrando: `e^{${k}x}`,
                usaK: true,
                func: x => Math.exp(k * x),
                F: x => Math.exp(k * x) / k,
                texF: `\\frac{1}{${k}}e^{${k}x}`,
                resultadoTex: `\\int e^{${k}x}\\,dx = \\frac{1}{${k}}e^{${k}x} + C`,
                pasos: [
                    ['Paso 1 — Sustitución:', `u = ${k}x, \\quad du = ${k}\\,dx \\quad\\Rightarrow\\quad dx = \\frac{du}{${k}}`],
                    ['Paso 2 — Reescribir en u:', `\\int e^{u}\\,\\frac{du}{${k}} = \\frac{1}{${k}}\\int e^{u}\\,du`],
                    ['Paso 3 — Integrar y regresar:', `\\frac{1}{${k}}e^{u} + C = \\frac{1}{${k}}e^{${k}x} + C`]
                ]
            },
            cadena: {
                nombre: '∫ 2x·e^(x²) dx',
                texIntegrando: `${2*k}x\\,e^{${k}x^2}`,
                usaK: true,
                func: x => 2 * k * x * Math.exp(k * x * x),
                F: x => Math.exp(k * x * x),
                texF: `e^{${k}x^2}`,
                resultadoTex: `\\int ${2*k}x\\,e^{${k}x^2}dx = e^{${k}x^2} + C`,
                pasos: [
                    ['Paso 1 — Sustitución (exponente interno):', `u = ${k}x^2, \\quad du = ${2*k}x\\,dx`],
                    ['Paso 2 — Reescribir en u:', `\\int e^{u}\\,du`],
                    ['Paso 3 — Integrar y regresar:', `e^{u} + C = e^{${k}x^2} + C`]
                ]
            },
            decaimiento: {
                nombre: '∫ k·e^(−kx) dx',
                texIntegrando: `${k}e^{-${k}x}`,
                usaK: true,
                func: x => k * Math.exp(-k * x),
                F: x => -Math.exp(-k * x),
                texF: `-e^{-${k}x}`,
                resultadoTex: `\\int ${k}e^{-${k}x}dx = -e^{-${k}x} + C`,
                pasos: [
                    ['Paso 1 — Sustitución:', `u = -${k}x, \\quad du = -${k}\\,dx \\quad\\Rightarrow\\quad ${k}\\,dx = -du`],
                    ['Paso 2 — Reescribir en u:', `\\int -e^{u}\\,du = -\\int e^{u}\\,du`],
                    ['Paso 3 — Integrar y regresar:', `-e^{u} + C = -e^{-${k}x} + C`]
                ]
            },
            'base-a': {
                nombre: '∫ 2ˣ dx',
                texIntegrando: '2^{x}',
                usaK: false,
                func: x => Math.pow(2, x),
                F: x => Math.pow(2, x) / Math.LN2,
                texF: '\\frac{2^{x}}{\\ln 2}',
                resultadoTex: '\\int 2^{x}\\,dx = \\frac{2^{x}}{\\ln 2} + C',
                pasos: [
                    ['Paso 1 — Reescribir con base e:', `2^{x} = e^{x\\ln 2}`],
                    ['Paso 2 — Integrar la exponencial:', `\\int e^{(\\ln 2)x}\\,dx = \\frac{1}{\\ln 2}e^{(\\ln 2)x} + C`],
                    ['Paso 3 — Regresar a base 2:', `\\frac{2^{x}}{\\ln 2} + C \\qquad (\\ln 2 \\approx 0.6931)`]
                ]
            }
        };
        return configs[clave];
    }

    // 4. Renderizar una fórmula KaTeX dentro de un elemento
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

    // 5. Gráfica: integrando + área sombreada + antiderivada
    function graficar(cfg, a, b) {
        const contenedor = document.getElementById('grafico');
        const pasos = 300;
        const xs = [], ys = [], Fs = [];
        for (let i = 0; i <= pasos; i++) {
            const x = a + (b - a) * i / pasos;
            xs.push(x);
            ys.push(cfg.func(x));
            Fs.push(cfg.F(x));
        }

        // Rango extendido para mostrar contexto fuera de [a,b]
        const ext = (b - a) * 0.25;
        const xe = [], ye = [], Fe = [];
        for (let i = 0; i <= pasos; i++) {
            const x = (a - ext) + ((b + ext) - (a - ext)) * i / pasos;
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
            title: { text: 'f(x) (morado), área sombreada (orquídea) y F(x) punteada (cian)', font: { color: '#b388ff' } },
            xaxis: { title: 'x', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
            yaxis: { title: 'y', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' },
            showlegend: true,
            legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(30,17,51,0.8)', font: { size: 11 } },
            margin: { t: 60, r: 20, b: 50, l: 60 }
        };

        Plotly.newPlot(contenedor, [trazaArea, trazaCurva, trazaF], layout, { responsive: true });
    }

    // 6. Resultados paso a paso + valor numérico verificado
    function mostrarResultados(cfg, a, b) {
        divResultados.innerHTML = '';

        const valorExacto = cfg.F(b) - cfg.F(a);

        // Verificación numérica (Simpson)
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
        nota.textContent = '💡 Observa la gráfica: donde f(x) > 0, la antiderivada F(x) (cian punteada) crece; donde f(x) < 0, F decrece. El área sombreada entre a y b es exactamente F(b) − F(a).';
        divResultados.appendChild(nota);
    }

    // 7. Evento principal
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
        if ((clave === 'simple' || clave === 'cadena' || clave === 'decaimiento') && (isNaN(k) || k === 0)) {
            alert('El parámetro k debe ser un número distinto de 0.');
            return;
        }

        const cfg = construirConfig(clave, k);
        graficar(cfg, a, b);
        mostrarResultados(cfg, a, b);
    });

    // 8. Cálculo inicial al cargar
    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputK.value));
    graficar(cfgInicial, parseFloat(inputA.value), parseFloat(inputB.value));
});
