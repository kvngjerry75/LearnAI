import { useEffect, useState } from "react";
import Layout from "./Layout.jsx";
import { useNavigate } from "react-router-dom";
import { 
  FileUp, 
  BookOpenText, 
  BrainCircuit, 
  FileQuestion,
  Sparkles
} from "lucide-react";
import { getDashboardStats, getRecentActivity } from "../api/api.jsx";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse] = await Promise.all([
        getDashboardStats(), 
        getRecentActivity()
      ]);
      
      setStats(statsResponse.data);
      setActivities(activityResponse.data.map(activity => ({
        ...activity,
        time: formatDistanceToNow(new Date(activity.time)) + ' ago'
      })));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

// Update statsData to use the new stats
const statsData = [
  { title: "Uploaded Documents", value: stats?.uploaded_documents || "0", icon: FileUp, color: "text-blue-500" },
  { title: "Study Materials", value: stats?.study_materials || "0", icon: BookOpenText, color: "text-green-500" },
  { title: "Generated Summaries", value: stats?.generated_summaries || "0", icon: BrainCircuit, color: "text-purple-500" },
  { title: "Practice Quizzes", value: stats?.practice_quizzes || "0", icon: FileQuestion, color: "text-yellow-500" },
];

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/materials')}
            >
              <div className="p-3 bg-blue-100 rounded-full mb-2">
                <FileUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm">Upload Document</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-purple-100 rounded-full mb-2">
                <BrainCircuit className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm">Generate Summary</span>
            </button>
            <button 
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/materials')}
            >
              <div className="p-3 bg-green-100 rounded-full mb-2">
                <BookOpenText className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm">View Materials</span>
            </button>
            <button 
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/quizzes')}
            >
              <div className="p-3 bg-yellow-100 rounded-full mb-2">
                <FileQuestion className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm">Take Quiz</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="p-2 bg-indigo-100 rounded-full mr-4">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}