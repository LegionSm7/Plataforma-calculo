// ===== MÓDULO 7: SUSTITUCIÓN / POTENCIAS =====

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
    const inputA = document.getElementById('a');
    const inputB = document.getElementById('b');
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    // 3. Catálogo de integrales resolubles por sustitución
    //    g(x): sustitución u = g(x); k: factor tal que k*g'(x) es el factor del integrando
    //    f(u): función que queda tras sustituir; F(u): su antiderivada
    const INTEGRALES = {
        polinomio: {
            nombre: '∫ 2x(x² + 1)⁵ dx',
            texIntegrando: '2x(x^2+1)^5',
            uTex: 'x^2 + 1',
            duTex: '2x \\, dx',
            g: x => x * x + 1,
            dg: x => 2 * x,
            k: 1,                    // integrando = k * f(g(x)) * g'(x)
            fTex: 'u^5',
            f: u => Math.pow(u, 5),
            FTex: '\\frac{u^6}{6}',
            F: u => Math.pow(u, 6) / 6,
            resultadoTex: '\\frac{(x^2+1)^6}{6} + C'
        },
        radical: {
            nombre: '∫ 3x²√(x³ + 2) dx',
            texIntegrando: '3x^2\\sqrt{x^3+2}',
            uTex: 'x^3 + 2',
            duTex: '3x^2 \\, dx',
            g: x => x * x * x + 2,
            dg: x => 3 * x * x,
            k: 1,
            fTex: '\\sqrt{u} = u^{1/2}',
            f: u => u >= 0 ? Math.sqrt(u) : NaN,
            FTex: '\\frac{2}{3}u^{3/2}',
            F: u => u >= 0 ? (2 / 3) * Math.pow(u, 1.5) : NaN,
            resultadoTex: '\\frac{2}{3}(x^3+2)^{3/2} + C'
        },
        trig: {
            nombre: '∫ sen(x)cos²(x) dx',
            texIntegrando: '\\sin(x)\\cos^2(x)',
            uTex: '\\cos(x)',
            duTex: '-\\sin(x) \\, dx',
            g: x => Math.cos(x),
            dg: x => -Math.sin(x),
            k: -1,                   // sen(x)dx = -du  →  integral = -∫u² du
            fTex: 'u^2',
            f: u => u * u,
            FTex: '\\frac{u^3}{3}',
            F: u => Math.pow(u, 3) / 3,
            resultadoTex: '-\\frac{\\cos^3(x)}{3} + C'
        },
        log: {
            nombre: '∫ eˣ(eˣ + 4)³ dx',
            texIntegrando: 'e^x(e^x+4)^3',
            uTex: 'e^x + 4',
            duTex: 'e^x \\, dx',
            g: x => Math.exp(x) + 4,
            dg: x => Math.exp(x),
            k: 1,
            fTex: 'u^3',
            f: u => Math.pow(u, 3),
            FTex: '\\frac{u^4}{4}',
            F: u => Math.pow(u, 4) / 4,
            resultadoTex: '\\frac{(e^x+4)^4}{4} + C'
        }
    };

    // 4. Renderizar una fórmula KaTeX dentro de un elemento
    function renderizarFormula(elemento, formula, displayMode = false) {
        if (typeof katex !== 'undefined') {
            katex.render(formula, elemento, { displayMode: displayMode, throwOnError: false });
        } else {
            elemento.textContent = formula;
        }
    }

    // Crear un <p> con texto normal + una fórmula en línea
    function parrafoConFormula(textoAntes, latex, textoDespues) {
        const p = document.createElement('p');
        if (textoAntes) p.appendChild(document.createTextNode(textoAntes));
        const span = document.createElement('span');
        renderizarFormula(span, latex, false);
        p.appendChild(span);
        if (textoDespues) p.appendChild(document.createTextNode(textoDespues));
        return p;
    }

    // Crear un bloque de paso (similar a los ejemplos de teoría)
    function crearPaso(titulo, nodos) {
        const paso = document.createElement('div');
        paso.className = 'paso-resuelto';
        const h = document.createElement('h4');
        h.textContent = titulo;
        paso.appendChild(h);
        nodos.forEach(n => paso.appendChild(n));
        return paso;
    }

    // 5. Gráfica comparativa: área bajo f(g(x))·g'(x)·k en [a,b] vs área bajo f(u) en [g(a),g(b)]
    function graficarSustitucion(cfg, a, b) {
        const contenedor = document.getElementById('grafico');
        const pasos = 200;

        // Panel izquierdo: variable x
        let xs = [], ysX = [];
        for (let i = 0; i <= pasos; i++) {
            const x = a + (b - a) * i / pasos;
            xs.push(x);
            ysX.push(cfg.k * cfg.f(cfg.g(x)) * cfg.dg(x));
        }

        // Panel derecho: variable u
        const ua = cfg.g(a), ub = cfg.g(b);
        const uMin = Math.min(ua, ub), uMax = Math.max(ua, ub);
        const us = [], ysU = [];
        for (let i = 0; i <= pasos; i++) {
            const u = uMin + (uMax - uMin) * i / pasos;
            us.push(u);
            ysU.push(cfg.f(u));
        }

        const trazaX = {
            x: xs, y: ysX, mode: 'lines', name: `f(g(x))·g'(x) — variable x`,
            line: { color: '#b388ff', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(179,136,255,0.25)', xaxis: 'x', yaxis: 'y'
        };
        const trazaU = {
            x: us, y: ysU, mode: 'lines', name: 'f(u) — variable u',
            line: { color: '#4dd0e1', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(77,208,225,0.25)', xaxis: 'x2', yaxis: 'y2'
        };

        const baseEje = { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66' };

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'La sustitución conserva el área: ambas integrales valen lo mismo', font: { color: '#b388ff' } },
            grid: { rows: 1, columns: 2, pattern: 'independent' },
            annotations: [
                { text: `Variable original x ∈ [${a}, ${b}]`, xref: 'paper', yref: 'paper', x: 0.22, y: 1.02, showarrow: false, font: { color: '#b388ff', size: 12 } },
                { text: `Nueva variable u ∈ [${ua.toFixed(2)}, ${ub.toFixed(2)}]`, xref: 'paper', yref: 'paper', x: 0.78, y: 1.02, showarrow: false, font: { color: '#4dd0e1', size: 12 } }
            ],
            xaxis: Object.assign({ title: 'x', domain: [0, 0.45] }, baseEje),
            yaxis: Object.assign({ title: 'integrande en x', domain: [0, 1] }, baseEje),
            xaxis2: Object.assign({ title: 'u', domain: [0.55, 1] }, baseEje),
            yaxis2: Object.assign({ title: 'integrande en u', domain: [0, 1] }, baseEje),
            showlegend: true,
            legend: { x: 0.5, y: 0.02, bgcolor: 'rgba(30,17,51,0.8)', font: { size: 11 } },
            margin: { t: 70, r: 20, b: 50, l: 55 }
        };

        Plotly.newPlot(contenedor, [trazaX, trazaU], layout, { responsive: true });
    }

    // 6. Mostrar el procedimiento paso a paso
    function mostrarResultados(cfg, a, b) {
        divResultados.innerHTML = '';

        const ua = cfg.g(a), ub = cfg.g(b);

        // Calcular valor exacto (TFC en la variable u) y numérico (Simpson en x) como verificación
        const valorExacto = cfg.k * (cfg.F(ub) - cfg.F(ua));

        const nS = 200, hx = (b - a) / nS;
        let sumaNum = cfg.k * (cfg.f(cfg.g(a)) * cfg.dg(a) + cfg.f(cfg.g(b)) * cfg.dg(b));
        for (let i = 1; i < nS; i++) {
            const x = a + i * hx;
            sumaNum += (i % 2 === 1 ? 4 : 2) * cfg.k * cfg.f(cfg.g(x)) * cfg.dg(x);
        }
        sumaNum *= hx / 3;

        // --- PASO 1: Elegir u ---
        divResultados.appendChild(crearPaso('Paso 1 — Elegimos la sustitución:', [
            parrafoConFormula('Identificamos la parte interna: ', `u = ${cfg.uTex}`, '')
        ]));

        // --- PASO 2: Diferencial ---
        divResultados.appendChild(crearPaso('Paso 2 — Calculamos el diferencial:', [
            parrafoConFormula('Derivamos: ', `du = ${cfg.duTex}`, '')
        ]));

        // --- PASO 3: Transformar límites ---
        divResultados.appendChild(crearPaso('Paso 3 — Transformamos los límites de integración:', [
            parrafoConFormula(`Si x = ${a}, entonces: `, `u = g(${a}) = ${ua.toFixed(4)}`, ''),
            parrafoConFormula(`Si x = ${b}, entonces: `, `u = g(${b}) = ${ub.toFixed(4)}`, '')
        ]));

        // --- PASO 4: Integral en u ---
        const p4a = parrafoConFormula('La integral se reescribe como: ',
            `${cfg.k === -1 ? '-' : ''}\\int_{${ua.toFixed(4)}}^{${ub.toFixed(4)}} ${cfg.fTex} \\, du`, '');
        const p4b = parrafoConFormula('Que se integra directamente: ',
            `${cfg.k === -1 ? '-' : ''}\\left[ ${cfg.FTex} \\right]_{${ua.toFixed(4)}}^{${ub.toFixed(4)}}`, '');
        divResultados.appendChild(crearPaso('Paso 4 — Integramos en u (¡ahora es inmediata!):', [p4a, p4b]));

        // --- PASO 5: Valor numérico ---
        const p5 = parrafoConFormula('Evaluando en los límites transformados: ',
            `${cfg.k === -1 ? '-' : ''}\\left(${cfg.FTex}\\right)\\Big|_{${ua.toFixed(4)}}^{${ub.toFixed(4)}} = ${valorExacto.toFixed(6)}`, '');
        const p5b = document.createElement('p');
        p5b.className = 'verificacion';
        p5b.appendChild(document.createTextNode('✔ Verificación numérica (Simpson sobre la integral original en x): '));
        const spanVer = document.createElement('span');
        renderizarFormula(spanVer, `\\approx ${sumaNum.toFixed(6)}`, false);
        p5b.appendChild(spanVer);
        divResultados.appendChild(crearPaso('Paso 5 — Valor de la integral definida:', [p5, p5b]));

        // --- RESULTADO FINAL (indefinida) ---
        const finalBox = document.createElement('div');
        finalBox.className = 'resultado-final';
        const hFinal = document.createElement('h4');
        hFinal.textContent = '🏁 Resultado general (regresando a x):';
        finalBox.appendChild(hFinal);
        const spanFinal = document.createElement('span');
        renderizarFormula(spanFinal, `\\int ${cfg.texIntegrando} \\, dx = ${cfg.resultadoTex}`, true);
        finalBox.appendChild(spanFinal);
        divResultados.appendChild(finalBox);

        // --- NOTA EDUCATIVA ---
        const nota = document.createElement('p');
        nota.className = 'nota-educativa';
        nota.appendChild(document.createTextNode(
            `💡 Observa las dos gráficas: el área bajo el integrando original en x (morado, en [${a}, ${b}]) es exactamente igual al área bajo f(u) (cian, en [${ua.toFixed(2)}, ${ub.toFixed(2)}]). La sustitución no cambia el valor de la integral: solo cambia la lente con la que la miramos.`
        ));
        divResultados.appendChild(nota);
    }

    // 7. Evento principal del botón
    btnCalcular.addEventListener('click', function() {
        const clave = selectIntegral.value;
        const cfg = INTEGRALES[clave];
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

        mostrarResultados(cfg, a, b);
        graficarSustitucion(cfg, a, b);
    });

    // 8. Ejecutar al cargar la página
    btnCalcular.click();
});
