import type { Product } from '../types';

export const AUTOMOTRIZ_PRODUCTS: Product[] = [
  {
    id: 'automotiva',
    name: 'AUTOMOTIVA',
    line: 'automotriz',

    description:
      'Formulado con materias primas de óptima calidad como resina nitrocelulósica, pigmentos activos, disolventes y aditivos seleccionados para obtener un acabado con buen brillo, adherencia, dureza, flexibilidad y resistencia a la intemperie.',

    uses: [
      'Repinte de automóviles',
      'Repinte de camiones',
      'Repinte de motocicletas',
      'Repinte de bicicletas',
      'Industria metalmecánica en general',
    ],

    segment: 'Segmento Nitro (Acabado)',

    presentations: ['Galón'],

    characteristics: [
      'Excelente acabado',
      'Alta durabilidad',
      'Alto en sólidos',
      'Uso en ambientes interiores y exteriores',
      'Alta adherencia',
      'Alto rendimiento',
      'Excelente retención del color',
      'Acabado brillante',
      'Secado rápido',
      'Diluible con TH-100',
    ],

    colors: [
      { name: 'Royal Marrón', code: 'LN-109', hex: '#452d00' },
      { name: 'Green Gold Tonner', code: 'LN-116', hex: '#5f8a42' },
      { name: 'Magenta', code: 'LN-160', hex: '#861859' },
      { name: 'Violeta Puro', code: 'LN-161', hex: '#7f00ff' },
      { name: 'Aluminio fino brillante', code: 'LN-181', hex: '#cbcbcb' },
      { name: 'Aluminio medio brillante', code: 'LN-183', hex: '#b6b6b6' },
      { name: 'Amarillo oro', code: 'LN-189', hex: '#efb810' },
    ],

    image: '/products/automativa.png',
  },

  {
    id: 'automotiva-industrial',
    name: 'AUTOMOTIVA INDUSTRIAL',
    line: 'automotriz',

    description:
      'Formulado con materias primas de óptima calidad como resina nitrocelulósica, pigmentos activos, disolventes y aditivos seleccionados para obtener un acabado con buen brillo, adherencia, dureza, flexibilidad y resistencia a la intemperie.',

    uses: [
      'Repinte de automóviles',
      'Repinte de camiones',
      'Repinte de motocicletas',
      'Repinte de bicicletas',
      'Industria metalmecánica en general',
    ],

    segment: 'Segmento Nitro (Acabado)',

    presentations: ['Tambor', 'Cuñete de 5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Excelente acabado',
      'Alta durabilidad',
      'Uso en ambientes interiores y exteriores',
      'Alta adherencia',
      'Alto rendimiento',
      'Excelente retención del color',
      'Acabado brillante y mate',
      'Secado rápido',
      'Diluible con TH-100',
    ],

    colors: [
      { name: 'Negro mate', code: 'LN-270', hex: '#252525' },
      { name: 'Marrón índigo limpio', code: 'LN-411', hex: '#e1b384' },
      { name: 'Negro mezcla', code: 'LN-430', hex: '#262626' },
      { name: 'Transparente', code: 'LN-450', hex: '#fefff7' },
      { name: 'Blanco concentración', code: 'LN-451', hex: '#ffff00' },
      { name: 'Amarillo limón', code: 'LN-452', hex: '#ffcd05' },
      { name: 'Amarillo medio', code: 'LN-453', hex: '#fe7900' },
      { name: 'Naranja', code: 'LN-456', hex: '#ec022d' },
      { name: 'Rojo toloudine', code: 'LN-458', hex: '#ec022d' },

      { name: 'Azul Tonner', code: 'LN-463', hex: '#0d1023' },
      { name: 'Verde Tonner', code: 'LN-470', hex: '#163d1d' },
      { name: 'Amarillo oxido', code: 'LN-471', hex: '#c6953d' },
      { name: 'Rojo oxido', code: 'LN-473', hex: '#891d03' },
      { name: 'Gold Tonner', code: 'LN-479', hex: '#dcbd7a' },
      { name: 'Negro concentración', code: 'LN-480', hex: '#020202' },
      { name: 'Aluminio Grano fino', code: 'LN-481', hex: '#c0c0c0' },
      { name: 'Aluminio Grano grueso', code: 'LN-482', hex: '#aeaeae' },
      { name: 'Rojo Ferrari', code: 'LN-498', hex: '#cc0000' },
    ],

    image: '/products/automotiva-industrial.png',
  },
  {
    id: 'fondo-nitro',
    name: 'FONDO NITRO',
    line: 'automotriz',

    description:
      'Formulado con materias primas de óptima calidad como resina nitrocelulósica, pigmentos activos, disolventes y aditivos seleccionados. Producto de gran desempeño, rápido secamiento y fácil aplicación, no se desprende ni se agrieta, excelente lijabilidad y rendimiento. Provee sobre la superficie a repintar una muy buena adherencia de la laca de acabado final.',

    uses: [
      'Repintado de automóviles',
      'Repintado de camiones',
      'Repintado de motocicletas',
      'Repintado de bicicletas',
      'Industria metalmecánica en general',
      'Puede ser usado como primer antes de la aplicación de lacas nitrocelulósicas',
    ],

    segment: 'Segmento Nitro (Base)',

    presentations: ['Cuñete de 5 galones', 'Galón'],

    characteristics: [
      'Alto cubrimiento',
      'Buena flexibilidad',
      'Alto en sólidos',
      'Excelente adherencia',
      'Alto rendimiento',
      'Alta capacidad de relleno',
      'Libre de plomo y cromatos',
      'Alta dureza',
      'Diluible con TH-100',
    ],

    colors: [
      { name: 'Negro', code: 'FL-330', hex: '#000000' },
      { name: 'Verde', code: 'FL-517', hex: '#485727' },
    ],

    image: '/products/fondo-nitro.png',
  },
  {
    id: 'fondo-nitro-industrial',
    name: 'FONDO NITRO INDUSTRIAL',
    line: 'automotriz',

    description:
      'Formulado con materias primas de óptima calidad como resina nitrocelulósica, pigmentos activos, disolventes y aditivos seleccionados. Producto de gran desempeño, rápido secamiento y fácil aplicación, no se desprende ni se agrieta, excelente lijabilidad y rendimiento. Provee sobre la superficie a repintar una muy buena adherencia de la laca de acabado final.',

    uses: [
      'Repintado de automóviles',
      'Repintado de camiones',
      'Repintado de motocicletas',
      'Repintado de bicicletas',
      'Industria metalmecánica en general',
      'Puede ser usado como primer antes de la aplicación de lacas nitrocelulósicas',
    ],

    segment: 'Segmento Nitro (Base)',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto cubrimiento',
      'Buena flexibilidad',
      'Fácil aplicación',
      'Excelente adherencia',
      'Alto rendimiento',
      'Alta capacidad de relleno',
      'Libre de plomo y cromatos',
      'Alta dureza',
      'Diluible con TH-100',
    ],

    colors: [
      { name: 'Blanco', code: 'FL-551', hex: '#ffffff' },
      { name: 'Gris claro', code: 'FL-560', hex: '#d8dbe4' },
      { name: 'Ocre', code: 'FL-571', hex: '#c06e29' },
      { name: 'Rojo claro', code: 'FL-573', hex: '#a73023' },
      { name: 'Pardo', code: 'FL-575', hex: '#755c49' },
      { name: 'Rojo oscuro', code: 'FL-576', hex: '#5c0b0c' },
      { name: 'Gris oscuro', code: 'FL-577', hex: '#676463' },
      { name: 'Negro', code: 'FL-580', hex: '#000000' },
    ],

    image: '/products/fondo-nitro-industrial.png',
  },
  {
    id: 'masilla-nitro',
    name: 'MASILLA NITRO',
    line: 'automotriz',

    description:
      'Producto de gran desempeño, rápido secamiento y fácil aplicación, no se desprende ni se agrieta, excelente lijabilidad y rendimiento. Excelente poder de relleno, resistencia al cuarteo y al rechupe.',

    uses: [
      'Rellenar pequeñas imperfecciones',
      'Corregir rayones',
      'Corregir desniveles',
      'Corregir abolladuras no profundas',
      'Superficies metálicas',
      'Superficies de madera',
    ],

    segment: 'Segmento Nitro (Masilla)',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto cubrimiento',
      'No se agrieta',
      'Secado rápido',
      'Excelente adherencia',
      'Alto rendimiento',
      'Alta capacidad de relleno',
      'Excelente lijabilidad',
      'Alta dureza',
    ],

    colors: [
      { name: 'Blanca', code: 'LN-501', hex: '#ffffff' },
      { name: 'Gris', code: 'LN-510', hex: '#a1a8ae' },
      { name: 'Roja', code: 'LN-523', hex: '#ba2025' },
    ],

    image: '/products/masilla-nitro.png',
  },
  {
    id: 'masilla-industrial-nitro',
    name: 'MASILLA INDUSTRIAL NITRO',
    line: 'automotriz',

    description:
      'Producto de gran desempeño, rápido secamiento y fácil aplicación, no se desprende ni se agrieta, excelente lijabilidad y rendimiento. Excelente poder de relleno, resistencia al cuarteo y al rechupe.',

    uses: [
      'Rellenar imperfecciones',
      'Corregir rayones',
      'Corregir desniveles',
      'Corregir abolladuras',
      'Superficies metálicas',
      'Superficies de madera',
    ],

    segment: 'Segmento Nitro (Masilla)',

    presentations: ['Galón', 'Cuarto de galón', 'Octavo de galón'],

    characteristics: [
      'Alto cubrimiento',
      'No se agrieta',
      'Secado rápido',
      'Excelente adherencia',
      'Alto rendimiento',
      'Alta capacidad de relleno',
      'Excelente lijabilidad',
      'Alta dureza',
    ],

    colors: [
      { name: 'Blanca', code: 'LN-901', hex: '#ffffff' },
      { name: 'Gris', code: 'LN-910', hex: '#a1a8ae' },
      { name: 'Roja', code: 'LN-923', hex: '#ba2025' },
      { name: 'Negra', code: 'LN-930', hex: '#000000' },
    ],

    image: '/products/masilla-industrial-nitro.png',
  },
  {
    id: 'pasta-para-pulir',
    name: 'PASTA PARA PULIR',
    line: 'automotriz',

    description:
      'Producto de gran desempeño, rápido secamiento y fácil aplicación, no se desprende ni se agrieta, excelente lijabilidad y rendimiento. Excelente poder de relleno, resistencia al cuarteo y al rechupe.',

    uses: [
      'Eliminar suciedad',
      'Desmanchar superficies',
      'Brillar pintura',
      'Polichar superficies metálicas o de madera',
      'Brilla metal en cobre o bronce',
    ],

    segment: 'Segmento Nitro (Pasta)',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón', 'Octavo de galón'],

    characteristics: [
      'Alto cubrimiento',
      'Secado rápido',
      'Alto rendimiento',
      'Alta capacidad de relleno',
      'Excelente para brillar y restaurar',
    ],

    colors: [
      { name: 'Ultra white', code: 'PR-101', hex: '#ffffff' },
      { name: 'Rojo', code: 'PR-768', hex: '#ba2025' },
    ],

    image: '/products/pasta-para-pulir.png',
  },
  {
    id: 'removedor',
    name: 'REMOVEDOR',
    line: 'automotriz',

    description:
      'El removedor de pintura Tonner consiste en una suspensión parafinada de solventes activos de muy alto poder de disolución y agentes removedores especiales.',

    uses: [
      'Remover pinturas',
      'Remover barnices',
      'Remover lacas',
      'Aplicación sobre todo tipo de superficies',
    ],

    segment: 'Segmento Nitro (Pasta)',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto rendimiento',
      'Alto poder de remoción',
      'Secado rápido',
      'Uso en ambientes interiores y exteriores',
      'Fácil aplicación',
      'Producto económico',
    ],

    colors: [{ name: 'Removedor', code: 'TO-800' }],

    image: '/products/removedor.png',
  },
  {
    id: 'laca-acrilica',
    name: 'LACA ACRÍLICA',
    line: 'automotriz',

    description:
      'Producto elaborado con resina acrílica y materias primas de óptima calidad. Tiene excelente retención de color y brillo, buena resistencia a la intemperie y alto rendimiento con menor número de manos de aplicación.',

    uses: [
      'Repinte de automóviles',
      'Repinte de camiones',
      'Repinte de motocicletas',
      'Repinte de bicicletas',
      'Industria metalmecánica',
    ],

    segment: 'Segmento Acrílico',

    presentations: ['Galón'],

    characteristics: [
      'Excelente acabado',
      'Acabado brillante',
      'Alto cubrimiento',
      'Excelente retención del color',
      'Alto rendimiento',
      'Secado rápido',
      'Alta durabilidad',
      'Alta dureza',
      'Diluible con TH-600',
    ],

    colors: [
      { name: 'Transparente', code: 'LA-600' },
      { name: 'Blanco', code: 'LA-601', hex: '#ffffff' },
      { name: 'Amarillo medio', code: 'LA-603', hex: '#ffcd05' },
      { name: 'Rojo escarlata', code: 'LA-607', hex: '#ee1010' },
      { name: 'Rojo permanente', code: 'LA-608', hex: '#931a1d' },
      { name: 'Marrón índigo', code: 'LA-611', hex: '#44101b' },
      { name: 'Azul Tonner', code: 'LA-613', hex: '#0d1023' },
      { name: 'Verde Tonner', code: 'LA-620', hex: '#163d1d' },
      { name: 'Siena dorado', code: 'LA-629', hex: '#f8c87c' },
      { name: 'Negro para entremezclas', code: 'LA-630', hex: '#262626' },
      { name: 'Aluminio grano fino', code: 'LA-631', hex: '#c0c0c0' },
      { name: 'Aluminio grano grueso', code: 'LA-632', hex: '#aeaeae' },
      { name: 'Amarillo dorado', code: 'LA-639', hex: '#f9ce1d' },
    ],

    image: '/products/laca-acrilica.png',
  },
  {
    id: 'fondo-acrilico',
    name: 'FONDO ACRÍLICO',
    line: 'automotriz',

    description:
      'Formulada con materias primas de óptima calidad. Producto de gran desempeño, rápido secamiento y fácil aplicación, excelente lijabilidad y rendimiento. Provee sobre la superficie una muy buena adherencia de la laca de acabado final.',

    uses: [
      'Repinte de automóviles',
      'Repinte de camiones',
      'Repinte de motocicletas',
      'Repinte de bicicletas',
      'Industria metalmecánica',
    ],

    segment: 'Segmento Acrílico (Base)',

    presentations: ['Galón'],

    characteristics: [
      'Alto cubrimiento',
      'Excelente lijabilidad',
      'Secado rápido',
      'Excelente adherencia',
      'Alto rendimiento',
      'Alta durabilidad',
      'Alta dureza',
      'Libre de plomo y cromo',
    ],

    colors: [{ name: 'Gris claro', code: 'FA-677', hex: '#d8dbe4' }],

    image: '/products/fondo-acrilico.png',
  },
  {
    id: 'masilla-acrilica',
    name: 'MASILLA ACRÍLICA',
    line: 'automotriz',

    description:
      'Producto de gran desempeño, rápido secamiento y fácil aplicación, no se desprende ni se agrieta, excelente lijabilidad y rendimiento. Excelente poder de relleno, resistencia al cuarteo y al rechupe.',

    uses: [
      'Rellenar imperfecciones',
      'Corregir rayones',
      'Corregir desniveles',
      'Corregir abolladuras no profundas',
      'Superficies metálicas',
      'Superficies de madera',
    ],

    segment: 'Segmento Acrílico (Masilla)',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto cubrimiento',
      'Excelente lijabilidad',
      'Secado rápido',
      'Excelente adherencia',
      'Alto rendimiento',
      'Alta durabilidad',
      'Alta dureza',
      'Libre de plomo y cromo',
    ],

    colors: [{ name: 'Rojo', code: 'MA-626', hex: '#ba2025' }],

    image: '/products/masilla-acrilica.png',
  },
  {
    id: 'poliuretano',
    name: 'POLIURETANO',
    line: 'automotriz',

    description:
      'Producto de acabado de sistema poliuretano, de gran desempeño, alto cubrimiento, muy buen secado, alto contenido de sólidos, excelente nivelación, muy buena durabilidad y alta resistencia química y mecánica.',

    uses: [
      'Repintado de automóviles',
      'Sistema poliuretano de dos componentes',
      'Aplicaciones automotrices de alto brillo',
    ],

    segment: 'Segmento Poliuretano (Acabado)',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto cubrimiento',
      'Uso en ambientes interiores y exteriores',
      'Secado rápido',
      'Acabado brillante',
      'Alto rendimiento',
      'Excelente adherencia',
      'Excelente retención del color',
      'Alta durabilidad',
      'Diluible con TH-700',
    ],

    colors: [
      { name: 'Barniz Transparente', code: 'PU-700' },
      { name: 'Blanco', code: 'PU-701', hex: '#ffffff' },
      { name: 'Amarillo claro', code: 'PU-702', hex: '#f9ff0d' },
      { name: 'Amarillo medio', code: 'PU-703', hex: '#ffcd05' },
      { name: 'Rojo escarlata', code: 'PU-705', hex: '#ee1010' },
      { name: 'Naranja', code: 'PU-706', hex: '#fe7900' },
      { name: 'Magenta', code: 'PU-710', hex: '#861859' },
      { name: 'Marrón índigo', code: 'PU-711' },
      { name: 'Azul Tonner', code: 'PU-713', hex: '#0d1023' },
      { name: 'Verde Tonner', code: 'PU-720', hex: '#163d1d' },
      { name: 'Ocre', code: 'PU-721', hex: '#d49946' },
      { name: 'Negro', code: 'PU-730', hex: '#000000' },
      { name: 'Aluminio fino', code: 'PU-731', hex: '#c0c0c0' },
      { name: 'Aluminio medio', code: 'PU-732', hex: '#b6b6b6' },
      { name: 'Amarillo limón', code: 'PU-752', hex: '#ffff00' },
      { name: 'Violeta azuloso', code: 'PU-761', hex: '#594e9d' },
      { name: 'Gold Tonner', code: 'PU-779', hex: '#dcbd7a' },
      { name: 'Rojo Ferrari', code: 'PU-798', hex: '#cc0000' },
    ],

    image: '/products/poliuretano.png',
  },
  {
    id: 'fondo-poliuretano-2k',
    name: 'FONDO POLIURETANO 2K',
    line: 'automotriz',

    description:
      'Producto de gran desempeño, rápido secamiento, alto contenido de sólidos, muy buen poder de relleno y excelente lijabilidad. Tres productos en uno: fondo, relleno y aislador de sistemas.',

    uses: [
      'Aplicación directa sobre metal',
      'Fondo relleno',
      'Sellador de superficie',
      'Aislador de sistemas',
      'Aplicación en madera MDF y aglomerados',
    ],

    segment: 'Segmento Poliuretano (Base)',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto cubrimiento',
      'Excelente lijabilidad',
      'Secado rápido',
      'Excelente adherencia',
      'Alto rendimiento',
      'Alta capacidad de relleno',
      'Alta dureza',
      'Alta durabilidad',
      'Diluible con TH-500',
    ],

    colors: [
      { name: 'Blanco', code: 'FP-501', hex: '#ffffff' },
      { name: 'Gris', code: 'FP-527', hex: '#6e7b8e' },
      { name: 'Negro', code: 'FP-530', hex: '#000000' },
    ],

    image: '/products/fondo-poliuretano-2k.png',
  },
  {
    id: 'primer-monocomponente',
    name: 'PRIMER MONOCOMPONENTE',
    line: 'automotriz',

    description:
      'Formulado con materias primas de óptima calidad como resinas, pigmentos, disolventes y aditivos seleccionados. Prepara la superficie para un excelente acabado.',

    uses: [
      'Repintado automotriz',
      'Repintado de camiones',
      'Repintado de motocicletas',
      'Repintado de bicicletas',
      'Industria metalmecánica',
    ],

    segment: 'Segmento Poliuretano (Base)',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto cubrimiento',
      'Excelente lijabilidad',
      'Secado rápido',
      'Excelente acabado',
      'Alto rendimiento',
      'Alta capacidad de relleno',
      'Alta dureza',
      'Libre de plomo y cromatos',
      'Diluible con TH-100',
    ],

    colors: [
      { name: 'Blanco', code: 'MC-501', hex: '#ffffff' },
      { name: 'Amarillo', code: 'MC-503', hex: '#ffcc00' },
      { name: 'Gris', code: 'MC-527', hex: '#6e7b8e' },
      { name: 'Negro', code: 'MC-530', hex: '#000000' },
    ],

    image: '/products/primer-monocomponente.png',
  },
  {
    id: 'monocomponente-acrilico',
    name: 'Monocomponente Acrílico',
    line: 'automotriz',

    description:
      'Primer o fondo para secado al aire de un componente formulado con resinas acrílicas de alta calidad. Excelente adherencia y buen aspecto al acabado final.',

    uses: [
      'Superficies metálicas ferrosas',
      'Repinte automotriz',
      'Base para colores claros',
      'Retoques puntuales',
    ],

    segment: 'Segmento Poliuretano (Base)',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Excelente adherencia',
      'Buen acabado final',
      'Buena flexibilidad',
      'Resistente a impactos',
      'Buena cobertura',
      'Excelente lijabilidad',
      'Secado rápido',
    ],

    colors: [
      { name: 'Blanco', code: 'FM-801', hex: '#ffffff' },
      { name: 'Gris', code: 'FM-810', hex: '#a9acb5' },
      { name: 'Negro', code: 'FM-830', hex: '#000000' },
    ],

    image: '/products/mono-componente-acrilico.png',
  },
  {
    id: 'masilla-rapida',
    name: 'Masilla Rápida',
    line: 'automotriz',

    description:
      'Producto de gran desempeño, secado extra rápido y fácil aplicación. Excelente poder de relleno y adherencia.',

    uses: [
      'Rellenar imperfecciones',
      'Corregir rayones',
      'Corregir desniveles',
      'Corregir abolladuras',
    ],

    segment: 'Segmento Poliuretano (Masilla)',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto cubrimiento',
      'Excelente lijabilidad',
      'Secado rápido',
      'Excelente adherencia',
      'Alto rendimiento',
      'Alta capacidad de relleno',
      'Alta durabilidad',
      'Alta dureza',
    ],

    colors: [
      { name: 'Verde', code: 'MP-717', hex: '#53c2b5' },
      { name: 'Roja', code: 'MP-726', hex: '#9c1c1f' },
    ],

    image: '/products/masilla-rapida.png',
  },
  {
    id: 'endurecedor-poliuretano',
    name: 'ENDURECEDOR POLIURETANO',
    line: 'automotriz',

    description:
      'Es un producto elaborado con isocianatos de tipo alifático y solventes de excelente calidad. ENDURECEDOR POLIURETANO TONNER (PU-800) promueve la reacción de curado cuando se mezcla con Poliuretano de colores y Barniz Poliuretano Tonner. ENDURECEDOR POLIURETANO TONNER (PU-810) promueve la reacción de curado cuando se mezcla con Fondo Poliuretano 2K Tonner.',

    uses: [
      'Repintado de automóviles',
      'Sistema poliuretano de dos componentes',
      'Mezcla con poliuretano de colores',
      'Mezcla con barniz poliuretano',
      'Mezcla con fondo poliuretano 2K',
    ],

    segment: 'Segmento Poliuretano (Endurecedor)',

    presentations: ['Galón', 'Cuarto de galón', 'Dieciseisavo de galón'],

    characteristics: [
      'Promueve la reacción de curado',
      'Alta compatibilidad con sistemas poliuretano',
      'Excelente calidad de solventes',
    ],

    colors: [
      { name: 'Endurecedor Poliuretano', code: 'PU-800' },
      { name: 'Endurecedor Fondo 2K', code: 'PU-810' },
    ],

    image: '/products/endurecedor-poliuretano.png',
  },
  {
    id: 'poliester',
    name: 'Poliéster',
    line: 'automotriz',

    description:
      'Producto elaborado con resina poliéster y materias primas de óptima calidad, excelente acabado, rápido secado al aire, alta dureza, excelente adherencia sobre fondos PUR o epóxico, excelente flexibilidad, alta resistencia al exterior, no amarillenta y excelente retención del color.',

    uses: [
      'Repintado de automóviles',
      'Sistemas bicapa y tricapa',
      'Bases de color plano',
      'Bases de efecto perlado o metalizado',
      'Sistema Basecoat / Clearcoat',
    ],

    segment: 'Segmento Poliéster',

    presentations: ['Tambor', 'Galón'],

    characteristics: [
      'Alto cubrimiento',
      'Uso en ambientes interiores y exteriores',
      'Secado rápido',
      'Acabado brillante',
      'Alto rendimiento',
      'Excelente adherencia',
      'Excelente retención del color',
      'Alta durabilidad',
      'Diluible con TH-700',
    ],

    colors: [
      { name: 'Transparente', code: 'PE-800' },
      { name: 'Amarillo limón', code: 'PE-802', hex: '#ffff00' },
      { name: 'Amarillo medio', code: 'PE-804', hex: '#ffcd05' },
      { name: 'Rojo Ferrari', code: 'PE-805', hex: '#cc0000' },
      { name: 'Magenta limpio', code: 'PE-810', hex: '#a01c6b' },
      { name: 'Violeta rojizo', code: 'PE-811', hex: '#930153' },
      { name: 'Azul entonador', code: 'PE-813', hex: '#0d1023' },
      { name: 'Rojo limpio', code: 'PE-825', hex: '#e70408' },
      { name: 'Negro', code: 'PE-830', hex: '#000000' },
      { name: 'Aluminio fino', code: 'PE-831', hex: '#c0c0c0' },
      { name: 'Blanco', code: 'PE-851', hex: '#fefff7' },
      { name: 'Negro mezcla azuloso', code: 'PE-860', hex: '#262626' },
      { name: 'Negro intenso alto Jetn', code: 'PE-880', hex: '#1d1d1b' },
      { name: 'Aluminio brillante fino', code: 'PE-891', hex: '#cbcbcb' },
      { name: 'Aluminio brillante medio', code: 'PE-892', hex: '#c4c4c4' },
      { name: 'Aluminio brillante grueso', code: 'PE-893', hex: '#b8b8b8' },
      { name: 'Aluminio lenticular fino', code: 'PE-896', hex: '#c2c2c2' },
      { name: 'Aluminio lenticular medio', code: 'PE-897', hex: '#b2b2b2' },
    ],

    image: '/products/polieston.png',
  },
];
