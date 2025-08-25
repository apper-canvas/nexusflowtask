import { useState } from "react"
import { useLocation } from "react-router-dom"
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <ApperIcon name="Search" size={16} className="mr-2" />
            Search
          </Button>
          
          <Button variant="ghost" size="sm">
            <ApperIcon name="Bell" size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Header