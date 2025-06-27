import { useState } from "react";
import Layout from "./Layout";
import { User, Mail, Lock, Bell, Palette } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: true,
    theme: "light"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would update settings via API
    alert("Settings updated successfully!");
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Lock className="w-5 h-5 mr-3" />
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'appearance' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Palette className="w-5 h-5 mr-3" />
                  Appearance
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Update Profile
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Preferences</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications"
                          checked={formData.notifications}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Appearance</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">Theme</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <label className={`border rounded-lg p-4 cursor-pointer ${formData.theme === 'light' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={formData.theme === 'light'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center">
                            <div className="w-full h-24 bg-white border border-gray-200 rounded mb-2"></div>
                            <span>Light</span>
                          </div>
                        </label>
                        <label className={`border rounded-lg p-4 cursor-pointer ${formData.theme === 'dark' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={formData.theme === 'dark'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center">
                            <div className="w-full h-24 bg-gray-800 border border-gray-700 rounded mb-2"></div>
                            <span>Dark</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Save Appearance
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}