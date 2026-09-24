// ===== MÓDULO 5: INTEGRAL DEFINIDA Y ÁREA =====

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Inicializar KaTeX para renderizar las fórmulas matemáticas del HTML estático
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
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    // 3. Función para evaluar matemáticamente las opciones del select
    function evaluarFuncion(funcStr, x) {
        switch(funcStr) {
            case 'x^2': return x * x;
            case 'x': return x;
            case 'sqrt(x)': return x >= 0 ? Math.sqrt(x) : NaN;
            case 'sin(x)': return Math.sin(x);
            case 'exp(x)': return Math.exp(x);
            case '1/x': return x !== 0 ? 1 / x : NaN;
            default: return x * x;
        }
    }

    // 4. Función para calcular la Integral Definida numéricamente (Simpson con n=1000)
    function calcularIntegralDefinida(funcStr, a, b) {
        let n = 1000;
        if (n % 2 !== 0) n++;
        
        let dx = (b - a) / n;
        let suma = evaluarFuncion(funcStr, a) + evaluarFuncion(funcStr, b);
        
        for (let i = 1; i < n; i++) {
            let x_i = a + i * dx;
            let coeficiente = (i % 2 === 0) ? 2 : 4;
            suma += coeficiente * evaluarFuncion(funcStr, x_i);
        }
        
        return (dx / 3) * suma;
    }

    // 5. Función para dibujar la gráfica con Plotly.js
    function graficarArea(funcStr, a, b) {
        let xMin = Math.min(a, b) - 1;
        let xMax = Math.max(a, b) + 1;
        let xCurva = [], yCurva = [];
        let pasos = 200;
        let dx = (xMax - xMin) / pasos;
        
        for (let i = 0; i <= pasos; i++) {
            let x = xMin + i * dx;
            xCurva.push(x);
            yCurva.push(evaluarFuncion(funcStr, x));
        }

        let xArea = [], yArea = [];
        let pasosArea = 100;
        let dxArea = (b - a) / pasosArea;
        
        for (let i = 0; i <= pasosArea; i++) {
            let x = a + i * dxArea;
            xArea.push(x);
            yArea.push(evaluarFuncion(funcStr, x));
        }

        let trazaArea = {
            x: xArea,
            y: yArea,
            mode: 'lines',
           name: 'Área bajo la curva',
            fill: 'tozeroy',
            opacity: 0.4,
            line: { color: '#69f0ae', width: 1 }
        };

        let trazaCurva = {
            x: xCurva,
            y: yCurva,
            mode: 'lines',
            name: 'f(x) - Función',
            line: { color: '#b388ff', width: 3 }
        };

        let yA = evaluarFuncion(funcStr, a);
        let yB = evaluarFuncion(funcStr, b);
        let trazaLimites = {
            x: [a, a, null, b, b],
            y: [0, yA, null, 0, yB],
            mode: 'lines',
            name: 'Límites [a, b]',
            line: { color: '#ff6e8f', dash: 'dash', width: 2 }
        };

        let layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            titlefont: { color: '#b388ff' },
            title: `Integral Definida: f(x) = ${funcStr} en [${a}, ${b}]`,
            xaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', title: 'Eje X', range: [xMin, xMax] },
            yaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', title: 'Eje Y (f(x))' },
            showlegend: true,
            legend: { x: 0, y: 1 },
            margin: { t: 50, r: 20, b: 50, l: 50 }
        };

        Plotly.newPlot('grafico', [trazaArea, trazaCurva, trazaLimites], layout, { responsive: true });
    }

    // 6. Función para renderizar fórmulas con KaTeX directamente
    function renderizarFormula(elemento, formula, displayMode = true) {
        if (typeof katex !== 'undefined') {
            katex.render(formula, elemento, {
                displayMode: displayMode,
                throwOnError: false
            });
        } else {
            elemento.textContent = formula;
        }
    }

        // 7. Evento principal: Cuando el usuario hace clic en "Calcular Área y Graficar"
    btnCalcular.addEventListener('click', function() {
        const func = inputFuncion.value;
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);

        if (isNaN(a) || isNaN(b)) {
            alert('Por favor, ingrese valores numéricos válidos para los límites.');
            return;
        }
        if (a === b) {
            alert('Los límites de integración "a" y "b" deben ser diferentes. (Si son iguales, el área es 0).');
            return;
        }

        // Calcular la integral definida
        const valorIntegral = calcularIntegralDefinida(func, a, b);

        // Calcular el área geométrica (siempre positiva)
        const areaGeometrica = Math.abs(valorIntegral);

        // Limpiar el contenedor de resultados
        divResultados.innerHTML = '';

        // --- RESULTADO 1: Integral Definida ---
        const p1 = document.createElement('p');
        p1.innerHTML = '<strong>Integral Definida (Área neta con signo):</strong> ';
        const formula1 = document.createElement('span');
        renderizarFormula(formula1, `\\int_{${a}}^{${b}} ${func} \\, dx \\approx ${valorIntegral.toFixed(6)}`);
        p1.appendChild(formula1);
        divResultados.appendChild(p1);

        // --- RESULTADO 2: Área Geométrica ---
        const p2 = document.createElement('p');
        p2.innerHTML = '<strong>Área Geométrica (Espacio físico):</strong> ';
        const span2 = document.createElement('span');
        span2.textContent = `${areaGeometrica.toFixed(6)} unidades²`;
        p2.appendChild(span2);
        divResultados.appendChild(p2);

        // --- MENSAJE EDUCATIVO SI a > b ---
        if (a > b) {
            const p3 = document.createElement('p');
            p3.style.color = '#ff6e8f';
            p3.style.background = 'rgba(255,110,143,0.12)';
            p3.style.padding = '10px';
            p3.style.borderRadius = '5px';
            p3.style.marginTop = '10px';

            // Texto inicial
            p3.innerHTML = '<strong>️ ¡Propiedad de Inversión de Límites!</strong> Integraste de derecha a izquierda ';

            // Fórmula: a > b
            const formula1 = document.createElement('span');
            renderizarFormula(formula1, 'a > b', false);
            p3.appendChild(formula1);

            p3.innerHTML += '. Por la propiedad de la integral definida, el signo cambia: ';

            // Fórmula: ∫_a^b f(x)dx = -∫_b^a f(x)dx
            const formula2 = document.createElement('span');
            renderizarFormula(formula2, `\\int_{${a}}^{${b}} f(x)\\,dx = -\\int_{${b}}^{${a}} f(x)\\,dx`, false);
            p3.appendChild(formula2);

            p3.innerHTML += '. Por eso la integral es negativa, pero el área geométrica sigue siendo positiva.';

            divResultados.appendChild(p3);
        } else {
            // Tip normal si a < b
            const p4 = document.createElement('p');
            p4.innerHTML = '<em>💡 Tip: Si la gráfica se sombrea por debajo del eje X, la integral definida será negativa, pero el área física siempre es positiva.</em>';
            divResultados.appendChild(p4);
        }

        // Dibujar la gráfica
        graficarArea(func, a, b);
    });

    // 8. Ejecutar el cálculo automáticamente al cargar la página
    btnCalcular.click();
});