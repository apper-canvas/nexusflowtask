import { motion } from "framer-motion"

const Loading = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 animate-pulse" />
        </div>
        <div className="h-10 bg-gradient-to-r from-primary-200 to-primary-300 rounded-lg w-24 animate-pulse" />
      </div>
      
      {/* Task items skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 animate-pulse" />
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16 animate-pulse" />
                </div>
                
                <div className="flex items-center gap-4 mt-2 ml-7">
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 animate-pulse" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 animate-pulse" />
                </div>
              </div>
              
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Loading