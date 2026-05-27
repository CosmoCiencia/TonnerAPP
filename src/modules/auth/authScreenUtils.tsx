import type { ReactNode } from 'react'

import { getOptimizedImageSrc } from '../../services/imageAssets'

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <main className="auth-screen">
      <section className="auth-device">
        <header className="auth-header">
          <img src={getOptimizedImageSrc('/brand/logo.webp')} alt="Pinturas Tonner" decoding="async" />
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </section>
    </main>
  )
}
