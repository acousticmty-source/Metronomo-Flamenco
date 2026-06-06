# Metrónomo Flamenco

Web app móvil hecha con HTML, CSS y JavaScript puro. Usa Web Audio API con un pequeño scheduler para mantener el pulso estable.

## 1. Cómo abrir la app

Abre `index.html` directamente en un navegador móvil o de escritorio.

En celular, si el navegador bloquea el sonido, pulsa `Iniciar` una vez: esa interacción activa el motor de audio.

## 2. Sonidos sin archivos WAV

La app ya funciona sin subir archivos de audio. Los golpes se generan con Web Audio API:

- tiempos acentuados: golpe más fuerte y agudo
- tiempos normales: golpe más suave

La interfaz incluye un selector de sonido:

- Palmas secas
- Madera
- Cajón tapa
- Click suave

Puedes cambiar el carácter de cada sonido en `app.js`, dentro del objeto `soundPresets`.

## 3. Usar audios externos opcionalmente

Si más adelante quieres usar tus propios WAV, coloca los archivos en la carpeta `audio`:

```text
audio/acento.wav
audio/pulso.wav
```

Después cambia en `app.js`:

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
- `bpm`: el BPM inicial sugerido.

Ejemplo:

```js
tangos: {
  label: "Tangos",
  bpm: 120,
  beats: ["1", "2", "3", "4"],
  accents: ["4"],
}
```

Ejemplo con silencio:

```js
rumbas: {
  label: "Rumbas",
  bpm: 100,
  beats: ["1", "2", "3", "4"],
  accents: ["4"],
  weakBeats: ["1"],
}
```

La app incluye dos patrones de Bulerías:

- `Bulerías 12-3-7-8-10`
- `Bulerías 12-3-6-8-10`

## 5. Cómo quitar la limitación de 8 compases

Edita `app.js` y cambia:

```js
const FREE_DEMO_BARS = 8;
```

por:

```js
const FREE_DEMO_BARS = Infinity;
```

El botón `Desbloquear versión completa` está preparado como elemento visual, pero todavía no implementa pagos.

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

Si el navegador muestra una versión anterior, cierra esa pestaña y abre una URL con versión nueva, por ejemplo:

```text
http://127.0.0.1:4173/index.html?v=15
```

También puedes usar otro puerto local para evitar una caché antigua del service worker.
