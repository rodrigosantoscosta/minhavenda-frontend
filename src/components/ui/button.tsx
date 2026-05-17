import * as React from "react"
import { type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { FiLoader } from "react-icons/fi"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans font-medium rounded-xl transition-[background-color,color,box-shadow,transform,opacity] duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 focus:ring-ring/50 shadow-card hover:shadow-card-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90 focus:ring-ring/50 shadow-card hover:shadow-card-hover",
        outline:
          "bg-transparent border-2 border-primary text-primary hover:bg-muted active:bg-muted/80 focus:ring-ring/50",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 focus:ring-destructive/50 shadow-card hover:shadow-card-hover",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 focus:ring-ring/50",
        white:
          "bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-400/50 shadow-card hover:shadow-card-hover",
        success:
          "bg-success text-success-foreground hover:bg-success/90 active:bg-success/80 focus:ring-success/50 shadow-card hover:shadow-card-hover",
      },
      size: {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-5 py-2.5 text-base gap-2",
      },
      fullWidth: {
        true: "w-full",
      },
      static: {
        true: "",
        false: "active:scale-[0.96]",
      },
    },
    compoundVariants: [
      {
        static: false,
        className: "active:scale-[0.96]",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      static: false,
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      static: isStatic,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            static: isStatic,
          }),
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <FiLoader className="w-4 h-4 animate-spin shrink-0" />}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }