// ===== MÓDULO 6: INTEGRACIÓN DIRECTA =====

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

    // 2. Referencias a los elementos del DOM
    const inputFuncion = document.getElementById('funcion');
    const inputA = document.getElementById('a');
    const inputB = document.getElementById('b');
    const btnCalcular = document.getElementById('calcular');
    const divResultados = document.getElementById('resultados-content');

    // 3. Función para evaluar f(x)
    function evaluarF(funcStr, x) {
        switch(funcStr) {
            case 'x^2': return x * x;
            case 'x': return x;
            case 'x^3': return x * x * x;
            case 'sqrt(x)': return x >= 0 ? Math.sqrt(x) : NaN;
            case 'sin(x)': return Math.sin(x);
            case 'cos(x)': return Math.cos(x);
            case 'exp(x)': return Math.exp(x);
            default: return x * x;
        }
    }

    // 4. Función para evaluar la Antiderivada F(x) asumiendo C = 0
    function evaluarAntiderivada(funcStr, x) {
        switch(funcStr) {
            case 'x^2': return (x * x * x) / 3;
            case 'x': return (x * x) / 2;
            case 'x^3': return (x * x * x * x) / 4;
            case 'sqrt(x)': return x >= 0 ? (2/3) * Math.pow(x, 1.5) : NaN;
            case 'sin(x)': return -Math.cos(x);
            case 'cos(x)': return Math.sin(x);
            case 'exp(x)': return Math.exp(x);
            default: return (x * x * x) / 3;
        }
    }

    // 5. Diccionario para mostrar la fórmula simbólica con KaTeX
    function obtenerFormulaSimbolica(funcStr) {
        const formulas = {
            'x^2': '\\frac{x^3}{3} + C',
            'x': '\\frac{x^2}{2} + C',
            'x^3': '\\frac{x^4}{4} + C',
            'sqrt(x)': '\\frac{2}{3}x^{3/2} + C',
            'sin(x)': '-\\cos(x) + C',
            'cos(x)': '\\sin(x) + C',
            'exp(x)': 'e^x + C'
        };
        return formulas[funcStr] || 'F(x) + C';
    }

    // 6. Función para renderizar fórmulas dinámicamente
    function renderizarFormula(elemento, formula, displayMode = true) {
        if (typeof katex !== 'undefined') {
            katex.render(formula, elemento, { displayMode: displayMode, throwOnError: false });
        } else {
            elemento.textContent = formula;
        }
    }

    // 7. Función para graficar f(x) y F(x) con Plotly.js
    function graficarFuncionYAntiderivada(funcStr, a, b) {
        // Definir el rango de la gráfica (un poco más amplio que [a,b] para dar contexto)
        let xMin = Math.min(a, b) - 1;
        let xMax = Math.max(a, b) + 1;
        
        let xVals = [], yF = [], yAntiderivada = [];
        let pasos = 200;
        let dx = (xMax - xMin) / pasos;

        for (let i = 0; i <= pasos; i++) {
            let x = xMin + i * dx;
            xVals.push(x);
            yF.push(evaluarF(funcStr, x));
            yAntiderivada.push(evaluarAntiderivada(funcStr, x));
        }

        // Trazas de Plotly
        let trazaF = {
            x: xVals, y: yF, mode: 'lines', name: 'f(x) - Función original',
            line: { color: '#b388ff', width: 3 }
        };

        let trazaAntiderivada = {
            x: xVals, y: yAntiderivada, mode: 'lines', name: 'F(x) - Antiderivada (C=0)',
            line: { color: '#69f0ae', width: 3, dash: 'dash' }
        };

        let layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            titlefont: { color: '#b388ff' },
            title: `Gráfica de f(x) y su Antiderivada F(x)`,
            xaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', title: 'Eje X', range: [xMin, xMax] },
            yaxis: { gridcolor: '#3d2a66', zerolinecolor: '#4a3570', title: 'Eje Y' },
            showlegend: true,
            legend: { x: 0, y: 1 },
            margin: { t: 50, r: 20, b: 50, l: 50 }
        };

        Plotly.newPlot('grafico', [trazaF, trazaAntiderivada], layout, { responsive: true });
    }

    // 8. Evento principal del botón
    btnCalcular.addEventListener('click', function() {
        const func = inputFuncion.value;
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);

        if (isNaN(a) || isNaN(b)) {
            alert('Por favor, ingrese valores numéricos válidos para los límites.');
            return;
        }

        // Calcular el valor exacto usando el Teorema Fundamental: F(b) - F(a)
        const Fb = evaluarAntiderivada(func, b);
        const Fa = evaluarAntiderivada(func, a);
        const integralDefinida = Fb - Fa;

        // Limpiar resultados anteriores
        divResultados.innerHTML = '';

        // --- RESULTADO 1: Fórmula de la Antiderivada ---
        const p1 = document.createElement('p');
        p1.innerHTML = '<strong>Antiderivada general:</strong> ';
        const spanFormula = document.createElement('span');
        renderizarFormula(spanFormula, `\\int ${func} \\, dx = ${obtenerFormulaSimbolica(func)}`);
        p1.appendChild(spanFormula);
        divResultados.appendChild(p1);

        // --- RESULTADO 2: Aplicación del Teorema Fundamental ---
        const p2 = document.createElement('p');
        p2.innerHTML = '<strong>Integral Definida (Teorema Fundamental):</strong> ';
        const spanTFC = document.createElement('span');
        renderizarFormula(spanTFC, `\\int_{${a}}^{${b}} ${func} \\, dx = F(${b}) - F(${a}) = ${Fb.toFixed(4)} - (${Fa.toFixed(4)}) = ${integralDefinida.toFixed(4)}`);
        p2.appendChild(spanTFC);
        divResultados.appendChild(p2);

        // --- TIP EDUCATIVO ---
        const p3 = document.createElement('p');
        p3.style.marginTop = '15px';
        p3.style.fontStyle = 'italic';
        p3.style.color = '#b3a6cc';
        p3.innerHTML = '💡 <strong>Observa la gráfica:</strong> La función azul es $f(x)$. La función verde punteada es $F(x)$. Notarás que donde $f(x) = 0$, la antiderivada $F(x)$ tiene un punto crítico (máximo, mínimo o punto de inflexión), ¡porque $F\'(x) = f(x)$!';
        divResultados.appendChild(p3);

        // Graficar
        graficarFuncionYAntiderivada(func, a, b);
    });

    // 9. Ejecutar al cargar la página
    btnCalcular.click();
});