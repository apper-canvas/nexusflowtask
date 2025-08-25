// Browser notification service
export class NotificationService {
  constructor() {
    this.permission = Notification.permission;
    this.isSupported = 'Notification' in window;
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Browser notifications are not supported');
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      throw new Error('Notification permission denied');
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    return true;
  }

  async showTaskReminder(task, reminder) {
    if (!this.isSupported) {
      console.warn('Browser notifications not supported');
      return null;
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const options = {
      body: `Due: ${new Date(task.due_date_c).toLocaleDateString()}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `task-${task.Id}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Task'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: {
        taskId: task.Id,
        reminderId: reminder.Id,
        taskTitle: task.title_c
      }
    };

    const notification = new Notification(task.title_c, options);

notification.onclick = () => {
      if (typeof window !== 'undefined' && window.focus) {
        window.focus();
        // Navigate to task (will be handled by the component)
        if (typeof window.CustomEvent === 'function') {
          window.dispatchEvent(new window.CustomEvent('task-notification-click', {
            detail: { taskId: task.Id }
          }));
        }
        notification.close();
      }
    };

    return notification;
  }

  async showInAppNotification(title, message, type = 'info', duration = 5000) {
    // Create in-app notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
    
    const typeStyles = {
      info: 'bg-blue-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-black',
      error: 'bg-red-500 text-white'
    };

    notification.className += ` ${typeStyles[type]}`;
    
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h4 class="font-medium">${title}</h4>
          <p class="text-sm opacity-90">${message}</p>
        </div>
        <button class="text-current opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }

    return notification;
  }

  isPermissionGranted() {
    return this.permission === 'granted';
  }

  canRequestPermission() {
    return this.permission === 'default';
  }
isNotificationSupported() {
    return 'Notification' in window;
  }
}

// Singleton instance
export const notificationService = new NotificationService();