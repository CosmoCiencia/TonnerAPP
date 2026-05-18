import { AUTOMOTRIZ_PRODUCTS } from './lines/automotriz';
import { ARQUITECTONICA_PRODUCTS } from './lines/arquitectonica';
import { INDUSTRIAL_PRODUCTS } from './lines/industrial';
import { MADERAS_PRODUCTS } from './lines/maderas';

export const PRODUCTS = [
  ...ARQUITECTONICA_PRODUCTS,
  ...INDUSTRIAL_PRODUCTS,
  ...AUTOMOTRIZ_PRODUCTS,
  ...MADERAS_PRODUCTS,
];
