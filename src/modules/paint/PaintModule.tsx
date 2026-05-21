import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { TONNER_COLORS } from './colors'
import { useAppContent } from '../../services/appContent'
import { getOptimizedImageSrc } from '../../services/imageAssets'

const DEFAULT_PAINT_API_URL = 'http://127.0.0.1:8000'
const PAINT_API_URL = (
  import.meta.env.VITE_TONNER_PAINT_API_URL?.trim() || DEFAULT_PAINT_API_URL
).replace(/\/+$/, '')
const PAINT_TIMEOUT_MS = 120_000

export default function PaintModule() {
  const navigate = useNavigate()
  const appContent = useAppContent()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState(TONNER_COLORS[2])
  const [isPainting, setIsPainting] = useState(false)
  const [flashActive, setFlashActive] = useState(false)
  const [paintError, setPaintError] = useState<string | null>(null)

  const palette = useMemo(
    () => Array.from({ length: 32 }, (_, index) => TONNER_COLORS[index % TONNER_COLORS.length]),
    [],
  )

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
      console.error(error)
    } finally {
      window.clearTimeout(timeoutId)
      setIsPainting(false)
    }
  }

  return (
    <main className="paint-page">
      <div className="paint-app">
        <header className="paint-top">
          <img src={getOptimizedImageSrc('/logo.png')} alt="Pinturas Tonner" decoding="async" />
          <button type="button" aria-label="Volver al inicio" onClick={() => navigate('/')}>
            <img src="/icons/boton regreso.png" alt="" />
          </button>
        </header>

        <section className="paint-hero">
          <h1>TonnerPaints</h1>
          <p>Que material vas a pintar hoy?</p>
          <div className="paint-materials">
            <button type="button" aria-label="Anterior">
              ‹
            </button>
            {appContent.paint.materials.map((material, index) => (
              <div key={material.key} className={`paint-material ${index === 0 ? 'is-active' : ''}`}>
                <span>
                  <img src={material.icon} alt="" />
                </span>
                <small>{material.label}</small>
              </div>
            ))}
            <button type="button" aria-label="Siguiente">
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
              <img src={previewUrl} className="active-preview" alt="Vista previa para pintar" />
            ) : (
              <span className="paint-camera" aria-hidden="true" />
            )}
            {isPainting ? <span className="scan-line" aria-hidden="true" /> : null}
          </button>

          <section className="paint-colors">
            <h2>COLORES</h2>
            {paintError ? <p className="paint-error">{paintError}</p> : null}
            <div className="color-grid" id="colorsGrid">
              {palette.map((color, index) => (
                <button
                  key={`${color.code}-${index}`}
                  type="button"
                  className={`color-card ${color.hex === selectedColor.hex ? 'active' : ''}`}
                  aria-label={color.name}
                  onClick={() => setSelectedColor(color)}
                >
                  <span className="swatch" style={{ background: color.hex }}>
                    <strong>VI-101</strong>
                  </span>
                </button>
              ))}
            </div>
            <button
              id="applyBtn"
              className="paint-apply-panel"
              type="button"
              disabled={!selectedFile || isPainting}
              onClick={handleApplyColor}
            >
              {isPainting ? 'PROCESANDO...' : 'APLICAR COLOR'}
            </button>
          </section>
        </section>

        <nav className="paint-bottom-nav" aria-label="Navegacion principal">
          <button type="button" aria-label="Inicio" onClick={() => navigate('/')}>
            <img src="/icons/INICIO.png" alt="" />
          </button>
          <button type="button" aria-label="Trabajo" onClick={() => navigate('/work')}>
            <img src="/icons/TRABAJO.png" alt="" />
          </button>
          <button type="button" aria-label="Favoritos" onClick={() => navigate('/favorites')}>
            <img src="/icons/FAVORITOS.png" alt="" />
          </button>
          <button type="button" className="is-active" aria-label="Pintar">
            <img src="/icons/CALCULADORA.png" alt="" />
          </button>
          <button type="button" aria-label="Perfil" onClick={() => navigate('/profile')}>
            <img src="/icons/PERFIL.png" alt="" />
          </button>
        </nav>
      </div>

      <div id="camera-flash" className={`flash-overlay ${flashActive ? 'flash-active' : ''}`} />
    </main>
  )
}
