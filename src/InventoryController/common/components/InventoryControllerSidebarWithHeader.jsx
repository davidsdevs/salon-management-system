"use client"
import { LogOut, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../../contexts/AuthContext"
import { 
  LayoutDashboard, 
  Boxes, 
  Package, 
  Truck, 
  ClipboardList, 
  FileText, 
  User 
} from "lucide-react"

const InventoryControllerSidebarWithHeader = ({ userInfo, pageTitle, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, branchInfo } = useAuth()

  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date().toLocaleDateString("en-US", options)
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, route: "/inventory-dashboard" },
    { name: "Products", icon: Package, route: "/inventory-products" },
    { name: "Stock Management", icon: Boxes, route: "/inventory-controller-stock" },
    { name: "Suppliers", icon: Truck, route: "/inventory-controller-suppliers" },
    { name: "Purchase Orders / Stock Requests", icon: ClipboardList, route: "/inventory-controller-requests" },
    { name: "Deliveries", icon: Truck, route: "/inventory-controller-deliveries" },
    { name: "Reports", icon: FileText, route: "/inventory-controller-reports" },
    { name: "Profile", icon: User, route: "/inventory-controller-profile" }
  ]
  
  // ✅ Sync active menu with current route
  useEffect(() => {
    const current = menuItems.find(item => location.pathname.startsWith(item.route))
    if (current) {
      setActiveItem(current.name)
    }
  }, [location.pathname])

  const handleMenuItemClick = (itemName, route) => {
    setActiveItem(itemName)
    navigate(route)
    setSidebarOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="flex min-h-screen w-full font-poppins bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            {/* Logo */}
            <div className="flex items-center mb-6">
              <img src="/logo.png" alt="David's Salon" className="h-8 w-auto" />
            </div>

            {/* Branch Info */}
            {branchInfo && (
              <div className="mb-6">
                <div className="w-full px-4 py-3 border border-[#160B53] rounded-lg text-center">
                  <p className="text-[#160B53] font-medium text-sm">{branchInfo.name}</p>
                </div>
              </div>
            )}

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                <img
                  src={userInfo.profileImage || "/placeholder.svg"}
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{userInfo.name}</h3>
                <p className="text-sm text-gray-500">{userInfo.badge}</p>
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 px-4 py-2 overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleMenuItemClick(item.name, item.route)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeItem === item.name
                      ? "bg-[#160B53] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6 lg:py-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title and Date */}
            <div className="flex-1 lg:ml-0">
              <h1 className="text-2xl font-semibold text-[#160B53]">{pageTitle}</h1>
              <p className="text-gray-600">{getCurrentDate()}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-[#160B53] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default InventoryControllerSidebarWithHeader
