import type { Product } from '../types';

export const ARQUITECTONICA_PRODUCTS: Product[] = [
  {
    id: 'tonertex',
    name: 'TONERTEX',
    line: 'arquitectonica',

    description:
      'Pintura vinil-acrílica diluible con agua de acabado mate, alto cubrimiento, resistencia a la intemperie y excelente lavabilidad con una amplia gama de colores: blancos, colores pasteles y concentrados.',

    uses: [
      'Superficies interiores',
      'Superficies exteriores',
      'Superficies de madera',
      'Superficies de cemento',
      'Superficies de asbesto-cemento',
    ],

    segment: 'Vinilos',

    presentations: ['Cuñete de 5 galones', 'Balde 2.5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Uso en ambientes interior y exterior',
      'Alta resistencia a la intemperie',
      'Acabado mate',
      'Alto rendimiento',
      'Alto cubrimiento',
      'Excelente retención de color',
      'Bajo contenido de VOC',
      'Bajo salpique',
      'Diluible con agua',
    ],

    colors: [
      { name: 'Blanco super lavable', code: 'VI-101', hex: '#ffffff' },
      { name: 'Gris basalto', code: 'VI-110', hex: '#4e5754' },
      { name: 'Blanco arena', code: 'VI-111', hex: '#fffff9' },
      { name: 'Blanco hueso', code: 'VI-112', hex: '#feffe0' },
      { name: 'Mandarina', code: 'VI-706', hex: '#fb813b' },
      { name: 'Azul milano', code: 'VI-717', hex: '#627fdc' },
      { name: 'Verde primaveral', code: 'VI-770', hex: '#67ce04' },

      { name: 'Blanco', code: 'VI-1501', hex: '#ffffff' },
      { name: 'Blanco almendra', code: 'VI-154', hex: '#f6f6c6' },
      { name: 'Blanco hueso', code: 'VI-162', hex: '#feffe0' },

      { name: 'Amarillo', code: 'VI-703', hex: '#ffff00' },
      { name: 'Rojo', code: 'VI-705', hex: '#f41000' },
      { name: 'Magenta', code: 'VI-710', hex: '#c41e78' },
      { name: 'Violeta', code: 'VI-711', hex: '#8000ff' },
      { name: 'Azul mediterráneo', code: 'VI-713', hex: '#13308a' },
      { name: 'Verde pino', code: 'VI-719', hex: '#3c5a40' },
      { name: 'Verde oscuro', code: 'VI-720', hex: '#143e4a' },
      { name: 'Ocre', code: 'VI-721', hex: '#db841b' },
      { name: 'Rojo colonial', code: 'VI-723', hex: '#900d09' },
      { name: 'Negro', code: 'VI-730', hex: '#000000' },
      { name: 'Naranja', code: 'VI-766', hex: '#fa581a' },
    ],

    image: '/products/tonertex.png',
  },
  {
    id: 'vinilton',
    name: 'VINILTON',
    line: 'arquitectonica',

    description:
      'Pintura vinil-acrílica diluible con agua de acabado mate, muy buen cubrimiento y lavabilidad.',

    uses: [
      'Decoración de muros',
      'Superficies de madera',
      'Superficies de cemento',
      'Superficies de asbesto-cemento',
    ],

    segment: 'Vinilos',

    presentations: ['Cuñete de 5 galones', 'Balde 2.5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Uso en ambientes interior y exterior',
      'Acabado mate',
      'Alto cubrimiento',
      'Excelente retención de color',
      'Alto rendimiento',
      'Bajo contenido de VOC',
      'Bajo salpique',
      'Diluible con agua',
    ],

    colors: [
      { name: 'Blanco', code: 'VI-201', hex: '#ffffff' },
      { name: 'Crema claro', code: 'VI-203', hex: '#fbf9af' },
      { name: 'Blanco almendra', code: 'VI-204', hex: '#f4f7c1' },
      { name: 'Curuba', code: 'VI-205', hex: '#fdf8b9' },
      { name: 'Palo de rosa', code: 'VI-206', hex: '#eed9ad' },
      { name: 'Melon', code: 'VI-208', hex: '#fbf7bd' },
      { name: 'Champaña', code: 'VI-209', hex: '#faf4e9' },
      { name: 'Blanco hueso', code: 'VI-212', hex: '#f7f5ce' },
      { name: 'Azul cielo', code: 'VI-215', hex: '#c6def3' },
      { name: 'Verde porcelana', code: 'VI-216', hex: '#cae7cb' },
      { name: 'Verde ceda', code: 'VI-217', hex: '#d5e6af' },
      { name: 'Lila', code: 'VI-223', hex: '#f4daf2' },
    ],

    image: '/products/vinilton.png',
  },
  {
    id: 'tonerama',
    name: 'TONERAMA',
    line: 'arquitectonica',

    description: 'Pintura vinílica diluible con agua de acabado mate y muy buen cubrimiento.',

    uses: [
      'Decoración de muros',
      'Superficies de madera',
      'Superficies de cemento',
      'Superficies de asbesto-cemento',
    ],

    segment: 'Vinilos',

    presentations: ['Cuñete de 5 galones', 'Balde 2.5 galones', 'Galón'],

    characteristics: [
      'Acabado mate',
      'Alto cubrimiento',
      'Excelente retención de color',
      'Alto rendimiento',
      'Bajo contenido de VOC',
      'Bajo salpique',
      'Diluible con agua',
    ],

    colors: [{ name: 'Blanco tipo 3', code: 'VI-301', hex: '#ffffff' }],

    image: '/products/tonerama.png',
  },
  {
    id: 'ultrarmor',
    name: 'Ultra Armor',
    line: 'arquitectonica',

    description:
      'Pintura 100% acrílica diluible con agua, de alto cubrimiento y muy alta durabilidad.',

    uses: ['Fachadas exteriores', 'Superficies expuestas a la intemperie'],

    segment: 'Acrílicos',

    presentations: ['Cuñete de 5 galones', 'Galón'],

    characteristics: [
      'Alta resistencia a la intemperie',
      'Alta durabilidad',
      'Alto cubrimiento',
      'Excelente retención de color',
      'Bajo contenido de VOC',
      'Diluible con agua',
    ],

    colors: [
      { name: 'Blanco', code: 'AC-101', hex: '#ffffff' },
      { name: 'Rojo vivo', code: 'AC-105', hex: '#fe0000' },
      { name: 'Azul profundo', code: 'AC-113', hex: '#020181' },
      { name: 'Verde amazonas', code: 'AC-120', hex: '#284f34' },
      { name: 'Amarillo tostado', code: 'AC-121', hex: '#edab1f' },
      { name: 'Rojo colonial', code: 'AC-123', hex: '#a1473c' },
      { name: 'Ladrillo', code: 'AC-125', hex: '#a06547' },
      { name: 'Negro', code: 'AC-130', hex: '#000000' },
    ],

    image: '/products/ultra-armor.png',
  },
  {
    id: 'permakrill',
    name: 'Permakill',
    line: 'arquitectonica',

    description:
      'Producto acrílico que evita la penetración de la humedad y filtraciones en cubiertas y terrazas.',

    uses: ['Cubiertas', 'Terrazas', 'Canaletas', 'Placas de concreto'],

    segment: 'Acrílicos',

    presentations: ['Cuñete de 5 galones', 'Balde 2.5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Alta resistencia a la intemperie',
      'Alta durabilidad',
      'Gran capacidad de adhesión',
    ],

    colors: [
      { name: 'Blanco', code: 'IP-801', hex: '#ffffff' },
      { name: 'Gris', code: 'IP-810', hex: '#a9acb5' },
    ],

    image: '/products/permakill.png',
  },
  {
    id: 'pintura-para-canchas',
    name: 'PINTURA PARA CANCHAS',
    line: 'arquitectonica',

    description:
      'Producto de excelente calidad elaborado a partir de resinas acrílicas base agua modificadas para ser utilizadas en interiores y exteriores. Alta resistencia al desgaste, a la abrasión y a la intemperie. Excelente durabilidad y acabado antideslizante.',

    uses: [
      'Canchas deportivas',
      'Escenarios deportivos',
      'Senderos peatonales',
      'Ciclo rutas',
      'Superficies de concreto',
      'Superficies de madera',
      'Superficies de asfalto',
    ],

    segment: 'Acrílicos',

    presentations: ['Cuñete de 5 galones', 'Galón'],

    characteristics: [
      'Antideslizante',
      'Alta resistencia a la intemperie',
      'Alta durabilidad',
      'Alto cubrimiento',
      'Uso en canchas cerradas o abiertas',
      'Excelente retención de color',
      'Alto rendimiento',
      'Bajo salpique',
      'Diluible con agua',
    ],

    colors: [
      { name: 'Blanco', code: 'PC-901', hex: '#ffffff' },
      { name: 'Amarillo', code: 'PC-903', hex: '#f0d900' },
      { name: 'Rojo', code: 'PC-905', hex: '#bd1818' },
      { name: 'Gris', code: 'PC-910', hex: '#c2c2c2' },
      { name: 'Azul', code: 'PC-913', hex: '#05519f' },
      { name: 'Verde', code: 'PC-919', hex: '#148e59' },
    ],

    image: '/products/pintura-para-canchas.png',
  },
  {
    id: 'banos-y-cocinas',
    name: 'BAÑOS Y COCINAS',
    line: 'arquitectonica',

    description:
      'Pintura elaborada con resinas acrílicas diluible con agua, de acabado semibrillante, alto cubrimiento y excelente lavabilidad. Alta resistencia a la humedad, vapor, grasa, manchas y formación de hongos.',

    uses: ['Paredes interiores', 'Techos de cocinas', 'Techos de baños', 'Áreas de ducha'],

    segment: 'Acrílicos',

    presentations: ['Galón'],

    characteristics: [
      'Alta resistencia a la humedad',
      'Resistencia a vapor y grasa',
      'Resistencia a manchas y hongos',
      'Alta durabilidad',
      'Alto cubrimiento',
      'Alto rendimiento',
      'Bajo salpique',
      'Diluible con agua',
    ],

    colors: [{ name: 'Blanco', code: 'BC-101', hex: '#ffffff' }],

    image: '/products/banos-y-cocinas.png',
  },
  {
    id: 'esmalte-acrilico',
    name: 'Esmalte Acrílico',
    line: 'arquitectonica',

    description:
      'Esmalte ecológico multisuperficie 100% acrílico diluible con agua para ambientes interiores y exteriores de acabado semibrillante.',

    uses: [
      'Metal',
      'Madera',
      'Concreto',
      'PVC',
      'Muebles',
      'Puertas',
      'Ventanas',
      'Superficies metálicas',
    ],

    segment: 'Acrílicos',

    presentations: ['Galón'],

    characteristics: [
      'Alta resistencia a la intemperie',
      'Buena flexibilidad',
      'Alta durabilidad',
      'Alto cubrimiento',
      'Uso en ambientes interior y exterior',
      'Alto rendimiento',
      'Bajo contenido de VOC',
      'Libre de plomo y cromo',
      'Diluible con agua',
    ],

    colors: [{ name: 'Blanco', code: 'AE-651', hex: '#ffffff' }],

    image: '/products/esmalte-acrilico.png',
  },
  {
    id: 'esmalton',
    name: 'ESMALTON',
    line: 'arquitectonica',

    description:
      'Producto de secamiento al aire elaborado con resinas alquídicas y pigmentos seleccionados, disponible en acabado brillante y mate.',

    uses: ['Muebles', 'Puertas', 'Paredes', 'Divisiones arquitectónicas', 'Superficies metálicas'],

    segment: 'Esmaltes',

    presentations: [
      'Cuñete de 5 galones',
      'Galón',
      'Cuarto de galón',
      'Octavo de galón',
      'Dieciseisavo de galón',
    ],

    characteristics: [
      'Alto cubrimiento',
      'Acabado brillante y mate',
      'Secado rápido',
      'Excelente acabado',
      'Excelente retención del color',
      'Alta durabilidad',
      'Excelente adherencia',
      'Diluible con varsol',
    ],

    colors: [
      { name: 'Blanco', code: 'ES-301', hex: '#ffffff' },
      { name: 'Amarillo claro', code: 'ES-302', hex: '#ffff00' },
      { name: 'Amarillo', code: 'ES-303', hex: '#fdcc00' },
      { name: 'Naranja', code: 'ES-304', hex: '#f03805' },
      { name: 'Rojo fiesta', code: 'ES-305', hex: '#b81602' },
      { name: 'Gris', code: 'ES-310', hex: '#81808c' },
      { name: 'Vinotinto', code: 'ES-311', hex: '#600705' },
      { name: 'Marfil', code: 'ES-312', hex: '#fde277' },
      { name: 'Azul real', code: 'ES-314', hex: '#00063a' },
    ],

    image: '/products/esmalton.png',
  },
  {
    id: 'special-xxi',
    name: 'Especial XXI',
    line: 'arquitectonica',

    description:
      'Producto de secamiento al aire elaborado con resinas alquídicas y pigmentos seleccionados, de acabado brillante y excelente durabilidad.',

    uses: [
      'Decoración de muebles',
      'Puertas',
      'Paredes',
      'Divisiones arquitectónicas',
      'Superficies metálicas',
    ],

    segment: 'Esmaltes',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Alto cubrimiento',
      'Acabado brillante',
      'Secado rápido',
      'Excelente acabado',
      'Excelente retención del color',
      'Alta durabilidad',
      'Excelente adherencia',
      'Diluible con varsol',
    ],

    colors: [
      { name: 'Blanco', code: 'ES-401', hex: '#ffffff' },
      { name: 'Amarillo', code: 'ES-403', hex: '#fdcc00' },
      { name: 'Naranja', code: 'ES-404', hex: '#f03805' },
      { name: 'Rojo', code: 'ES-405', hex: '#d80100' },
      { name: 'Mandarina', code: 'ES-406', hex: '#f28500' },
    ],

    image: '/products/especial-xxi.png',
  },
  {
    id: 'secado-flash-arquitectonica',
    name: 'Secado Flash',
    line: 'arquitectonica',

    description:
      'Producto elaborado con resinas alquídicas modificadas de excelente calidad y pigmentos de color seleccionados. Es de secamiento extra rápido, excelente brillo y durabilidad.',

    uses: [
      'Protección de objetos metálicos',
      'Puertas metálicas',
      'Ventanas metálicas',
      'Rejas',
      'Maquinaria industrial',
      'Estructuras metálicas',
      'Superficies metálicas en general',
    ],

    segment: 'Esmaltes',

    presentations: ['Galón', 'Cuarto de galón'],

    characteristics: [
      'Excelente adherencia',
      'Excelente retención del color',
      'Secado ultra rápido',
      'Uso en ambientes interiores y exteriores',
      'Alta durabilidad',
      'Diluible con xilol',
      'Excelente acabado',
      'Alto rendimiento',
      'Alto cubrimiento',
      'No compatible con esmaltes alquídicos o sintéticos',
    ],

    colors: [
      { name: 'Blanco', code: 'SF-501', hex: '#ffffff' },
      { name: 'Amarillo', code: 'SF-503', hex: '#fdcc00' },
      { name: 'Rojo', code: 'SF-505', hex: '#d80100' },
      { name: 'Azul Tonner', code: 'SF-513', hex: '#310070' },
      { name: 'Azul Español', code: 'SF-514', hex: '#07194d' },
      { name: 'Verde esmeralda', code: 'SF-516', hex: '#1b5422' },
      { name: 'Verde Tonner', code: 'SF-520', hex: '#009366' },
      { name: 'Analoc Champaña', code: 'SF-528', hex: '#867f5e' },
      { name: 'Gold Tonner', code: 'SF-529', hex: '#dcbd7a' },
      { name: 'Negro', code: 'SF-530', hex: '#000000' },
      { name: 'Aluminio', code: 'SF-531', hex: '#9fa2b0' },
      { name: 'Verde John D', code: 'SF-556', hex: '#1b8000' },
    ],

    image: '/products/secado-flash.png',
  },
  {
    id: 'esmalton-3-en-1',
    name: 'Esmalton 3 en 1',
    line: 'arquitectonica',

    description:
      'Producto de secamiento al aire elaborado con resinas alquídicas y pigmentos de color seleccionados, de acabado brillante, excelente calidad, flexibilidad, retención de color y alta durabilidad, con inhibidor de óxido y anticorrosivo. Está diseñado para acondicionar, proteger y decorar superficies en un solo paso.',

    uses: [
      'Decoración de muebles',
      'Puertas',
      'Paredes',
      'Divisiones arquitectónicas',
      'Superficies metálicas en general',
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
      'Diluible con varsol',
    ],

    colors: [
      { name: 'Blanco', code: 'ES-101', hex: '#ffffff' },
      { name: 'Amarillo', code: 'ES-103', hex: '#fdcc00' },
      { name: 'Rojo fiesta', code: 'ES-105', hex: '#b81602' },
      { name: 'Azul Español', code: 'ES-114', hex: '#07194d' },
      { name: 'Verde esmeralda', code: 'ES-116', hex: '#1b5422' },
      { name: 'Negro', code: 'ES-130', hex: '#000000' },
      { name: 'Aluminio', code: 'ES-131', hex: '#9fa2b0' },
    ],

    image: '/products/esmalton-3-en-1.png',
  },
  {
    id: 'pantonner',
    name: 'PANTONNER',
    line: 'arquitectonica',

    description:
      'Producto fabricado con resinas alquídicas y pigmentos de color seleccionados de acabado brillante, óptima flexibilidad, excelente retención de color y durabilidad. Pintura adecuada para uso en la industria y el hogar.',

    uses: [
      'Decoración de muebles',
      'Puertas',
      'Paredes',
      'Divisiones arquitectónicas',
      'Superficies metálicas en general',
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
      'Diluible con varsol',
    ],

    colors: [
      { name: 'Blanco', code: 'ES-801', hex: '#ffffff' },
      { name: 'Amarillo', code: 'ES-803', hex: '#fdcc00' },
      { name: 'Naranja', code: 'ES-804', hex: '#f03805' },
      { name: 'Rojo', code: 'ES-805', hex: '#d80100' },
      { name: 'Azul', code: 'ES-814', hex: '#05519f' },
      { name: 'Verde', code: 'ES-816', hex: '#148e59' },
      { name: 'Caoba', code: 'ES-827', hex: '#582405' },
      { name: 'Negro', code: 'ES-830', hex: '#000000' },
    ],

    image: '/products/pantonner.png',
  },
  {
    id: 'anticorrosivo-base-mate',
    name: 'ANTICORROSIVO BASE MATE',
    line: 'arquitectonica',

    description:
      'Producto elaborado con resinas alquídicas de excelente calidad y pigmentos anticorrosivos seleccionados. Formulado especialmente para la protección de superficies metálicas en ambientes interiores y exteriores.',

    uses: [
      'Estructuras de hierro y acero',
      'Marcos y puertas de hierro',
      'Tanques metálicos',
      'Tuberías',
      'Superficies metálicas en general',
    ],

    segment: 'ANTICORROSIVOS',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Uso en ambientes interiores y exteriores',
      'Acabado mate',
      'Secado rápido',
      'Excelente adherencia',
      'Inhibidor de óxido',
      'Alto rendimiento',
      'Excelente lijabilidad',
      'Diluible con varsol',
      'Buena flexibilidad',
    ],

    colors: [
      { name: 'Blanco', code: 'EA-201', hex: '#ffffff' },
      { name: 'Azul', code: 'EA-213', hex: '#0000ff' },
      { name: 'Verde', code: 'EA-217', hex: '#1e633f' },
      { name: 'Ocre', code: 'EA-221', hex: '#b18502' },
      { name: 'Rojo claro', code: 'EA-223', hex: '#9f360d' },
      { name: 'Rojo oscuro', code: 'EA-226', hex: '#9f2509' },
      { name: 'Gris', code: 'EA-227', hex: '#81808c' },
      { name: 'Negro chasis', code: 'EA-230', hex: '#2b0f04' },
      { name: 'Negro industrial', code: 'EA-280', hex: '#000000' },
    ],

    image: '/products/anticorrosivo-base-mate.png',
  },
  {
    id: 'anticorrosivo-2-en-1-satinado',
    name: '2 EN 1 ANTICORROSIVO SATINADO',
    line: 'arquitectonica',

    description:
      'Producto elaborado con resinas alquídicas de excelente calidad y pigmentos anticorrosivos seleccionados con acabado satinado. Formulado especialmente para la protección de superficies metálicas en ambientes interiores y exteriores.',

    uses: [
      'Estructuras de hierro y acero',
      'Marcos y puertas de hierro',
      'Tanques metálicos',
      'Tuberías',
      'Superficies metálicas en general',
    ],

    segment: 'ANTICORROSIVOS',

    presentations: ['Cuñete de 5 galones', 'Galón', 'Cuarto de galón'],

    characteristics: [
      'Uso en ambientes interiores y exteriores',
      'Acabado satinado',
      'Secado rápido',
      'Excelente adherencia',
      'Inhibidor de óxido',
      'Alto rendimiento',
      'Excelente lijabilidad',
      'Diluible con varsol',
      'Buena flexibilidad',
    ],

    colors: [
      { name: 'Negro', code: 'EA-290', hex: '#000000' },
      { name: 'Blanco', code: 'EA-291', hex: '#ffffff' },
      { name: 'Rojo', code: 'EA-293', hex: '#d21a18' },
      { name: 'Naranja', code: 'EA-294', hex: '#ff8201' },
      { name: 'Verde', code: 'EA-296', hex: '#24ac65' },
      { name: 'Gris', code: 'EA-297', hex: '#a5a3b5' },
      { name: 'Ocre', code: 'EA-299', hex: '#cc9800' },
    ],

    image: '/products/2-en-1-anticorrosivo-satinado.png',
  },
];
