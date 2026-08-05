import { supabase } from '../lib/supabase'
import type { Product, ProductAttribute, ProductTone } from '../modules/catalog/types'
import type { Distributor } from '../modules/distributors/types'
import { PRODUCTS as DEFAULT_PRODUCTS } from '../modules/catalog/products'
import { distributors as DEFAULT_DISTRIBUTORS } from '../modules/distributors/distributors.data'
import { PAINT_PALETTES, type PaintColor, type PaintMaterialKey } from '../modules/paint/colors'

type CatalogProductRow = Omit<Product, 'image'> & {
  image_url?: string | null
  attributes?: ProductAttribute[] | null
  characteristics?: string[] | null
  uses?: string[] | null
  colors?: ProductTone[] | null
  presentations?: string[] | null
}

type DistributorRow = {
  id: string
  name: string
  city: string
  address: string
  phone: string
  email?: string | null
  lat?: number | null
  lng?: number | null
}

function mapProduct(row: CatalogProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    line: row.line,
    category: row.category ?? undefined,
    subline: row.subline ?? undefined,
    segment: row.segment ?? undefined,
    description: row.description ?? '',
    short_description: row.short_description ?? undefined,
    attributes: row.attributes ?? undefined,
    characteristics: row.characteristics ?? undefined,
    uses: row.uses ?? undefined,
    colors: row.colors ?? undefined,
    presentations: row.presentations ?? undefined,
    image: row.image_url ?? undefined,
    image_url: row.image_url ?? undefined,
    datasheet_url: row.datasheet_url ?? undefined,
  }
}

function mapDistributor(row: DistributorRow): Distributor {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    phone: row.phone,
    email: row.email ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
  }
}

export async function getRemoteProducts(): Promise<Product[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('tonner_catalog_products')
    .select(
      'id,name,line,category,subline,segment,description,short_description,attributes,characteristics,uses,colors,presentations,image_url,datasheet_url',
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error || !data || data.length === 0) return null

  return (data as CatalogProductRow[]).map(mapProduct)
}

export async function getProductsWithFallback(): Promise<Product[]> {
  try {
    return (await getRemoteProducts()) ?? DEFAULT_PRODUCTS
  } catch (error) {
    console.warn('[Tonner Catalog] Usando catálogo local de respaldo:', error)
    return DEFAULT_PRODUCTS
  }
}

export async function getRemoteDistributors(): Promise<Distributor[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('tonner_catalog_distributors')
    .select('id,name,city,address,phone,email,lat,lng')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error || !data || data.length === 0) return null

  return (data as DistributorRow[]).map(mapDistributor)
}

export async function getDistributorsWithFallback(): Promise<Distributor[]> {
  try {
    return (await getRemoteDistributors()) ?? DEFAULT_DISTRIBUTORS
  } catch (error) {
    console.warn('[Tonner Catalog] Usando distribuidores locales de respaldo:', error)
    return DEFAULT_DISTRIBUTORS
  }
}

export async function getPaintPalettesWithFallback(): Promise<Record<PaintMaterialKey, PaintColor[]>> {
  if (!supabase) return PAINT_PALETTES

  try {
    const { data, error } = await supabase
      .from('tonner_catalog_colors')
      .select('name,code,hex,line')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error || !data || data.length === 0) return PAINT_PALETTES

    const palettes: Record<PaintMaterialKey, PaintColor[]> = {
      arquitectonica: [],
      industrial: [],
      automotriz: [],
      maderas: [],
    }

    data.forEach((row) => {
      const color: PaintColor = {
        name: String(row.name ?? 'Color Tonner'),
        code: String(row.code ?? row.name ?? 'TONNER'),
        hex: String(row.hex ?? '#FFFFFF'),
      }
      const line = typeof row.line === 'string' ? row.line : ''

      for (const materialKey of Object.keys(palettes) as PaintMaterialKey[]) {
        if (!line || line === materialKey) palettes[materialKey].push(color)
      }
    })

    return Object.fromEntries(
      (Object.keys(palettes) as PaintMaterialKey[]).map((key) => [
        key,
        palettes[key].length > 0 ? palettes[key] : PAINT_PALETTES[key],
      ]),
    ) as Record<PaintMaterialKey, PaintColor[]>
  } catch (error) {
    console.warn('[Tonner Paint] Usando paletas locales de respaldo:', error)
    return PAINT_PALETTES
  }
}
