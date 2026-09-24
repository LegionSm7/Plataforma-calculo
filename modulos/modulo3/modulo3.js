// ===== MÓDULO 3: REGLA DEL PUNTO MEDIO =====

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
            case 'sqrt(x)': return Math.sqrt(x);
            case '1/x': return x === 0 ? 0 : 1 / x; // Evita división por cero
            case 'sin(x)': return Math.sin(x);
            case 'exp(x)': return Math.exp(x);
            default: return x * x;
        }
    }

    // 5. Lógica de la Regla del Punto Medio
    function reglaPuntoMedio(func, a, b, n) {
        let dx = (b - a) / n;
        let suma = 0;
        
        for (let i = 1; i <= n; i++) {
            // Calcular el punto medio del subintervalo
            let x_medio = a + (i - 0.5) * dx;
            suma += evaluarFuncion(func, x_medio);
        }
        
        return suma * dx;
    }

    // 6. Función para calcular un valor "exacto" de referencia (usando n muy alto)
    function calcularValorReferencia(func, a, b) {
        return reglaPuntoMedio(func, a, b, 10000);
    }

    // 7. Función para dibujar la gráfica con Plotly.js
    function graficarPuntoMedio(func, a, b, n) {
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

        // B) Generar puntos para dibujar los rectángulos y los puntos medios
        let xRect = [], yRect = [];
        let xPuntos = [], yPuntos = []; // Para marcar los puntos medios con un "dot"

        for (let i = 0; i < n; i++) {
            let x0 = a + i * dx;
            let x1 = a + (i + 1) * dx;
            let x_medio = (x0 + x1) / 2;
            let y_medio = evaluarFuncion(func, x_medio);
            
            // Dibujar cada rectángulo
            xRect.push(x0, x0, x1, x1, null);
            yRect.push(0, y_medio, y_medio, 0, null);

            // Guardar el punto medio para graficarlo como un marcador
            xPuntos.push(x_medio);
            yPuntos.push(y_medio);
        }

        // C) Configurar las trazas (capas) de Plotly
        let trazaCurva = {
            x: xCurva,
            y: yCurva,
            mode: 'lines',
            name: 'f(x) - Curva real',
            line: { color: '#1a237e', width: 3 }
        };

        let trazaRectangulos = {
            x: xRect,
            y: yRect,
            mode: 'lines',
            name: 'Rectángulos Punto Medio',
            fill: 'tozeroy', // Rellena el área hacia abajo
            opacity: 0.4,
            line: { color: '#ff9800', width: 1.5 } // Naranja para diferenciar del Trapecio
        };

        // Trazas para los puntos medios (los "dots" en la curva)
        let trazaPuntosMedios = {
            x: xPuntos,
            y: yPuntos,
            mode: 'markers',
            name: 'Puntos Medios (x̄ᵢ)',
            marker: { color: '#d32f2f', size: 10, symbol: 'circle' }
        };

        // D) Configurar el diseño (layout) de la gráfica
        let layout = {
            title: `Regla del Punto Medio: f(x) = ${func} en [${a}, ${b}] con n=${n}`,
            xaxis: { title: 'Eje X', range: [a - 0.5, b + 0.5] },
            yaxis: { title: 'Eje Y (f(x))', range: [0, Math.max(...yCurva) * 1.2] },
            showlegend: true,
            legend: { x: 0, y: 1 },
            margin: { t: 50, r: 20, b: 50, l: 50 }
        };

        // E) Renderizar la gráfica en el div con id="grafico"
        Plotly.newPlot('grafico', [trazaCurva, trazaRectangulos, trazaPuntosMedios], layout, { responsive: true });
    }

    // 8. Evento principal: Cuando el usuario hace clic en "Calcular y Graficar"
    btnCalcular.addEventListener('click', function() {
        // Obtener valores de los inputs
        const func = inputFuncion.value;
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);
        const n = parseInt(sliderN.value);

        // Validación básica
        if (isNaN(a) || isNaN(b) || isNaN(n)) {
            alert('Por favor, ingrese valores numéricos válidos.');
            return;
        }
        if (a >= b) {
            alert('El límite inferior (a) debe ser menor que el límite superior (b).');
            return;
        }
        if (n < 1) {
            alert('El número de rectángulos (n) debe ser al menos 1.');
            return;
        }

        // Calcular resultados
        const aproximacion = reglaPuntoMedio(func, a, b, n);
        const valorReferencia = calcularValorReferencia(func, a, b);
        const error = Math.abs(aproximacion - valorReferencia);

        // Actualizar la interfaz con los resultados
        divResultados.innerHTML = `
            <p><strong>Aproximación (Mₙ):</strong> ${aproximacion.toFixed(6)}</p>
            <p><strong>Valor de referencia (n=10000):</strong> ${valorReferencia.toFixed(6)}</p>
            <p><strong>Error absoluto aproximado:</strong> ${error.toFixed(6)}</p>
            <p><em>💡 Tip: Observa los puntos rojos en la gráfica. Representan el punto medio exacto de cada subintervalo, que es lo que hace que este método sea tan preciso.</em></p>
        `;

        // Dibujar la gráfica
        graficarPuntoMedio(func, a, b, n);
    });

    // 9. Ejecutar el cálculo automáticamente al cargar la página por primera vez
    btnCalcular.click();
});