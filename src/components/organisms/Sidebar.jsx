import { motion } from "framer-motion"
import NavItem from "@/components/molecules/NavItem"
import ApperIcon from "@/components/ApperIcon"

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const navItems = [
    { to: "/tasks", icon: "CheckSquare", label: "Tasks" },
    { to: "/calendar", icon: "Calendar", label: "Calendar" },
    { to: "/categories", icon: "Tags", label: "Categories" }
  ]

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              FlowTask
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>

          {/* Bottom section */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ApperIcon name="User" size={16} />
              <span>Productivity Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onMobileClose}
        >
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm" />
        </motion.div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isMobileOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <ApperIcon name="CheckSquare" size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                FlowTask
              </span>
            </div>
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <div key={item.to} onClick={onMobileClose}>
                <NavItem
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              </div>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ApperIcon name="User" size={16} />
              <span>Productivity Dashboard</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  )
}

export default Sidebar