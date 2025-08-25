import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const NavItem = ({ to, icon, label, isActive }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive: active }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
          active || isActive
            ? "text-primary-700 bg-gradient-to-r from-primary-100 to-primary-50"
            : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
        )
      }
    >
      {({ isActive: active }) => (
        <>
          {(active || isActive) && (
            <motion.div
              layoutId="activeNavItem"
              className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-3">
            <ApperIcon
              name={icon}
              size={18}
              className={(active || isActive) ? "text-primary-700" : "text-gray-500"}
            />
            <span>{label}</span>
          </div>
        </>
      )}
    </NavLink>
  )
}

export default NavItem