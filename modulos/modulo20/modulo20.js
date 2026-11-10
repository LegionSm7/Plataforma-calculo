// ===== MÓDULO 20: VOLUMEN DE SÓLIDOS CON SECCIÓN CONOCIDA (3D) =====

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

    function evaluarFuncion(funcStr, x) {
        switch(funcStr) {
            case 'x^2': return x * x;
            case 'sqrt(x)': return Math.sqrt(Math.max(0, x));
            case 'sin(x)': return Math.sin(x);
            case '1-x^2': return 1 - x * x;
            default: return x * x;
        }
    }

    function obtenerArea(funcStr, x, tipo) {
        const fx = Math.abs(evaluarFuncion(funcStr, x));
        const fx2 = fx * fx;
        
        switch(tipo) {
            case 'cuadrado':
                return { 
                    valor: fx2, 
                    nombre: 'Cuadrados', 
                    formulaLatex: 'A(x) = [f(x)]^2',
                    formulaDisplay: '$$A(x) = [f(x)]^2$$'
                };
            case 'semicirculo':
                return { 
                    valor: (Math.PI / 8) * fx2, 
                    nombre: 'Semicírculos', 
                    formulaLatex: 'A(x) = \\frac{\\pi}{8} [f(x)]^2',
                    formulaDisplay: '$$A(x) = \\frac{\\pi}{8} [f(x)]^2$$'
                };
            case 'triangulo':
                return { 
                    valor: (Math.sqrt(3) / 4) * fx2, 
                    nombre: 'Triángulos equiláteros', 
                    formulaLatex: 'A(x) = \\frac{\\sqrt{3}}{4} [f(x)]^2',
                    formulaDisplay: '$$A(x) = \\frac{\\sqrt{3}}{4} [f(x)]^2$$'
                };
            default:
                return { 
                    valor: fx2, 
                    nombre: 'Cuadrados', 
                    formulaLatex: 'A(x) = [f(x)]^2',
                    formulaDisplay: '$$A(x) = [f(x)]^2$$'
                };
        }
    }

    function calcularVolumen(funcStr, a, b, tipo, n = 1000) {
        const dx = (b - a) / n;
        let volumen = 0;
        
        for (let i = 0; i < n; i++) {
            const x = a + (i + 0.5) * dx; // Punto medio para mayor precisión
            const area = obtenerArea(funcStr, x, tipo).valor;
            volumen += area * dx;
        }
        
        return volumen;
    }

    function graficar3D(funcStr, a, b, tipo) {
        const nx = 50; // Número de rebanadas a lo largo del eje X
        const x_vals = [];
        const dx = (b - a) / (nx - 1);
        
        for (let i = 0; i < nx; i++) {
            x_vals.push(a + i * dx);
        }

        // Perfiles normalizados (L = 1) en el plano YZ
        let profile = [];
        
        if (tipo === 'cuadrado') {
            // Cuadrado: base, pared derecha, techo, pared izquierda
            profile = [[0, 0], [1, 0], [1, 1], [0, 1]];
        } else if (tipo === 'triangulo') {
            // Triángulo equilátero: base, vértice superior, regreso a origen
            profile = [[0, 0], [1, 0], [0.5, Math.sqrt(3)/2]];
        } else if (tipo === 'semicirculo') {
            // Semicírculo: puntos a lo largo del arco
            profile = [[0, 0]];
            for (let i = 1; i <= 20; i++) {
                const theta = Math.PI - (i / 20) * Math.PI; // De PI a 0
                profile.push([0.5 + 0.5 * Math.cos(theta), 0.5 * Math.sin(theta)]);
            }
        }

        const n_pts = profile.length;
        const X = [], Y = [], Z = [];

        // Construir matrices 2D para Plotly Surface
        for (let i = 0; i < nx; i++) {
            const x = x_vals[i];
            const L = Math.abs(evaluarFuncion(funcStr, x)); // Longitud de la base en este x
            
            const rowX = [], rowY = [], rowZ = [];
            for (let j = 0; j < n_pts; j++) {
                rowX.push(x);
                rowY.push(profile[j][0] * L);
                rowZ.push(profile[j][1] * L);
            }
            X.push(rowX);
            Y.push(rowY);
            Z.push(rowZ);
        }

        // Traza del sólido 3D
        const traceSolido = {
            x: X, y: Y, z: Z,
            type: 'surface',
            colorscale: 'Viridis',
            opacity: 0.9,
            showscale: false,
            hoverinfo: 'skip',
            name: 'Sólido'
        };

        // Traza de la base en el plano XY (para referencia visual)
        const X_base = [], Y_base = [], Z_base = [];
        for (let i = 0; i < nx; i++) {
            const x = x_vals[i];
            const L = Math.abs(evaluarFuncion(funcStr, x));
            X_base.push([x, x]);
            Y_base.push([0, L]);
            Z_base.push([0, 0]);
        }

        const traceBase = {
            x: X_base, y: Y_base, z: Z_base,
            type: 'surface',
            colorscale: [[0, 'rgba(100,100,100,0.2)'], [1, 'rgba(100,100,100,0.2)']],
            showscale: false,
            hoverinfo: 'skip',
            name: 'Base en plano XY'
        };

        // Traza de la curva f(x) en la base (línea cian brillante)
        const x_curve = [], y_curve = [], z_curve = [];
        for (let i = 0; i < nx; i++) {
            const x = x_vals[i];
            x_curve.push(x);
            y_curve.push(Math.abs(evaluarFuncion(funcStr, x)));
            z_curve.push(0);
        }

        const traceCurva = {
            x: x_curve, y: y_curve, z: z_curve,
            mode: 'lines',
            line: { color: '#00ffff', width: 6 },
            name: 'f(x) en la base',
            hoverinfo: 'skip'
        };

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#1e1133',
            font: { color: '#ece6f5', family: "'Segoe UI', sans-serif" },
            title: `Sólido 3D con Sección Transversal: ${tipo}`,
            scene: {
                xaxis: { title: 'Eje X', backgroundcolor: '#1e1133', gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
                yaxis: { title: 'Eje Y', backgroundcolor: '#1e1133', gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
                zaxis: { title: 'Eje Z', backgroundcolor: '#1e1133', gridcolor: '#3d2a66', zerolinecolor: '#4a3570' },
                aspectmode: 'cube', // Mantiene las proporciones reales sin estirar
                camera: { eye: { x: 1.8, y: 1.8, z: 1.2 } } // Ángulo de cámara isométrico agradable
            },
            margin: { l: 0, r: 0, b: 0, t: 50 },
            showlegend: false
        };

        Plotly.newPlot('grafico', [traceBase, traceSolido, traceCurva], layout, { responsive: true });
    }

    function mostrarResultados(funcStr, a, b, tipo) {
        const resultadosDiv = document.getElementById('resultados-content');
        const infoArea = obtenerArea(funcStr, (a+b)/2, tipo);
        const volumen = calcularVolumen(funcStr, a, b, tipo, 1000);

        const tarjetas = [
            { etiqueta: 'Función base', valor: `f(x) = ${funcStr}`, color: '#4dd0e1' },
            { etiqueta: 'Intervalo', valor: `[${a}, ${b}]`, color: '#69f0ae' },
            { etiqueta: 'Tipo de sección', valor: infoArea.nombre, color: '#b388ff' },
            { etiqueta: 'Fórmula del área', valor: infoArea.formulaDisplay, color: '#ffd54f', esMatematica: true },
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
                <p>$$V = \\int_{${a}}^{${b}} A(x) \\, dx \\approx ${volumen.toFixed(6)}$$</p>
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

    btnCalcular.addEventListener('click', function() {
        const funcStr = document.getElementById('funcion').value;
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const tipo = document.getElementById('tipo').value;

        if (a >= b) {
            alert('El límite inferior debe ser menor que el límite superior.');
            return;
        }

        if (funcStr === 'sqrt(x)' && a < 0) {
            alert('Para la función √x, el límite inferior no puede ser negativo.');
            return;
        }

        graficar3D(funcStr, a, b, tipo);
        mostrarResultados(funcStr, a, b, tipo);
    });

    // Calcular al cargar la página
    btnCalcular.click();
});