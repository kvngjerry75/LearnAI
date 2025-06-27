import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: BookOpen, label: "Study Materials", path: "/materials" },
    { icon: FileText, label: "Generate Content", path: "/content" },
    { icon: HelpCircle, label: "Quizzes", path: "/quizzes" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-indigo-700 text-white transition-all duration-300 relative ${collapsed ? "w-20" : "w-64"}`}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-600">
          {!collapsed && <h1 className="text-xl font-bold">LearnAI</h1>}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full hover:bg-indigo-600"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="mt-6">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full p-3 ${collapsed ? "justify-center" : "px-6"} hover:bg-indigo-600 transition-colors`}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-600">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full ${collapsed ? "justify-center" : "px-6"} py-2 text-white hover:bg-indigo-600 rounded transition-colors`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}