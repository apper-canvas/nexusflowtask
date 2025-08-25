import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isPast, isSameDay, isToday, startOfMonth, subMonths } from "date-fns";
import { Card, CardContent } from "@/components/atoms/Card";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import PriorityBadge from "@/components/molecules/PriorityBadge";
import FormField from "@/components/molecules/FormField";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import * as categoryService from "@/services/api/categoryService";
import * as taskService from "@/services/api/taskService";
import { create as taskCreate, getAll as taskGetAll, remove as taskRemove, update as taskUpdate } from "@/metadata/tables/task_c.json";
import { create as categoryCreate, getAll as categoryGetAll, remove as categoryRemove, update as categoryUpdate } from "@/metadata/tables/category_c.json";
const CalendarPage = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddDate, setQuickAddDate] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)

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
      setError("Failed to load calendar data. Please try again.")
      toast.error("Failed to load calendar data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentDate])

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.due_date_c) return false
      return isSameDay(new Date(task.due_date_c), date)
    })
  }

  const getTaskStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "bg-primary-100 text-primary-800 border-primary-200 hover:bg-primary-200"
      case "In Progress":
        return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
      case "Done":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
    }
  }

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const handleDateClick = (date) => {
    // Only allow adding tasks to current or future dates in current month
    if (date.getMonth() === currentDate.getMonth()) {
      setQuickAddDate(date)
      setShowQuickAdd(true)
    }
  }

  const handleTaskClick = (e, task) => {
    e.stopPropagation()
    setSelectedTask(task)
    setShowTaskDetails(true)
  }

  const handleQuickAddTask = async (taskData) => {
    try {
      const newTask = await taskService.create({
        ...taskData,
        dueDate: format(quickAddDate, 'yyyy-MM-dd')
      })
      setTasks(prev => [newTask, ...prev])
      setShowQuickAdd(false)
      setQuickAddDate(null)
      toast.success("Task added successfully!")
    } catch (err) {
      toast.error("Failed to create task")
    }
  }

  const handleTaskUpdate = async (updates) => {
    try {
      const updatedTask = await taskService.update(selectedTask.Id, {
        title: updates.title,
        dueDate: updates.dueDate,
        priority: updates.priority,
        status: updates.status,
        categoryId: updates.categoryId
      })
      setTasks(prev => prev.map(t => t.Id === selectedTask.Id ? { ...t, ...updatedTask } : t))
      setShowTaskDetails(false)
      setSelectedTask(null)
      toast.success("Task updated successfully!")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  const handleTaskDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    
    try {
      await taskService.remove(selectedTask.Id)
      setTasks(prev => prev.filter(t => t.Id !== selectedTask.Id))
      setShowTaskDetails(false)
      setSelectedTask(null)
      toast.success("Task deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete task")
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Add padding days to make calendar start on Sunday
  const startPadding = getDay(monthStart)
  const paddingDays = Array.from({ length: startPadding }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (startPadding - i))
    return date
  })

  const allDays = [...paddingDays, ...daysInMonth]
  const weeks = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600 mt-1">Click dates to add tasks, click tasks to edit them</p>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="flex items-center gap-2"
              >
                <ApperIcon name="ChevronLeft" size={16} />
                Previous
              </Button>
              
              <div className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="flex items-center gap-2"
              >
                Next
                <ApperIcon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow border">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Weeks */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0" style={{ minHeight: '140px' }}>
                {week.map((day, dayIndex) => {
                  const dayTasks = getTasksForDate(day)
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isCurrentDay = isToday(day)
                  const isPastDate = isPast(day) && !isToday(day)
                  const hasOverdueTasks = dayTasks.some(task => task.status_c !== 'Done')
                  
                  return (
                    <div
                      key={dayIndex}
                      onClick={() => handleDateClick(day)}
                      className={`relative p-2 border-r last:border-r-0 min-h-[140px] transition-all cursor-pointer ${
                        !isCurrentMonth 
                          ? 'bg-gray-50 text-gray-400' 
                          : isCurrentDay
                          ? 'bg-primary-50 hover:bg-primary-100'
                          : isPastDate && hasOverdueTasks
                          ? 'bg-red-50 hover:bg-red-100'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {/* Date Number */}
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentDay 
                          ? 'w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center' 
                          : isPastDate && hasOverdueTasks
                          ? 'text-red-600 font-bold'
                          : ''
                      }`}>
                        {format(day, 'd')}
                      </div>

                      {/* Add task hint */}
                      {isCurrentMonth && dayTasks.length === 0 && (
                        <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to add task
                        </div>
                      )}

                      {/* Tasks */}
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => {
                          const taskCategoryId = task.category_id_c?.Id || task.category_id_c
                          const category = categories.find(cat => cat.Id === taskCategoryId)
                          const isOverdue = isPast(new Date(task.due_date_c)) && !isToday(new Date(task.due_date_c)) && task.status_c !== 'Done'
                          
                          return (
                            <motion.div
                              key={task.Id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              onClick={(e) => handleTaskClick(e, task)}
                              className={`text-xs p-1.5 rounded border cursor-pointer transition-all transform hover:scale-105 hover:shadow-md ${
                                isOverdue 
                                  ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' 
                                  : getTaskStatusColor(task.status_c)
                              }`}
                              title={`${task.title_c} - ${task.status_c}${isOverdue ? ' (Overdue)' : ''}`}
                            >
                              <div className={`font-medium truncate flex items-center gap-1 ${
                                task.status_c === 'Done' ? 'line-through opacity-75' : ''
                              }`}>
                                {isOverdue && <ApperIcon name="AlertCircle" size={10} className="text-red-600 flex-shrink-0" />}
                                <span className="truncate">{task.title_c}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <PriorityBadge 
                                  priority={task.priority_c} 
                                  className="text-[10px] px-1 py-0"
                                />
                                {category && (
                                  <CategoryBadge 
                                    category={category} 
                                    className="text-[10px] px-1 py-0"
                                  />
                                )}
                              </div>
                            </motion.div>
                          )
                        })}
                        
                        {/* Show count if more than 3 tasks */}
                        {dayTasks.length > 3 && (
                          <div 
                            className="text-xs text-gray-500 font-medium cursor-pointer hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Could expand to show all tasks in future
                            }}
                          >
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary-100 border border-primary-200"></div>
              <span>To Do</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
              <span>Done</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-600"></div>
              <span>Today</span>
            </div>
          </div>

          {/* Stats */}
          {tasks.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary-900">
                  {tasks.filter(t => t.status_c === 'To Do').length}
                </div>
                <div className="text-sm text-primary-700">Tasks To Do</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-900">
                  {tasks.filter(t => t.status_c === 'In Progress').length}
                </div>
                <div className="text-sm text-amber-700">In Progress</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-900">
                  {tasks.filter(t => t.status_c === 'Done').length}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-900">
                  {tasks.filter(t => {
                    const dueDate = new Date(t.due_date_c)
                    return isPast(dueDate) && !isToday(dueDate) && t.status_c !== 'Done'
                  }).length}
                </div>
                <div className="text-sm text-red-700">Overdue</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Add Task Modal */}
      <AnimatePresence>
        {showQuickAdd && <QuickAddTaskModal 
          date={quickAddDate}
          categories={categories}
          onSubmit={handleQuickAddTask}
          onClose={() => {
            setShowQuickAdd(false)
            setQuickAddDate(null)
          }}
        />}
      </AnimatePresence>

      {/* Task Details Popover */}
      <AnimatePresence>
        {showTaskDetails && selectedTask && <TaskDetailsPopover 
          task={selectedTask}
          categories={categories}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
          onClose={() => {
            setShowTaskDetails(false)
            setSelectedTask(null)
          }}
        />}
      </AnimatePresence>
    </>
  )
}

// Quick Add Task Modal Component
const QuickAddTaskModal = ({ date, categories, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    categoryId: ""
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      setFormData({ title: "", priority: "Medium", categoryId: "" })
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <ApperIcon name="Plus" size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Add Task</h3>
                <p className="text-sm text-gray-600">Due: {format(date, 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Task Title" error={errors.title}>
                <Input
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-white"
                  autoFocus
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Priority">
                  <Select
                    value={formData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Select>
                </FormField>

                <FormField label="Category">
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value ? parseInt(e.target.value) : "")}
                    className="bg-white"
                  >
                    <option value="">No Category</option>
                    {categories.map((category) => (
                      <option key={category.Id} value={category.Id}>
                        {category.Name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 flex-1"
                >
                  {isSubmitting ? (
                    <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <ApperIcon name="Check" size={16} />
                  )}
                  {isSubmitting ? "Adding..." : "Add Task"}
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Task Details Popover Component
const TaskDetailsPopover = ({ task, categories, onUpdate, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    title: task.title_c || "",
    dueDate: task.due_date_c ? format(new Date(task.due_date_c), 'yyyy-MM-dd') : "",
    priority: task.priority_c || "Medium",
    status: task.status_c || "To Do",
    categoryId: task.category_id_c?.Id || task.category_id_c || ""
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required"
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await onUpdate(formData)
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false)
    }
  }

  const taskCategory = categories.find(cat => cat.Id === (task.category_id_c?.Id || task.category_id_c))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        <Card className="bg-white border border-gray-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Edit3" size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <PriorityBadge priority={task.priority_c} />
                    {taskCategory && <CategoryBadge category={taskCategory} />}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1"
              >
                <ApperIcon name="X" size={16} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Task Title" error={errors.title}>
                <Input
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Due Date" error={errors.dueDate}>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                  />
                </FormField>

                <FormField label="Status">
                  <Select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Priority">
                  <Select
                    value={formData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Select>
                </FormField>

                <FormField label="Category">
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value ? parseInt(e.target.value) : "")}
                  >
                    <option value="">No Category</option>
                    {categories.map((category) => (
                      <option key={category.Id} value={category.Id}>
                        {category.Name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 flex-1"
                >
                  {isSubmitting ? (
                    <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <ApperIcon name="Check" size={16} />
                  )}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                
                <Button
                  type="button"
                  variant="danger"
                  onClick={onDelete}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Trash2" size={16} />
                  Delete
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default CalendarPage
}