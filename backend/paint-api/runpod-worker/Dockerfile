FROM pytorch/pytorch:2.4.1-cuda12.1-cudnn9-runtime

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.txt

COPY handler.py .

ENV TONNER_PAINT_SAM_CHECKPOINT=/runpod-volume/sam/sam_vit_b_01ec64.pth
ENV TONNER_PAINT_SAM_MODEL_TYPE=vit_b

CMD ["python", "-u", "handler.py"]
