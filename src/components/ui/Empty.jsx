import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  title = "No data found", 
  description = "There's nothing here yet.", 
  actionLabel,
  onAction,
  icon = "Inbox"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} size={32} className="text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}

export default Empty