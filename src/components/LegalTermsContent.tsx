import { legalTermSections, legalTermsSummary } from '../content/legalTerms'

export default function LegalTermsContent() {
  return (
    <div className="tonner-legal-content">
      <dl className="tonner-legal-summary">
        <div>
          <dt>Razón social</dt>
          <dd>{legalTermsSummary.company}</dd>
        </div>
        <div>
          <dt>NIT</dt>
          <dd>{legalTermsSummary.nit}</dd>
        </div>
        <div>
          <dt>Vigencia</dt>
          <dd>{legalTermsSummary.effectiveDate}</dd>
        </div>
        <div>
          <dt>Contacto</dt>
          <dd>{legalTermsSummary.contact}</dd>
        </div>
      </dl>

      {legalTermSections.map((section) => (
        <section key={section.title} className="tonner-legal-section">
          <h2>{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  )
}
