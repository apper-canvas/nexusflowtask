import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addNotification, setPermissionGranted } from '@/store/notificationSlice';
import { notificationService } from '@/services/notificationService';
import * as reminderService from '@/services/api/reminderService';
import * as taskService from '@/services/api/taskService';

export const useNotificationSystem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const checkDueReminders = async () => {
    try {
      const dueReminders = await reminderService.getDueReminders();
      
      for (const reminder of dueReminders) {
        // Get task details
        const task = await taskService.getById(reminder.task_c_id_c?.Id || reminder.task_c_id_c);
        if (!task) continue;

        // Show browser notification
        if (notificationService.isPermissionGranted()) {
          await notificationService.showTaskReminder(task, reminder);
        } else {
          // Show in-app notification as fallback
          await notificationService.showInAppNotification(
            task.title_c,
            `Reminder: Due ${new Date(task.due_date_c).toLocaleDateString()}`,
            'info'
          );
        }

        // Add to notification center
        dispatch(addNotification({
          type: 'reminder',
          title: task.title_c,
          message: `Due: ${new Date(task.due_date_c).toLocaleDateString()}`,
          taskId: task.Id,
          reminderId: reminder.Id
        }));

        // Update reminder status to sent
        await reminderService.update(reminder.Id, {
          status: 'Sent'
        });
      }
    } catch (error) {
      console.error('Error checking due reminders:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const granted = await notificationService.requestPermission();
      dispatch(setPermissionGranted(granted));
      if (granted) {
        toast.success('Notifications enabled! You\'ll receive reminder alerts.');
      }
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      toast.error('Could not enable notifications. Please check your browser settings.');
      dispatch(setPermissionGranted(false));
      return false;
    }
  };

  const navigateToTask = (taskId) => {
    navigate('/tasks');
    // Could add specific task focus/highlight logic here
    setTimeout(() => {
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        taskElement.classList.add('ring-2', 'ring-primary-500', 'ring-opacity-50');
        setTimeout(() => {
          taskElement.classList.remove('ring-2', 'ring-primary-500', 'ring-opacity-50');
        }, 3000);
      }
    }, 100);
  };

useEffect(() => {
    // Check permission on mount
    if (notificationService.isSupported()) {
      dispatch(setPermissionGranted(notificationService.isPermissionGranted()));
    }

    // Set up task notification click handler
    const handleTaskNotificationClick = (event) => {
      navigateToTask(event.detail.taskId);
    };

    window.addEventListener('task-notification-click', handleTaskNotificationClick);

    // Start reminder checking interval (every minute)
    intervalRef.current = setInterval(checkDueReminders, 60000);

    // Initial check
    checkDueReminders();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('task-notification-click', handleTaskNotificationClick);
    };
  }, []);

return {
    requestNotificationPermission,
    navigateToTask,
    isNotificationSupported: notificationService.isSupported(),
    canRequestPermission: notificationService.canRequestPermission()
  };
};