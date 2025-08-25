import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Error = ({ 
  message = "Something went wrong", 
  onRetry, 
  title = "Oops!",
  details
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name="AlertCircle" size={32} className="text-white" />
</div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      
      {details && (
        <details className="mb-6 max-w-md">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Show technical details
          </summary>
          <pre className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
          </pre>
        </details>
      )}
      
      {onRetry && (
        <Button onClick={onRetry} className="flex items-center gap-2">
          <ApperIcon name="RefreshCw" size={16} />
          Try Again
        </Button>
      )}
    </motion.div>
  )
}

export default Error