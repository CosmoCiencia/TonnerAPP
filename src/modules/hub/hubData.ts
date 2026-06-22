import type { HubCard, HubView, ProfilePanel } from './types'

export const hubCards: HubCard[] = [
  {
    key: 'portfolio',
    title: 'PORTAFOLIO',
    image: '/hub/portafolio.webp',
    variant: 'portfolio',
  },
  {
    key: 'cup',
    title: 'POLLA TONNER',
    image: '/cup/fondo-pollatonner-grupos.webp',
    variant: 'cup',
  },
  {
    key: 'stores',
    title: 'PUNTOS DE VENTA',
    image: '/hub/puntos-de-venta.webp',
    variant: 'stores',
  },
  {
    key: 'paint',
    title: 'TONNER PAINT',
    image: '/hub/tonner-paint.webp',
    variant: 'paint',
  },
]

export const favoriteCards = hubCards.filter((card) => card.key === 'portfolio' || card.key === 'paint')

export const navItems = [
  { label: 'Inicio', icon: '/icons/INICIO.png', view: 'home' },
  { label: 'Trabajo', icon: '/icons/TRABAJO.png', view: 'work' },
  { label: 'Favoritos', icon: '/icons/FAVORITOS.png', view: 'favorites' },
  { label: 'Calculadora', icon: '/icons/CALCULADORA.png', view: 'calculator' },
  { label: 'Perfil', icon: '/icons/PERFIL.png', view: 'profile' },
] satisfies Array<{
  label: string
  icon: string
  view: HubView
}>

export const profileOptions: Array<{ label: string; panel: ProfilePanel }> = [
  { label: 'Actualizar datos y foto', panel: 'data' },
  { label: 'Términos y Condiciones', panel: 'terms' },
  { label: 'Preferencias', panel: 'preferences' },
  { label: 'Atención al Cliente', panel: 'support' },
]
