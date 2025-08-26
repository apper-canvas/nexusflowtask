import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import * as categoryService from "@/services/api/categoryService";

const TaskForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    priority: "Medium",
    categoryId: "",
    reminders: []
  });
  const [categories, setCategories] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [nextReminderId, setNextReminderId] = useState(1);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
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
    reminderTime.setHours(reminderTime.getHours() - 1);
    
    const newReminder = {
      id: nextReminderId,
      datetime: format(reminderTime, "yyyy-MM-dd'T'HH:mm"),
      type: 'notification',
      label: "1 hour before due date"
    };
    
    setReminders(prev => [...prev, newReminder]);
    setNextReminderId(prev => prev + 1);
  };

  const removeReminder = (id) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };
const updateReminderTime = (id, newTime) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, datetime: newTime } : reminder
    ));
  };
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      // Simulate file upload - in real implementation, you'd upload to a server
      // and get back a file path/URL
      const filePath = `/uploads/${Date.now()}_${file.name}`;
      
      return {
        id: Date.now() + Math.random(),
        file_name_c: file.name,
        file_type_c: file.type,
        file_size_c: file.size,
        file_path_c: filePath,
        upload_date_c: new Date().toISOString(),
        name: file.name
      };
    });

try {
      const newAttachments = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...newAttachments]);
      console.log(`${newAttachments.length} file(s) prepared for upload`);
    } catch (error) {
      console.error("Failed to prepare files for upload:", error);
    } finally {
      setUploading(false);
    }
  };

const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const taskData = {
        ...formData,
        reminders: reminders.filter(r => r.datetime),
        attachments: attachments
      };
      
      await onSubmit(taskData);
      
      // Reset form
      setFormData({
        title: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        priority: "Medium",
        categoryId: categories.length > 0 ? categories[0].Id : "",
        reminders: []
      });
      setReminders([]);
      setAttachments([]);
      setShowReminderOptions(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };
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
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReminderOptions(!showReminderOptions)}
                  className="text-sm"
                >
                  <ApperIcon name="Plus" size={14} className="mr-1" />
                  Add Reminder
                </Button>
              </div>

              {showReminderOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 mt-2"
                >
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Input
                        type="datetime-local"
                        value={reminder.datetime}
                        onChange={(e) => updateReminderTime(reminder.id, e.target.value)}
                        className="flex-1 bg-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReminder(reminder.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ApperIcon name="X" size={14} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addReminder}
                    className="w-full"
                  >
                    Add Another Reminder
                  </Button>
                </motion.div>
              )}
            </div>

            {/* File Attachments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Attachments</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    accept="*/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload').click()}
                    disabled={uploading}
                    className="text-sm"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2">
                          <ApperIcon name="Loader2" size={14} />
                        </div>
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <ApperIcon name="Paperclip" size={14} className="mr-2" />
                        Add Files
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="File" size={16} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.file_name_c}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.file_size_c / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <ApperIcon name="X" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div 
              className="flex justify-end space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2">
                      <ApperIcon name="Loader2" size={16} />
                    </div>
                    Creating...
                  </div>
                ) : (
                  'Create Task'
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskForm;