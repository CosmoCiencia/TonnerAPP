import type { Product } from './types';
import { PRODUCTS } from './products';

export async function getProducts(): Promise<Product[]> {
  return Promise.resolve(PRODUCTS);
}
