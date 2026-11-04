// ===== MÓDULO 11: SUSTITUCIÓN TRIGONOMÉTRICA =====

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
    const inputAParam = document.getElementById('param-k'); // parámetro a del radicando
    const inputLimInf = document.getElementById('a');       // límite inferior
    const inputLimSup = document.getElementById('b');       // límite superior
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    // a = radio/parámetro. Claves: circulo, inversa, hiperbola
    function construirConfig(clave, a) {
        const a2 = a * a;
        const configs = {
            circulo: {
                dominioRaiz: [-a, a],
                func: x => Math.sqrt(Math.max(a2 - x * x, 0)),
                F: x => (a2 / 2) * Math.asin(Math.min(1, Math.max(-1, x / a))) + (x * Math.sqrt(Math.max(a2 - x * x, 0))) / 2,
                texF: `\\frac{${a2}}{2}\\arcsen\\left(\\frac{x}{${a}}\\right) + \\frac{x\\sqrt{${a2}-x^2}}{2}`,
                resultadoTex: `\\int \\sqrt{${a2}-x^2}\\,dx = \\frac{${a2}}{2}\\arcsen\\left(\\frac{x}{${a}}\\right) + \\frac{x\\sqrt{${a2}-x^2}}{2} + C`,
                pasos: [
                    ['Paso 1 — Sustitución x = a·sen θ:', `x = ${a}\\sin\\theta,\\quad dx = ${a}\\cos\\theta\\,d\\theta,\\quad \\sqrt{${a2}-x^2} = ${a}\\cos\\theta`],
                    ['Paso 2 — Integral trigonométrica:', `\\int ${a}\\cos\\theta \\cdot ${a}\\cos\\theta\\,d\\theta = ${a2}\\int\\cos^2\\theta\\,d\\theta = ${a2}\\left(\\frac{\\theta}{2}+\\frac{\\sin 2\\theta}{4}\\right)+C`],
                    ['Paso 3 — Regresar con el triángulo (θ = arcsen(x/a)):', `\\frac{${a2}}{2}\\arcsen\\left(\\frac{x}{${a}}\\right) + \\frac{x\\sqrt{${a2}-x^2}}{2} + C`]
                ]
            },
            inversa: {
                dominioRaiz: [-a, a],
                func: x => x * x * Math.sqrt(Math.max(a2 - x * x, 0)),
                F: x => {
                    const t = Math.asin(Math.min(1, Math.max(-1, x / a)));
                    return (a2 * a2 / 8) * (2 * t - Math.sin(4 * t) / 2 - Math.sin(2 * t));
                },
                texF: `\\frac{${a2 * a2}}{8}\\left(2\\theta - \\frac{\\sin 4\\theta}{2} - \\sin 2\\theta\\right)`,
                resultadoTex: `\\int x^2\\sqrt{${a2}-x^2}\\,dx = \\frac{${a2 * a2}}{8}\\left(2\\arcsen\\tfrac{x}{${a}} - \\frac{x\\sqrt{${a2}-x^2}\,(2x^2-a^2)}{...}\\right)` ,
                extraTex: `\\text{Forma final: } \\frac{${a2 * a2}}{4}\\arcsen\\left(\\frac{x}{${a}}\\right) - \\frac{x(2x^2-a^2)\\sqrt{${a2}-x^2}}{8} + C`,
                pasos: [
                    ['Paso 1 — Sustitución x = a·sen θ:', `x^2 = ${a2}\\sin^2\\theta,\\quad \\sqrt{${a2}-x^2}=${a}\\cos\\theta,\\quad dx=${a}\\cos\\theta\\,d\\theta`],
                    ['Paso 2 — Potencias trigonométricas:', `${a2 * a2}\\int \\sin^2\\theta\\cos^2\\theta\\,d\\theta = ${a2 * a2}\\int \\frac{\\sin^2 2\\theta}{4}\\,d\\theta = \\frac{${a2 * a2}}{4}\\int\\frac{1-\\cos 4\\theta}{2}\\,d\\theta`],
                    ['Paso 3 — Integrar y regresar con el triángulo:', `\\frac{${a2 * a2}}{8}\\left(2\\theta - \\frac{\\sin 4\\theta}{2}\\right)+C = \\frac{${a2 * a2}}{4}\\arcsen\\left(\\frac{x}{${a}}\\right) - \\frac{x(2x^2-${a2})\\sqrt{${a2}-x^2}}{8}+C`]
                ]
            },
            hiperbola: {
                dominioRaiz: null,
                func: x => Math.sqrt(a2 + x * x),
                F: x => (x * Math.sqrt(a2 + x * x)) / 2 + (a2 / 2) * Math.log(x + Math.sqrt(a2 + x * x)),
                texF: `\\frac{x\\sqrt{${a2}+x^2}}{2} + \\frac{${a2}}{2}\\ln\\left|x+\\sqrt{${a2}+x^2}\\right|`,
                resultadoTex: `\\int \\sqrt{${a2}+x^2}\\,dx = \\frac{x\\sqrt{${a2}+x^2}}{2} + \\frac{${a2}}{2}\\ln\\left|x+\\sqrt{${a2}+x^2}\\right| + C`,
                pasos: [
                    ['Paso 1 — Sustitución x = a·tan θ:', `x = ${a}\\tan\\theta,\\quad dx = ${a}\\sec^2\\theta\\,d\\theta,\\quad \\sqrt{${a2}+x^2} = ${a}\\sec\\theta`],
                    ['Paso 2 — Integral de sec³:', `${a2}\\int\\sec^3\\theta\\,d\\theta = ${a2}\\left(\\frac{\\sec\\theta\\tan\\theta}{2}+\\frac{\\ln|\\sec\\theta+\\tan\\theta|}{2}\\right)+C`],
                    ['Paso 3 — Regresar (tan θ = x/a, sec θ = √(a²+x²)/a):', `\\frac{x\\sqrt{${a2}+x^2}}{2} + \\frac{${a2}}{2}\\ln\\left|x+\\sqrt{${a2}+x^2}\\right| + C`]
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
            x: xs, y: ys, mode: 'lines', name: 'Área bajo f(x)',
            line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(234,128,252,0.30)'
        };
        const trazas = [trazaArea];

        // Ayuda geométrica: círculo completo si aplica
        if (clave !== 'hiperbola') {
            const th = [], cx = [], cy = [];
            for (let i = 0; i <= 200; i++) {
                const t = 2 * Math.PI * i / 200;
                th.push(t);
                cx.push(radio * Math.cos(t));
                cy.push(radio * Math.sin(t));
            }
            trazas.push({
                x: cx, y: cy, mode: 'lines', name: `Círculo x²+y²=${radio * radio}`,
                line: { color: '#ffd54f', width: 1.5, dash: 'dash' }
            });
        }

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'El integrando con raíz... ¡es geometría circular!', font: { color: '#b388ff' } },
            xaxis: { title: 'x', gridcolor: '#3d2a66', zerolinecolor: '#4a3570', linecolor: '#3d2a66', scaleanchor: 'y' },
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
        renderizarFormula(spanFinal, cfg.resultadoTex.replace('...', '\\sqrt{}'), true);
        finalBox.appendChild(spanFinal);
        if (cfg.extraTex) {
            const spanExtra = document.createElement('span');
            renderizarFormula(spanExtra, cfg.extraTex, true);
            finalBox.appendChild(spanExtra);
        }
        divResultados.appendChild(finalBox);

        const nota = document.createElement('p');
        nota.className = 'nota-educativa';
        nota.textContent = '💡 Siempre que veas √(a²−x²), √(a²+x²) o √(x²−a²), piensa en sen, tan y sec respectivamente: las identidades pitagóricas disuelven la raíz.';
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

        if (cfg.dominioRaiz) {
            const lo = Math.min(limInf, limSup), hi = Math.max(limInf, limSup);
            if (lo < -radio || hi > radio) {
                alert(`Para √(${radio * radio}−x²) el intervalo debe estar dentro de [−${radio}, ${radio}]. Ajusta los límites o aumenta a.`);
                return;
            }
        }

        graficar(cfg, limInf, limSup, radio, clave);
        mostrarResultados(cfg, limInf, limSup);
    });

    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputAParam.value));
    graficar(cfgInicial, parseFloat(inputLimInf.value), parseFloat(inputLimSup.value), parseFloat(inputAParam.value), selectIntegral.value);
});
