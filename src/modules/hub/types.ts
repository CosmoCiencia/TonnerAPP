export type HubView = 'home' | 'work' | 'favorites' | 'calculator' | 'profile'

export type ProfilePanel = 'distributor' | 'data' | 'preferences' | 'terms' | 'support'

export type HubProfileDraft = {
  fullName: string
  email: string
  phone: string
  city: string
  avatar: string
}

export type HubCard = {
  key: string
  title: string
  image: string
  variant: 'portfolio' | 'paint' | 'stores' | 'cup'
}
