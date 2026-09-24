// ===== MÓDULO 2: REGLA DEL TRAPECIO =====

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
            case 'sin(x)': return Math.sin(x);
            case 'exp(x)': return Math.exp(x);
            default: return x * x;
        }
    }

    // 5. Lógica de la Regla del Trapecio
    function reglaTrapecio(func, a, b, n) {
        let dx = (b - a) / n;
        let suma = evaluarFuncion(func, a) + evaluarFuncion(func, b);
        
        for (let i = 1; i < n; i++) {
            suma += 2 * evaluarFuncion(func, a + i * dx);
        }
        
        return (dx / 2) * suma;
    }

    // 6. Función para calcular un valor "exacto" de referencia (usando n muy alto)
    function calcularValorReferencia(func, a, b) {
        return reglaTrapecio(func, a, b, 10000);
    }

    // 7. Función para dibujar la gráfica con Plotly.js
    function graficarTrapecios(func, a, b, n) {
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

        // B) Generar puntos para dibujar los trapecios
        let xTrap = [], yTrap = [];
        for (let i = 0; i < n; i++) {
            let x0 = a + i * dx;
            let x1 = a + (i + 1) * dx;
            let y0 = evaluarFuncion(func, x0);
            let y1 = evaluarFuncion(func, x1);
            
            // Dibujar cada trapecio como un polígono cerrado
            xTrap.push(x0, x0, x1, x1, null);
            yTrap.push(0, y0, y1, 0, null);
        }

        // C) Configurar las trazas (capas) de Plotly
        let trazaCurva = {
            x: xCurva,
            y: yCurva,
            mode: 'lines',
            name: 'f(x) - Curva real',
            line: { color: '#1a237e', width: 3 }
        };

        let trazaTrapecios = {
            x: xTrap,
            y: yTrap,
            mode: 'lines',
            name: 'Aproximación Trapecios',
            fill: 'tozeroy', // Rellena el área hacia abajo
            opacity: 0.4,
            line: { color: '#4caf50', width: 1.5 }
        };

        // D) Configurar el diseño (layout) de la gráfica
        let layout = {
            title: `Regla del Trapecio: f(x) = ${func} en [${a}, ${b}] con n=${n}`,
            xaxis: { title: 'Eje X', range: [a - 0.5, b + 0.5] },
            yaxis: { title: 'Eje Y (f(x))', range: [0, Math.max(...yCurva) * 1.2] },
            showlegend: true,
            legend: { x: 0, y: 1 },
            margin: { t: 50, r: 20, b: 50, l: 50 }
        };

        // E) Renderizar la gráfica en el div con id="grafico"
        Plotly.newPlot('grafico', [trazaCurva, trazaTrapecios], layout, { responsive: true });
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
            alert('El número de trapecios (n) debe ser al menos 1.');
            return;
        }

        // Calcular resultados
        const aproximacion = reglaTrapecio(func, a, b, n);
        const valorReferencia = calcularValorReferencia(func, a, b);
        const error = Math.abs(aproximacion - valorReferencia);

        // Actualizar la interfaz con los resultados
        divResultados.innerHTML = `
            <p><strong>Aproximación (Tₙ):</strong> ${aproximacion.toFixed(6)}</p>
            <p><strong>Valor de referencia (n=10000):</strong> ${valorReferencia.toFixed(6)}</p>
            <p><strong>Error absoluto aproximado:</strong> ${error.toFixed(6)}</p>
            <p><em>💡 Tip: Aumenta el valor de "n" en el slider para ver cómo el error disminuye y los trapecios se ajustan mejor a la curva.</em></p>
        `;

        // Dibujar la gráfica
        graficarTrapecios(func, a, b, n);
    });

    // 9. Ejecutar el cálculo automáticamente al cargar la página por primera vez
    btnCalcular.click();
});