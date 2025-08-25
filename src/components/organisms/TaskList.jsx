import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import SearchBar from "@/components/molecules/SearchBar";
import FilterPanel from "@/components/molecules/FilterPanel";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import ApperIcon from "@/components/ApperIcon";
import TaskItem from "@/components/molecules/TaskItem";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import Button from "@/components/atoms/Button";
import TaskForm from "@/components/organisms/TaskForm";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import * as categoryService from "@/services/api/categoryService";
import * as taskService from "@/services/api/taskService";

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")
  const [searchText, setSearchText] = useState("")
  const [filters, setFilters] = useState({})
  const searchRef = useRef()

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

const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Find the task being moved
    const taskId = parseInt(draggableId);
    const task = tasks.find(t => t.Id === taskId);
    if (!task) return;

    // Update task status based on destination column
    const newStatus = destination.droppableId;
    
    try {
      // Update task status in database
      const updatedTask = await taskService.update(taskId, {
        title: task.title_c,
        dueDate: task.due_date_c,
        priority: task.priority_c,
        status: newStatus,
        categoryId: task.category_id_c?.Id || task.category_id_c
      });

      // Update local state
      setTasks(prev => prev.map(t => 
        t.Id === taskId 
          ? { ...t, status_c: newStatus }
          : t
      ));

      toast.success(`Task moved to ${newStatus}!`);
    } catch (error) {
      toast.error("Failed to update task status");
      console.error("Error updating task status:", error);
    }
  };

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

const getTasksByStatus = (status) => {
    const filtered = filterTasks(tasks, selectedCategory);
    const statusTasks = filtered.filter(task => task.status_c === status);
    return sortTasks(statusTasks, sortBy);
  };

// Enhanced filtering with search and advanced filters
const filterTasks = (tasks, categoryFilter, searchText, filters) => {
  let filtered = [...tasks];

  // Category filter
  if (categoryFilter !== "all") {
    filtered = filtered.filter(task => {
      const taskCategoryId = task.category_id_c?.Id || task.category_id_c;
      return taskCategoryId === parseInt(categoryFilter);
    });
  }

  // Search filter
  if (searchText) {
    const searchLower = searchText.toLowerCase();
    filtered = filtered.filter(task => 
      task.title_c?.toLowerCase().includes(searchLower) ||
      task.Name?.toLowerCase().includes(searchLower)
    );
  }

  // Advanced filters
  if (filters.priorities?.length > 0) {
    filtered = filtered.filter(task => filters.priorities.includes(task.priority_c));
  }

  if (filters.statuses?.length > 0) {
    filtered = filtered.filter(task => filters.statuses.includes(task.status_c));
  }

  if (filters.dateRange?.start || filters.dateRange?.end) {
    filtered = filtered.filter(task => {
      if (!task.due_date_c) return false;
      const dueDate = new Date(task.due_date_c);
      const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      
      if (start && dueDate < start) return false;
      if (end && dueDate > end) return false;
      return true;
    });
  }

  return filtered;
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

const filteredTasks = filterTasks(tasks, selectedCategory, searchText, filters)
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

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <SearchBar 
          ref={searchRef}
          onSearch={setSearchText}
          placeholder="Search tasks by title..."
          className="max-w-md"
        />
        
        <FilterPanel 
          onFiltersChange={setFilters}
          initialFilters={filters}
        />
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
                backgroundColor: category.color_c,
                borderColor: category.color_c,
                color: 'white'
              } : {
                backgroundColor: `${category.color_c}10`,
                borderColor: `${category.color_c}30`,
                color: category.color_c
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? 'white' : category.color_c }}
              />
              {category.Name} ({taskCount})
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
{/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["To Do", "In Progress", "Done"].map((status) => {
            const statusTasks = getTasksByStatus(status);
            
            return (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{status}</h3>
                    <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full font-medium">
                      {statusTasks.length}
                    </span>
                  </div>
                  {status === "Done" && statusTasks.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ApperIcon name="CheckCircle" size={16} />
                      <span>{Math.round((statusTasks.length / filteredTasks.length) * 100)}%</span>
                    </div>
                  )}
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? "bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg" : ""
                      }`}
                    >
                      <AnimatePresence>
                        {statusTasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <ApperIcon name="Plus" size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              {status === "To Do" ? "No tasks to start" : 
                               status === "In Progress" ? "No active tasks" : 
                               "No completed tasks"}
                            </p>
                          </div>
                        ) : (
                          statusTasks.map((task, index) => {
                            const taskCategoryId = task.category_id_c?.Id || task.category_id_c;
                            const category = categories.find(cat => cat.Id === taskCategoryId);
                            
                            return (
                              <Draggable key={task.Id} draggableId={task.Id.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`transition-all ${
                                      snapshot.isDragging ? "rotate-2 shadow-lg scale-105" : ""
                                    } ${status === "Done" ? "opacity-75" : ""}`}
>
                                    <TaskItem 
                                      task={task} 
                                      category={category} 
                                      searchText={searchText}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            );
                          })
                        )}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
)
}

export default TaskList