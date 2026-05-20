import { Heart } from 'lucide-react';
import type { Product } from '../types';
import { getOptimizedImageSrc } from '../../../services/imageAssets';

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export default function ProductCard({
  product,
  isFavorite = false,
  onToggleFavorite,
  onViewDetails,
}: ProductCardProps) {
  const productImage = product.image || product.image_url;
  const optimizedProductImage = productImage ? getOptimizedImageSrc(productImage) : '';
  const productColors = product.colors?.length ? product.colors : (product.tones ?? []);
  const previewColors = productColors.filter((color) => color.hex).slice(0, 3);
  const subtitle = product.segment || product.subline || product.category || product.presentations?.[0] || '';

  return (
    <article className="catalog-product-card" onClick={() => onViewDetails?.(product)}>
      <div className="catalog-product-card__image">
        {optimizedProductImage ? (
          <img src={optimizedProductImage} alt={product.name} loading="lazy" decoding="async" />
        ) : null}
      </div>

      <div className="catalog-product-card__body">
        <div>
          <h2>{product.name}</h2>
          <span>{subtitle}</span>
        </div>

        <button
          type="button"
          className={isFavorite ? 'is-active' : ''}
          aria-label="Favorito"
          aria-pressed={isFavorite}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite?.(product);
          }}
        >
          <Heart />
        </button>
      </div>

      <div className="catalog-product-card__pills" aria-label="Colores disponibles">
        {previewColors.length ? (
          previewColors.map((color) => (
            <span
              key={`${product.id}-${color.code || color.name}`}
              title={`${color.code ? `${color.code} · ` : ''}${color.name}`}
              style={{ backgroundColor: color.hex }}
            />
          ))
        ) : (
          <span className="catalog-product-card__pills-empty">Sin colores</span>
        )}
      </div>

      <button type="button" className="catalog-product-card__cta">
        VER PRODUCTO
      </button>
    </article>
  );
}
