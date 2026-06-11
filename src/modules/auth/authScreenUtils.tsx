import type { ReactNode } from 'react'

import { getOptimizedImageSrc } from '../../services/imageAssets'

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  showHeaderLogo = true,
}: {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
  showHeaderLogo?: boolean
}) {
  return (
    <main className="auth-screen">
      <section className="auth-device">
        <header className="auth-header">
          {showHeaderLogo ? (
            <img src={getOptimizedImageSrc('/brand/logo.webp')} alt="Pinturas Tonner" decoding="async" />
          ) : null}
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </header>
        {children}
      </section>
    </main>
  )
}
