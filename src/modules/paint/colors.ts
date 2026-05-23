import { PRODUCTS } from '../catalog/products'
import type { ProductTone } from '../catalog/types'

export type PaintMaterialKey = 'pared' | 'vehiculo' | 'metal' | 'plastico' | 'madera'

export type PaintColor = Required<Pick<ProductTone, 'name' | 'hex'>> & {
  code: string
}

const materialLines: Record<PaintMaterialKey, string[]> = {
  pared: ['arquitectonica'],
  vehiculo: ['automotriz'],
  metal: ['industrial'],
  plastico: ['automotriz', 'industrial'],
  madera: ['maderas'],
}

function normalizeColor(tone: ProductTone): PaintColor | null {
  if (!tone.hex || !/^#[0-9a-f]{6}$/i.test(tone.hex)) return null

  return {
    name: tone.name || tone.code || 'Color Tonner',
    code: tone.code || tone.name || tone.hex,
    hex: tone.hex,
  }
}

function getColorsForLines(lines: string[]) {
  const colors = new Map<string, PaintColor>()

  PRODUCTS.filter((product) => lines.includes(product.line)).forEach((product) => {
    const productColors = product.colors?.length ? product.colors : (product.tones ?? [])

    productColors.forEach((tone) => {
      const color = normalizeColor(tone)
      if (!color) return

      const key = `${color.code}-${color.hex}`.toLowerCase()
      if (!colors.has(key)) {
        colors.set(key, color)
      }
    })
  })

  return Array.from(colors.values())
}

export const PAINT_PALETTES: Record<PaintMaterialKey, PaintColor[]> = {
  pared: getColorsForLines(materialLines.pared),
  vehiculo: getColorsForLines(materialLines.vehiculo),
  metal: getColorsForLines(materialLines.metal),
  plastico: getColorsForLines(materialLines.plastico),
  madera: getColorsForLines(materialLines.madera),
}

export const DEFAULT_PAINT_COLOR = PAINT_PALETTES.pared[0] ?? {
  name: 'Blanco',
  code: 'VI-101',
  hex: '#ffffff',
}

export function getPaintPaletteForMaterial(materialKey: string) {
  return PAINT_PALETTES[materialKey as PaintMaterialKey] ?? PAINT_PALETTES.pared
}
