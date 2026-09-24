// ===== MÓDULO 4: REGLA DE SIMPSON =====

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Inicializar KaTeX para renderizar las fórmulas matemáticas
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }

    // 2. Referencias a los elementos del DOM (HTML)
    const inputFuncion = document.getElementById('funcion');
    const inputA = document.getElementById('a');
    const inputB = document.getElementById('b');
    const sliderN = document.getElementById('n');
    const spanNValue = document.getElementById('n-value');
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    // 3. Actualizar el número "n" en tiempo real cuando se mueve el slider
    sliderN.addEventListener('input', function() {
        spanNValue.textContent = this.value;
    });

    // 4. Función para evaluar matemáticamente las opciones del select
    function evaluarFuncion(funcStr, x) {
        switch(funcStr) {
            case 'x^2': return x * x;
            case 'x': return x;
            case 'x^3': return x * x * x;
            case 'sqrt(x)': return Math.sqrt(x);
            case '1/x': return x === 0 ? 0 : 1 / x; // Evita división por cero
            case 'sin(x)': return Math.sin(x);
            case 'exp(x)': return Math.exp(x);
            default: return x * x;
        }
    }

    // 5. Lógica de la Regla de Simpson (1/3)
    function reglaSimpson(func, a, b, n) {
        // Forzar que n sea par (requisito de Simpson)
        if (n % 2 !== 0) {
            n = n + 1; 
        }
        
        let dx = (b - a) / n;
        let suma = evaluarFuncion(func, a) + evaluarFuncion(func, b);
        
        for (let i = 1; i < n; i++) {
            let x_i = a + i * dx;
            // Patrón de coeficientes: 4 para impares, 2 para pares
            let coeficiente = (i % 2 === 0) ? 2 : 4;
            suma += coeficiente * evaluarFuncion(func, x_i);
        }
        
        return (dx / 3) * suma;
    }

    // 6. Función para calcular un valor "exacto" de referencia (usando n muy alto)
    function calcularValorReferencia(func, a, b) {
        return reglaSimpson(func, a, b, 10000);
    }

    // 7. Función para dibujar la gráfica con Plotly.js
    function graficarSimpson(func, a, b, n) {
        // Forzar n par para la gráfica
        if (n % 2 !== 0) n++;
        let dx = (b - a) / n;

        // A) Generar puntos para la curva suave de f(x)
        let xCurva = [], yCurva = [];
        let pasosCurva = 200;
        let dxCurva = (b - a) / pasosCurva;
        for (let i = 0; i <= pasosCurva; i++) {
            let x = a + i * dxCurva;
            xCurva.push(x);
            yCurva.push(evaluarFuncion(func, x));
        }

        // B) Generar los puntos exactos que usa Simpson (x_i, f(x_i))
        let xPuntos = [], yPuntos = [];
        for (let i = 0; i <= n; i++) {
            let x_i = a + i * dx;
            xPuntos.push(x_i);
            yPuntos.push(evaluarFuncion(func, x_i));
        }

        // C) Configurar las trazas (capas) de Plotly
        let trazaCurva = {
            x: xCurva,
            y: yCurva,
            mode: 'lines',
            name: 'f(x) - Curva real',
            line: { color: '#b388ff', width: 3 }
        };

        // Área bajo la curva (sombreado para visualizar la integral)
        let trazaArea = {
            x: xCurva,
            y: yCurva,
            mode: 'lines',
            name: 'Área bajo la curva',
            fill: 'tozeroy',
            opacity: 0.1,
            line: { color: 'transparent' }
        };

        // Puntos evaluados por Simpson
        let trazaPuntos = {
            x: xPuntos,
            y: yPuntos,
            mode: 'markers',
            name: 'Puntos evaluados (xᵢ)',
            marker: { color: '#ff6e8f', size: 10, symbol: 'circle' }
        };

        // D) Configurar el diseño (layout) de la gráfica
        let layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            titlefont: { color: '#b388ff' },
            title: `Regla de Simpson: f(x) = ${func} en [${a}, ${b}] con n=${n}`,
            xaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', title: 'Eje X', range: [a - 0.5, b + 0.5] },
            yaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', title: 'Eje Y (f(x))', range: [0, Math.max(...yCurva) * 1.2] },
            showlegend: true,
            legend: { x: 0, y: 1 },
            margin: { t: 50, r: 20, b: 50, l: 50 }
        };

        // E) Renderizar la gráfica en el div con id="grafico"
        Plotly.newPlot('grafico', [trazaArea, trazaCurva, trazaPuntos], layout, { responsive: true });
    }

    // 8. Evento principal: Cuando el usuario hace clic en "Calcular y Graficar"
    btnCalcular.addEventListener('click', function() {
        // Obtener valores de los inputs
        const func = inputFuncion.value;
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);
        let n = parseInt(sliderN.value);

        // Validación básica
        if (isNaN(a) || isNaN(b) || isNaN(n)) {
            alert('Por favor, ingrese valores numéricos válidos.');
            return;
        }
        if (a >= b) {
            alert('El límite inferior (a) debe ser menor que el límite superior (b).');
            return;
        }
        if (n < 2) {
            alert('El número de subintervalos (n) debe ser al menos 2.');
            return;
        }

        // Calcular resultados
        const aproximacion = reglaSimpson(func, a, b, n);
        const valorReferencia = calcularValorReferencia(func, a, b);
        const error = Math.abs(aproximacion - valorReferencia);

        // Actualizar la interfaz con los resultados
        divResultados.innerHTML = `
            <p><strong>Aproximación (Sₙ):</strong> ${aproximacion.toFixed(6)}</p>
            <p><strong>Valor de referencia (n=10000):</strong> ${valorReferencia.toFixed(6)}</p>
            <p><strong>Error absoluto aproximado:</strong> ${error.toFixed(6)}</p>
            <p><em>💡 Tip: Observa los puntos rojos en la gráfica. Simpson evalúa la función en TODOS los puntos (extremos y medios) y los pondera con el patrón 1, 4, 2, 4... 1.</em></p>
        `;

        // Dibujar la gráfica
        graficarSimpson(func, a, b, n);
    });

    // 9. Ejecutar el cálculo automáticamente al cargar la página por primera vez
    btnCalcular.click();
});