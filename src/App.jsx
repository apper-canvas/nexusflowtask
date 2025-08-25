import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/organisms/Layout"
import TasksPage from "@/components/pages/TasksPage"
import CalendarPage from "@/components/pages/CalendarPage"
import CategoriesPage from "@/components/pages/CategoriesPage"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Routes>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-[9999]"
        />
      </div>
    </BrowserRouter>
  )
}

export default App