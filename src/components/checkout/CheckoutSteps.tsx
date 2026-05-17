/**
 * CheckoutSteps — step progress indicator for checkout flow.
 * Shows current, completed, and upcoming steps with numbered circles.
 */
interface CheckoutStep {
  label: string
  status: 'completed' | 'active' | 'upcoming'
}

interface CheckoutStepsProps {
  steps?: CheckoutStep[]
  currentStep: number
}

const defaultSteps: CheckoutStep[] = [
  { label: 'Carrinho', status: 'completed' },
  { label: 'Pagamento', status: 'active' },
  { label: 'Confirmação', status: 'upcoming' },
]

export default function CheckoutSteps({
  steps = defaultSteps,
  currentStep,
}: CheckoutStepsProps) {
  const resolvedSteps = steps.map((step, index) => ({
    ...step,
    status: index < currentStep ? 'completed' : index === currentStep ? 'active' : 'upcoming',
  }))

  return (
    <div className="flex items-center gap-4 mb-8">
      {resolvedSteps.map((step, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 text-sm ${
            step.status === 'completed'
              ? 'text-success'
              : step.status === 'active'
              ? 'text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
              step.status === 'completed'
                ? 'bg-success text-white'
                : step.status === 'active'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {step.status === 'completed' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </span>
          <span className="font-medium hidden sm:inline">{step.label}</span>
        </div>
      ))}
    </div>
  )
}
