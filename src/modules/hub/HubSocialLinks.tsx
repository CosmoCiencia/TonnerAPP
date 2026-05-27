const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/pinturastonner',
    variant: 'instagram',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/search?q=pinturas%20tonner',
    variant: 'tiktok',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/people/Pinturas-Tonner/100063534484222/',
    variant: 'facebook',
  },
] as const

function SocialIcon({ variant }: { variant: (typeof socialLinks)[number]['variant'] }) {
  if (variant === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.35" />
        <circle cx="17.1" cy="6.9" r="1" />
      </svg>
    )
  }

  if (variant === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14.2 8.1h2.1V4.6c-.36-.05-1.6-.16-3.05-.16-3.02 0-5.1 1.85-5.1 5.25v2.95H4.75v3.92h3.4v7h4.18v-7h3.28l.52-3.92h-3.8V10.1c0-1.13.31-2 1.87-2Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.35 3.5c.34 2.7 1.86 4.3 4.52 4.48v3.08a7.53 7.53 0 0 1-4.48-1.34v6.62c0 3.35-2.05 5.72-5.17 5.72-2.94 0-5.09-2.08-5.09-4.86 0-2.95 2.3-5.05 5.63-4.84v3.23c-1.38-.18-2.43.48-2.43 1.55 0 .98.82 1.65 1.88 1.65 1.15 0 1.91-.7 1.91-2.4V3.5h3.23Z" />
    </svg>
  )
}

export default function HubSocialLinks() {
  return (
    <nav className="hub-social-links" aria-label="Redes sociales Tonner">
      {socialLinks.map((social) => (
        <a
          key={social.label}
          className={`hub-social-link hub-social-link--${social.variant}`}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Abrir ${social.label}`}
        >
          <SocialIcon variant={social.variant} />
          <span>{social.label}</span>
        </a>
      ))}
    </nav>
  )
}
