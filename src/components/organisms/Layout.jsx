import { useState } from "react"
import Sidebar from "@/components/organisms/Sidebar"
import Header from "@/components/organisms/Header"

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={handleMobileMenuClose}
      />
      
      <div className="flex-1 flex flex-col">
        <Header onMobileMenuClick={handleMobileMenuToggle} />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout