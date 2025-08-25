import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import ColorPicker from "@/components/molecules/ColorPicker";
import FormField from "@/components/molecules/FormField";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import * as categoryService from "@/services/api/categoryService";
import * as taskService from "@/services/api/taskService";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
const [formData, setFormData] = useState({
    name: "",
    color: "#8B5CF6"
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [categoryData, taskData] = await Promise.all([
        categoryService.getAll(),
        taskService.getAll()
      ])
      setCategories(categoryData)
      setTasks(taskData)
    } catch (err) {
      setError("Failed to load categories. Please try again.")
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

const getCategoryTaskCount = (categoryId) => {
    return tasks.filter(task => {
      const taskCategoryId = task.category_id_c?.Id || task.category_id_c;
      return taskCategoryId === categoryId;
    }).length;
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = "Category name is required"
    }
    
    if (!formData.color) {
      errors.color = "Color is required"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setIsSubmitting(true)
      
      if (editingCategory) {
        const updatedCategory = await categoryService.update(editingCategory.Id, formData)
        setCategories(prev => prev.map(cat => 
          cat.Id === editingCategory.Id ? updatedCategory : cat
        ))
        toast.success("Category updated successfully!")
        setEditingCategory(null)
      } else {
        const newCategory = await categoryService.create(formData)
        setCategories(prev => [newCategory, ...prev])
        toast.success("Category created successfully!")
      }
      
      setFormData({ name: "", color: "#8B5CF6" })
      setShowForm(false)
      setFormErrors({})
    } catch (err) {
      toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`)
    } finally {
      setIsSubmitting(false)
    }
  }

const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.Name,
      color: category.color_c
    })
    setShowForm(true)
setFormErrors({})
  }
  const handleDelete = async (category) => {
    const taskCount = getCategoryTaskCount(category.Id)
    
    if (taskCount > 0) {
      toast.error(`Cannot delete category with ${taskCount} task${taskCount !== 1 ? 's' : ''}`)
      return
    }

if (!window.confirm(`Are you sure you want to delete "${category.Name}"?`)) {
      return
    }

    try {
      await categoryService.remove(category.Id)
      setCategories(prev => prev.filter(cat => cat.Id !== category.Id))
      toast.success("Category deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete category")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: "", color: "#8B5CF6" })
    setFormErrors({})
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Organize your tasks with custom categories</p>
          </div>
          
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <ApperIcon name={showForm ? "X" : "Plus"} size={16} />
            {showForm ? "Cancel" : "Add Category"}
          </Button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                      <ApperIcon name={editingCategory ? "Edit3" : "Plus"} size={16} className="text-white" />
                    </div>
                    {editingCategory ? "Edit Category" : "Create New Category"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Category Name"
                        error={formErrors.name}
                      >
                        <Input
                          placeholder="Enter category name..."
                          value={formData.name}
                          onChange={(e) => handleFormChange("name", e.target.value)}
                          className="bg-white"
                        />
                      </FormField>
                      
                      <FormField
                        label="Color"
                        error={formErrors.color}
                      >
                        <ColorPicker
                          value={formData.color}
                          onChange={(color) => handleFormChange("color", color)}
                        />
                      </FormField>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <ApperIcon name="Loader2" size={16} className="animate-spin" />
                        ) : (
                          <ApperIcon name="Check" size={16} />
                        )}
                        {isSubmitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories List */}
        <div className="space-y-3">
          {categories.length === 0 ? (
            <Empty
              title="No categories yet"
              description="Create your first category to organize your tasks"
              actionLabel="Add Category"
              onAction={() => setShowForm(true)}
              icon="Tags"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const taskCount = getCategoryTaskCount(category.Id)
                
                return (
                  <motion.div
                    key={category.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:scale-[1.02] transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
<div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-4 h-4 rounded-full border-2 border-gray-200"
                                style={{ backgroundColor: category.color_c }}
                              />
                              <h3 className="font-semibold text-gray-900">{category.Name}</h3>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                {taskCount} task{taskCount !== 1 ? 's' : ''}
                              </p>
                              <CategoryBadge category={category} />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(category)}
                              className="p-1 h-8 w-8"
                            >
                              <ApperIcon name="Edit3" size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(category)}
                              className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={taskCount > 0}
                            >
                              <ApperIcon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default CategoriesPage