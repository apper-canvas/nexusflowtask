import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    default: "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl active:scale-95",
    secondary: "bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 shadow-sm hover:shadow-md",
    ghost: "text-primary-600 hover:text-primary-700 hover:bg-primary-50",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl active:scale-95"
  }
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg"
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button