import { getOptimizedImageSrc } from '../../services/imageAssets'
import type { HubCard } from './types'
import HubSocialLinks from './HubSocialLinks'

export default function HubCards({
  cards,
  onOpenCatalog,
  onOpenCup,
  onOpenPaint,
  onOpenStores,
  showSocialLinks = false,
}: {
  cards: HubCard[]
  onOpenCatalog?: () => void
  onOpenCup?: () => void
  onOpenPaint?: () => void
  onOpenStores?: () => void
  showSocialLinks?: boolean
}) {
  return (
    <div className="hub-cards" aria-label="Secciones principales">
      {cards.map((card) => {
        const openInternalModule =
          card.key === 'portfolio'
            ? onOpenCatalog
            : card.key === 'stores'
              ? onOpenStores
              : card.key === 'paint'
                ? onOpenPaint
                : card.key === 'cup'
                  ? onOpenCup
                  : null

        return (
          <button
            key={card.key}
            type="button"
            className={`hub-card hub-card--${card.variant}`}
            onClick={openInternalModule ?? undefined}
            disabled={!openInternalModule}
          >
            <img src={getOptimizedImageSrc(card.image)} alt="" className="hub-card__image" decoding="async" />
            <span className="hub-card__title">{card.title}</span>
          </button>
        )
      })}
      {showSocialLinks ? <HubSocialLinks /> : null}
    </div>
  )
}
