export interface ProductAttribute {
  id: string;
  label: string;
  icon?: string;
}

export type Category = 'Interior' | 'Exterior' | 'Industrial';

export interface ProductTone {
  name: string;
  code?: string;
  hex?: string;
}

export interface Product {
  id: string;
  name: string;

  line: string;
  category?: string;
  subline?: string;
  segment?: string;

  description: string;
  short_description?: string;

  attributes?: ProductAttribute[];
  characteristics?: string[];
  uses?: string[];
  tones?: ProductTone[];
  colors?: ProductTone[];
  presentations?: string[];

  image?: string;
  image_url?: string;
  datasheet_url?: string;
}
