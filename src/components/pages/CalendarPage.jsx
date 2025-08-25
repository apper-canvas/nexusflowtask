import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, addMonths, subMonths } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import PriorityBadge from "@/components/molecules/PriorityBadge"
import CategoryBadge from "@/components/molecules/CategoryBadge"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import * as taskService from "@/services/api/taskService"
import * as categoryService from "@/services/api/categoryService"
import { toast } from "react-toastify"

const CalendarPage = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())

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
  }, [])

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.due_date_c) return false
      return isSameDay(new Date(task.due_date_c), date)
    })
  }

  const getTaskStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "bg-primary-100 text-primary-800 border-primary-200"
      case "In Progress":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "Done":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
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
            <p className="text-gray-600 mt-1">View your tasks organized by due dates</p>
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
                
                return (
                  <div
                    key={dayIndex}
                    className={`relative p-2 border-r last:border-r-0 min-h-[140px] ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    }`}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentDay 
                        ? 'w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center' 
                        : ''
                    }`}>
                      {format(day, 'd')}
                    </div>

                    {/* Tasks */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => {
                        const taskCategoryId = task.category_id_c?.Id || task.category_id_c
                        const category = categories.find(cat => cat.Id === taskCategoryId)
                        
                        return (
                          <motion.div
                            key={task.Id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition-all ${
                              getTaskStatusColor(task.status_c)
                            }`}
                            title={`${task.title_c} - ${task.status_c}`}
                          >
                            <div className={`font-medium truncate ${
                              task.status_c === 'Done' ? 'line-through' : ''
                            }`}>
                              {task.title_c}
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
                        <div className="text-xs text-gray-500 font-medium">
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
            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
            <span>Today</span>
          </div>
        </div>

        {/* Stats */}
        {tasks.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CalendarPage