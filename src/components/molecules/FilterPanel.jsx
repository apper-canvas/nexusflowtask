import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import { cn } from "@/utils/cn"

const FilterPanel = ({ 
  onFiltersChange,
  initialFilters = {},
  className 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    priorities: initialFilters.priorities || [],
    statuses: initialFilters.statuses || [],
    dateRange: initialFilters.dateRange || { start: "", end: "" },
    ...initialFilters
  })

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const priorityOptions = ["Low", "Medium", "High"]
  const statusOptions = ["To Do", "In Progress", "Done"]

  const handlePriorityToggle = (priority) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }))
  }

  const handleStatusToggle = (status) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }))
  }

  const handleDateRangeChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priorities: [],
      statuses: [],
      dateRange: { start: "", end: "" }
    })
  }

  const getActiveFilterCount = () => {
    return filters.priorities.length + 
           filters.statuses.length + 
           (filters.dateRange.start || filters.dateRange.end ? 1 : 0)
  }

  const activeCount = getActiveFilterCount()

  return (
    <div className={cn("border border-gray-200 rounded-lg bg-white", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ApperIcon name="Filter" size={16} />
            <span className="font-medium">Filters</span>
            <ApperIcon 
              name="ChevronDown" 
              size={14} 
              className={cn(
                "transition-transform",
                isExpanded ? "rotate-180" : ""
              )}
            />
          </Button>
          
          {activeCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeCount} active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 p-1"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2"
        >
          <ApperIcon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={16} 
          />
        </Button>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* Priority Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ApperIcon name="AlertTriangle" size={14} />
                  Priority
                </h4>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((priority) => {
                    const isSelected = filters.priorities.includes(priority)
                    const priorityColors = {
                      Low: "border-green-200 text-green-700 bg-green-50 hover:bg-green-100",
                      Medium: "border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100", 
                      High: "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                    }
                    const selectedColors = {
                      Low: "border-green-500 text-green-800 bg-green-100",
                      Medium: "border-yellow-500 text-yellow-800 bg-yellow-100",
                      High: "border-red-500 text-red-800 bg-red-100"
                    }
                    
                    return (
                      <button
                        key={priority}
                        onClick={() => handlePriorityToggle(priority)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
                          "flex items-center gap-1.5",
                          isSelected ? selectedColors[priority] : priorityColors[priority]
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isSelected ? "bg-current" : "border border-current"
                        )} />
                        {priority}
                        {isSelected && <ApperIcon name="Check" size={10} />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ApperIcon name="CheckSquare" size={14} />
                  Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => {
                    const isSelected = filters.statuses.includes(status)
                    const statusColors = {
                      "To Do": "border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100",
                      "In Progress": "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100",
                      "Done": "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                    }
                    const selectedColors = {
                      "To Do": "border-primary-500 text-primary-800 bg-primary-100",
                      "In Progress": "border-amber-500 text-amber-800 bg-amber-100",
                      "Done": "border-green-500 text-green-800 bg-green-100"
                    }
                    
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusToggle(status)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
                          "flex items-center gap-1.5",
                          isSelected ? selectedColors[status] : statusColors[status]
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isSelected ? "bg-current" : "border border-current"
                        )} />
                        {status}
                        {isSelected && <ApperIcon name="Check" size={10} />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date Range Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ApperIcon name="Calendar" size={14} />
                  Due Date Range
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <Input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => handleDateRangeChange("start", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <Input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => handleDateRangeChange("end", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <button
                    onClick={() => handleDateRangeChange("start", "") || handleDateRangeChange("end", "")}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <ApperIcon name="X" size={12} />
                    Clear date range
                  </button>
                )}
              </div>

              {/* Apply Filters Button */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {activeCount > 0 
                      ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
                      : 'No filters applied'
                    }
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="Check" size={14} />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FilterPanel