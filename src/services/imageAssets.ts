const optimizedImagePrefixes = [
  '/products/',
  '/line-banners/',
  '/PORTAFOLIO.png',
  '/TONNER PAINT.png',
  '/PUNTOS DE VENTA.png',
  '/PORTADA CARGA.png',
  '/FONDO POLLATONNER GRUPOS.png',
  '/tonnercup-copa.png',
  '/logo.png',
]

export function getOptimizedImageSrc(src: string) {
  const canUseWebp = optimizedImagePrefixes.some((prefix) => src.startsWith(prefix))

  if (!canUseWebp || !src.toLowerCase().endsWith('.png')) {
    return src
  }

  return src.replace(/\.png$/i, '.webp')
}
