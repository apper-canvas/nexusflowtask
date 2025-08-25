import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import * as categoryService from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import TaskItem from "@/components/molecules/TaskItem";
import Button from "@/components/atoms/Button";
import TaskForm from "@/components/organisms/TaskForm";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import * as taskService from "@/services/api/taskService";
const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")

const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [taskData, categoryData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ])
      setTasks(taskData)
      setCategories(categoryData)
    } catch (err) {
      setError("Failed to load data. Please try again.")
      toast.error("Failed to load data")
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
        return sorted.sort((a, b) => new Date(a.due_date_c) - new Date(b.due_date_c))
      case "priority":
        const priorityOrder = { High: 3, Medium: 2, Low: 1 }
        return sorted.sort((a, b) => priorityOrder[b.priority_c] - priorityOrder[a.priority_c])
      case "created":
        return sorted.sort((a, b) => new Date(b.created_at_c) - new Date(a.created_at_c))
      default:
        return sorted
    }
}

const filterTasks = (tasks, categoryFilter) => {
    if (categoryFilter === "all") return tasks
    return tasks.filter(task => {
      const taskCategoryId = task.category_id_c?.Id || task.category_id_c;
      return taskCategoryId === parseInt(categoryFilter);
    });
  }

  const getCategoryTaskCount = (categoryId) => {
    return tasks.filter(task => {
      const taskCategoryId = task.category_id_c?.Id || task.category_id_c;
      return taskCategoryId === categoryId;
    }).length;
  }

  useEffect(() => {
    loadData()
  }, [])

if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />
  
  const filteredTasks = filterTasks(tasks, selectedCategory)
  const sortedTasks = sortTasks(filteredTasks, sortBy)

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
            {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
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

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Filter by category:</span>
        
        <Button
          size="sm"
          variant={selectedCategory === "all" ? "default" : "secondary"}
          onClick={() => setSelectedCategory("all")}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Filter" size={14} />
          All ({tasks.length})
        </Button>
        
        {categories.map((category) => {
          const taskCount = getCategoryTaskCount(category.Id)
          const isActive = selectedCategory === category.Id.toString()
          
          return (
            <Button
              key={category.Id}
              size="sm"
              variant={isActive ? "default" : "secondary"}
              onClick={() => setSelectedCategory(category.Id.toString())}
              className="flex items-center gap-2"
              style={isActive ? {
                backgroundColor: category.color,
                borderColor: category.color,
                color: 'white'
              } : {
                backgroundColor: `${category.color}10`,
                borderColor: `${category.color}30`,
                color: category.color
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? 'white' : category.color }}
              />
              {category.name} ({taskCount})
            </Button>
          )
        })}
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
              title={selectedCategory === "all" ? "No tasks yet" : "No tasks in this category"}
              description={selectedCategory === "all" 
                ? "Create your first task to get started with FlowTask"
                : "Try creating a task or selecting a different category"
              }
              actionLabel="Add Task"
              onAction={() => setShowForm(true)}
              icon="CheckSquare"
            />
          ) : (
sortedTasks.map((task) => {
              const taskCategoryId = task.category_id_c?.Id || task.category_id_c;
              return (
                <TaskItem 
                  key={task.Id} 
                  task={task} 
                  category={categories.find(cat => cat.Id === taskCategoryId)}
                />
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
)
}

export default TaskList