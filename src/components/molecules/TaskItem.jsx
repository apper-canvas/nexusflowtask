import { motion } from "framer-motion"
import { format, isToday, isPast, isTomorrow } from "date-fns"
import PriorityBadge from "@/components/molecules/PriorityBadge"
import { Card, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"

const TaskItem = ({ task }) => {
  const formatDueDate = (date) => {
    if (isToday(new Date(date))) return "Today"
    if (isTomorrow(new Date(date))) return "Tomorrow"
    if (isPast(new Date(date))) return `Overdue - ${format(new Date(date), "MMM d")}`
    return format(new Date(date), "MMM d, yyyy")
  }

  const getDueDateColor = (date) => {
    if (isPast(new Date(date)) && !isToday(new Date(date))) return "text-red-600"
    if (isToday(new Date(date))) return "text-amber-600"
    return "text-gray-600"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:scale-[1.02] transition-all duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded border-2 border-gray-300 hover:border-primary-500 transition-colors" />
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                <PriorityBadge priority={task.priority} />
              </div>
              
              <div className="flex items-center gap-4 mt-2 ml-7">
                <div className={`flex items-center gap-1 text-sm ${getDueDateColor(task.dueDate)}`}>
                  <ApperIcon name="Calendar" size={14} />
                  <span>{formatDueDate(task.dueDate)}</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ApperIcon name="Clock" size={14} />
                  <span>Created {format(new Date(task.createdAt), "MMM d")}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {task.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default TaskItem