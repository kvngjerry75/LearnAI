import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Layout from "./Layout";
import { getQuizzes } from "../api/api.jsx";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getQuizzes();
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);

  const handleQuizClick = (quiz) => {
    if (quiz.is_completed) {
      // Navigate directly to results view for completed quizzes
      navigate(`/quizzes/${quiz.id}`, { 
        state: { 
          showResults: true,
          quizId: quiz.id 
        } 
      });
    } else {
      // Navigate to quiz taking view for incomplete quizzes
      navigate(`/quizzes/${quiz.id}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Practice Quizzes</h1>
          <button 
            onClick={() => navigate('/content')}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FileQuestion className="w-5 h-5 mr-2" />
            Create New Quiz
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileQuestion className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No quizzes yet</h3>
              <p className="text-gray-500">Generate your first quiz from your study materials</p>
              <button
                onClick={() => navigate('/content')}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Quiz
              </button>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleQuizClick(quiz)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-800">{quiz.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                {quiz.material ? (
                  <p className="text-gray-600 mb-4"> {quiz.material.title}</p>
                ) : (
                  <p className="text-gray-600 mb-4">General knowledge quiz</p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {quiz.questions_count || 10} questions
                  </span>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quiz.is_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quiz.is_completed ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Not Started
                        </>
                      )}
                    </span>
                    {quiz.is_completed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Score: {quiz.latest_score}/{quiz.latest_total}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}