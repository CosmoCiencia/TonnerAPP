import { getOptimizedImageSrc } from '../../services/imageAssets'

export default function PaintModule() {
  return (
    <main className="paint-page">
      <section className="paint-coming-soon" aria-labelledby="paint-maintenance-title">
        <article className="paint-coming-soon__card">
          <img
            src={getOptimizedImageSrc('/hub/tonner-paint.webp')}
            alt="TonnerPaint"
            decoding="async"
          />
          <span>TonnerPaint</span>
          <h1 id="paint-maintenance-title">Estamos mejorando tu experiencia</h1>
          <p>
            Estamos ajustando esta herramienta para que puedas probar colores de forma mas estable y precisa.
            Volveremos pronto.
          </p>
        </article>
      </section>
    </main>
  )
}
