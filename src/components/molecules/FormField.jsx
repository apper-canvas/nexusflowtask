import Label from "@/components/atoms/Label"
import { cn } from "@/utils/cn"

const FormField = ({ label, children, error, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FormField