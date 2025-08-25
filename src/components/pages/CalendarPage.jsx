import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const CalendarPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mb-6">
            <ApperIcon name="Calendar" size={32} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Calendar View</h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            Calendar-style task visualization will be available here. View your tasks organized by dates and deadlines.
          </p>
          
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-6 text-center">
            <p className="text-sm text-primary-700">
              <span className="font-medium">Coming Soon:</span> Monthly and weekly calendar views with drag-and-drop task scheduling.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CalendarPage