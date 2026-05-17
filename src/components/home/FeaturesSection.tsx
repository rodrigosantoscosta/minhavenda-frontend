/**
 * FeaturesSection — 4-column feature cards with icons.
 * Configurable via props so content can be fetched from backend.
 */
import { FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi'

export interface Feature {
  icon: 'truck' | 'shield' | 'refresh' | 'headphones' | string
  title: string
  description: string
}

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  truck: FiTruck,
  shield: FiShield,
  refresh: FiRefreshCw,
  headphones: FiHeadphones,
}

interface FeaturesSectionProps {
  title?: string
  subtitle?: string
  features?: Feature[]
}

const defaultFeatures: Feature[] = [
  {
    icon: 'truck',
    title: 'Entrega Rápida',
    description: 'Receba seus produtos em até 2 dias úteis para capitais e regiões metropolitanas.',
  },
  {
    icon: 'shield',
    title: 'Compra Segura',
    description: 'Pagamentos protegidos com criptografia de ponta a ponta e garantia de reembolso.',
  },
  {
    icon: 'refresh',
    title: 'Troca Fácil',
    description: '30 dias para trocar ou devolver qualquer produto sem burocracia.',
  },
  {
    icon: 'headphones',
    title: 'Suporte 24/7',
    description: 'Atendimento humanizado disponível a qualquer hora via chat, email ou telefone.',
  },
]

export default function FeaturesSection({
  title = 'Por que escolher a MinhaVenda?',
  subtitle = 'Benefícios exclusivos para nossos clientes',
  features = defaultFeatures,
}: FeaturesSectionProps) {
  return (
    <section className="py-10 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-display font-semibold text-xl text-foreground">{title}</h2>
          {subtitle && (
            <p className="font-sans text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || FiTruck
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-card border border-border animate-fadeInUp"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-secondary rounded-lg text-foreground">
                  <Icon size={24} />
                </div>
                <h3 className="font-sans font-semibold text-sm text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
