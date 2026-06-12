import { useEffect, useMemo, useState } from 'react';
import { Heart, Mail, MapPin, Navigation, Phone } from 'lucide-react';

import { getProducts } from './services';
import type { Product } from './types';
import type { TonnerLineKey } from './tonnerLines';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import { distributors } from '../distributors/distributors.data';
import StoresMap from '../distributors/StoresMap';
import type { Distributor } from '../distributors/types';
import { getDistributorMapsHref, getDistributorPhoneHref } from '../distributors/contactLinks';
import { useAppContent } from '../../services/appContent';
import { getOptimizedImageSrc } from '../../services/imageAssets';

export type CatalogView = 'catalog' | 'stores' | 'favorites';
export type StoresMode = 'map' | 'list';

interface CatalogModuleProps {
  initialView?: CatalogView;
  initialStoresMode?: StoresMode;
  favoriteProductIds: Set<string>;
  favoriteStoreIds: Set<string>;
  onToggleFavorite: (product: Product) => void;
  onToggleStoreFavorite: (distributor: Distributor) => void;
}

const lineTabs: Array<{ label: string; value: TonnerLineKey }> = [
  { label: 'Arquitectónica', value: 'arquitectonica' },
  { label: 'Industrial', value: 'industrial' },
  { label: 'Automotriz', value: 'automotriz' },
  { label: 'Maderas', value: 'maderas' },
];

const INITIAL_PRODUCT_LIMIT = 8;
const PRODUCT_LIMIT_STEP = 8;

const normalizeStoreSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function CatalogModule({
  initialView = 'catalog',
  initialStoresMode = 'map',
  favoriteProductIds,
  favoriteStoreIds,
  onToggleFavorite,
  onToggleStoreFavorite,
}: CatalogModuleProps) {
  const [view, setView] = useState<CatalogView>(initialView);
  const [storesMode, setStoresMode] = useState<StoresMode>(initialStoresMode);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeLine, setActiveLine] = useState<TonnerLineKey>('arquitectonica');
  const [productLimit, setProductLimit] = useState(INITIAL_PRODUCT_LIMIT);
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedStoreCity, setSelectedStoreCity] = useState('');
  const appContent = useAppContent();

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const visibleProducts = useMemo(
    () => products.filter((product) => product.line === activeLine),
    [activeLine, products],
  );
  const activeBanner = appContent.catalog.lineBanners[activeLine];
  const isLineBanner = activeBanner.image.startsWith('/line-banners/');
  const optimizedBannerImage = getOptimizedImageSrc(activeBanner.image);

  const favoriteProducts = useMemo(
    () => products.filter((product) => favoriteProductIds.has(product.id)),
    [favoriteProductIds, products],
  );
  const favoriteStores = useMemo(
    () => distributors.filter((distributor) => favoriteStoreIds.has(String(distributor.id))),
    [favoriteStoreIds],
  );
  const storeCities = useMemo(() => {
    const cityMap = new Map<string, { label: string; count: number }>();

    distributors.forEach((distributor) => {
      const city = distributor.city.trim();
      if (!city) return;

      const key = normalizeStoreSearch(city);
      const currentCity = cityMap.get(key);

      cityMap.set(key, {
        label: currentCity?.label ?? city,
        count: (currentCity?.count ?? 0) + 1,
      });
    });

    return Array.from(cityMap.entries())
      .map(([key, city]) => ({ key, ...city }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, []);
  const citySuggestions = useMemo(() => {
    const search = normalizeStoreSearch(storeSearch);
    if (!search || selectedStoreCity) return [];

    return storeCities.filter((city) => city.key.includes(search)).slice(0, 5);
  }, [selectedStoreCity, storeCities, storeSearch]);
  const filteredDistributors = useMemo(() => {
    const search = normalizeStoreSearch(selectedStoreCity || storeSearch);
    if (!search) return distributors;

    return distributors.filter((distributor) => {
      const searchableText = normalizeStoreSearch(
        [distributor.city, distributor.address, distributor.name].filter(Boolean).join(' '),
      );

      return searchableText.includes(search);
    });
  }, [selectedStoreCity, storeSearch]);
  const currentProducts = view === 'favorites' ? favoriteProducts : visibleProducts;
  const displayedProducts = currentProducts.slice(0, productLimit);
  const hasMoreProducts = productLimit < currentProducts.length;

  const renderMainContent = () => {
    if (selectedProduct) {
      return (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      );
    }

    const renderStoreCard = (distributor: Distributor) => {
      const storeId = String(distributor.id);
      const isFavorite = favoriteStoreIds.has(storeId);
      const phoneHref = getDistributorPhoneHref(distributor.phone);

      return (
        <article key={distributor.id} className="catalog-store-card">
          <div className="catalog-store-card__media" aria-hidden="true">
            <MapPin />
            <span>{distributor.city.slice(0, 3)}</span>
          </div>
          <div className="catalog-store-card__content">
            <div className="catalog-store-card__text">
              <div className="catalog-store-card__heading">
                <h2>{distributor.name}</h2>
                <button
                  type="button"
                  className={`catalog-store-card__favorite ${isFavorite ? 'is-active' : ''}`}
                  aria-label={isFavorite ? 'Quitar punto de venta de favoritos' : 'Agregar punto de venta a favoritos'}
                  aria-pressed={isFavorite}
                  onClick={() => onToggleStoreFavorite(distributor)}
                >
                  <Heart />
                </button>
              </div>
              <p>
                <MapPin />
                <span>
                  {distributor.address} · {distributor.city}
                </span>
              </p>
              {distributor.email ? (
                <p>
                  <Mail />
                  <span>{distributor.email}</span>
                </p>
              ) : null}
              {phoneHref ? (
                <p>
                  <Phone />
                  <span>{distributor.phone}</span>
                </p>
              ) : null}
            </div>

            <div className="catalog-store-card__actions" aria-label={`Contactar a ${distributor.name}`}>
              {phoneHref ? (
                <a href={phoneHref}>
                  <Phone />
                  <span>Llamar</span>
                </a>
              ) : null}
              {distributor.email ? (
                <a href={`mailto:${distributor.email}`}>
                  <Mail />
                  <span>Correo</span>
                </a>
              ) : null}
              <a href={getDistributorMapsHref(distributor)} target="_blank" rel="noreferrer">
                <Navigation />
                <span>Ruta</span>
              </a>
            </div>
          </div>
        </article>
      );
    };

    if (view === 'stores') {
      const activeLocation = selectedStoreCity || storeSearch;

      return (
        <main className="catalog-stores">
          <section className="catalog-store-search" aria-label="Buscar puntos de venta por ubicación">
            <label htmlFor="catalog-store-location">Ubicación</label>
            <div className="catalog-store-search__field">
              <MapPin />
              <input
                id="catalog-store-location"
                type="search"
                value={storeSearch}
                placeholder="Escribe tu ciudad"
                autoComplete="off"
                onChange={(event) => {
                  setStoreSearch(event.target.value);
                  setSelectedStoreCity('');
                }}
              />
              {storeSearch ? (
                <button
                  type="button"
                  className="catalog-store-search__clear"
                  aria-label="Limpiar ubicación"
                  onClick={() => {
                    setStoreSearch('');
                    setSelectedStoreCity('');
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>
            {citySuggestions.length > 0 ? (
              <div className="catalog-store-search__suggestions" aria-label="Ciudades disponibles">
                {citySuggestions.map((city) => (
                  <button
                    key={city.key}
                    type="button"
                    onClick={() => {
                      setStoreSearch(city.label);
                      setSelectedStoreCity(city.label);
                    }}
                  >
                    <span>{city.label}</span>
                    <small>
                      {city.count} punto{city.count === 1 ? '' : 's'}
                    </small>
                  </button>
                ))}
              </div>
            ) : null}
            <p>
              {activeLocation.trim()
                ? filteredDistributors.length > 0
                  ? `${filteredDistributors.length} punto${filteredDistributors.length === 1 ? '' : 's'} de venta encontrado${filteredDistributors.length === 1 ? '' : 's'}.`
                  : 'No encontramos puntos de venta para esa ubicación.'
                : 'Busca por ciudad, barrio, dirección o nombre del punto de venta.'}
            </p>
          </section>

          <nav className="catalog-stores__tabs" aria-label="Vista de puntos de venta">
            <button
              type="button"
              className={storesMode === 'map' ? 'is-active' : ''}
              onClick={() => setStoresMode('map')}
            >
              MAPA
            </button>
            <button
              type="button"
              className={storesMode === 'list' ? 'is-active' : ''}
              onClick={() => setStoresMode('list')}
            >
              LISTA
            </button>
          </nav>

          {storesMode === 'map' ? (
            <section className="catalog-map-view" aria-label="Mapa de puntos de venta">
              <StoresMap distributors={filteredDistributors} />
              {filteredDistributors.length === 0 ? (
                <div className="catalog-map-empty">
                  <strong>Sin resultados</strong>
                  <span>Prueba con otra ciudad o revisa la escritura.</span>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="catalog-store-list" aria-label="Lista de puntos de venta">
              {filteredDistributors.length > 0 ? (
                filteredDistributors.map(renderStoreCard)
              ) : (
                <section className="catalog-store-empty">
                  <h2>Sin resultados</h2>
                  <p>Prueba con otra ciudad, barrio o dirección.</p>
                </section>
              )}
            </section>
          )}
        </main>
      );
    }

    if (view === 'favorites') {
      const hasFavorites = favoriteProducts.length > 0 || favoriteStores.length > 0;

      return (
        <main className="catalog-home catalog-home--favorites">
          <h1 className="catalog-section-title">Favoritos</h1>

          {!hasFavorites ? (
            <section className="catalog-empty-favorites">
              <h2>Sin favoritos</h2>
              <p>Marca productos o puntos de venta con el corazón para consultarlos más rápido desde esta sección.</p>
            </section>
          ) : (
            <>
              <section className="catalog-favorites-section" aria-label="Productos favoritos">
                <h2>Productos</h2>
                {favoriteProducts.length > 0 ? (
                  <section className="catalog-grid">
                    {favoriteProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favoriteProductIds.has(product.id)}
                        onToggleFavorite={onToggleFavorite}
                        onViewDetails={(nextProduct) => {
                          setSelectedProduct(nextProduct);
                          setView('catalog');
                        }}
                      />
                    ))}
                  </section>
                ) : (
                  <p className="catalog-favorites-section__empty">No tienes productos favoritos.</p>
                )}
              </section>

              <section className="catalog-favorites-section" aria-label="Puntos de venta favoritos">
                <h2>Puntos de venta</h2>
                {favoriteStores.length > 0 ? (
                  <section className="catalog-store-list">{favoriteStores.map(renderStoreCard)}</section>
                ) : (
                  <p className="catalog-favorites-section__empty">No tienes puntos de venta favoritos.</p>
                )}
              </section>
            </>
          )}
        </main>
      );
    }

    return (
      <main className="catalog-home">
        {view === 'catalog' ? (
          <>
            <section
              className={`catalog-hero catalog-hero--${activeLine} ${
                isLineBanner ? 'catalog-hero--line-banner' : ''
              }`}
              aria-label={activeBanner.title}
            >
              {isLineBanner ? (
                <img src={optimizedBannerImage} alt="" className="catalog-hero__banner" decoding="async" />
              ) : null}
              <div className="catalog-hero__copy">
                <span>{activeBanner.eyebrow}</span>
                <h1>{activeBanner.title}</h1>
                <p>{activeBanner.description}</p>
              </div>
              {!isLineBanner ? (
                <img src={optimizedBannerImage} alt="" className="catalog-hero__product" decoding="async" />
              ) : null}
              <div className="catalog-hero__dots">
                {lineTabs.map((tab) => (
                  <span key={tab.value} className={activeLine === tab.value ? 'is-active' : ''} />
                ))}
              </div>
            </section>

            <nav className="catalog-tabs" aria-label="Lineas">
              {lineTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={activeLine === tab.value ? 'is-active' : ''}
                  onClick={() => {
                    setActiveLine(tab.value);
                    setProductLimit(INITIAL_PRODUCT_LIMIT);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </>
        ) : null}

        <section className="catalog-grid">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favoriteProductIds.has(product.id)}
              onToggleFavorite={onToggleFavorite}
              onViewDetails={(nextProduct) => {
                setSelectedProduct(nextProduct);
                setView('catalog');
              }}
            />
          ))}
        </section>
        {hasMoreProducts ? (
          <button
            type="button"
            className="catalog-load-more"
            onClick={() => setProductLimit((currentLimit) => currentLimit + PRODUCT_LIMIT_STEP)}
          >
            Ver más productos
          </button>
        ) : null}
      </main>
    );
  };

  return (
    <div className="catalog-app">
      {renderMainContent()}
    </div>
  );
}
