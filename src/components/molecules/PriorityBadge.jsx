import { cn } from "@/utils/cn"

const PriorityBadge = ({ priority, className }) => {
  const priorityStyles = {
    Low: "bg-green-100 text-green-700 border border-green-200",
    Medium: "bg-yellow-100 text-yellow-700 border border-yellow-200", 
    High: "bg-red-100 text-red-700 border border-red-200"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all",
        priorityStyles[priority] || priorityStyles.Low,
        className
      )}
    >
      {priority}
    </span>
  )
}

export default PriorityBadge