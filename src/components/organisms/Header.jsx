import { useState, useContext } from "react"
import { useLocation } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux'
import { AuthContext } from '@/App'
import { setNotificationCenterOpen } from '@/store/notificationSlice'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import NotificationCenter from '@/components/molecules/NotificationCenter'
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
const Header = ({ onMobileMenuClick }) => {
  const location = useLocation()
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/tasks":
        return "Tasks"
      case "/calendar":
        return "Calendar"
      case "/categories":
        return "Categories"
      default:
        return "FlowTask"
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ApperIcon name="Menu" size={20} />
          </button>
          
          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Organize and track your daily activities
            </p>
          </div>
        </div>

{/* Header actions */}
        <HeaderActions />
      </div>
    </div>
  )
}

const HeaderActions = () => {
  const { logout } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { unreadCount, isNotificationCenterOpen } = useSelector((state) => state.notifications);
  const { requestNotificationPermission, navigateToTask, canRequestPermission } = useNotificationSystem();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const handleNotificationClick = async () => {
    if (canRequestPermission) {
      try {
        await requestNotificationPermission();
      } catch (error) {
        console.error("Failed to request notification permission:", error);
      }
    }
    setShowNotificationCenter(!showNotificationCenter);
  };

  const handleNotificationCenterClose = () => {
    setShowNotificationCenter(false);
  };
  return (
    <div className="flex items-center gap-3">
<Button 
        variant="ghost" 
        size="sm" 
        className="hidden sm:flex"
        onClick={() => {
          // Focus search input if available
          const searchInput = document.querySelector('input[placeholder*="Search"]');
          if (searchInput) {
            searchInput.focus();
          }
        }}
      >
        <ApperIcon name="Search" size={16} className="mr-2" />
        Search
      </Button>
      
<div className="relative">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNotificationClick}
          className="relative"
        >
          <ApperIcon name="Bell" size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        
        <NotificationCenter
          isOpen={showNotificationCenter}
          onClose={handleNotificationCenterClose}
          onNavigateToTask={navigateToTask}
        />
      </div>

      {isAuthenticated && (
        <>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <ApperIcon name="User" size={16} />
            <span>{user?.firstName || 'User'}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            <ApperIcon name="LogOut" size={16} className="mr-2" />
            Logout
          </Button>
        </>
      )}
    </div>
  );
};

export default Header;