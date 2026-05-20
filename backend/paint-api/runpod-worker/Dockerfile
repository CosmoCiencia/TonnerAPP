FROM pytorch/pytorch:2.4.1-cuda12.1-cudnn9-runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    TONNER_PAINT_SAM_CHECKPOINT=/runpod-volume/sam/sam_vit_b_01ec64.pth \
    TONNER_PAINT_SAM_MODEL_TYPE=vit_b \
    TONNER_PAINT_MAX_SIDE=1024 \
    TONNER_PAINT_POINTS_PER_SIDE=16 \
    TONNER_PAINT_PRED_IOU_THRESH=0.9 \
    TONNER_PAINT_STABILITY_SCORE_THRESH=0.9 \
    TONNER_PAINT_MIN_MASK_REGION_AREA=5000

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.txt \
    && python -c "import cv2, numpy, runpod, torch; from segment_anything import SamAutomaticMaskGenerator, sam_model_registry; print('opencv', cv2.__version__); print('numpy', numpy.__version__); print('torch', torch.__version__); print('cuda_available_at_build', torch.cuda.is_available()); print('runpod', getattr(runpod, '__version__', 'installed')); print('segment_anything', SamAutomaticMaskGenerator.__name__, bool(sam_model_registry))"

COPY handler.py .

CMD ["python", "-u", "handler.py"]
