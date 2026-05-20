import {
  BadgeCheck,
  Brush,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Download,
  Droplets,
  Eye,
  Gauge,
  Gem,
  Home,
  Layers,
  Link,
  Package,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  Waves,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useRef } from 'react';
import type { UserType } from '../../onboarding/userTypes';
import type { Product, ProductTone } from '../types';
import { getOptimizedImageSrc } from '../../../services/imageAssets';

interface Props {
  product: Product | null;
  userType: UserType;
  primaryActionLabel: string;
  onAddToOrder: (product: Product) => void;
  onClose: () => void;
}

const fallbackCharacteristics = ['Acabado mate', 'Alto Cubrimiento', 'Alto Rendimiento', 'Bajo Salpique', 'Bajo VOC'];

const normalizeFeatureText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function getFeatureIcon(characteristic: string): LucideIcon {
  const text = normalizeFeatureText(characteristic);

  if (text.includes('secado') || text.includes('secamiento')) return Timer;
  if (text.includes('rapido') || text.includes('flash')) return Zap;
  if (text.includes('rendimiento')) return Gauge;
  if (text.includes('cubrimiento') || text.includes('solido')) return Layers;
  if (text.includes('adherencia')) return Link;
  if (text.includes('dureza') || text.includes('rayado')) return Gem;
  if (text.includes('durabilidad') || text.includes('resistencia') || text.includes('corrosion')) return ShieldCheck;
  if (text.includes('intemperie') || text.includes('exterior')) return CloudSun;
  if (text.includes('interior')) return Home;
  if (text.includes('mate')) return Sun;
  if (text.includes('brillante') || text.includes('brillo')) return Sparkles;
  if (text.includes('acabado')) return Brush;
  if (text.includes('lavab') || text.includes('agua') || text.includes('humedad') || text.includes('diluible')) return Droplets;
  if (text.includes('voc')) return Wind;
  if (text.includes('salpique')) return Waves;
  if (text.includes('color') || text.includes('transparencia')) return Eye;
  if (text.includes('aplicacion')) return Wrench;
  if (text.includes('presentacion') || text.includes('componente')) return Package;

  return BadgeCheck;
}

function readableTextColor(hex?: string) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return '#2d59c7';

  const value = hex.slice(1);
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 150 ? '#1f3b76' : '#ffffff';
}

function normalizeColors(product: Product): ProductTone[] {
  const colors = product.colors?.length ? product.colors : (product.tones ?? []);

  return colors.filter((color) => color.name || color.code || color.hex);
}

export default function ProductModal({ product, onClose }: Props) {
  const featuresListRef = useRef<HTMLDivElement | null>(null);

  if (!product) return null;

  const productImage = product.image || product.image_url;
  const optimizedProductImage = productImage ? getOptimizedImageSrc(productImage) : '';
  const description = product.description || product.short_description || '';
  const colors = normalizeColors(product);
  const presentations = product.presentations ?? [];
  const characteristics = product.characteristics?.length
    ? product.characteristics
    : product.attributes?.map((attribute) => attribute.label) ?? [];
  const visibleCharacteristics = characteristics.length ? characteristics : fallbackCharacteristics;
  const scrollFeatures = (direction: 'previous' | 'next') => {
    const list = featuresListRef.current;
    if (!list) return;

    list.scrollBy({
      left: direction === 'next' ? 128 : -128,
      behavior: 'smooth',
    });
  };

  return (
    <main className="catalog-detail">
      <section className="catalog-detail__hero">
        <button type="button" onClick={onClose} aria-label="Volver">
          <ChevronLeft />
        </button>
        {optimizedProductImage ? <img src={optimizedProductImage} alt={product.name} decoding="async" /> : null}
      </section>

      <section className="catalog-detail__body">
        <h1>{product.name}</h1>
        <p>{description}</p>

        <h2>Usos Recomendados</h2>
        <p>{product.uses?.join(' ') || description}</p>

        {presentations.length ? (
          <>
            <h2>PRESENTACIONES</h2>
            <div className="catalog-detail__presentations">
              {presentations.map((presentation) => (
                <span key={presentation}>{presentation}</span>
              ))}
            </div>
          </>
        ) : null}

        <h2>CARACTERÍSTICAS</h2>
        <div className="catalog-detail__features">
          <button
            type="button"
            className="catalog-detail__chevron"
            aria-label="Ver características anteriores"
            onClick={() => scrollFeatures('previous')}
          >
            <ChevronLeft />
          </button>
          <div ref={featuresListRef} className="catalog-detail__features-list">
            {visibleCharacteristics.map((characteristic) => {
              const Icon = getFeatureIcon(characteristic);

              return (
                <div key={characteristic} className="catalog-detail__feature">
                  <span>
                    <Icon />
                  </span>
                  <small>{characteristic}</small>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="catalog-detail__chevron"
            aria-label="Ver más características"
            onClick={() => scrollFeatures('next')}
          >
            <ChevronRight />
          </button>
        </div>

        <h2>COLORES</h2>
        {colors.length ? (
          <div className="catalog-detail__colors">
            {colors.map((tone, index) => {
              const color = tone.hex || '#f8fafc';
              const textColor = readableTextColor(tone.hex);

              return (
                <button
                  key={`${tone.code || tone.name}-${index}`}
                  type="button"
                  title={`${tone.code ? `${tone.code} · ` : ''}${tone.name}`}
                  style={{ backgroundColor: color, color: textColor }}
                >
                  <span>{tone.code || tone.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="catalog-detail__empty">Este producto no tiene colores registrados.</p>
        )}

        {product.datasheet_url ? (
          <a
            className="catalog-detail__datasheet"
            href={product.datasheet_url}
            target="_blank"
            rel="noreferrer"
          >
            <Download />
            <span>Descargar ficha técnica</span>
          </a>
        ) : (
          <button className="catalog-detail__datasheet is-disabled" type="button" disabled>
            <Download />
            <span>Ficha técnica pendiente</span>
          </button>
        )}
      </section>
    </main>
  );
}
