import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Capacitor, CapacitorHttp } from '@capacitor/core'

import { DEFAULT_PAINT_COLOR, getPaintPaletteForMaterial, type PaintColor, type PaintMaterialKey } from './colors'
import { useAppContent } from '../../services/appContent'
import { getPaintPalettesWithFallback } from '../../services/tonnerCatalog'

const PAINT_API_URL = (import.meta.env.VITE_TONNER_PAINT_API_URL?.trim() ?? '').replace(/\/+$/, '')
const PAINT_TIMEOUT_MS = 120_000
const IOS_UPLOAD_MAX_SIDE = 1600
const materialOrder = ['arquitectonica', 'industrial', 'automotriz', 'maderas']

class PaintRequestError extends Error {
  readonly userMessage: string

  constructor(userMessage: string) {
    super(userMessage)
    this.userMessage = userMessage
  }
}

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No se pudo preparar la imagen seleccionada.'))
    }
    image.src = objectUrl
  })

const canvasToJpeg = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error('No se pudo convertir la imagen a JPEG.'))
      },
      'image/jpeg',
      0.88,
    )
  })

const prepareIosImage = async (file: File): Promise<File> => {
  const image = await loadImage(file)
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight)
  const scale = longestSide > IOS_UPLOAD_MAX_SIDE ? IOS_UPLOAD_MAX_SIDE / longestSide : 1
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('No se pudo preparar la imagen para TonnerPaint.')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  const jpeg = await canvasToJpeg(canvas)
  return new File([jpeg], 'tonnerpaint-ios.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const separatorIndex = result.indexOf(',')

      if (separatorIndex < 0) {
        reject(new Error('No se pudo codificar la imagen.'))
        return
      }

      resolve(result.slice(separatorIndex + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })

const base64ToBlob = (base64: string, contentType: string) => {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: contentType })
}

const sendPaintRequest = async (file: File, color: string, signal: AbortSignal): Promise<Blob> => {
  const url = `${PAINT_API_URL}/paint`

  if (Capacitor.getPlatform() === 'ios') {
    let uploadFile = file

    try {
      uploadFile = await prepareIosImage(file)
    } catch (error) {
      console.warn('TonnerPaint: no se pudo normalizar la foto; se enviará el archivo original.', error)
    }

    const encodedImage = await fileToBase64(uploadFile)
    const response = await CapacitorHttp.request({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: [
        {
          key: 'image',
          value: encodedImage,
          type: 'base64File',
          contentType: uploadFile.type || 'application/octet-stream',
          fileName: uploadFile.name || 'tonnerpaint-image',
        },
        { key: 'color', value: color, type: 'string' },
        { key: 'opacity', value: '0.6', type: 'string' },
      ],
      dataType: 'formData',
      responseType: 'arraybuffer',
      connectTimeout: 30_000,
      readTimeout: PAINT_TIMEOUT_MS,
    })

    if (response.status < 200 || response.status >= 300) {
      throw new PaintRequestError(`TonnerPaint respondió con error (${response.status}).`)
    }

    const contentType = response.headers['content-type']?.split(';')[0].trim().toLowerCase()
    if (contentType !== 'image/jpeg' || typeof response.data !== 'string') {
      throw new PaintRequestError('TonnerPaint devolvió una respuesta inválida.')
    }

    return base64ToBlob(response.data, contentType)
  }

  const formData = new FormData()
  formData.append('image', file)
  formData.append('color', color)
  formData.append('opacity', '0.6')

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    signal,
  })

  if (!response.ok) {
    throw new PaintRequestError(`TonnerPaint respondió con error (${response.status}).`)
  }

  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  if (contentType !== 'image/jpeg') {
    throw new PaintRequestError('TonnerPaint devolvió una respuesta inválida.')
  }

  return response.blob()
}

