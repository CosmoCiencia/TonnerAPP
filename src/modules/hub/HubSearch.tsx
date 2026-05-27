import { getOptimizedImageSrc } from '../../services/imageAssets'
import type { Product } from '../catalog/types'

export default function HubSearch({
  profileAvatar,
  profileFirstName,
  productSearch,
  searchResults,
  onOpenProductResult,
  onOpenProfileOptions,
  onSearchChange,
}: {
  profileAvatar: string
  profileFirstName: string
  productSearch: string
  searchResults: Product[]
  onOpenProductResult: () => void
  onOpenProfileOptions: () => void
  onSearchChange: (value: string) => void
}) {
  return (
    <>
      <div className="hub-search-row">
        <label className="hub-search">
          <img src="/icons/LUPA.png" alt="" className="hub-search__icon" />
          <input
            type="search"
            placeholder="¿Qué producto estás buscando ?"
            value={productSearch}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="hub-search-profile"
          aria-label="Abrir opciones de perfil"
          onClick={onOpenProfileOptions}
        >
          <span className="hub-search-avatar" aria-hidden="true">
            <img src={profileAvatar || '/icons/PERFIL.png'} alt="" />
          </span>
          <span className="hub-search-profile__name">{profileFirstName}</span>
        </button>
      </div>

      {productSearch.trim().length >= 2 ? (
        <section className="hub-search-results" aria-label="Resultados de productos">
          {searchResults.length > 0 ? (
            searchResults.map((product) => (
              <button
                key={product.id}
                type="button"
                className="hub-search-result"
                onClick={onOpenProductResult}
              >
                <img
                  src={getOptimizedImageSrc(product.image_url ?? product.image ?? '/hub/portafolio.webp')}
                  alt=""
                  decoding="async"
                />
                <span>
                  <strong>{product.name}</strong>
                  <small>{[product.line, product.category].filter(Boolean).join(' · ')}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="hub-search-empty">
              <strong>Sin resultados</strong>
              <span>Prueba con el nombre del producto, línea o uso.</span>
            </div>
          )}
        </section>
      ) : null}
    </>
  )
}
