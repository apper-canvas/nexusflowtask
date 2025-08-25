import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/atoms/Card";
import * as categoryService from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
const TaskForm = ({ onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
    title: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    priority: "Medium",
    categoryId: "",
    reminders: []
  })
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReminderOptions, setShowReminderOptions] = useState(false)

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
      // Set default category if available
      if (data.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: data[0].Id }))
      }
    } catch (err) {
      // Categories are optional, so we don't show error
      console.warn("Failed to load categories:", err)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

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
const addReminder = () => {
    const reminderTime = new Date(formData.dueDate);
    reminderTime.setHours(reminderTime.getHours() - 1); // 1 hour before due date
    
    const newReminder = {
      id: Date.now(),
      time: format(reminderTime, "yyyy-MM-dd'T'HH:mm"),
      label: "1 hour before due date"
    };
    
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }));
  };

  const removeReminder = (id) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id)
    }));
  };

  const updateReminderTime = (id, newTime) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => 
        r.id === id 
          ? { ...r, time: newTime, label: `Custom: ${format(new Date(newTime), "MMM d, h:mm a")}` }
          : r
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      setFormData({
        title: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        priority: "Medium",
        categoryId: categories.length > 0 ? categories[0].Id : "",
        reminders: []
      })
      setShowReminderOptions(false)
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <ApperIcon name="Plus" size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
          </div>
          
<form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                label="Task Title"
                error={errors.title}
                className="md:col-span-2"
              >
                <Input
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-white"
                />
              </FormField>
              
              <FormField
                label="Due Date"
                error={errors.dueDate}
              >
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  className="bg-white"
                />
              </FormField>
              
              <FormField
                label="Priority"
              >
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
              
              <FormField
                label="Category"
                className="md:col-span-2 lg:col-span-1"
              >
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

            {/* Reminder Options */}
            <div className="md:col-span-2 lg:col-span-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Reminders</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReminderOptions(!showReminderOptions)}
                  className="text-xs"
                >
                  <ApperIcon name="Bell" size={12} className="mr-1" />
                  {showReminderOptions ? "Hide" : "Add Reminders"}
                </Button>
              </div>

              {showReminderOptions && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addReminder}
                      className="text-xs"
                    >
                      <ApperIcon name="Plus" size={12} className="mr-1" />
                      Add Reminder
                    </Button>
                  </div>

                  {formData.reminders.length > 0 && (
                    <div className="space-y-2">
                      {formData.reminders.map((reminder) => (
                        <div key={reminder.id} className="flex items-center gap-2 bg-white rounded p-2">
                          <ApperIcon name="Bell" size={12} className="text-blue-600" />
                          <input
                            type="datetime-local"
                            value={reminder.time}
                            onChange={(e) => updateReminderTime(reminder.id, e.target.value)}
                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReminder(reminder.id)}
                            className="p-1 text-red-600"
                          >
                            <ApperIcon name="Trash2" size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pt-2 md:col-span-2 lg:col-span-4">
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
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default TaskForm