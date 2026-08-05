import type { Product } from './types';
import { getProductsWithFallback } from '../../services/tonnerCatalog'

export async function getProducts(): Promise<Product[]> {
  return getProductsWithFallback()
}
