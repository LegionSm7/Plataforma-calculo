// ===== MÓDULO 19: SUSTITUCIÓN UNIVERSAL t = tan(x/2) (Sustitución Z / Weierstrass) =====

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
    const inputB = document.getElementById('param-b');
    const inputC = document.getElementById('param-c');
    const inputK = document.getElementById('param-k');
    const limInf = document.getElementById('a');
    const limSup = document.getElementById('b');
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    function fmt(v) {
        const r = Math.round(v * 1000) / 1000;
        return String(r);
    }

    // Tex de un polinomio cuadrático A t² + B t + C con signos encadenados
    function quadTex(A, B, C) {
        let s = '';
        if (Math.abs(A) > 1e-12) s += (A === 1 ? '' : (A === -1 ? '-' : fmt(A))) + 't^2';
        if (Math.abs(B) > 1e-12) {
            if (s === '') s += (B === 1 ? '' : (B === -1 ? '-' : fmt(B))) + 't';
            else s += (B > 0 ? ' + ' : ' - ') + (Math.abs(B) === 1 ? '' : fmt(Math.abs(B))) + 't';
        }
        if (Math.abs(C) > 1e-12 || s === '') {
            if (s === '') s += fmt(C);
            else s += (C > 0 ? ' + ' : ' - ') + fmt(Math.abs(C));
        }
        return s;
    }

    // Integra ∫ dx/(p + q·sin(kx) + r·cos(kx)) vía t = tan(kx/2):
    //   sin(kx)=2t/(1+t²), cos(kx)=(1−t²)/(1+t²), dx=2dt/(1+t²)
    //   ⇒ ∫ 2 dt / [ (p−r)t² + 2q·t + (p+r) ]
    function construirConfig(clave, p, q, r, k) {

        // Normalizar coeficientes según la familia elegida
        if (clave === 'sen')      { q = 1; r = 0; }
        if (clave === 'cos')      { q = 0; r = 1; }
        if (clave === 'unomas')   { p = 1; q = 1; r = 0; }
        if (clave === 'unomenos') { p = 1; q = -1; r = 0; }

        const A = p - r, Bc = 2 * q, C = p + r;   // Q(t) = A t² + Bc t + C
        const disc = Bc * Bc - 4 * A * C;          // discriminante de Q(t)

        const denomTex = (() => {
            let s = fmt(p);
            if (Math.abs(q) > 1e-12) s += (q > 0 ? ' + ' : ' - ') + (Math.abs(q) === 1 ? '' : fmt(Math.abs(q))) + '\\sin(' + fmt(k) + 'x)';
            if (Math.abs(r) > 1e-12) s += (r > 0 ? ' + ' : ' - ') + (Math.abs(r) === 1 ? '' : fmt(Math.abs(r))) + '\\cos(' + fmt(k) + 'x)';
            return s;
        })();

        const func = x => 1 / (p + q * Math.sin(k * x) + r * Math.cos(k * x));

        let F, resultadoTex, casoTex, pasos;

        const kt = x => Math.tan(k * x / 2);   // sustitución con frecuencia k
        const dxTex = `dx = \\frac{2\\,dt}{${fmt(k)}(1+t^2)}`;

        if (Math.abs(A) < 1e-12) {
            // Lineal en t: ∫ (2/k)dt/(Bc t + C) = (2/(k·Bc)) ln|Bc t + C|
            if (Math.abs(Bc) < 1e-12) throw new Error('el denominador es constante nulo.');
            F = x => (2 / (k * Bc)) * Math.log(Math.abs(Bc * kt(x) + C));
            resultadoTex = `\\int \\frac{dx}{${denomTex}} = \\frac{2}{${fmt(k * Bc)}}\\ln\\left|${quadTex(0, Bc, C)}\\right| + C`;
            casoTex = `$Q(t)$ es lineal ($p=r$): aparece un logaritmo directo.`;
            pasos = [
                ['Paso 1 — Cambio tangencial:', `t = \\tan\\!\\left(\\tfrac{${fmt(k)}x}{2}\\right), \\quad ${dxTex}`],
                ['Paso 2 — Racionalizar:', `\\int \\frac{2\\,dt}{${fmt(k)}\\left(${quadTex(0, Bc, C)}\\right)}`],
                ['Paso 3 — Integrar (logaritmo):', `\\frac{2}{${fmt(k * Bc)}}\\ln\\left|${quadTex(0, Bc, C)}\\right| + C`],
                ['Paso 4 — Regresar a x:', `t = \\tan\\!\\left(\\tfrac{${fmt(k)}x}{2}\\right)`]
            ];
        } else if (disc < -1e-12) {
            // Irreducible → arctan: ∫(2/k)dt/(At²+Bt+C) = 4/(k√(4AC−B²)) · arctan((2At+B)/√(4AC−B²))
            const s = Math.sqrt(-disc);
            F = x => (4 / (k * s)) * Math.atan((2 * A * kt(x) + Bc) / s);
            resultadoTex = `\\int \\frac{dx}{${denomTex}} = \\frac{4}{${fmt(k * s)}}\\arctan\\!\\left(\\frac{${fmt(2 * A)}t + ${fmt(Bc)}}{${fmt(s)}}\\right) + C`;
            casoTex = `$\\Delta = ${fmt(disc)} < 0$: el denominador en $t$ es irreducible → sale $\\arctan$ (completar cuadrado).`;
            pasos = [
                ['Paso 1 — Cambio tangencial:', `t = \\tan\\!\\left(\\tfrac{${fmt(k)}x}{2}\\right), \\quad ${dxTex}`],
                ['Paso 2 — Racionalizar:', `\\int \\frac{2\\,dt}{${fmt(k)}\\left(${quadTex(A, Bc, C)}\\right)}`],
                ['Paso 3 — Completar el cuadrado:', `${quadTex(A, Bc, C)} = ${fmt(A)}\\left(t ${Bc >= 0 ? '+' : '-'} ${fmt(Math.abs(Bc / (2 * A)))}\\right)^2 + ${fmt(C - Bc * Bc / (4 * A))}`],
                ['Paso 4 — Fórmula de arctan:', `\\frac{4}{${fmt(k * s)}}\\arctan\\!\\left(\\frac{${fmt(2 * A)}t + ${fmt(Bc)}}{${fmt(s)}}\\right) + C`],
                ['Paso 5 — Regresar a x:', `t = \\tan\\!\\left(\\tfrac{${fmt(k)}x}{2}\\right)`]
            ];
        } else if (disc > 1e-12) {
            // Dos raíces reales → fracciones parciales → logaritmos
            const s = Math.sqrt(disc);
            const t1 = (-Bc + s) / (2 * A), t2 = (-Bc - s) / (2 * A);
            F = x => {
                const t = kt(x);
                return (2 / (k * s)) * Math.log(Math.abs((t - t1) / (t - t2)));
            };
            resultadoTex = `\\int \\frac{dx}{${denomTex}} = \\frac{2}{${fmt(k * s)}}\\ln\\left|\\frac{t - (${fmt(t1)})}{t - (${fmt(t2)})}\\right| + C`;
            casoTex = `$\\Delta = ${fmt(disc)} > 0$: dos raíces reales en $Q(t)$ → fracciones parciales y logaritmos.`;
            pasos = [
                ['Paso 1 — Cambio tangencial:', `t = \\tan\\!\\left(\\tfrac{${fmt(k)}x}{2}\\right), \\quad ${dxTex}`],
                ['Paso 2 — Racionalizar:', `\\int \\frac{2\\,dt}{${fmt(k)}\\left(${quadTex(A, Bc, C)}\\right)}`],
                ['Paso 3 — Raíces de Q(t):', `t_1 = ${fmt(t1)}, \\qquad t_2 = ${fmt(t2)}`],
                ['Paso 4 — Fracciones parciales:', `\\frac{2}{${fmt(k)}(t - (${fmt(t1)}))(t - (${fmt(t2)}))} = \\frac{${fmt(2 / (k * s))}}{t - (${fmt(t1)})} - \\frac{${fmt(2 / (k * s))}}{t - (${fmt(t2)})}`],
                ['Paso 5 — Integrar:', `\\frac{2}{${fmt(k * s)}}\\ln\\left|\\frac{t - (${fmt(t1)})}{t - (${fmt(t2)})}\\right| + C`],
                ['Paso 6 — Regresar a x:', `t = \\tan\\!\\left(\\tfrac{${fmt(k)}x}{2}\\right)`]
            ];
        } else {
            // Doble raíz → potencia −1
            const t0 = -Bc / (2 * A);
            F = x => -2 / (k * A * (kt(x) - t0));
            resultadoTex = `\\int \\frac{dx}{${denomTex}} = -\\frac{2}{${fmt(k * A)}\\left(t ${t0 >= 0 ? '-' : '+'} ${fmt(Math.abs(t0))}\\right)} + C`;
            casoTex = `$\\Delta = 0$: raíz doble en $Q(t)$ → integral de una potencia $-1$ (¡sin logaritmos!).`;
            pasos = [
                ['Paso 1 — Cambio tangencial:', `t = \\tan\\!\\left(\\tfrac{${fmt(k)}x}{2}\\right), \\quad ${dxTex}`],
                ['Paso 2 — Racionalizar:', `\\int \\frac{2\\,dt}{${fmt(k)}\\left(${quadTex(A, Bc, C)}\\right)}`],
                ['Paso 3 — Raíz doble:', `${quadTex(A, Bc, C)} = ${fmt(A)}\\left(t ${t0 >= 0 ? '-' : '+'} ${fmt(Math.abs(t0))}\\right)^2`],
                ['Paso 4 — Integrar la potencia:', `-\\frac{2}{${fmt(k * A)}\\left(t ${t0 >= 0 ? '-' : '+'} ${fmt(Math.abs(t0))}\\right)} + C`],
                ['Paso 5 — Regresar a x:', `t = \\tan\\!\\left(\\tfrac{${fmt(k)}x}{2}\\right)`]
            ];
        }

        return {
            texIntegrando: `\\int \\frac{dx}{${denomTex}}`,
            func, F, resultadoTex, casoTex, pasos,
            racionalTex: `\\int \\frac{2\\,dt}{${fmt(k)}\\left(${quadTex(A, Bc, C)}\\right)}`,
            estrategia: 'Racionalización universal: todo R(sin x, cos x) se vuelve una fracción parcial en t = tan(x/2)'
        };
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

    function graficar(cfg, a, b, k) {
        const contenedor = document.getElementById('grafico');
        const n = 400;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            const y = cfg.func(x);
            xs.push(x);
            ys.push(isFinite(y) && Math.abs(y) < 1e4 ? y : null);
        }

        const trazas = [{
            x: xs, y: ys, mode: 'lines', name: 'f(x) integrando',
            line: { color: '#4dd0e1', width: 3 }, fill: 'tozeroy',
            fillcolor: 'rgba(77,208,225,0.22)'
        }];

        const Fs = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            const v = cfg.F(x);
            Fs.push(isFinite(v) && Math.abs(v) < 1e4 ? v : null);
        }
        trazas.push({
            x: xs.slice(), y: Fs, mode: 'lines', name: 'F(x) antiderivada',
            line: { color: '#ea80fc', width: 2.5, dash: 'dash' }
        });

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: { text: 'Integrando (cian) y antiderivada F(x) (orquídea punteada)', font: { color: '#b388ff' } },
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

        const pEstr = parrafoConFormula('Estrategia elegida: ', cfg.estrategia, '');
        divResultados.appendChild(crearPaso('🧭 Estrategia', [pEstr]));

        const pRac = parrafoConFormula('La integral racionalizada queda: ', cfg.racionalTex, '');
        const pCas = document.createElement('p');
        pCas.appendChild(document.createTextNode(cfg.casoTex.replace(/\$/g, '')));
        divResultados.appendChild(crearPaso('Racionalización en t', [pRac, pCas]));

        cfg.pasos.forEach(([titulo, latex]) => {
            divResultados.appendChild(crearPaso(titulo, [parrafoConFormula('', latex, '')]));
        });

        const valorExacto = cfg.F(b) - cfg.F(a);

        const nS = 800;
        const lo = Math.min(a, b), hi = Math.max(a, b);
        const g = x => { const v = cfg.func(x); return isFinite(v) ? v : 0; };
        const h = (hi - lo) / nS;
        let suma = g(lo) + g(hi);
        for (let i = 1; i < nS; i++) suma += (i % 2 === 1 ? 4 : 2) * g(lo + i * h);
        suma *= h / 3;

        const pEval = parrafoConFormula('Evaluando con el TFC: ',
            `F(${fmt(b)}) - F(${fmt(a)}) = ${valorExacto.toFixed(6)}`, '');
        const pVer = document.createElement('p');
        pVer.className = 'verificacion';
        pVer.appendChild(document.createTextNode('✔ Verificación numérica (Simpson, n=' + nS + '): '));
        const spanVer = document.createElement('span');
        renderizarFormula(spanVer, `\\approx ${suma.toFixed(4)}`, false);
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
        nota.textContent = '💡 Recuerda: t = tan(kx/2) no está definida cuando kx = π + 2mπ. Mantén tu intervalo dentro de un arco de longitud 2π/|k| que no cruce esos puntos; si los cruza, parte la integral o usa otra técnica.';
        divResultados.appendChild(nota);
    }

    btnCalcular.addEventListener('click', function() {
        const clave = selectIntegral.value;
        const p = parseFloat(inputA.value);
        const q = parseFloat(inputB.value);
        const r = parseFloat(inputC.value);
        const k = parseFloat(inputK.value);
        const a = parseFloat(limInf.value);
        const b = parseFloat(limSup.value);

        if ([p, q, r, k, a, b].some(v => isNaN(v))) { alert('Todos los valores deben ser números válidos.'); return; }
        if (a === b) { alert('Los límites de integración deben ser diferentes.'); return; }
        if (k === 0) { alert('El parámetro k debe ser distinto de 0.'); return; }
        if (Math.abs(b - a) >= 2 * Math.PI / Math.abs(k) - 1e-9) {
            alert('El intervalo debe tener longitud menor a 2π/|k| para que t = tan(kx/2) esté bien definida.'); return;
        }
        // El cambio t = tan(kx/2) estalla en x = (π + 2mπ)/k: exigir que el intervalo no lo cruce
        const kMin = k * Math.min(a, b), kMax = k * Math.max(a, b);
        const mLow = Math.ceil((kMin - Math.PI) / (2 * Math.PI));
        const mHigh = Math.floor((kMax - Math.PI) / (2 * Math.PI));
        if (mHigh >= mLow) {
            alert('El intervalo cruza un punto donde t = tan(kx/2) no está definida (kx = π + 2mπ). Ajusta los límites de integración.'); return;
        }

        let cfg;
        try {
            cfg = construirConfig(clave, p, q, r, k);
        } catch (e) {
            alert('No se puede resolver: ' + e.message + ' Prueba otros coeficientes.');
            return;
        }

        // Validar singularidades del integrando dentro del intervalo
        let pole = false;
        for (let i = 0; i <= 400; i++) {
            const x = a + (b - a) * i / 400;
            const den = p + q * Math.sin(k * x) + r * Math.cos(k * x);
            if (Math.abs(den) < 1e-6) { pole = true; break; }
        }
        if (pole) { alert('El denominador se anula dentro del intervalo (asíntota vertical). La integral definida es impropia: ajusta a, b o los coeficientes.'); return; }

        graficar(cfg, a, b, k);
        mostrarResultados(cfg, a, b);
    });

    // Gráfica inicial
    const cfgInicial = construirConfig(selectIntegral.value, parseFloat(inputA.value), parseFloat(inputB.value), parseFloat(inputC.value), parseFloat(inputK.value));
    graficar(cfgInicial, parseFloat(limInf.value), parseFloat(limSup.value), parseFloat(inputK.value));
});
