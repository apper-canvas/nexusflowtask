import { cn } from "@/utils/cn"

const CategoryBadge = ({ category, className, showCount = false, taskCount = 0 }) => {
  if (!category) return null

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all border",
        className
      )}
style={{
        backgroundColor: `${category.color_c}15`,
        borderColor: `${category.color_c}40`,
        color: category.color_c
      }}
    >
      {category.Name}
      {showCount && <span className="ml-1">({taskCount})</span>}
    </span>
  )
}

export default CategoryBadge