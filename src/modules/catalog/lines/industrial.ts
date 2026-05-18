import type { Product } from '../types';

export const INDUSTRIAL_PRODUCTS: Product[] = [
  {
    id: 'epoxico',
    name: 'Esmalte Epóxico',
    line: 'industrial',

    description:
      'Primer Epóxico-Poliamida es un recubrimiento con muy buena resistencia a la corrosión. Excelente secamiento, muy buena adherencia y flexibilidad. Se presenta en dos componentes: Componente A (Primer Epóxico) y Componente B EP-200 (Catalizador Epóxico Tonner®), los cuales se mezclan en partes iguales para aplicación.',

    uses: [
      'Protección de superficies metálicas ferrosas y no ferrosas',
      'Tanques y tuberías',
      'Estructuras metálicas',
      'Maquinaria y equipos industriales',
      'Puentes',
      'Pisos de talleres',
      'Paredes de centros hospitalarios y odontológicos',
    ],

    segment: 'Esmaltes',

    presentations: ['Galón'],

    characteristics: [
      'Excelente adherencia',
      'Alta dureza',
      'Secado rápido',
      'Uso interior y exterior',
      'Alta durabilidad',
      'Excelente acabado',
      'Alto rendimiento',
      'Alto cubrimiento',
    ],

    colors: [
      { name: 'Catalizador', code: 'EP-200' },
      { name: 'Amarillo', code: 'EP-203', hex: '#fff316' },
      { name: 'Rojo', code: 'EP-205', hex: '#ff160a' },
      { name: 'Gris basalto', code: 'EP-210', hex: '#e4e4e4' },
      { name: 'Azul', code: 'EP-213', hex: '#0070d4' },
      { name: 'Verde', code: 'EP-216', hex: '#1ea33d' },
      { name: 'Negro', code: 'EP-230', hex: '#000000' },
      { name: 'Blanco', code: 'EP-251', hex: '#ffffff' },
      { name: 'Azul mediano', code: 'EP-254', hex: '#0000cc' },
      { name: 'Gris', code: 'EP-277', hex: '#a1a8ae' },
    ],

    image: '/products/esmalte-epoxico.png',
  },
  {
    id: 'secado-flash',
    name: 'Secado Flash',
    line: 'industrial',

    description:
      'Producto elaborado con resinas alquídicas modificadas de excelente calidad y pigmentos seleccionados. Ofrece secamiento extra rápido, excelente brillo y alta durabilidad.',

    uses: [
      'Protección de objetos metálicos',
      'Puertas y ventanas',
      'Rejas',
      'Maquinaria industrial',
      'Estructuras metálicas',
    ],

    segment: 'Esmaltes',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Excelente adherencia',
      'Excelente retención del color',
      'Secado ultra rápido',
      'Uso interior y exterior',
      'Alta durabilidad',
      'Excelente acabado',
      'Alto rendimiento',
      'Alto cubrimiento',
    ],

    colors: [
      { name: 'Blanco', code: 'SF-501', hex: '#ffffff' },
      { name: 'Amarillo', code: 'SF-503', hex: '#fdcc00' },
      { name: 'Rojo', code: 'SF-505', hex: '#d80100' },
      { name: 'Azul Tonner', code: 'SF-513', hex: '#310070' },
      { name: 'Azul Español', code: 'SF-514', hex: '#07194d' },
      { name: 'Verde esmeralda', code: 'SF-516', hex: '#1b5422' },
      { name: 'Verde Tonner', code: 'SF-520', hex: '#009366' },
      { name: 'Champaña', code: 'SF-528', hex: '#867f5e' },
      { name: 'Gold Tonner', code: 'SF-529', hex: '#dcbd7a' },
      { name: 'Negro', code: 'SF-530', hex: '#000000' },
      { name: 'Aluminio', code: 'SF-531', hex: '#9fa2b0' },
      { name: 'Verde John D', code: 'SF-556', hex: '#1b8000' },
      { name: 'Negro mate', code: 'SF-580', hex: '#252525' },
    ],

    image: '/products/secado-flash.png',
  },
  {
    id: 'esmalton-3en1',
    name: 'Esmalton 3 en 1',
    line: 'industrial',

    description:
      'Esmalte alquídico de secado al aire con inhibidor de óxido que acondiciona, protege y decora superficies metálicas en un solo paso.',

    uses: [
      'Decoración de muebles',
      'Puertas',
      'Paredes',
      'Divisiones arquitectónicas',
      'Superficies metálicas',
    ],

    segment: 'Esmaltes',

    presentations: ['Galón'],

    characteristics: [
      'Alto cubrimiento',
      'Acabado brillante',
      'Inhibidor de óxido',
      'Excelente acabado',
      'Excelente retención del color',
      'Alta durabilidad',
      'Excelente adherencia',
    ],

    colors: [
      { name: 'Blanco', code: 'ES-101', hex: '#ffffff' },
      { name: 'Amarillo', code: 'ES-103', hex: '#fdcc00' },
      { name: 'Rojo fiesta', code: 'ES-105', hex: '#b81602' },
      { name: 'Azul Español', code: 'ES-114', hex: '#07194d' },
      { name: 'Verde esmeralda', code: 'ES-116', hex: '#1b5422' },
      { name: 'Negro', code: 'ES-130', hex: '#000000' },
      { name: 'Aluminio', code: 'ES-131', hex: '#9fa2b0' },
      { name: 'Negro mate', code: 'ES-180', hex: '#252525' },
    ],

    image: '/products/esmalton-3-en-1.png',
  },
  {
    id: 'trafico-pesado',
    name: 'Tráfico Pesado',
    line: 'industrial',

    description:
      'Pintura acrílica de rápido secamiento con excelente adherencia y alta resistencia a la abrasión, humedad e intemperie.',

    uses: ['Demarcación vial', 'Calles', 'Canchas deportivas', 'Pisos de bodegas', 'Parqueaderos'],

    segment: 'Demarcación',

    presentations: ['Cuñete', 'Galón'],

    characteristics: [
      'Excelente adherencia',
      'Alta dureza',
      'Secado rápido',
      'Uso interior y exterior',
      'Alta durabilidad',
      'Acabado mate',
      'Alto rendimiento',
    ],

    colors: [
      { name: 'Blanco', code: 'PT-801', hex: '#ffffff' },
      { name: 'Amarillo', code: 'PT-803', hex: '#fdcc00' },
      { name: 'Rojo', code: 'PT-805', hex: '#b81602' },
      { name: 'Gris', code: 'PT-810', hex: '#bfbfbf' },
      { name: 'Azul', code: 'PT-813', hex: '#0070d4' },
      { name: 'Verde', code: 'PT-820', hex: '#1ea33d' },
      { name: 'Negro', code: 'PT-830', hex: '#000000' },
    ],

    image: '/products/trafico-pesado.png',
  },
  {
    id: 'primer-epoxico',
    name: 'Primer Epóxico',
    line: 'industrial',

    description:
      'Recubrimiento epóxico-poliamida con excelente resistencia a la corrosión, alta adherencia y gran capacidad de relleno.',

    uses: [
      'Protección de superficies metálicas',
      'Tanques',
      'Tuberías',
      'Estructuras metálicas',
      'Maquinaria industrial',
    ],

    segment: 'Primer',

    presentations: ['Galón'],

    characteristics: [
      'Excelente adherencia',
      'Alta capacidad de relleno',
      'Secado rápido',
      'Acabado mate',
      'Excelente calidad',
      'Alto rendimiento',
      'Alto cubrimiento',
    ],

    colors: [{ name: 'Gris', code: 'EP-227', hex: '#bfbfbf' }],

    image: '/products/primer-epoxico.png',
  },
  {
    id: 'wash-primer',
    name: 'Wash Primer',
    line: 'industrial',

    description:
      'Imprimante anticorrosivo de dos componentes diseñado para mejorar la adherencia de recubrimientos sobre superficies metálicas. Contiene agentes fosfatizantes que generan una excelente base para sistemas de pintura industrial.',

    uses: [
      'Preparación de superficies metálicas',
      'Estructuras metálicas',
      'Carrocerías',
      'Tanques',
      'Equipos industriales',
    ],

    segment: 'Primer',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Excelente adherencia',
      'Protección anticorrosiva',
      'Secado rápido',
      'Base ideal para sistemas de pintura',
      'Alta durabilidad',
      'Excelente rendimiento',
    ],

    colors: [{ name: 'Verde', code: 'WP-401', hex: '#4f7c3a' }],

    image: '/products/wash-primer.png',
  },
  {
    id: 'primer-cromato-zinc',
    name: 'Primer Cromato de Zinc',
    line: 'industrial',

    description:
      'Imprimante anticorrosivo formulado con cromato de zinc para brindar alta protección contra la oxidación en superficies metálicas expuestas a ambientes agresivos.',

    uses: [
      'Protección de estructuras metálicas',
      'Puentes',
      'Torres',
      'Maquinaria industrial',
      'Tanques metálicos',
    ],

    segment: 'Primer',

    presentations: ['Galón'],

    characteristics: [
      'Alta resistencia a la corrosión',
      'Excelente adherencia',
      'Secado rápido',
      'Uso industrial',
      'Excelente durabilidad',
      'Buen poder de cubrimiento',
    ],

    colors: [{ name: 'Verde zinc', code: 'CZ-450', hex: '#6f8f55' }],

    image: '/products/primer-cromato-de-zinc.png',
  },
  {
    id: 'primer-fosfato-zinc',
    name: 'Primer Fosfato de Zinc',
    line: 'industrial',

    description:
      'Imprimante anticorrosivo formulado con fosfato de zinc que protege superficies metálicas contra la oxidación y mejora la adherencia de recubrimientos finales.',

    uses: [
      'Protección de estructuras metálicas',
      'Equipos industriales',
      'Puertas metálicas',
      'Rejas',
      'Maquinaria',
    ],

    segment: 'Primer',

    presentations: ['Galón'],

    characteristics: [
      'Excelente protección anticorrosiva',
      'Alta adherencia',
      'Secado rápido',
      'Uso interior y exterior',
      'Alta durabilidad',
      'Buen rendimiento',
    ],

    colors: [{ name: 'Gris', code: 'FZ-460', hex: '#9c9c9c' }],

    image: '/products/primer-fosfato-de-zinc.png',
  },
  {
    id: 'primer-plasticos',
    name: 'Primer para Plásticos',
    line: 'industrial',

    description:
      'Imprimante especializado para mejorar la adherencia de pinturas sobre superficies plásticas difíciles como PVC, ABS y policarbonato.',

    uses: [
      'Superficies plásticas',
      'Piezas automotrices',
      'Equipos industriales',
      'Componentes plásticos',
      'Elementos decorativos',
    ],

    segment: 'Primer',

    presentations: ['Cuarto de galón'],

    characteristics: [
      'Alta adherencia en plásticos',
      'Secado rápido',
      'Excelente base para acabados',
      'Alta durabilidad',
      'Buen rendimiento',
    ],

    colors: [{ name: 'Transparente', code: 'PP-470' }],

    image: '/products/primer-para-plasticos.png',
  },
];
