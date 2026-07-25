import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'

import { DEFAULT_PAINT_COLOR, getPaintPaletteForMaterial } from './colors'
import { useAppContent } from '../../services/appContent'

const PAINT_API_URL = (import.meta.env.VITE_TONNER_PAINT_API_URL?.trim() ?? '').replace(/\/+$/, '')
const PAINT_TIMEOUT_MS = 120_000
const materialOrder = ['pared', 'vehiculo', 'metal', 'plastico', 'madera']

export default function PaintModule() {
  const appContent = useAppContent()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeMaterialKey, setActiveMaterialKey] = useState('pared')
  const palette = useMemo(() => getPaintPaletteForMaterial(activeMaterialKey), [activeMaterialKey])
  const [selectedColor, setSelectedColor] = useState(DEFAULT_PAINT_COLOR)
  const [isPainting, setIsPainting] = useState(false)
  const [flashActive, setFlashActive] = useState(false)
  const [paintError, setPaintError] = useState<string | null>(null)

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
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('color', selectedColor.hex)
      formData.append('opacity', '0.6')

      const response = await fetch(`${PAINT_API_URL}/paint`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Server ${response.status}`)
      }

      const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
      if (contentType !== 'image/jpeg') {
        throw new Error(`Respuesta inesperada: ${contentType || 'sin content-type'}`)
      }

      const blob = await response.blob()
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
          : 'No se pudo procesar la imagen.'
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
