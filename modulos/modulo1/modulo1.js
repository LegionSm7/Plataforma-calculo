// ===== MÓDULO 1: SUMAS DE RIEMANN =====

document.addEventListener('DOMContentLoaded', function() {
    // Renderizar fórmulas KaTeX
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }

    // Elementos del DOM
    const sliderN = document.getElementById('n');
    const nValue = document.getElementById('n-value');
    const btnCalcular = document.getElementById('calcular');

    // Actualizar valor de n en tiempo real
    sliderN.addEventListener('input', function() {
        nValue.textContent = this.value;
    });

    // Función para evaluar f(x) según la selección
    function evaluarFuncion(funcStr, x) {
        switch(funcStr) {
            case 'x^2': return x * x;
            case 'x': return x;
            case 'sqrt(x)': return Math.sqrt(x);
            case 'sin(x)': return Math.sin(x);
            case 'exp(x)': return Math.exp(x);
            case '1/x': return 1 / x;
            default: return x * x;
        }
    }

    // Calcular suma de Riemann
    function calcularRiemann(func, a, b, n, tipo) {
        const dx = (b - a) / n;
        let suma = 0;
        const puntos = [];

        for (let i = 0; i < n; i++) {
            let x;
            if (tipo === 'izquierda') {
                x = a + i * dx;
            } else if (tipo === 'derecha') {
                x = a + (i + 1) * dx;
            } else { // punto medio
                x = a + (i + 0.5) * dx;
            }
            const y = evaluarFuncion(func, x);
            suma += y * dx;
            puntos.push({x: x, y: y, xi: a + i * dx, xf: a + (i + 1) * dx});
        }

        return { suma: suma, puntos: puntos, dx: dx };
    }

    // Utilidad: hex -> rgba con alfa (para rellenos translúcidos)
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Graficar con Plotly
    function graficar(func, a, b, n, tipo) {
        // Generar puntos de la curva
        const xCurve = [];
        const yCurve = [];
        const pasos = 200;
        const dx = (b - a) / pasos;
        for (let i = 0; i <= pasos; i++) {
            const x = a + i * dx;
            xCurve.push(x);
            yCurve.push(evaluarFuncion(func, x));
        }

        const traces = [];

        // Curva de la función
        traces.push({
            x: xCurve,
            y: yCurve,
            mode: 'lines',
            name: 'f(x)',
            line: { color: '#b388ff', width: 3 }
        });

        // Dibujar la suma seleccionada (una sola vez, sin comparar todas juntas)
        const resultado = calcularRiemann(func, a, b, n, tipo);
        const xBarras = [];
        const yBarras = [];

        resultado.puntos.forEach(p => {
            xBarras.push(p.xi, p.xi, p.xf, p.xf, null);
            yBarras.push(0, p.y, p.y, 0, null);
        });

        // Cada tipo conserva su color frío destacado sobre el fondo oscuro
        const colores = {
            'izquierda': '#ea80fc',
            'derecha': '#4dd0e1',
            'medio': '#b388ff'
        };
        const nombres = {
            'izquierda': 'Izquierda (Lₙ)',
            'derecha': 'Derecha (Rₙ)',
            'medio': 'Punto Medio (Mₙ)'
        };

        traces.push({
            x: xBarras,
            y: yBarras,
            mode: 'lines',
            name: nombres[tipo],
            fill: 'tozeroy',
            fillcolor: hexToRgba(colores[tipo], 0.5),
            line: { color: colores[tipo], width: 1.5 },
            opacity: 1
        });

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            titlefont: { color: '#b388ff' },
            title: `Sumas de Riemann: f(x) = ${func} en [${a}, ${b}] con n=${n}`,
            xaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', title: 'x', range: [a - 0.5, b + 0.5] },
            yaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', title: 'f(x)', range: [0, Math.max(...yCurve) * 1.2] },
            showlegend: true,
            legend: { x: 1, y: 1, xanchor: 'right', bgcolor: 'rgba(30, 17, 51, 0.8)', bordercolor: '#3d2a66', borderwidth: 1 }
        };

        Plotly.newPlot('grafico', traces, layout, { responsive: true });
    }

    // Mostrar resultados (tarjetas organizadas + tabla resumen)
    function mostrarResultados(func, a, b, n, tipo) {
        const resultadosDiv = document.getElementById('resultados-content');

        const nombres = { 'izquierda': 'Lₙ · Izquierda', 'derecha': 'Rₙ · Derecha', 'medio': 'Mₙ · Punto Medio' };
        const colores = { 'izquierda': '#ea80fc', 'derecha': '#4dd0e1', 'medio': '#b388ff' };

        // Valor exacto (aproximado con n muy grande)
        const valorExacto = calcularRiemann(func, a, b, 10000, 'medio').suma;

        const resultado = calcularRiemann(func, a, b, n, tipo);
        const error = Math.abs(resultado.suma - valorExacto);
        const errorRelativo = valorExacto !== 0 ? (error / Math.abs(valorExacto)) * 100 : 0;

        // Tarjetas de parámetros y resultado
        const tarjetas = [
            { etiqueta: 'Función',              valor: `f(x) = ${func}`,            color: '#b388ff' },
            { etiqueta: 'Intervalo',            valor: `[${a}, ${b}]`,              color: '#4dd0e1' },
            { etiqueta: 'Subintervalos (n)',    valor: `${n}`,                      color: '#69f0ae' },
            { etiqueta: 'Ancho Δx',             valor: resultado.dx.toFixed(6),     color: '#82b1ff' },
            { etiqueta: `Aproximación (${nombres[tipo]})`, valor: resultado.suma.toFixed(6), color: colores[tipo] },
            { etiqueta: 'Valor exacto (aprox.)', valor: valorExacto.toFixed(6),     color: '#ece6f5' },
            { etiqueta: 'Error absoluto',       valor: error.toFixed(6),            color: '#ffab70' },
            { etiqueta: 'Error relativo',       valor: `${errorRelativo.toFixed(4)} %`, color: '#ff6e8f' }
        ];

        let html = '<div class="resumen-tarjetas">';
        tarjetas.forEach(t => {
            html += `
                <div class="resumen-tarjeta" style="--acento: ${t.color}">
                    <span class="resumen-etiqueta">${t.etiqueta}</span>
                    <span class="resumen-valor">${t.valor}</span>
                </div>`;
        });
        html += '</div>';

        // Tabla comparativa de los tres métodos
        html += `
            <table class="tabla-resultados">
                <thead>
                    <tr><th>Método</th><th>Valor aproximado</th><th>Error absoluto</th></tr>
                </thead>
                <tbody>`;

        ['izquierda', 'derecha', 'medio'].forEach(t => {
            const r = calcularRiemann(func, a, b, n, t);
            const e = Math.abs(r.suma - valorExacto);
            const activo = t === tipo ? ' clase="activo"' : '';
            html += `
                <tr${activo}>
                    <td><span class="punto-color" style="background:${colores[t]}"></span>${nombres[t]}</td>
                    <td class="num">${r.suma.toFixed(6)}</td>
                    <td class="num">${e.toFixed(6)}</td>
                </tr>`;
        });

        html += `</tbody></table>`;
        resultadosDiv.innerHTML = html;
    }

    // Evento del botón calcular
    btnCalcular.addEventListener('click', function() {
        const func = document.getElementById('funcion').value;
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const n = parseInt(document.getElementById('n').value);
        const tipo = document.getElementById('tipo').value;

        if (a >= b) {
            alert('El límite inferior debe ser menor que el superior');
            return;
        }

        graficar(func, a, b, n, tipo);
        mostrarResultados(func, a, b, n, tipo);
    });

    // Calcular al cargar
    btnCalcular.click();
});