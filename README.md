# Metrónomo Flamenco

Web app móvil hecha con HTML, CSS y JavaScript puro. Usa Web Audio API con un pequeño scheduler para mantener el pulso estable.

## 1. Cómo abrir la app

Abre `index.html` directamente en un navegador móvil o de escritorio.

En celular, si el navegador bloquea el sonido, pulsa `Iniciar` una vez: esa interacción activa el motor de audio.

## 2. Sonidos sin archivos WAV

La app ya funciona sin subir archivos de audio. Los golpes se generan con Web Audio API.

Sonidos disponibles:

- Palmas
- Madera
- Cajón

Puedes cambiar el carácter de cada sonido en `app.js`, dentro de las funciones `playPalmas`, `playMadera` y `playCajon`.

## 3. Usar audios externos opcionalmente

Para usar loops reales de palmas por palo, coloca estos WAV en la carpeta `audio`:

```text
audio/palmas-rumba-100.wav
audio/palmas-tangos-188.wav
audio/palmas-bulerias-90.wav
audio/palmas-alegrias-80.wav
audio/palmas-sevillanas-150.wav
audio/palmas-fandangos-142.wav
```

Cuando el selector de sonido esté en `Palmas`, la app intentará cargar el loop del palo seleccionado. Si no existe, usará las palmas generadas.

No subas loops de librerías comerciales a un repositorio público si la licencia no permite redistribuirlos.

Si más adelante quieres usar golpes WAV sueltos para acento y pulso, cambia en `app.js`:

```js
const USE_EXTERNAL_AUDIO_FILES = false;
```

por:

```js
const USE_EXTERNAL_AUDIO_FILES = true;
```

Para cambiar nombres o rutas, edita:

```js
const AUDIO_FILES = {
  accent: "audio/acento.wav",
  pulse: "audio/pulso.wav",
};
```

## 4. Cómo cambiar acentos de cada palo

Edita el objeto `palos` en `app.js`. Cada palo tiene:

- `beats`: los tiempos visibles.
- `accents`: los tiempos que deben sonar y verse acentuados.
- `rests`: tiempos visibles que no deben sonar.
- `weakBeats`: tiempos que suenan con volumen muy bajo.
- `ornaments`: golpes suaves añadidos entre tiempos.
- `bpm`: el BPM inicial sugerido.

Ejemplo:

```js
tangos: {
  label: "Tangos",
  bpm: 112,
  beats: ["1", "2", "3", "4"],
  accents: ["4"],
  weakBeats: ["1"],
}
```

Ejemplo con adornos:

```js
alegrias: {
  label: "Alegrías",
  bpm: 150,
  beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
  accents: ["12", "3", "6", "8", "10"],
  ornaments: [{ beat: "3", offsetBeats: 0.5, volume: 0.34 }],
}
```

## 5. Cómo quitar la limitación de 8 compases

Edita `app.js` y cambia:

```js
const FREE_DEMO_BARS = 8;
```

por:

```js
const FREE_DEMO_BARS = Infinity;
```

El botón `Desbloquear versión completa` abre el enlace configurado en `MERCADO_PAGO_URL`.

## 6. Modo instalable PWA

La app incluye:

- `manifest.webmanifest`
- `sw.js`
- `icon.svg`

Para que el modo instalable/offline funcione, abre la app desde un servidor local o hosting estático. Abrir `index.html` directamente funciona para practicar, pero los navegadores no activan service workers desde `file://`.

Ejemplo con servidor local:

```bash
python -m http.server 4173
```

Después abre:

```text
http://127.0.0.1:4173
```

Si el navegador muestra una versión anterior, cierra esa pestaña y abre una URL con versión nueva:

```text
http://127.0.0.1:4173/index.html?v=19
```
