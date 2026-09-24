# 📐 Plataforma Web Colaborativa de Cálculo Integral — Fase 1

**Asignatura:** Cálculo Integral (CB215)  
**Programa:** Tecnología en Desarrollo de Software  
**Institución:** Universidad Tecnológica de Pereira (UTP)

---

## 📖 Descripción del Proyecto

Esta plataforma web interactiva está diseñada para la enseñanza y visualización de conceptos de cálculo integral y métodos numéricos, con una estructura modular que facilita el aprendizaje y la exploración de cada tema por separado.

---

## 🏗️ Arquitectura del Proyecto

```text
plataforma-calculo-fase1/
│
├── index.html                    # Página principal con navegación a 14 módulos
├── README.md                     # Documentación técnica del proyecto
│
├── css/
│   └── styles.css                # Estilos globales (diseño responsive)
│
├── js/
│   └── main.js                   # Lógica JavaScript global
│
└── modulos/
    ├── modulo1/                  # ✅ Sumas de Riemann (Fase 1 - Activo)
    │   ├── index.html
    │   ├── modulo1.css
    │   └── modulo1.js
    │
    ├── modulo2/                  # ✅ Regla del Trapecio (Fase 1 - Activo)
    ├── modulo3/                  # ✅ Regla del Punto Medio (Fase 1 - Activo)
    ├── modulo4/                  # ✅ Regla de Simpson (Fase 1 - Activo)
    ├── modulo5/                  # ✅ Integral Definida y Área (Fase 1 - Activo)
    ├── modulo6/                  # ✅ Integración Directa (Fase 1 - Activo)
    │
    ├── modulo7/                  # 🔒 Sustitución/Potencias (Fase 2 - Próximamente)
    ├── modulo8/                  # 🔒 Integrales Exponenciales (Fase 2 - Próximamente)
    ├── modulo9/                  # 🔒 Integrales Logarítmicas (Fase 2 - Próximamente)
    ├── modulo10/                 # 🔒 Integrales Trigonométricas (Fase 2 - Próximamente)
    ├── modulo11/                 # 🔒 Trigonométricas Inversas (Fase 3 - Próximamente)
    ├── modulo12/                 # 🔒 Hiperbólicas Inversas (Fase 3 - Próximamente)
    ├── modulo13/                 # 🔒 Trinomio ax² + bx + c (Fase 3 - Próximamente)
    └── modulo14/                 # 🔒 Integración por Partes (Fase 3 - Próximamente)
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica y accesible.
- **CSS3**: Diseño responsive con Grid y Flexbox.
- **JavaScript (ES6+)**: Lógica interactiva y cálculos matemáticos.

### Librerías Matemáticas y de Visualización
- **KaTeX**: Renderizado rápido de fórmulas matemáticas en LaTeX.
- **Plotly.js**: Gráficas interactivas y visualizaciones científicas.

### Herramientas de Desarrollo
- **Git & GitHub**: Control de versiones y colaboración.
- **GitHub Pages**: Despliegue y hosting gratuito.
- **Qwen Coder**: Asistencia en programación y estructura general del proyecto.
- **Visual Studio Code**: Editor de desarrollo principal.

### Características Técnicas
- ✅ **Diseño responsive**: Compatible con móviles, tablets y desktop.
- ✅ **Renderizado matemático**: Fórmulas en LaTeX con KaTeX.
- ✅ **Visualización interactiva**: Gráficas dinámicas con Plotly.js.
- ✅ **Arquitectura modular**: Cada módulo funciona de forma independiente.
- ✅ **Código documentado**: Estructura clara y comentarios útiles.

---

## 🚀 Instalación y Ejecución

### Opción 1: Ejecución local directa

1. Clona el repositorio en tu máquina local:

```bash
git clone https://github.com/TU_USUARIO/plataforma-calculo-fase1.git
cd plataforma-calculo-fase1
```

2. Abre el archivo `index.html` directamente en tu navegador web.

### Opción 2: Servidor local (recomendado)

Para evitar restricciones de CORS y cargar correctamente los recursos:

```bash
# Con Python 3
python -m http.server 8000
```

```bash
# Con Node.js
npx http-server -p 8000
```

Luego accede a: `http://localhost:8000`

### Opción 3: Despliegue en GitHub Pages

1. Sube el proyecto a tu repositorio de GitHub.
2. Entra a **Settings → Pages**.
3. En **Branch**, selecciona `main` y la carpeta `/` (root).
4. Tu sitio quedará disponible en:

```text
https://TU_USUARIO.github.io/plataforma-calculo-fase1/
```

---

## 🤝 Cómo Contribuir

Este proyecto está pensado para crecer a lo largo del semestre. Si deseas colaborar en las Fases 2 y 3:

1. Haz un fork de este repositorio.
2. Crea una rama para tu módulo o mejora:

```bash
git checkout -b modulo-X-nombre
```

3. Desarrolla el contenido siguiendo la estructura y estándares de los módulos 1 a 6.
4. Prueba localmente que el renderizado de KaTeX y las gráficas de Plotly.js funcionen correctamente.
5. Haz commit de tus cambios:

```bash
git add .
git commit -m "Agregar Módulo X: [Nombre del módulo] con visualizador y ejemplos"
```

6. Haz push a tu rama y abre un Pull Request describiendo los cambios realizados.

---

## 🤖 Documentación del Uso de Inteligencia Artificial

De acuerdo con las directrices del curso, se documenta el uso de herramientas de IA en este proyecto:

- **Herramienta utilizada:** Qwen Coder.
- **Alcance:** Asistencia en la generación de código JavaScript, HTML y CSS, así como en la estructuración de la arquitectura modular.
- **Validación:** Todo el código fue revisado, entendido, adaptado y probado manualmente por el estudiante.
- **Documentación:** Este README y los comentarios del código reflejan el trabajo y la comprensión del estudiante.

---

## 👨‍💻 Autor

| Campo | Valor |
|-------|-------|
| **Nombre** | Samuel Andres Garcia Nieto |
| **Email** | samuel.garcia5@utp.edu.co |
| **GitHub** | LegionSm7 |

---

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso de Cálculo Integral (CB215) de la Universidad Tecnológica de Pereira. El código fuente está disponible para fines educativos y académicos.

---