/**
 * HeroSection — gradient hero with headline, subtitle, and dual CTAs.
 * Content is dynamic: fetched from backend or configured via props.
 */
interface HeroSectionProps {
  title: string
  subtitle: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export default function HeroSection({
  title,
  subtitle,
  primaryCta = { label: 'Ver Produtos', href: '/produtos' },
  secondaryCta = { label: 'Saiba Mais', href: '/sobre' },
}: HeroSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-secondary to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground tracking-tight text-balance animate-fadeInUp">
            {title}
          </h1>
          <p
            className="font-sans text-lg text-muted-foreground mt-4 text-balance animate-fadeInUp"
            style={{ animationDelay: '80ms' }}
          >
            {subtitle}
          </p>
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center mt-8 animate-fadeInUp"
            style={{ animationDelay: '160ms' }}
          >
            {primaryCta && (
              <a
                href={primaryCta.href}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-sans font-medium text-base hover:bg-primary/90 transition-colors duration-150 active:scale-[0.98] shadow-card"
              >
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-primary text-foreground rounded-lg font-sans font-medium text-base hover:bg-muted transition-colors duration-150 active:scale-[0.98]"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
