# VerbQuest v4 · Individual + Multijugador en tiempo real 🎮

Esta versión **mantiene la interfaz de VerbQuest v3**, los 80 verbos, los 5 niveles adaptativos, el progreso local y el repaso de errores. Además incorpora:

1. **Salir al inicio** desde una partida individual, con confirmación. Se conserva el dominio ya registrado en el navegador.
2. **Salas multijugador reales**, creadas por un administrador, con **código de 6 caracteres** y enlace de invitación.
3. **De 10 a 50 participantes por sala**: la partida no puede iniciar hasta que se registren **al menos 10 estudiantes**, sin contar al administrador.
4. **Contrarreloj global**: el administrador elige 1, 2, 3, 5, 10 o 15 minutos. Todos los jugadores compiten durante el mismo intervalo.
5. **Clasificación en directo y ganador**: la puntuación, las respuestas, el reloj y el orden de la clasificación se controlan en el servidor.
6. **Dificultad adaptativa individual** durante la competición, con distractores más engañosos y preguntas contextualizadas/de parejas en niveles altos.

## Requisitos

- **Node.js 20 o superior** instalado en el equipo servidor (recomendado Node.js 22 LTS).
- Un navegador moderno para cada participante.
- **No se necesitan dependencias npm de terceros, base de datos ni claves API.**
- Para que personas de diferentes redes puedan unirse, necesitas alojar el servidor Node.js en una dirección pública HTTPS.

## Nuevo selector de desafíos estilo consola (PC y celular)

La pantalla principal incluye una **biblioteca de desafíos** inspirada en la navegación por juegos de Xbox 360:

- **PC:** selecciona una tarjeta con el mouse, usa las flechas del carrusel o desplázate con **← / →, Inicio / Fin** al enfocar las tarjetas.
- **Celular:** desliza horizontalmente las tarjetas; la tarjeta centrada se selecciona automáticamente. También puedes tocar una tarjeta.
- **Opciones rápidas:** elige 10, 20, 40 o todos los verbos y sin límite / 10 / 15 / 20 segundos por pregunta.
- **Accesibilidad:** botones con `aria-pressed`, navegación con teclado, foco visible y movimiento reducido cuando el sistema lo solicita.
- **Compatibilidad:** `public/challenge-picker.js` sincroniza los controles visuales con `modeSelect`, `countSelect` y `timerSelect`. `public/app.js` y el motor de juego conservan su comportamiento; el modo multijugador no se modifica.

## Paso 1 — Ejecutar en Windows

1. Extrae el ZIP de la entrega; entra a la carpeta `VerbQuest_Multijugador`.
2. Abre una terminal (PowerShell, VS Code o Git Bash) dentro de esa carpeta, **junto al archivo `package.json`**.
3. Ejecuta:

```bash
node --version
npm start
```

Deberías ver:

```text
VerbQuest listo en http://localhost:3000
```

4. Abre **http://localhost:3000** en tu navegador.
5. Para detener el servidor presiona **Ctrl + C**.

> **Importante**: el modo individual sí puede abrirse desde `public/index.html` sin servidor. El **modo multijugador NO**: los jugadores deben abrir la misma aplicación desde la dirección del servidor.

## Paso 2 — Crear y jugar en una sala

### Administrador (docente)

1. En la pantalla principal pulsa **Create a room**.
2. Escribe tu nombre, elige la capacidad (10, 15, 20, 30 o 50 jugadores), la duración total y el modo de preguntas.
3. Pulsa **Create room**. Aparecerá un código de seis caracteres (por ejemplo, `X7QK4B`) y la opción **Copy invitation**.
4. Comparte el **enlace de invitación o código** con los estudiantes. Mantén abierta la sala.
5. Espera a **10 estudiantes o más** y pulsa **Start challenge**. Los participantes tienen tres segundos de preparación.
6. Observa la **tabla de posiciones en vivo**. Al llegar el reloj a cero aparece la clasificación final y el ganador.

El administrador actúa como coordinador/espectador; **no cuenta** como estudiante ni puede responder.

### Estudiantes

1. Abren la **misma dirección del servidor** y pulsan **Join a room** (o usan el enlace compartido).
2. Introducen su apodo y el código de sala.
3. Esperan a que el administrador comience la partida.
4. Contestan tantas preguntas como puedan durante el **tiempo global**; cada pregunta tiene 4 opciones.
5. Cuando responden se muestra retroalimentación. Pulsen **Next question** para avanzar.
6. Al terminar ven el **ganador, las posiciones y sus propios resultados**.

## Paso 3 — Probar con varios dispositivos en una red local

