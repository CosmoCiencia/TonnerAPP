# Tonner Paint API

Backend FastAPI de Tonner Paint dentro de `TonnerApp`.

Este servicio ya no procesa SAM/Torch en el PC local. Ahora funciona como proxy
seguro hacia RunPod: React llama a `/paint`, este backend envia la imagen a
RunPod y devuelve la imagen resultante al navegador. La llave de RunPod queda
solo en el servidor.

El procesamiento SAM para RunPod esta en `runpod-worker/`.

## Variables

Configura estas variables en el entorno donde corra el backend:

```bash
RUNPOD_API_KEY=tu_api_key
RUNPOD_ENDPOINT_ID=tu_endpoint_id
RUNPOD_ENDPOINT_URL=
RUNPOD_OPERATION=runsync
RUNPOD_WAIT_MS=120000
RUNPOD_TIMEOUT_SECONDS=180
```

Puedes ponerlas en `TonnerApp/.env`, exportarlas en la terminal, o crear un
`.env` propio dentro de `backend/paint-api`. Si usas `RUNPOD_ENDPOINT_URL`,
puedes apuntar a una URL completa, por ejemplo
`https://api.runpod.ai/v2/<endpoint_id>/runsync`.

## Contrato con RunPod

El proxy envia:

```json
{
  "input": {
    "image_base64": "...",
    "image_mime_type": "image/jpeg",
    "filename": "input.jpg",
    "color": "#0057B8",
    "opacity": 0.6
  }
}
```

El worker de RunPod puede responder con una imagen base64, un data URI o una URL
en `output`. Tambien se aceptan claves comunes como `image`, `image_base64`,
`result`, `image_url` u `output_url`.

El worker incluido en `runpod-worker/` responde con `image_base64`.

## Setup

Desde `TonnerApp`:

```bash
npm run setup:api
```

## Ejecutar

Solo backend:

```bash
npm run dev:api
```

Frontend y backend:

```bash
npm run dev:full
```

El frontend usa `VITE_TONNER_PAINT_API_URL`, por defecto
`http://127.0.0.1:8000`.
