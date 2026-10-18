<div align="center">

# 🎮 VerbQuest

### Learn. Practice. Master. Compete. 🏆

**Plataforma web interactiva para aprender y practicar los verbos irregulares del inglés mediante gamificación, dificultad adaptativa y competencias multijugador en tiempo real.**

![Versión](https://img.shields.io/badge/versi%C3%B3n-4.1.0-6C4CFF)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Modalidades](https://img.shields.io/badge/modos-individual%20%7C%20multijugador-19C39C)

**Desarrollado por Mateo Salazar**  
**Pontificia Universidad Javeriana · Bogotá, Colombia · 2026**

</div>

---

## 📖 Descripción

**VerbQuest** es una aplicación web educativa diseñada para reforzar el aprendizaje de las **tres formas de los verbos irregulares en inglés**: *base form*, *simple past* y *past participle*.

Combina ejercicios de selección múltiple, retroalimentación inmediata, seguimiento del dominio de cada forma verbal y un sistema de dificultad que se adapta al desempeño del estudiante. Además, permite organizar competencias contrarreloj mediante salas privadas con código de acceso, clasificación en vivo y anuncio del ganador.

La interfaz es **responsive** y puede utilizarse desde un computador, una tableta o un celular con un navegador moderno. No es necesario instalar la aplicación ni crear una cuenta para jugar.

## ✨ Características principales

### 🧠 Modo individual: práctica inteligente

- **80 verbos irregulares**, con sus tres formas y una descripción de su significado.
- Ejercicios de **base form**, **simple past**, **past participle** o **modo mixto**.
- Partidas de **10, 20, 40 o todos los verbos**.
- Temporizador opcional por pregunta: **sin límite, 10, 15 o 20 segundos**.
- **Cuatro opciones** por pregunta, con corrección visual inmediata y explicación de las formas verbales.
- Puntos, rachas de aciertos, barra de progreso y resultados al finalizar.
- Botón para **salir al menú principal** durante la partida.
- **Dominio por verbo y por forma verbal**: se registran aciertos, errores y avance.
- Selección adaptativa que prioriza los contenidos que necesitan refuerzo.
- **Repaso de errores** al terminar: los elementos fallados vuelven a practicarse hasta acertarlos.
- Progreso almacenado en el navegador mediante `localStorage`.

### ⚡ Dificultad adaptativa

El juego dispone de **cinco niveles**:

| Nivel | Nombre | Tipo de reto |
|:--:|---|---|
| 1 | 🌱 Starter | Identificación de formas con distractores sencillos. |
| 2 | 🔎 Explorer | Opciones incorrectas más parecidas. |
| 3 | ⚡ Practitioner | Mayor similitud entre opciones y preguntas en contexto. |
| 4 | 🔥 Advanced | Menos pistas y ejercicios que relacionan dos formas verbales. |
| 5 | 🏆 Expert | Distractores exigentes, frases contextualizadas y pares engañosos. |

**Regla de progresión:** dos aciertos consecutivos permiten subir un nivel; una respuesta incorrecta reduce un nivel, sin salir del rango de 1 a 5. Así, el reto se adapta continuamente al estudiante.

### 🌍 Modo multijugador: competencia en tiempo real

- Un **administrador** crea la sala y configura sus reglas.
- Cada sala recibe un **código único de seis caracteres** y un enlace de invitación.
- Capacidad configurable de **10, 15, 20, 30 o 50 cupos**.
- **Inicio flexible:** el administrador puede iniciar con **al menos un jugador**, sin esperar a llenar los cupos. Los cupos representan el máximo de participantes, no un mínimo obligatorio.
- Duración global de **1, 2, 3, 5, 10 o 15 minutos**.
- Modalidades de preguntas: mixta, pasado simple, participio o forma base.
- Cuenta regresiva de preparación de **tres segundos** antes del comienzo.
- Preguntas de dificultad adaptativa para cada participante.
- **Clasificación en vivo**, puntos y anuncio del ganador o ganadores al finalizar.
- Validación de respuestas, puntuaciones y tiempo desde el servidor.

> **Nota:** el administrador coordina la sala, pero no participa en el ranking. Una vez iniciada la partida, no se admiten nuevos jugadores en esa sala.

## 🎯 ¿Cómo se juega?

**Individual:** abre la página, configura tu práctica, responde las preguntas y consulta los resultados. Si te equivocas, utiliza **Review mistakes** para reforzar las formas que necesitas repasar.

**Multijugador (administrador):** elige **Create a room**, configura capacidad, duración y modo; comparte el código con los participantes y pulsa **Start now** cuando haya al menos una persona en la sala.

**Multijugador (estudiante):** abre el mismo sitio, selecciona **Join a room**, introduce tu apodo y el código de sala, espera el inicio y responde tantas preguntas como puedas antes de que termine el tiempo.

### 🏅 Puntuación y ganador

En el multijugador, una respuesta correcta otorga **10 + 2 × (nivel − 1)** puntos, más **2 puntos extra** desde el tercer acierto consecutivo. Una respuesta incorrecta no suma puntos.

Gana quien obtiene **más puntos**. En caso de empate se comparan, en orden, más respuestas correctas, menos errores y menor tiempo acumulado de respuesta en los aciertos. Si el empate es total, se pueden declarar **ganadores compartidos**.

## 🛠️ Tecnologías y arquitectura

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura y pantallas de la aplicación. |
| **CSS3** | Diseño responsive, animaciones y estados visuales. |
| **JavaScript (Vanilla)** | Mecánicas del juego y lógica del cliente. |
| **Node.js 20+** | Servidor HTTP y reglas del multijugador. |
| **Server-Sent Events (SSE)** | Actualización en tiempo real de las salas y del ranking. |
| **REST / `fetch`** | Creación de salas, ingreso, respuestas y acciones de los jugadores. |
| **`localStorage` / `sessionStorage`** | Dominio individual y recuperación de sesión multijugador en el navegador. |
| **GitHub + Render** | Repositorio de código y despliegue web público. |

El proyecto utiliza módulos integrados de Node.js y **no requiere dependencias npm externas**, base de datos ni claves API para su funcionamiento actual.

### 📁 Estructura del proyecto

```text
VerbQuest/
├── README.md
└── VerbQuest_Multijugador/
    ├── public/
    │   ├── index.html          # Interfaz y modo individual
    │   └── multiplayer.js      # Cliente multijugador
    ├── engine.js               # Reglas, salas, preguntas y puntuaciones
    ├── server.js               # Servidor HTTP y eventos SSE
    ├── verbs.json              # Banco de 80 verbos
    ├── package.json            # Comandos y versión del proyecto
    └── tests/
        ├── engine.test.js
        ├── http.test.js
        └── render-free.test.js
```

> La estructura supone que `VerbQuest_Multijugador` está dentro del repositorio. Si los archivos del servidor están directamente en la raíz, omite esa carpeta en los comandos siguientes.

## 💻 Instalación y ejecución local

**Requisito:** tener instalado **Node.js 20 o superior**.

1. Clona el repositorio y entra a la carpeta que contiene `package.json`:

   ```bash
   git clone https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   cd TU-REPOSITORIO/VerbQuest_Multijugador
   ```

2. Inicia el servidor:

   ```bash
   npm start
   ```

3. Abre en tu navegador:

   ```text
   http://localhost:3000
   ```

4. Para detener el servidor, utiliza **Ctrl + C** en la terminal.

> Sustituye `TU-USUARIO/TU-REPOSITORIO` por la dirección real de tu repositorio. Para acceder desde otros equipos, publica el servidor o utiliza una dirección accesible desde la misma red.

### ✅ Pruebas automatizadas

Desde la carpeta que contiene `package.json` ejecuta:

```bash
npm test
```

El proyecto incluye pruebas del banco de verbos, preguntas con una única respuesta válida, niveles de dificultad, creación e inicio flexible de salas, puntuación, clasificación, fin de partida y comunicación HTTP/SSE.

## ☁️ Despliegue en Render

VerbQuest necesita un **Web Service de Node.js** para que el multijugador funcione entre dispositivos conectados desde redes diferentes.

1. Sube el proyecto a un repositorio de GitHub.
2. En [Render](https://render.com/), crea un **New → Web Service** y conecta el repositorio.
3. Utiliza la siguiente configuración:

   | Parámetro | Valor |
   |---|---|
   | **Language / Runtime** | `Node` |
   | **Root Directory** | `VerbQuest_Multijugador` si allí está `package.json`; en caso contrario, déjalo vacío. |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` para pruebas y uso educativo sujeto a sus límites. |

4. Despliega y comparte la **URL HTTPS** que Render asigne al servicio.
5. Para comprobar que el proceso responde, visita `https://TU-SERVICIO.onrender.com/healthz`.

**Importante sobre Render Free:** el servicio puede suspenderse tras aproximadamente **15 minutos de inactividad** y tardar cerca de **un minuto o más** en responder a la primera visita posterior. El enlace sigue siendo público, pero **no se garantiza disponibilidad continua ni arranque inmediato**.

Antes de una competencia, abre la web unos minutos antes, comprueba que el servidor responde y crea la sala cuando esté listo. Evita desplegar cambios mientras haya una partida activa.

## 🔐 Limitaciones y mejoras futuras

- Las salas y los resultados multijugador se mantienen **en la memoria del servidor**: se pierden si el proceso se reinicia, se suspende o se vuelve a desplegar.
- El dominio individual se guarda **solo en el navegador utilizado**; no está sincronizado entre dispositivos.
- Las sesiones de sala utilizan códigos y tokens temporales, pero **no hay cuentas verificadas ni autenticación avanzada**.
- La capacidad máxima configurable es de **50 participantes por sala**, aunque esto no representa una garantía de rendimiento bajo cualquier carga o infraestructura.
- Para futuras versiones se podrían agregar base de datos persistente, historial de torneos, cuentas de usuario, sincronización del dominio, panel docente y más modalidades de ejercicios.

## 🎓 Autor y créditos

**Mateo Salazar Bogota**  
**Pontificia Universidad Javeriana**  
**Bogotá, Colombia — 2026**

Proyecto educativo orientado a practicar inglés de forma interactiva y competitiva. La mención de la universidad identifica la referencia académica del proyecto y no implica patrocinio ni respaldo institucional oficial.

**© 2026 Mateo Salazar Bogota · Pontificia Universidad Javeriana · Bogotá, Colombia**

**Licencia:** el paquete actual declara `UNLICENSED`; no se ha otorgado una licencia abierta de reutilización del código.

---

<div align="center">

**✨ Learning irregular verbs can be a game. Welcome to VerbQuest! ✨**

</div>
