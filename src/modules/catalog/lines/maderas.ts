import type { Product } from '../types';

export const MADERAS_PRODUCTS: Product[] = [
  {
    id: 'PU-740',
    name: 'Uretablex (Sellador y Barniz)',
    line: 'maderas',

    description:
      'Sistema de acabado poliuretano de dos componentes que proporciona alta resistencia química y física. Ofrece excelente resistencia al rayado, humedad y cambios de temperatura.',

    uses: [
      'Uso interior',
      'Aplicación en muebles',
      'Aplicación en puertas',
      'Aplicación en maderas en general',
    ],

    segment: 'Poliuretano',

    presentations: ['Galón'],

    characteristics: [
      'Alta dureza',
      'Acabados mate y brillante',
      'Secado rápido',
      'Excelente acabado',
      'Alto rendimiento',
      'Alta transparencia',
      'Alta durabilidad',
      'Fácil aplicación',
    ],

    colors: [
      { name: 'Sellador Madera', code: 'PU-740' },
      { name: 'Barniz Brillante', code: 'PU-750' },
      { name: 'Barniz Semi Mate', code: 'PU-770' },
      { name: 'Endurecedor', code: 'PU-850' },
    ],

    image: '/products/uretablex.png',
  },
  {
    id: 'LM-700',
    name: 'Laca Transparente Brillante',
    line: 'maderas',

    description:
      'Laca nitrocelulósica formulada con resinas, disolventes y aditivos de alta calidad. Ofrece secado rápido, excelente adherencia y acabado brillante duradero.',

    uses: ['Uso interior', 'Aplicación en cualquier tipo de madera'],

    segment: 'Nitrocelulósico',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Alta dureza',
      'Acabado brillante',
      'Secado rápido',
      'Excelente acabado',
      'Alto rendimiento',
      'Excelente adherencia',
      'Alta transparencia',
      'Alta durabilidad',
    ],

    colors: [
      { name: 'Transparente Brillante', code: 'LM-700' },
      { name: 'Transparente Brillante Industrial', code: 'LM-750' },
    ],

    image: '/products/laca-transparante-brillante.png',
  },
  {
    id: 'LM-770',
    name: 'Laca Transparente Mate',
    line: 'maderas',

    description:
      'Laca nitrocelulósica de secado rápido que proporciona un acabado mate uniforme con excelente adherencia y resistencia.',

    uses: ['Uso interior', 'Aplicación en cualquier tipo de madera'],

    segment: 'Nitrocelulósico',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Alta dureza',
      'Acabado mate',
      'Secado rápido',
      'Excelente acabado',
      'Alto rendimiento',
      'Excelente adherencia',
      'Alta transparencia',
      'Alta durabilidad',
    ],

    colors: [{ name: 'Transparente Mate', code: 'LM-770' }],

    image: '/products/laca-transparente-mate.png',
  },
  {
    id: 'LM-730',
    name: 'Sellador Nitro',
    line: 'maderas',

    description:
      'Sellador nitrocelulósico de un componente que puede diluirse con Thinner Extrafino Tonner® (TH-100) para facilitar su aplicación. Permite secado rápido y lijado en poco tiempo.',

    uses: [
      'Uso interior',
      'Aplicación en cualquier tipo de madera',
      'Especialmente en maderas no resinosas',
    ],

    segment: 'Nitrocelulósico (Sellador)',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Alta dureza',
      'Acabados mate y brillante',
      'Secado rápido',
      'Excelente acabado',
      'Alto rendimiento',
      'Alta transparencia',
      'Alta durabilidad',
      'Fácil aplicación',
    ],

    colors: [
      { name: 'Sellador Industrial', code: 'LM-730' },
      { name: 'Sell. 40% Sólidos', code: 'LM-740' },
      { name: 'Sell. 42% Sólidos', code: 'LM-742' },
      { name: 'Sell. 45% Sólidos', code: 'LM-745' },
    ],

    image: '/products/sellador-nitro.png',
  },
  {
    id: 'LC-750',
    name: 'Laca Catalizada',
    line: 'maderas',

    description:
      'Sistema de acabado de dos componentes compuesto por Laca Catalizada Tonner® (Componente A) y Catalizador Tonner® LC-700 (Componente B). Proporciona excelente brillo, dureza y sellamiento rápido de la madera.',

    uses: [
      'Uso interior',
      'Aplicación en muebles',
      'Aplicación en puertas',
      'Aplicación en maderas en general',
    ],

    segment: 'Catalizado',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón', 'PET'],

    characteristics: [
      'Excelente adherencia',
      'Acabados brillante y mate',
      'Secado rápido',
      'Alta dureza',
      'Alto rendimiento',
      'Alta transparencia',
      'Alta durabilidad',
      'Excelente calidad',
    ],

    colors: [
      { name: 'Blanca (no amarillenta)', code: 'LC-701', hex: '#ffffff' },
      { name: 'Transparente', code: 'LC-750' },
      { name: 'Laca Brillante', code: 'LC-760' },
      { name: 'Laca Brillante (no amarillenta)', code: 'LC-770' },
      { name: 'Laca Mate', code: 'LC-780' },
      { name: 'Laca Semi Mate', code: 'LC-785' },
    ],

    image: '/products/laca-catalizada.png',
  },
  {
    id: 'LC-759',
    name: 'Laca Catalizada Industrial',
    line: 'maderas',

    description:
      'Sistema catalizado de alto desempeño formulado con materias primas de alta calidad que proporciona acabados de gran dureza, brillo y excelente sellamiento de la madera.',

    uses: [
      'Uso interior',
      'Aplicación en muebles',
      'Aplicación en puertas',
      'Aplicación en maderas en general',
    ],

    segment: 'Catalizado',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón', 'PET'],

    characteristics: [
      'Excelente adherencia',
      'Acabado brillante',
      'Secado rápido',
      'Alta dureza',
      'Alto rendimiento',
      'Alta transparencia',
      'Alta durabilidad',
      'Excelente calidad',
    ],

    colors: [
      { name: 'Caramelo', code: 'LC-759', hex: '#59150c' },
      { name: 'Miel', code: 'LC-779', hex: '#952c17' },
      { name: 'Transparente', code: 'LC-785' },
      { name: 'Laca Brillante', code: 'LC-880' },
      { name: 'Laca Semi Mate', code: 'LC-885' },
    ],

    image: '/products/laca-latalizada-industrial.png',
  },
  {
    id: 'LC-735',
    name: 'Sellador Catalizado',
    line: 'maderas',

    description:
      'Sistema de sellador catalizado compuesto por Sellador Catalizado Tonner® (Componente A) y Catalizador Tonner® LC-700 (Componente B). Garantiza un sellamiento rápido y excelente acondicionamiento de la madera antes del acabado final.',

    uses: [
      'Uso interior',
      'Preparación de superficies de madera',
      'Aplicación en muebles',
      'Aplicación en puertas',
      'Base antes del acabado final',
    ],

    segment: 'Catalizado (Sellador)',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón', 'PET'],

    characteristics: [
      'Excelente adherencia',
      'Excelente acabado',
      'Secado rápido',
      'Alta dureza',
      'Excelente lijabilidad',
      'Alto rendimiento',
      'Alta transparencia',
      'Alta durabilidad',
    ],

    colors: [
      { name: 'Sellador Cat. Industrial', code: 'LC-735', hex: '#e4e4e4' },
      { name: 'Sellador Cat. Premium', code: 'LC-740', hex: '#fffdf1' },
      { name: 'Sellador Ocre', code: 'LC-721', hex: '#c06e29' },
      { name: 'Sellador Pardo', code: 'LC-725', hex: '#755c49' },
      { name: 'Sellador Wengue', code: 'LC-728', hex: '#341f19' },
      { name: 'Sellador Negro', code: 'LC-730', hex: '#000000' },
      { name: 'Sellador Blanco', code: 'LC-751', hex: '#ffffff' },
      { name: 'Sellador Ocre Rojizo', code: 'LC-771', hex: '#bb3a0a' },
      { name: 'Sellador Rojo Oxido', code: 'LC-773', hex: '#891d03' },
      { name: 'Sellador Rojo Canela', code: 'LC-775', hex: '#82332e' },
      { name: 'Sellador Caoba', code: 'LC-777', hex: '#582405' },
    ],

    image: '/products/sellador-catalizado.png',
  },
  {
    id: 'LC-700',
    name: 'Catalizador',
    line: 'maderas',

    description:
      'Catalizador Tonner® elaborado con solventes y solución ácida diseñado para activar el proceso de curado en lacas y selladores catalizados.',

    uses: [
      'Promover reacción de curado',
      'Uso con lacas catalizadas',
      'Uso con selladores catalizados',
    ],

    segment: 'Catalizado (Catalizador)',

    presentations: ['Garrafa por 1000 CC', 'Unidad por 200 CC', 'Unidad por 50 CC'],

    characteristics: [
      'Activador de curado',
      'Alta compatibilidad con sistemas catalizados',
      'Fácil mezcla',
      'Alta eficiencia de reacción',
    ],

    colors: [{ name: 'Catalizador', code: 'LC-700' }],

    image: '/products/catalizador.png',
  },
  {
    id: 'TM-703',
    name: 'Tintes para Madera',
    line: 'maderas',

    description:
      'Tintes base alcohol formulados con altas concentraciones de colorantes que proporcionan excelente rendimiento y un acabado uniforme en superficies de madera.',

    uses: [
      'Uso interior',
      'Aplicación en madera natural',
      'Aplicación en MDF',
      'Aplicación en aglomerados',
    ],

    segment: 'Tintes',

    presentations: ['Galón', 'Garrafa de 1000 CC', 'Unidad por 200 CC'],

    characteristics: [
      'Excelente adherencia',
      'Acabado mate',
      'Secado rápido',
      'Alto cubrimiento',
      'Alto rendimiento',
      'Alta transparencia',
      'Excelente nivelación',
      'Alta durabilidad',
      'Fácil aplicación',
    ],

    colors: [
      { name: 'Amarillo', code: 'TM-703', hex: '#f18e32' },
      { name: 'Rojo', code: 'TM-705', hex: '#dc232e' },
      { name: 'Rojo Inglés', code: 'TM-708', hex: '#842114' },
      { name: 'Caramelo', code: 'TM-709', hex: '#59150c' },
      { name: 'Miel', code: 'TM-729', hex: '#952c17' },
      { name: 'Negro', code: 'TM-730', hex: '#000000' },
      { name: 'Caoba', code: 'TM-757', hex: '#582405' },
      { name: 'Nogal', code: 'TM-773', hex: '#7f351e' },
      { name: 'Tabaco', code: 'TM-776', hex: '#5e1d19' },
      { name: 'Wengue', code: 'TM-778', hex: '#341f19' },
      { name: 'Chocolate', code: 'TM-780', hex: '#683921' },
    ],

    image: '/products/tintes-para-madera.png',
  },
  {
    id: 'MA-028',
    name: 'Maderbond',
    line: 'maderas',

    description:
      'Adhesivo acuoso basado en resina sintética PVA diseñado para la industria de la carpintería. Permite uniones fuertes y duraderas en diferentes aplicaciones de madera.',

    uses: [
      'Ensamble de madera',
      'Pegue de listones',
      'Pegue de espigos',
      'Aplicaciones generales de carpintería',
    ],

    segment: 'Pegantes',

    presentations: [
      'Tambor',
      'Cuñete de 5 galones',
      'Balde de 2.5 galones',
      'Galón',
      'Cuarto de galón',
    ],

    characteristics: [
      'Excelente adherencia',
      'Producto económico',
      'Secado rápido',
      'Bajo contenido de VOC',
      'Alto rendimiento',
      'Diluible con agua',
      'Buena flexibilidad',
      'Alta durabilidad',
      'Fácil aplicación',
    ],

    colors: [
      { name: 'Industrial Blanco 28%', code: 'MA-028' },
      { name: 'Industrial Blanco 30%', code: 'MA-030' },
    ],

    image: '/products/maderbond.png',
  },
  {
    id: 'MA-050',
    name: 'Maderbond Experto',
    line: 'maderas',

    description:
      'Adhesivo acuoso basado en resina sintética PVA con alto contenido de sólidos y aditivos especiales que brindan alta adhesión y secado rápido. Diseñado para la industria del mueble y la madera.',

    uses: [
      'Ensamble de madera',
      'Pegue de espigos',
      'Laminación',
      'Enchape de madera',
      'Aplicación en maderas blandas y duras',
    ],

    segment: 'Pegantes',

    presentations: [
      'Tambor',
      'Cuñete de 5 galones',
      'Balde de 2.5 galones',
      'Galón',
      'Cuarto de galón',
    ],

    characteristics: [
      'Excelente adherencia',
      'Producto económico',
      'Secado rápido',
      'Bajo contenido de VOC',
      'Alto rendimiento',
      'Diluible con agua',
      'Buena flexibilidad',
      'Alta durabilidad',
      'Fácil aplicación',
    ],

    colors: [{ name: 'Pegante ligeramente rosado 50%', code: 'MA-050', hex: '#f3c7c7' }],

    image: '/products/maderbond-experto.png',
  },
];
