import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { format, formatDistanceToNow } from "date-fns";
import { 
  markAsRead, 
  markAllAsRead, 
  removeNotification, 
  setNotificationCenterOpen 
} from "@/store/notificationSlice";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotificationCenter = ({ isOpen, onClose, onNavigateToTask }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(state => state.notifications);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
    
    if (notification.taskId && onNavigateToTask) {
      onNavigateToTask(notification.taskId);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleRemoveNotification = (id, event) => {
    event.stopPropagation();
    dispatch(removeNotification(id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder':
        return "Bell";
      case 'task_due':
        return "AlertTriangle";
      case 'task_completed':
        return "CheckCircle";
      default:
        return "Info";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'reminder':
        return "text-blue-600";
      case 'task_due':
        return "text-orange-600";
      case 'task_completed':
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ApperIcon name="Bell" size={16} />
              <h3 className="font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkAllRead}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Mark all read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="p-1"
              >
                <ApperIcon name="X" size={14} />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <ApperIcon name="Bell" size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        <ApperIcon 
                          name={getNotificationIcon(notification.type)} 
                          size={16} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          !notification.read ? 'font-medium' : 'font-normal'
                        } text-gray-900`}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleRemoveNotification(notification.id, e)}
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ApperIcon name="X" size={12} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={() => {
                  // Could navigate to a full notifications page
                  onClose();
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;