import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import TaskItem from "@/components/molecules/TaskItem"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import TaskForm from "@/components/organisms/TaskForm"
import * as taskService from "@/services/api/taskService"

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState("dueDate")

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await taskService.getAll()
      setTasks(data)
    } catch (err) {
      setError("Failed to load tasks. Please try again.")
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData)
      setTasks(prev => [newTask, ...prev])
      setShowForm(false)
      toast.success("Task created successfully!")
    } catch (err) {
      toast.error("Failed to create task")
      throw err
    }
  }

  const sortTasks = (tasks, sortBy) => {
    const sorted = [...tasks]
    switch (sortBy) {
      case "dueDate":
        return sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      case "priority":
        const priorityOrder = { High: 3, Medium: 2, Low: 1 }
        return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      case "created":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      default:
        return sorted
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadTasks} />
  
  const sortedTasks = sortTasks(tasks, sortBy)

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <ApperIcon name={showForm ? "X" : "Plus"} size={16} />
            {showForm ? "Cancel" : "Add Task"}
          </Button>
          
          <div className="text-sm text-gray-600">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
          </div>
        </div>
        
        {/* Sort options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="created">Recently Created</option>
          </select>
        </div>
      </div>

      {/* Task form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedTasks.length === 0 ? (
            <Empty
              title="No tasks yet"
              description="Create your first task to get started with FlowTask"
              actionLabel="Add Task"
              onAction={() => setShowForm(true)}
              icon="CheckSquare"
            />
          ) : (
            sortedTasks.map((task) => (
              <TaskItem key={task.Id} task={task} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TaskList