1. Inicia el servidor con `npm start` en un equipo Windows conectado a la misma red Wi‑Fi de los alumnos.
2. Busca la dirección IPv4 del servidor con `ipconfig` (por ejemplo, `192.168.1.50`).
3. Los alumnos deberán abrir `http://192.168.1.50:3000` desde esa misma red, **no** `localhost:3000`.
4. Si Windows Firewall pregunta si deseas permitir Node.js en redes privadas, habilítalo para esa red. No abras el puerto a Internet sin medidas de seguridad adecuadas.
5. Comparte el enlace generado por la sala. Si el profesor creó la sala desde `localhost`, el botón **Copy invitation** incluirá `localhost`; reemplázalo al compartir por la IP accesible del servidor, por ejemplo `http://192.168.1.50:3000/?room=CODIGO`.

## Paso 4 — Publicar para estudiantes en redes diferentes

Esta versión requiere un alojamiento capaz de ejecutar **Node.js continuamente**, por ejemplo Render, Railway, Fly.io o un VPS. GitHub Pages y un Netlify exclusivamente estático **no pueden ejecutar el backend de salas**.

En un proveedor Node.js compatible:

1. Sube todo el directorio `VerbQuest_Multijugador` a tu repositorio.
2. Configura el servicio como aplicación Node.js con **start command** `npm start` y entorno Node.js 20+.
3. El servidor respeta automáticamente la variable de entorno `PORT` del proveedor.
4. Abre la URL HTTPS pública asignada por la plataforma y crea una sala allí.
5. Comparte el enlace generado. No compartas enlaces `localhost` para jugadores remotos.

Si tu proveedor suspende el servicio gratuito por inactividad, las salas pueden perderse o desconectarse cuando el servidor se reinicie. Para un torneo es recomendable mantener el servicio encendido.

## Reglas y desempates

- Se usan **80 verbos por partida**; cada estudiante avanza a su ritmo a través de una secuencia común de verbos.
- El **cronómetro global** comienza después de tres segundos de preparación y finaliza para todos a la misma hora del servidor.
- **Respuesta correcta**: `10 + 2 × (nivel actual - 1)` puntos; desde el tercer acierto consecutivo suma **2 puntos de racha** adicionales.
- **Respuesta incorrecta**: cero puntos y reducción de un nivel (hasta el mínimo 1).
- **Dos aciertos consecutivos**: se sube un nivel (hasta el máximo 5).
- **Ranking**: mayor puntuación; desempate por más aciertos, menos errores y menor suma de tiempos de respuesta correctos.
- Si todos estos criterios empatan, se declaran **ganadores compartidos**. Si nadie obtuvo puntos, se indica que no hubo ganador.
- Un estudiante que pulsa **Exit multiplayer** durante la competición **renuncia a la clasificación**. Si solamente se interrumpe su conexión, puede reconectarse desde la misma pestaña o sesión del navegador.
- El administrador puede cerrar la sala en la espera; si abandona una competición ya iniciada, el servidor continúa hasta finalizar.

## Archivos

```text
VerbQuest_Multijugador/
├── public/
│   ├── index.html         # Interfaz original v3 y nuevas pantallas v4
│   └── multiplayer.js     # Interfaz multijugador, API, eventos y clasificación
├── engine.js              # Lógica y validaciones del juego en el servidor
├── server.js              # HTTP + eventos SSE en tiempo real
├── verbs.json             # Banco de 80 verbos
├── package.json           # npm start / npm test
├── tests/
│   ├── engine.test.js
│   └── http.test.js
└── README.md
```

## Pruebas automatizadas

Desde la carpeta raíz:

```bash
npm test
```

Valida la creación de salas, mínimo de diez participantes, preguntas sin respuestas válidas duplicadas, validación de respuestas en el servidor, adaptación de nivel, fin por tiempo y comunicación HTTP/SSE.

## Consideraciones técnicas y límites

- El **servidor** determina las respuestas correctas, los puntos, el nivel y los tiempos; el navegador nunca recibe la respuesta correcta hasta que el jugador responde.
- Los eventos de clasificación se envían mediante **Server-Sent Events (SSE)**, mientras que las acciones del jugador se envían con `fetch`. No hay dependencias de WebSocket ni servicios externos.
- Las salas se guardan **en memoria**. **Se pierden si reinicias el servidor**; tras finalizar se limpian automáticamente pasados 30 minutos.
- El avance de estudio **individual** sigue guardándose únicamente en `localStorage` del navegador original. La competición no modifica dicho progreso.
- La recuperación de la sala después de actualizar la página utiliza `sessionStorage` de ese mismo navegador.
- El sistema verifica respuestas y puntos en el servidor, pero **los apodos no verifican identidades** y no hay cuentas, contraseñas, límites por IP ni protección avanzada contra bots. Es una implementación educativa para grupos supervisados; si se requiere una competición pública con premios, se recomienda añadir autenticación, control de abuso, almacenamiento persistente, HTTPS y más pruebas de carga.
- La capacidad admitida es de **hasta 50 inscritos por sala**, pero no se ha certificado una carga de 50 dispositivos concurrentes en redes reales. Prueba la conexión y capacidad de tu alojamiento antes de un evento.

Desarrollado con HTML, CSS, JavaScript y las bibliotecas integradas en Node.js. ✨
