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
  onHome: () => void;
}

const lineTabs: Array<{ label: string; value: TonnerLineKey }> = [
  { label: 'Arquitectónica', value: 'arquitectonica' },
  { label: 'Industrial', value: 'industrial' },
  { label: 'Automotriz', value: 'automotriz' },
  { label: 'Maderas', value: 'maderas' },
];

const INITIAL_PRODUCT_LIMIT = 8;
const PRODUCT_LIMIT_STEP = 8;

const getPhoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

const getMapsHref = (distributor: (typeof distributors)[number]) => {
  const lat = Number(distributor.lat ?? distributor.coordinates?.[0]);
  const lng = Number(distributor.lng ?? distributor.coordinates?.[1]);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${distributor.name} ${distributor.address} ${distributor.city}`,
  )}`;
};

export default function CatalogModule({
  initialView = 'catalog',
  initialStoresMode = 'map',
  favoriteProductIds,
  favoriteStoreIds,
  onToggleFavorite,
  onToggleStoreFavorite,
  onHome,
}: CatalogModuleProps) {
  const [view, setView] = useState<CatalogView>(initialView);
  const [storesMode, setStoresMode] = useState<StoresMode>(initialStoresMode);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeLine, setActiveLine] = useState<TonnerLineKey>('arquitectonica');
  const [productLimit, setProductLimit] = useState(INITIAL_PRODUCT_LIMIT);
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
  const currentProducts = view === 'favorites' ? favoriteProducts : visibleProducts;
  const displayedProducts = currentProducts.slice(0, productLimit);
  const hasMoreProducts = productLimit < currentProducts.length;

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
      return;
    }

    onHome();
  };

  const renderMainContent = () => {
    if (selectedProduct) {
      return (
        <ProductModal
          product={selectedProduct}
          userType="contratista"
          primaryActionLabel="Agregar"
          onAddToOrder={() => undefined}
          onClose={() => setSelectedProduct(null)}
        />
      );
    }

    const renderStoreCard = (distributor: Distributor) => {
      const storeId = String(distributor.id);
      const isFavorite = favoriteStoreIds.has(storeId);

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
              <p>
                <Phone />
                <span>{distributor.phone}</span>
              </p>
            </div>

            <div className="catalog-store-card__actions" aria-label={`Contactar a ${distributor.name}`}>
              <a href={getPhoneHref(distributor.phone)}>
                <Phone />
                <span>Llamar</span>
              </a>
              {distributor.email ? (
                <a href={`mailto:${distributor.email}`}>
                  <Mail />
                  <span>Correo</span>
                </a>
              ) : null}
              <a href={getMapsHref(distributor)} target="_blank" rel="noreferrer">
                <Navigation />
                <span>Ruta</span>
              </a>
            </div>
          </div>
        </article>
      );
    };

    if (view === 'stores') {
      return (
        <main className="catalog-stores">
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
              <StoresMap distributors={distributors} />
            </section>
          ) : (
            <section className="catalog-store-list" aria-label="Lista de puntos de venta">
              {distributors.map(renderStoreCard)}
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
      <header className="catalog-top">
        <button type="button" className="catalog-top__back" aria-label="Regresar" onClick={handleBack}>
          <img src="/icons/boton regreso.png" alt="" />
        </button>
        <img src={getOptimizedImageSrc('/logo.png')} alt="Pinturas Tonner" decoding="async" />
        <button type="button" className="catalog-top__bell" aria-label="Notificaciones">
          <img src="/campana icon.png" alt="" />
        </button>
      </header>

      {renderMainContent()}
    </div>
  );
}
