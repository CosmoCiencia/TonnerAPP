# Tonner Paint RunPod Worker

Worker Serverless para ejecutar SAM en RunPod.

El proxy local en `../server/api.py` envia a RunPod:

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

Este worker responde:

```json
{
  "image_base64": "...",
  "image_mime_type": "image/jpeg"
}
```

## Modelo SAM

Por defecto busca el checkpoint en:

```bash
/runpod-volume/sam/sam_vit_b_01ec64.pth
```

Puedes cambiarlo con:

```bash
TONNER_PAINT_SAM_CHECKPOINT=/ruta/al/modelo.pth
TONNER_PAINT_SAM_MODEL_TYPE=vit_b
```

## Imagen Docker

```bash
docker build -t tonner-paint-runpod-worker .
```

Sube esa imagen a tu registry y usala como template del endpoint Serverless de
RunPod. El endpoint que cree RunPod es el que va en `RUNPOD_ENDPOINT_ID` del
proxy local.
