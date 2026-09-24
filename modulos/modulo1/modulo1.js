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
            line: { color: '#1a237e', width: 3 }
        });

        if (tipo === 'todas') {
            // Mostrar las tres sumas
            const tipos = ['izquierda', 'derecha', 'medio'];
            const colores = ['#f44336', '#4caf50', '#ff9800'];
            const nombres = ['Izquierda', 'Derecha', 'Punto Medio'];

            tipos.forEach((t, idx) => {
                const resultado = calcularRiemann(func, a, b, n, t);
                const xBarras = [];
                const yBarras = [];

                resultado.puntos.forEach(p => {
                    xBarras.push(p.xi, p.xi, p.xf, p.xf, null);
                    yBarras.push(0, p.y, p.y, 0, null);
                });

                traces.push({
                    x: xBarras,
                    y: yBarras,
                    mode: 'lines',
                    name: nombres[idx],
                    fill: 'tozeroy',
                    opacity: 0.3,
                    line: { color: colores[idx] }
                });
            });
        } else {
            const resultado = calcularRiemann(func, a, b, n, tipo);
            const xBarras = [];
            const yBarras = [];

            resultado.puntos.forEach(p => {
                xBarras.push(p.xi, p.xi, p.xf, p.xf, null);
                yBarras.push(0, p.y, p.y, 0, null);
            });

            const colores = {
                'izquierda': '#f44336',
                'derecha': '#4caf50',
                'medio': '#ff9800'
            };

            traces.push({
                x: xBarras,
                y: yBarras,
                mode: 'lines',
                name: tipo,
                fill: 'tozeroy',
                opacity: 0.5,
                line: { color: colores[tipo] }
            });
        }

        const layout = {
            title: `Sumas de Riemann: f(x) = ${func} en [${a}, ${b}] con n=${n}`,
            xaxis: { title: 'x', range: [a - 0.5, b + 0.5] },
            yaxis: { title: 'f(x)', range: [0, Math.max(...yCurve) * 1.2] },
            showlegend: true,
            legend: { x: 0, y: 1 }
        };

        Plotly.newPlot('grafico', traces, layout, { responsive: true });
    }

    // Mostrar resultados
    function mostrarResultados(func, a, b, n, tipo) {
        const resultadosDiv = document.getElementById('resultados-content');
        let html = '<table class="tabla-resultados"><tr><th>Tipo</th><th>Valor Aproximado</th><th>Error</th></tr>';

        const tipos = tipo === 'todas' ? ['izquierda', 'derecha', 'medio'] : [tipo];
        const nombres = { 'izquierda': 'Lₙ (Izquierda)', 'derecha': 'Rₙ (Derecha)', 'medio': 'Mₙ (Punto Medio)' };

        // Valor exacto (aproximado con n muy grande)
        const valorExacto = calcularRiemann(func, a, b, 10000, 'medio').suma;

        tipos.forEach(t => {
            const resultado = calcularRiemann(func, a, b, n, t);
            const error = Math.abs(resultado.suma - valorExacto);
            html += `<tr><td>${nombres[t]}</td><td>${resultado.suma.toFixed(6)}</td><td>${error.toFixed(6)}</td></tr>`;
        });

        html += `</table><p><strong>Valor exacto (aproximado):</strong> ${valorExacto.toFixed(6)}</p>`;
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