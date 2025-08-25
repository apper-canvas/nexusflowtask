import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import * as reminderService from "@/services/api/reminderService";

const ReminderList = ({ taskId, taskTitle, onReminderAdded }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState("");

  const loadReminders = async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      const data = await reminderService.getByTaskId(taskId);
      setReminders(data);
    } catch (error) {
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [taskId]);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    
    if (!newReminderTime) {
      toast.error("Please select a reminder time");
      return;
    }

    try {
      const reminderData = {
        taskId: taskId,
        taskTitle: taskTitle,
        reminderTime: new Date(newReminderTime).toISOString()
      };

      const newReminder = await reminderService.create(reminderData);
      setReminders(prev => [...prev, newReminder]);
      setNewReminderTime("");
      setShowAddForm(false);
      toast.success("Reminder added successfully!");
      
      if (onReminderAdded) {
        onReminderAdded(newReminder);
      }
    } catch (error) {
      toast.error("Failed to add reminder");
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) {
      return;
    }

    try {
      await reminderService.remove(reminderId);
      setReminders(prev => prev.filter(r => r.Id !== reminderId));
      toast.success("Reminder deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete reminder");
    }
  };

  const getDefaultReminderTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <ApperIcon name="Bell" size={14} />
          Reminders ({reminders.length})
        </h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs"
        >
          <ApperIcon name="Plus" size={12} className="mr-1" />
          Add Reminder
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddReminder}
            className="bg-gray-50 rounded-lg p-3 space-y-3"
          >
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Reminder Time
              </label>
              <input
                type="datetime-local"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" className="text-xs">
                <ApperIcon name="Check" size={12} className="mr-1" />
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {reminders.length === 0 ? (
          <div className="text-xs text-gray-500 py-2 text-center">
            No reminders set
          </div>
        ) : (
          reminders.map((reminder) => {
            const reminderTime = new Date(reminder.reminder_time_c);
            const isOverdue = reminderTime < new Date() && reminder.status_c === 'Scheduled';
            
            return (
              <motion.div
                key={reminder.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between p-2 rounded border text-xs ${
                  isOverdue 
                    ? 'bg-red-50 border-red-200' 
                    : reminder.status_c === 'Sent'
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ApperIcon 
                    name={
                      isOverdue ? "AlertTriangle" :
                      reminder.status_c === 'Sent' ? "Check" : "Clock"
                    } 
                    size={12}
                    className={
                      isOverdue ? "text-red-600" :
                      reminder.status_c === 'Sent' ? "text-gray-600" : "text-blue-600"
                    }
                  />
                  <div>
                    <div className="font-medium">
                      {format(reminderTime, "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div className={`text-xs ${
                      isOverdue ? "text-red-600" :
                      reminder.status_c === 'Sent' ? "text-gray-600" : "text-blue-600"
                    }`}>
                      {isOverdue ? "Overdue" : 
                       reminder.status_c === 'Sent' ? "Completed" : "Scheduled"}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteReminder(reminder.Id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <ApperIcon name="Trash2" size={12} />
                </Button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReminderList;