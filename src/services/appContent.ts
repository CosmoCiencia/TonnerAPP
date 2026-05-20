import { useEffect, useState } from 'react'

import type { TonnerLineKey } from '../modules/catalog/tonnerLines'

export type CatalogLineBanner = {
  eyebrow: string
  title: string
  description: string
  image: string
}

export type PaintMaterialAsset = {
  key: string
  label: string
  icon: string
}

export type TonnerAppContent = {
  catalog: {
    lineBanners: Record<TonnerLineKey, CatalogLineBanner>
  }
  cup: {
    launch: {
      backgroundImage: string
      trophyImage: string
      topLine: string
      title: string
      bottomLine: string
      brand: string
    }
  }
  paint: {
    materials: PaintMaterialAsset[]
  }
}

export const DEFAULT_APP_CONTENT: TonnerAppContent = {
  catalog: {
    lineBanners: {
      arquitectonica: {
        eyebrow: 'LINEA',
        title: 'ARQUITECTONICA',
        description: 'Vinilos, esmaltes y recubrimientos para obra, hogar y exteriores.',
        image: '/line-banners/arquitectonico.png',
      },
      industrial: {
        eyebrow: 'LINEA',
        title: 'INDUSTRIAL',
        description: 'Proteccion y alto desempeno para estructuras, pisos y metalmecanica.',
        image: '/line-banners/industrial.png',
      },
      automotriz: {
        eyebrow: 'LINEA',
        title: 'AUTOMOTRIZ',
        description: 'Acabados, fondos y complementos para repinte automotriz profesional.',
        image: '/line-banners/automotriz.png',
      },
      maderas: {
        eyebrow: 'LINEA',
        title: 'MADERAS',
        description: 'Lacas, selladores, tintes y pegantes para acabado de madera.',
        image: '/line-banners/maderas.png',
      },
    },
  },
  cup: {
    launch: {
      backgroundImage: '/tonnercup-fondo.png',
      trophyImage: '/tonnercup-copa.png',
      topLine: 'Vive la fiebre del',
      title: 'Mundial',
      bottomLine: 'Pollamundialista',
      brand: 'Tonner',
    },
  },
  paint: {
    materials: [
      { key: 'pared', label: 'PARED', icon: '/paint-materials/pared.png' },
      { key: 'vehiculo', label: 'VEHICULO', icon: '/paint-materials/vehiculo.png' },
      { key: 'metal', label: 'METAL', icon: '/paint-materials/metal.png' },
      { key: 'plastico', label: 'PLASTICO', icon: '/paint-materials/plastico.png' },
      { key: 'madera', label: 'MADERA', icon: '/paint-materials/madera.png' },
    ],
  },
}

const contentUrl = import.meta.env.VITE_TONNER_CONTENT_URL?.trim() || '/content/app-content.json'
let contentRequest: Promise<TonnerAppContent> | null = null

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeContent(value: unknown): TonnerAppContent {
  if (!isObject(value)) return DEFAULT_APP_CONTENT

  const catalog = isObject(value.catalog) ? value.catalog : {}
  const cup = isObject(value.cup) ? value.cup : {}
  const launch = isObject(cup.launch) ? cup.launch : {}
  const paint = isObject(value.paint) ? value.paint : {}
  const remoteLineBanners = isObject(catalog.lineBanners) ? catalog.lineBanners : {}
  const remoteMaterials = Array.isArray(paint.materials) ? paint.materials : DEFAULT_APP_CONTENT.paint.materials

  return {
    catalog: {
      lineBanners: {
        arquitectonica: {
          ...DEFAULT_APP_CONTENT.catalog.lineBanners.arquitectonica,
          ...(isObject(remoteLineBanners.arquitectonica) ? remoteLineBanners.arquitectonica : {}),
        },
        industrial: {
          ...DEFAULT_APP_CONTENT.catalog.lineBanners.industrial,
          ...(isObject(remoteLineBanners.industrial) ? remoteLineBanners.industrial : {}),
        },
        automotriz: {
          ...DEFAULT_APP_CONTENT.catalog.lineBanners.automotriz,
          ...(isObject(remoteLineBanners.automotriz) ? remoteLineBanners.automotriz : {}),
        },
        maderas: {
          ...DEFAULT_APP_CONTENT.catalog.lineBanners.maderas,
          ...(isObject(remoteLineBanners.maderas) ? remoteLineBanners.maderas : {}),
        },
      },
    },
    cup: {
      launch: {
        ...DEFAULT_APP_CONTENT.cup.launch,
        ...launch,
      },
    },
    paint: {
      materials: remoteMaterials
        .filter(isObject)
        .map((material, index) => ({
          key: String(material.key ?? DEFAULT_APP_CONTENT.paint.materials[index]?.key ?? `material-${index}`),
          label: String(material.label ?? DEFAULT_APP_CONTENT.paint.materials[index]?.label ?? 'MATERIAL'),
          icon: String(material.icon ?? DEFAULT_APP_CONTENT.paint.materials[index]?.icon ?? ''),
        }))
        .filter((material) => material.icon),
    },
  }
}

export async function loadAppContent(): Promise<TonnerAppContent> {
  if (contentRequest) {
    return contentRequest
  }

  contentRequest = fetchAppContent()
  return contentRequest
}

async function fetchAppContent(): Promise<TonnerAppContent> {
  try {
    const response = await fetch(contentUrl, { cache: 'no-store' })

    if (!response.ok) {
      return DEFAULT_APP_CONTENT
    }

    return mergeContent(await response.json())
  } catch {
    return DEFAULT_APP_CONTENT
  }
}

export function useAppContent() {
  const [content, setContent] = useState<TonnerAppContent>(DEFAULT_APP_CONTENT)

  useEffect(() => {
    let isMounted = true

    loadAppContent().then((nextContent) => {
      if (isMounted) {
        setContent(nextContent)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return content
}