export default function PaintModule() {
  const appContent = useAppContent()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeMaterialKey, setActiveMaterialKey] = useState('arquitectonica')
  const [paintPalettes, setPaintPalettes] = useState<Record<PaintMaterialKey, PaintColor[]>>({
    arquitectonica: getPaintPaletteForMaterial('arquitectonica'),
    industrial: getPaintPaletteForMaterial('industrial'),
    automotriz: getPaintPaletteForMaterial('automotriz'),
    maderas: getPaintPaletteForMaterial('maderas'),
  })
  const palette = useMemo(
    () => paintPalettes[activeMaterialKey as PaintMaterialKey] ?? getPaintPaletteForMaterial(activeMaterialKey),
    [activeMaterialKey, paintPalettes],
  )
  const [selectedColor, setSelectedColor] = useState(DEFAULT_PAINT_COLOR)
  const [isPainting, setIsPainting] = useState(false)
  const [flashActive, setFlashActive] = useState(false)
  const [paintError, setPaintError] = useState<string | null>(null)

  useEffect(() => {
    getPaintPalettesWithFallback().then(setPaintPalettes)
  }, [])

  useEffect(() => {
    const colorStillExists = palette.some((color) => color.code === selectedColor.code && color.hex === selectedColor.hex)

    if (!colorStillExists && palette[0]) {
      setSelectedColor(palette[0])
    }
  }, [palette, selectedColor.code, selectedColor.hex])

  const handleMaterialChange = (materialKey: string) => {
    setActiveMaterialKey(materialKey)
    setPaintError(null)
  }

  const cycleMaterial = (direction: -1 | 1) => {
    const currentIndex = materialOrder.indexOf(activeMaterialKey)
    const safeIndex = currentIndex >= 0 ? currentIndex : 0
    const nextIndex = (safeIndex + direction + materialOrder.length) % materialOrder.length
    handleMaterialChange(materialOrder[nextIndex])
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPaintError(null)
    setFlashActive(true)
    window.setTimeout(() => setFlashActive(false), 250)

    if (window.navigator.vibrate) {
      window.navigator.vibrate(40)
    }

    const reader = new FileReader()
    reader.onload = () => {
      const nextPreview = typeof reader.result === 'string' ? reader.result : null
      setPreviewUrl((currentUrl) => {
        if (currentUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(currentUrl)
        }

        return nextPreview
      })
    }
    reader.readAsDataURL(file)
  }

  const handleApplyColor = async () => {
    if (!selectedFile || isPainting) return

    if (!PAINT_API_URL) {
      setPaintError('TonnerPaint no está configurado.')
      return
    }

    setIsPainting(true)
    setPaintError(null)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), PAINT_TIMEOUT_MS)

    try {
      const blob = await sendPaintRequest(selectedFile, selectedColor.hex, controller.signal)
      setPreviewUrl((currentUrl) => {
        if (currentUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(currentUrl)
        }

        return URL.createObjectURL(blob)
      })
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'AbortError'
          ? 'La pintura tardó demasiado. Intenta con una imagen más liviana.'
          : error instanceof PaintRequestError
            ? error.userMessage
            : 'No se pudo conectar con TonnerPaint. Verifica tu conexión e inténtalo de nuevo.'
      console.error('TonnerPaint request failed:', error)
      setPaintError(message)
    } finally {
      window.clearTimeout(timeoutId)
      setIsPainting(false)
    }
  }

  return (
    <main className="paint-page">
      <div className="paint-app">
        <section className="paint-hero">
          <p>Que material vas a pintar hoy?</p>
          <div className="paint-materials">
            <button type="button" aria-label="Anterior" onClick={() => cycleMaterial(-1)}>
              ‹
            </button>
            {appContent.paint.materials.map((material) => (
              <button
                key={material.key}
                type="button"
                className={`paint-material ${material.key === activeMaterialKey ? 'is-active' : ''}`}
                aria-pressed={material.key === activeMaterialKey}
                onClick={() => handleMaterialChange(material.key)}
              >
                <span>
                  <img src={material.icon} alt="" />
                </span>
                <small>{material.label}</small>
              </button>
            ))}
            <button type="button" aria-label="Siguiente" onClick={() => cycleMaterial(1)}>
              ›
            </button>
          </div>
        </section>

        <section className="paint-main">
          <button
            type="button"
            id="preview"
            className={`paint-preview ${isPainting ? 'scanning' : ''}`}
            aria-label="Seleccionar imagen para TonnerPaint"
            onClick={() => imageInputRef.current?.click()}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={handleImageChange}
            />
            {previewUrl ? (
              <img src={previewUrl} className="active-preview" alt="Vista previa para pintar" decoding="async" />
            ) : (
              <span className="paint-camera" aria-hidden="true" />
            )}
            {isPainting ? <span className="scan-line" aria-hidden="true" /> : null}
          </button>

          <section className="paint-colors">
            <h2>COLORES {palette.length ? `(${palette.length})` : ''}</h2>
            {paintError ? <p className="paint-error">{paintError}</p> : null}
            <button
              id="applyBtn"
              className="paint-apply-panel"
              type="button"
              disabled={!selectedFile || isPainting}
              onClick={handleApplyColor}
            >
              {isPainting ? 'PROCESANDO...' : 'PROCESAR IMAGEN'}
            </button>
            <article className="paint-selected-color">
              <span className="paint-selected-color__swatch" style={{ background: selectedColor.hex }} />
              <span>
                <strong>{selectedColor.code}</strong>
                <small>{selectedColor.name}</small>
              </span>
            </article>
            <div className="color-grid" id="colorsGrid">
              {palette.map((color, index) => (
                <button
                  key={`${color.code}-${index}`}
                  type="button"
                  className={`color-card ${
                    color.code === selectedColor.code && color.hex === selectedColor.hex ? 'active' : ''
                  }`}
                  aria-label={`${color.code} ${color.name}`}
                  title={`${color.code} · ${color.name}`}
                  onClick={() => setSelectedColor(color)}
                >
                  <span className="swatch" style={{ background: color.hex }}>
                    <span />
                  </span>
                  <span className="color-card__meta">
                    <strong>{color.code}</strong>
                    <small>{color.name}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </section>
      </div>

      <div id="camera-flash" className={`flash-overlay ${flashActive ? 'flash-active' : ''}`} />
    </main>
  )
}
