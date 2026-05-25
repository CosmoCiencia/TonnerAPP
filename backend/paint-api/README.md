# Tonner Paint API

Backend FastAPI de Tonner Paint dentro de `TonnerApp`.

Este servicio procesa la imagen directamente en el pod con GPU. Ya no funciona
como proxy hacia RunPod Serverless.

Flujo:

```txt
TonnerPaint -> FastAPI /paint -> SAM local GPU -> image/jpeg
```

## Variables

Configura estas variables en el entorno donde corra el backend:

```bash
TONNER_PAINT_SAM_CHECKPOINT=/workspace/sam_vit_b_01ec64.pth
TONNER_PAINT_SAM_MODEL_TYPE=vit_b
TONNER_PAINT_MAX_SIDE=1024
TONNER_PAINT_POINTS_PER_SIDE=16
TONNER_PAINT_PRED_IOU_THRESH=0.9
TONNER_PAINT_STABILITY_SCORE_THRESH=0.9
TONNER_PAINT_MIN_MASK_REGION_AREA=5000
TONNER_PAINT_CORS_ORIGINS=http://localhost:5192,https://tonner-app.vercel.app
```

El backend tambien busca el checkpoint en estas rutas si no se define
`TONNER_PAINT_SAM_CHECKPOINT`:

```txt
/workspace/sam_vit_b_01ec64.pth
/workspace/sam/sam_vit_b_01ec64.pth
/runpod-volume/sam/sam_vit_b_01ec64.pth
```

## Endpoints

```txt
GET  /health
POST /paint
```

`POST /paint` recibe `multipart/form-data`:

```txt
image=@foto.jpg
color=#0057B8
opacity=0.6
```

Devuelve `image/jpeg`.

## Ejecutar

Solo backend:

```bash
npm run dev:api
```

Frontend y backend:

```bash
npm run dev:full
```

El frontend usa `VITE_TONNER_PAINT_API_URL`. Para el pod directo actual:

```bash
VITE_TONNER_PAINT_API_URL=https://fvgl7xmmeluu5j-8000.proxy.runpod.net
```

## Startup en RunPod pod directo

El script `scripts/runpod-start-api.sh` está preparado para correr en RunPod con:

```txt
/workspace/backend/paint-api
/workspace/sam_vit_b_01ec64.pth
```

Instalarlo una vez dentro del pod:

```bash
cd /workspace/backend/paint-api
bash scripts/install-runpod-startup.sh
```

Después de cada reinicio:

```bash
bash /workspace/start-api.sh
```

Verificar:

```bash
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/paint \
  -F "image=@/workspace/test.jpg;type=image/jpeg" \
  -F "color=#0057B8" \
  -F "opacity=0.6" \
  --output /workspace/proxy-result.jpg
```

El script crea/reusa `.venv`, instala dependencias solo si faltan o cambió
`requirements.txt`, valida CUDA y arranca `uvicorn` en `0.0.0.0:8000`.
