import { motion } from "framer-motion"
import TaskList from "@/components/organisms/TaskList"

const TasksPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="max-w-6xl mx-auto">
        <TaskList />
      </div>
    </motion.div>
  )
}

export default TasksPage