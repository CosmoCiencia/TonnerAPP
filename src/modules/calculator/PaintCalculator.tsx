import { useState, type FormEvent } from 'react'
import { ChevronDown, PaintRoller } from 'lucide-react'
import { PRODUCTS } from '../catalog/products'

const normalizePresentation = (presentation: string) =>
  presentation === 'Balde 2.5 galones' ? 'Balde de 2.5 galones' : presentation

const presentationOrder = [
  'Tambor',
  'Cuñete de 5 galones',
  'Balde de 2.5 galones',
  'Cuñete',
  'Galón',
  'Garrafa de 1000 CC',
  'Garrafa por 1000 CC',
  'PET',
]

const excludedPresentations = new Set([
  'Cuarto de galón',
  'Octavo de galón',
  'Dieciseisavo de galón',
  'Unidad por 200 CC',
  'Unidad por 50 CC',
])

const catalogPresentations = Array.from(
  new Set(
    PRODUCTS.flatMap((product) => product.presentations ?? []).map(normalizePresentation),
  ),
).filter((presentation) => !excludedPresentations.has(presentation))
  .sort((first, second) => {
  const firstIndex = presentationOrder.indexOf(first)
  const secondIndex = presentationOrder.indexOf(second)

  if (firstIndex === -1 && secondIndex === -1) return first.localeCompare(second, 'es')
  if (firstIndex === -1) return 1
  if (secondIndex === -1) return -1
  return firstIndex - secondIndex
})

const defaultPresentation = catalogPresentations.includes('Galón')
  ? 'Galón'
  : catalogPresentations[0] ?? 'Galón'

type CoverageResult = {
  amount: number
  coverageRate: number
  totalCoverage: number
  presentation: string
}

const formatNumber = (value: number) =>
  value.toLocaleString('es-CO', {
    maximumFractionDigits: 2,
  })

export default function PaintCalculator() {
  const [amount, setAmount] = useState('')
  const [coverageRate, setCoverageRate] = useState('')
  const [presentation, setPresentation] = useState(defaultPresentation)
  const [result, setResult] = useState<CoverageResult | null>(null)
  const [error, setError] = useState('')

  const amountLabel = 'CANTIDAD DE ENVASES'
  const rateLabel = `TASA DE CUBRIMIENTO (m² / ${presentation})`

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const amountValue = Number(amount.replace(',', '.'))
    const coverageValue = Number(coverageRate.replace(',', '.'))

    if (!Number.isFinite(amountValue) || amountValue <= 0 || !Number.isFinite(coverageValue) || coverageValue <= 0) {
      setResult(null)
      setError('Ingresa una cantidad y una tasa de cubrimiento mayores que cero.')
      return
    }

    setError('')
    setResult({
      amount: amountValue,
      coverageRate: coverageValue,
      totalCoverage: amountValue * coverageValue,
      presentation,
    })
  }

  return (
    <main className="calculator-page">
      <header className="calculator-hero">
        <h1>Calculadora de Cobertura</h1>
        <p>CUBRIMIENTO POR M²</p>
      </header>

      <section className="calculator-panel" aria-label="Calculadora de cobertura de pintura">
        <form className="calculator-form" onSubmit={handleSubmit}>
          <label className="calculator-field">
            <span>{amountLabel}</span>
            <div className="calculator-field__control calculator-field__control--unit">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ej. 2,5"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value)
                  setResult(null)
                  setError('')
                }}
                aria-label={amountLabel}
              />
              <span className="calculator-unit-select">
                <select
                  value={presentation}
                  onChange={(event) => {
                    setPresentation(event.target.value)
                    setResult(null)
                    setError('')
                  }}
                  aria-label="Tamaño o presentación del envase"
                >
                  {catalogPresentations.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" />
              </span>
            </div>
          </label>

          <label className="calculator-field">
            <span>{rateLabel}</span>
            <div className="calculator-field__control">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ej. 35"
                value={coverageRate}
                onChange={(event) => {
                  setCoverageRate(event.target.value)
                  setResult(null)
                  setError('')
                }}
                aria-label={rateLabel}
              />
              <PaintRoller className="calculator-field__icon" aria-hidden="true" />
            </div>
          </label>

          {error ? <p className="calculator-error" role="alert">{error}</p> : null}

          <button className="calculator-submit" type="submit">
            CALCULAR COBERTURA
          </button>
        </form>
      </section>

      {result ? (
        <section className="calculator-result" aria-live="polite">
          <div className="calculator-result__summary">
            <div className="calculator-result__icon" aria-hidden="true">
              <PaintRoller />
            </div>
            <div>
              <strong>{formatNumber(result.totalCoverage)} m²</strong>
              <span>Total de metros cuadrados cubiertos</span>
            </div>
          </div>
          <dl className="calculator-result__details">
            <div>
              <dt>Cantidad:</dt>
              <dd>{formatNumber(result.amount)}</dd>
            </div>
            <div>
              <dt>Presentación:</dt>
              <dd>{result.presentation}</dd>
            </div>
            <div>
              <dt>Tasa:</dt>
              <dd>{formatNumber(result.coverageRate)} m²/{result.presentation}</dd>
            </div>
            <div>
              <dt>Cubrimiento total:</dt>
              <dd>{formatNumber(result.totalCoverage)} m²</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </main>
  )
}
