// ===== MÓDULO 21: VOLUMEN DE SÓLIDOS DE REVOLUCIÓN (3D) =====

document.addEventListener('DOMContentLoaded', function() {
    // Renderizar fórmulas KaTeX iniciales
    renderMathInElement(document.body, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError: false
    });

    const btnCalcular = document.getElementById('calcular');

    // Función para evaluar expresiones matemáticas
    function evaluarFuncion(funcStr, x) {
        let expr = funcStr
            .replace(/x\^2/g, `(x*x)`)
            .replace(/sqrt\(x\)/g, `Math.sqrt(Math.max(0, x))`)
            .replace(/sin\(x\)/g, `Math.sin(x)`);
        
        try {
            const fn = new Function('x', `return ${expr};`);
            return fn(x);
        } catch (e) {
            return 0;
        }
    }

    // Cálculo numérico del volumen (Regla del punto medio, n=1000)
    function calcularVolumen(fStr, gStr, a, b, n = 1000) {
        const dx = (b - a) / n;
        let volumen = 0;
        
        for (let i = 0; i < n; i++) {
            const x = a + (i + 0.5) * dx;
            const fx = evaluarFuncion(fStr, x);
            const gx = evaluarFuncion(gStr, x);
            
            // Área de la arandela: π * (R² - r²)
            const area = Math.PI * (Math.pow(fx, 2) - Math.pow(gx, 2));
            volumen += area * dx;
        }
        
        return volumen;
    }

    // Generar sólido de revolución 3D
    function graficar3D(fStr, gStr, a, b) {
        const nx = 60; // Número de rebanadas a lo largo del eje X
        const ntheta = 40; // Número de puntos angulares para la rotación
        const x_vals = [];
        const dx = (b - a) / (nx - 1);
        
        for (let i = 0; i < nx; i++) {
            x_vals.push(a + i * dx);
        }

        const traces = [];

        // --- SUPERFICIE EXTERIOR (Radio R(x) = f(x)) ---
        const X_ext = [], Y_ext = [], Z_ext = [];
        for (let i = 0; i < nx; i++) {
            const x = x_vals[i];
            const R = Math.abs(evaluarFuncion(fStr, x));
            
            const rowX = [], rowY = [], rowZ = [];
            for (let j = 0; j <= ntheta; j++) {
                const theta = (j / ntheta) * 2 * Math.PI;
                rowX.push(x);
                rowY.push(R * Math.cos(theta));
                rowZ.push(R * Math.sin(theta));
            }
            X_ext.push(rowX);
            Y_ext.push(rowY);
            Z_ext.push(rowZ);
        }

        traces.push({
            x: X_ext, y: Y_ext, z: Z_ext,
            type: 'surface',
            colorscale: [[0, '#2d6a4f'], [1, '#69f0ae']],
            opacity: 0.85,
            showscale: false,
            hoverinfo: 'skip',
            name: 'Superficie exterior R(x)'
        });

        // --- SUPERFICIE INTERIOR (Radio r(x) = g(x)) - Solo si es arandela ---
        const esArandela = (gStr !== '0');
        if (esArandela) {
            const X_int = [], Y_int = [], Z_int = [];
            for (let i = 0; i < nx; i++) {
                const x = x_vals[i];
                const r = Math.abs(evaluarFuncion(gStr, x));
                
                const rowX = [], rowY = [], rowZ = [];
                for (let j = 0; j <= ntheta; j++) {
                    const theta = (j / ntheta) * 2 * Math.PI;
                    rowX.push(x);
                    rowY.push(r * Math.cos(theta));
                    rowZ.push(r * Math.sin(theta));
                }
                X_int.push(rowX);
                Y_int.push(rowY);
                Z_int.push(rowZ);
            }

            traces.push({
                x: X_int, y: Y_int, z: Z_int,
                type: 'surface',
                colorscale: [[0, '#1a472a'], [1, '#40916c']],
                opacity: 0.7,
                showscale: false,
                hoverinfo: 'skip',
                name: 'Superficie interior r(x) (hueco)'
            });
        }

        // --- EJE X (línea de revolución) ---
        traces.push({
            x: [a - 0.3, b + 0.3],
            y: [0, 0],
            z: [0, 0],
            mode: 'lines',
            line: { color: '#ffffff', width: 4 },
            name: 'Eje de revolución (X)',
            hoverinfo: 'skip'
        });

        // --- CURVA f(x) en el plano XY (referencia) ---
        const x_curve = [], y_curve = [], z_curve = [];
        for (let i = 0; i < nx; i++) {
            const x = x_vals[i];
            x_curve.push(x);
            y_curve.push(evaluarFuncion(fStr, x));
            z_curve.push(0);
        }

        traces.push({
            x: x_curve, y: y_curve, z: z_curve,
            mode: 'lines',
            line: { color: '#ffd54f', width: 5 },
            name: 'Curva R(x) en plano XY',
            hoverinfo: 'skip'
        });

        // --- CURVA g(x) en el plano XY (si es arandela) ---
        if (esArandela) {
            const x_curve2 = [], y_curve2 = [], z_curve2 = [];
            for (let i = 0; i < nx; i++) {
                const x = x_vals[i];
                x_curve2.push(x);
                y_curve2.push(evaluarFuncion(gStr, x));
                z_curve2.push(0);
            }

            traces.push({
                x: x_curve2, y: y_curve2, z: z_curve2,
                mode: 'lines',
                line: { color: '#4dd0e1', width: 5, dash: 'dash' },
                name: 'Curva r(x) en plano XY',
                hoverinfo: 'skip'
            });
        }

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: esArandela 
                ? 'Sólido de Revolución 3D (Método de Arandelas)' 
                : 'Sólido de Revolución 3D (Método de Discos)',
            scene: {
                xaxis: { title: 'Eje X', backgroundcolor: '#1e1133', gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
                yaxis: { title: 'Eje Y', backgroundcolor: '#1e1133', gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
                zaxis: { title: 'Eje Z', backgroundcolor: '#1e1133', gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
                aspectmode: 'cube',
                camera: { eye: { x: 1.8, y: 1.8, z: 1.2 } }
            },
            margin: { l: 0, r: 0, b: 0, t: 50 },
            showlegend: false
        };

        Plotly.newPlot('grafico', traces, layout, { responsive: true });
    }

    // Mostrar resultados con KaTeX corregido
    function mostrarResultados(fStr, gStr, a, b) {
        const resultadosDiv = document.getElementById('resultados-content');
        const volumen = calcularVolumen(fStr, gStr, a, b, 1000);
        const esDisco = (gStr === '0');
        const tipoMetodo = esDisco ? 'Discos' : 'Arandelas';

        const integrando = esDisco 
            ? `$$V = \\pi \\int_{${a}}^{${b}} [${fStr}]^2 \\, dx$$`
            : `$$V = \\pi \\int_{${a}}^{${b}} \\left( [${fStr}]^2 - [${gStr}]^2 \\right) \\, dx$$`;

        const tarjetas = [
            { etiqueta: 'Método', valor: tipoMetodo, color: '#ffd54f' },
            { etiqueta: 'Radio exterior R(x)', valor: fStr, color: '#69f0ae' },
            { etiqueta: 'Radio interior r(x)', valor: gStr, color: '#4dd0e1' },
            { etiqueta: 'Intervalo', valor: `[${a}, ${b}]`, color: '#b388ff' },
            { etiqueta: 'Volumen calculado', valor: `${volumen.toFixed(6)} u³`, color: '#ea80fc' }
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

        html += `
            <div class="paso" style="margin-top: 1.5rem;">
                <h4>🧮 Expresión Integral:</h4>
                ${integrando}
                <p style="margin-top: 1rem;">$$V \\approx ${volumen.toFixed(6)} \\text{ u}^3$$</p>
            </div>
        `;

        resultadosDiv.innerHTML = html;
        
        // Esperar a que el DOM se actualice y luego renderizar KaTeX
        setTimeout(() => {
            renderMathInElement(resultadosDiv, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }, 100);
    }

    // Evento del botón calcular
    btnCalcular.addEventListener('click', function() {
        const fStr = document.getElementById('f_x').value;
        const gStr = document.getElementById('g_x').value;
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);

        if (a >= b) {
            alert('El límite inferior (a) debe ser menor que el límite superior (b).');
            return;
        }

        // Validación básica para evitar raíces de negativos en sqrt(x)
        if ((fStr.includes('sqrt') || gStr.includes('sqrt')) && a < 0) {
            alert('Para funciones con raíz cuadrada, el límite inferior no puede ser negativo.');
            return;
        }

        graficar3D(fStr, gStr, a, b);
        mostrarResultados(fStr, gStr, a, b);
    });

    // Calcular al cargar la página
    btnCalcular.click();
});