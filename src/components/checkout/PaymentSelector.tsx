/**
 * PaymentSelector — payment method card selector (Cartão/PIX/Boleto).
 * Only these 3 methods as specified.
 */
import { FiCreditCard, FiDollarSign, FiFileText } from 'react-icons/fi'

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO'

interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

const methods: { id: PaymentMethod; label: string; sublabel: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'PIX', label: 'PIX', sublabel: 'à vista', Icon: FiDollarSign },
  { id: 'CREDIT_CARD', label: 'Cartão', sublabel: 'parcelado', Icon: FiCreditCard },
  { id: 'BOLETO', label: 'Boleto', sublabel: 'à vista', Icon: FiFileText },
]

export default function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {methods.map(({ id, label, sublabel, Icon }) => (
        <label
          key={id}
          className={`relative cursor-pointer rounded-xl border-2 p-4 text-center transition-[border-color,background-color,color] duration-150 ${
            value === id
              ? 'border-primary bg-secondary text-foreground'
              : 'border-border hover:border-ring/50 text-muted-foreground'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={id}
            checked={value === id}
            onChange={() => onChange(id)}
            className="sr-only"
          />
          <div className="flex flex-col items-center">
            <Icon size={24} />
            <span className="font-sans font-medium text-sm mt-2">{label}</span>
            <span className="text-xs text-muted-foreground">{sublabel}</span>
          </div>
        </label>
      ))}
    </div>
  )
}
