import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import PriorityBadge from "@/components/molecules/PriorityBadge";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import * as taskService from "@/services/api/taskService";

const TaskItem = ({ task, category, searchText = "" }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      await taskService.update(task.Id, {
        title: task.title_c,
        dueDate: task.due_date_c,
        priority: task.priority_c,
        status: newStatus,
        categoryId: task.category_id_c?.Id || task.category_id_c
      });
      toast.success(`Task marked as ${newStatus}!`);
    } catch (error) {
      toast.error("Failed to update task status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await taskService.remove(task.Id);
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  // Highlight search text in content
  const highlightText = (text, search) => {
    if (!search || !text) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const isOverdue = task.due_date_c && new Date(task.due_date_c) < new Date() && task.status_c !== 'Done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all p-4 ${
        task.status_c === 'Done' ? 'opacity-75' : ''
      } ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className={`text-sm font-medium text-gray-900 ${
          task.status_c === 'Done' ? 'line-through' : ''
        }`}>
          {highlightText(task.title_c, searchText)}
        </h3>
        
        <div className="flex items-center gap-2 ml-2">
          {searchText && (
            <div className="text-xs text-gray-500">
              <ApperIcon name="Search" size={12} className="inline" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 p-1"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority_c} />
          {category && <CategoryBadge category={category} />}
        </div>
        
        {task.due_date_c && (
          <div className={`text-xs flex items-center gap-1 ${
            isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
          }`}>
            {isOverdue && <ApperIcon name="AlertTriangle" size={12} />}
            {format(new Date(task.due_date_c), 'MMM d')}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default TaskItem