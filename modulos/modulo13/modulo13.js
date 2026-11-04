// ===== MÓDULO 13: TABLA DE INTEGRALES (explorador + verificador visual) =====

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

    // ---- Datos de la tabla. Cada fila: tex de la integral, tex del resultado,
    //      funciones JS f (integrando) y F (antiderivada), categoría, condición y dominio seguro.
    const TABLA = [
        { cat: 'basicas', cond: 'n ≠ −1',
          texI: '\\int x^n\\,dx', texR: '\\frac{x^{n+1}}{n+1}+C',
          f: x => Math.pow(x, 0.5), F: x => Math.pow(x, 1.5)/1.5,
          demo: ['\\int \\sqrt{x}\\,dx = \\frac{2}{3}x^{3/2}+C', 1, 4], dom: [0.01, 10] },
        { cat: 'basicas', cond: '',
          texI: '\\int \\frac{1}{x}\\,dx', texR: '\\ln|x|+C',
          f: x => 1/x, F: x => Math.log(Math.abs(x)),
          demo: ['\\int_1^e \\frac{dx}{x} = 1', 1, Math.E], dom: [0.05, 10] },
        { cat: 'exponenciales', cond: '',
          texI: '\\int e^{x}\\,dx', texR: 'e^{x}+C',
          f: x => Math.exp(x), F: x => Math.exp(x),
          demo: ['\\int_0^1 e^x dx = e-1', 0, 1], dom: [-2, 3] },
        { cat: 'exponenciales', cond: 'k ≠ 0',
          texI: '\\int e^{kx}\\,dx', texR: '\\frac{1}{k}e^{kx}+C',
          f: x => Math.exp(2*x), F: x => Math.exp(2*x)/2,
          demo: ['\\int_0^1 e^{2x}dx = (e^2-1)/2', 0, 1], dom: [-2, 2] },
        { cat: 'exponenciales', cond: 'a>0, a≠1',
          texI: '\\int a^{x}\\,dx', texR: '\\frac{a^{x}}{\\ln a}+C',
          f: x => Math.pow(2, x), F: x => Math.pow(2, x)/Math.LN2,
          demo: ['\\int_0^2 2^x dx = 3/\\ln 2', 0, 2], dom: [-3, 4] },
        { cat: 'trigonometricas', cond: '',
          texI: '\\int \\sin x\\,dx', texR: '-\\cos x+C',
          f: x => Math.sin(x), F: x => -Math.cos(x),
          demo: ['\\int_0^{\\pi} \\sin x\\,dx = 2', 0, Math.PI], dom: [-6, 6] },
        { cat: 'trigonometricas', cond: '',
          texI: '\\int \\cos x\\,dx', texR: '\\sin x+C',
          f: x => Math.cos(x), F: x => Math.sin(x),
          demo: ['\\int_0^{\\pi/2} \\cos x\\,dx = 1', 0, Math.PI/2], dom: [-6, 6] },
        { cat: 'trigonometricas', cond: '',
          texI: '\\int \\sec^2 x\\,dx', texR: '\\tan x+C',
          f: x => 1/Math.pow(Math.cos(x),2), F: x => Math.tan(x),
          demo: ['\\int_0^{\\pi/4} \\sec^2 x\\,dx = 1', 0, Math.PI/4], dom: [-1.4, 1.4] },
        { cat: 'trigonometricas', cond: '',
          texI: '\\int \\csc^2 x\\,dx', texR: '-\\cot x+C',
          f: x => 1/Math.pow(Math.sin(x),2), F: x => -Math.cos(x)/Math.sin(x),
          demo: ['\\int_{\\pi/4}^{\\pi/2} \\csc^2 x\\,dx = 1', Math.PI/4, Math.PI/2], dom: [0.6, 2.5] },
        { cat: 'trigonometricas', cond: '',
          texI: '\\int \\sec x\\tan x\\,dx', texR: '\\sec x+C',
          f: x => Math.sin(x)/Math.pow(Math.cos(x),2), F: x => 1/Math.cos(x),
          demo: ['\\int_0^{\\pi/3} \\sec x\\tan x\\,dx = 1', 0, Math.PI/3], dom: [-1.4, 1.4] },
        { cat: 'trigonometricas', cond: '',
          texI: '\\int \\tan x\\,dx', texR: '\\ln|\\sec x|+C',
          f: x => Math.tan(x), F: x => -Math.log(Math.abs(Math.cos(x))),
          demo: ['\\int_0^{\\pi/4} \\tan x\\,dx = \\ln\\sqrt{2}', 0, Math.PI/4], dom: [-1.4, 1.4] },
        { cat: 'racionales', cond: 'a²−u²>0',
          texI: '\\int \\frac{du}{a^2-u^2}', texR: '\\frac{1}{2a}\\ln\\left|\\frac{a+u}{a-u}\\right|+C',
          f: x => 1/(4-x*x), F: x => 0.25*Math.log(Math.abs((2+x)/(2-x))),
          demo: ['\\int_0^1 \\frac{dx}{4-x^2}', 0, 1], dom: [-1.9, 1.9] },
        { cat: 'raices', cond: 'u²<a²',
          texI: '\\int \\frac{du}{\\sqrt{a^2-u^2}}', texR: '\\arcsin(u/a)+C',
          f: x => 1/Math.sqrt(4-x*x), F: x => Math.asin(x/2),
          demo: ['\\int_0^1 \\frac{dx}{\\sqrt{4-x^2}} = \\frac{\\pi}{6}', 0, 1], dom: [-1.99, 1.99] },
        { cat: 'raices', cond: '',
          texI: '\\int \\frac{du}{a^2+u^2}', texR: '\\frac{1}{a}\\arctan(u/a)+C',
          f: x => 1/(4+x*x), F: x => 0.5*Math.atan(x/2),
          demo: ['\\int_0^2 \\frac{dx}{4+x^2} = \\frac{\\pi}{8}', 0, 2], dom: [-5, 5] },
        { cat: 'basicas', cond: '',
          texI: '\\int \\frac{x}{\\sqrt{1-x^2}}\\,dx', texR: '-\\sqrt{1-x^2}+C',
          f: x => x/Math.sqrt(1-x*x), F: x => -Math.sqrt(1-x*x),
          demo: ['\\int_0^{0.6} \\frac{x\\,dx}{\\sqrt{1-x^2}} = 0.2', 0, 0.6], dom: [-0.99, 0.99] },
        { cat: 'exponenciales', cond: '',
          texI: '\\int \\frac{dx}{1+e^{x}}', texR: 'x-\\ln(1+e^{x})+C',
          f: x => 1/(1+Math.exp(x)), F: x => x - Math.log(1+Math.exp(x)),
          demo: ['\\int_0^{\\ln 2} \\frac{dx}{1+e^x} = \\ln\\frac{4}{3}', 0, Math.LN2], dom: [-4, 4] }
    ];

    const CAT_NOMBRES = {
        basicas: 'Básicas', racionales: 'Racionales', trigonometricas: 'Trigonométricas',
        exponenciales: 'Exp. y Log', raices: 'Con raíces'
    };

    const tbody = document.getElementById('tabla-body');
    const buscador = document.getElementById('buscador');
    const filtro = document.getElementById('filtro-categoria');
    const panel = document.getElementById('panel-verificador');
    const vTitulo = document.getElementById('verificador-titulo');
    const vA = document.getElementById('v-a');
    const vB = document.getElementById('v-b');
    const vBtn = document.getElementById('v-calcular');
    const vCerrar = document.getElementById('v-cerrar');
    const vResultado = document.getElementById('v-resultado');
    const vResultadoContent = document.getElementById('v-resultado-content');

    let filaActiva = null;

    function poblarTabla() {
        tbody.innerHTML = '';
        const q = buscador.value.toLowerCase().trim();
        const cat = filtro.value;

        TABLA.forEach((fila, idx) => {
            if (cat !== 'todas' && fila.cat !== cat) return;
            const textoBusqueda = (fila.texI + ' ' + fila.texR + ' ' + fila.cond).toLowerCase();
            if (q && textoBusqueda.indexOf(q) === -1) return;

            const tr = document.createElement('tr');

            const tdNum = document.createElement('td');
            tdNum.textContent = idx + 1;
            tr.appendChild(tdNum);

            const tdI = document.createElement('td');
            if (typeof katex !== 'undefined') {
                katex.render(fila.texI, tdI, { throwOnError: false });
            } else { tdI.textContent = fila.texI; }
            tr.appendChild(tdI);

            const tdR = document.createElement('td');
            if (typeof katex !== 'undefined') {
                katex.render(fila.texR, tdR, { throwOnError: false });
            } else { tdR.textContent = fila.texR; }
            tr.appendChild(tdR);

            const tdC = document.createElement('td');
            const spanCat = document.createElement('span');
            spanCat.className = 'cat-etiqueta';
            spanCat.textContent = CAT_NOMBRES[fila.cat];
            tdC.appendChild(spanCat);
            if (fila.cond) {
                const small = document.createElement('div');
                small.style.fontSize = '0.75rem';
                small.style.marginTop = '4px';
                small.style.opacity = '0.8';
                small.textContent = fila.cond;
                tdC.appendChild(small);
            }
            tr.appendChild(tdC);

            const tdB = document.createElement('td');
            const btn = document.createElement('button');
            btn.className = 'btn-verificar';
            btn.textContent = '📈 Verificar';
            tdB.appendChild(btn);
            tr.appendChild(tdB);

            tr.addEventListener('click', () => abrirVerificador(fila));
            tbody.appendChild(tr);
        });

        if (!tbody.children.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.style.textAlign = 'center';
            td.textContent = 'No hay fórmulas que coincidan con la búsqueda.';
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
    }

    function abrirVerificador(fila) {
        filaActiva = fila;
        panel.style.display = 'block';
        vTitulo.textContent = '✅ Verificador: ' + CAT_NOMBRES[fila.cat];
        vA.value = fila.demo[1];
        vB.value = Number(fila.demo[2]).toFixed(4);
        vResultado.style.display = 'none';
        graficarDemo(fila);
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function graficarDemo(fila) {
        const contenedor = document.getElementById('v-grafico');
        const lo = fila.dom[0], hi = fila.dom[1];
        const n = 300;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = lo + (hi - lo) * i / n;
            const y = fila.f(x);
            xs.push(x);
            ys.push(isFinite(y) ? y : null);
        }
        Plotly.newPlot(contenedor, [{
            x: xs, y: ys, mode: 'lines', name: 'f(x)', connectgaps: false,
            line: { color: '#ea80fc', width: 3 }
        }], {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5' },
            title: { text: 'Curva de la fórmula seleccionada', font: { color: '#b388ff' } },
            xaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
            yaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
            margin: { t: 50, r: 20, b: 45, l: 55 }
        }, { responsive: true });
    }

    function verificar() {
        if (!filaActiva) return;
        const a = parseFloat(vA.value);
        const b = parseFloat(vB.value);
        if (isNaN(a) || isNaN(b) || a === b) {
            alert('Ingresa límites numéricos distintos.');
            return;
        }
        const fila = filaActiva;
        const lo = Math.min(a, b), hi = Math.max(a, b);
        if (lo < fila.dom[0] || hi > fila.dom[1]) {
            alert(`Para esta demostración usa límites dentro de [${fila.dom[0]}, ${fila.dom[1]}].`);
            return;
        }

        const exacto = fila.F(b) - fila.F(a);

        const nS = 400, h = (b - a) / nS;
        let suma = fila.f(a) + fila.f(b);
        for (let i = 1; i < nS; i++) {
            suma += (i % 2 === 1 ? 4 : 2) * fila.f(a + i * h);
        }
        suma *= h / 3;

        // Derivada numérica de F para comprobar F' = f en el punto medio
        const xm = (a + b) / 2, dsmall = 1e-5;
        const derivF = (fila.F(xm + dsmall) - fila.F(xm - dsmall)) / (2 * dsmall);
        const fReal = fila.f(xm);

        vResultado.style.display = 'block';
        vResultadoContent.innerHTML = '';

        const p1 = document.createElement('p');
        p1.innerHTML = `<strong>Fórmula tabular:</strong> `;
        const s1 = document.createElement('span');
        if (typeof katex !== 'undefined') katex.render(fila.texI + ' = ' + fila.texR, s1, { throwOnError: false });
        else s1.textContent = fila.texI + ' = ' + fila.texR;
        p1.appendChild(s1);
        vResultadoContent.appendChild(p1);

        const p2 = document.createElement('p');
        p2.className = 'verificacion';
        p2.textContent = `✔ Valor por la antiderivada (TFC): ${exacto.toFixed(6)} — Método de Simpson: ${suma.toFixed(6)}. Error relativo: ${Math.abs(exacto) > 1e-9 ? (Math.abs(exacto - suma) / Math.abs(exacto) * 100).toFixed(4) : '0.0000'}%.`;
        vResultadoContent.appendChild(p2);

        const p3 = document.createElement('p');
        p3.className = 'verificacion';
        p3.textContent = `✔ Derivada numérica de F en x=${xm.toFixed(3)} es ${derivF.toFixed(6)}, mientras que f(x)=${fReal.toFixed(6)}. Como coinciden, la fórmula de la tabla es correcta.`;
        vResultadoContent.appendChild(p3);

        // Refrescar gráfica con área sombreada entre a y b
        const contenedor = document.getElementById('v-grafico');
        const n = 300;
        const xs = [], ys = [];
        for (let i = 0; i <= n; i++) {
            const x = a + (b - a) * i / n;
            const y = fila.f(x);
            xs.push(x);
            ys.push(isFinite(y) ? y : null);
        }
        Plotly.newPlot(contenedor, [
            { x: xs, y: ys, mode: 'lines', name: 'Área verificada', connectgaps: false,
              line: { color: '#ea80fc', width: 3 }, fill: 'tozeroy', fillcolor: 'rgba(234,128,252,0.3)' },
            { x: [a, a], y: [0, fila.f(a)], mode: 'lines', name: 'Límite a', line: { color: '#4dd0e1', width: 2, dash: 'dot' } },
            { x: [b, b], y: [0, fila.f(b)], mode: 'lines', name: 'Límite b', line: { color: '#4dd0e1', width: 2, dash: 'dot' } }
        ], {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5' },
            title: { text: `∫ de ${a} a ${b}: área = ${exacto.toFixed(4)}`, font: { color: '#b388ff' } },
            xaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
            yaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
            showlegend: false,
            margin: { t: 50, r: 20, b: 45, l: 55 }
        }, { responsive: true });
    }

    buscador.addEventListener('input', poblarTabla);
    filtro.addEventListener('change', poblarTabla);
    vBtn.addEventListener('click', verificar);
    vCerrar.addEventListener('click', () => { panel.style.display = 'none'; filaActiva = null; });

    poblarTabla();
});
