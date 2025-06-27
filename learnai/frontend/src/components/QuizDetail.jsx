import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  FileQuestion, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RotateCw, 
  BarChart2, 
  Award,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Layout from "./Layout";
import { getQuizDetails, submitQuizResults, getQuizHistory, retakeQuiz } from "../api/api.jsx";

function QuizResultsView({ 
  score, 
  totalQuestions, 
  questions, 
  answers, 
  onRetake, 
  onBack, 
  materialId,
  quizHistory
}) {
  const navigate = useNavigate();
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  const grade = calculateGrade(percentage);
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="text-center py-6">
      {!showReview ? (
        <>
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Award className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Quiz Results
          </h3>
          
          <div className="flex justify-center items-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {percentage}%
                </span>
              </div>
            </div>
            <div className="ml-8 text-left">
              <p className="text-lg mb-2">
                <span className="font-medium">Score:</span> {score} out of {totalQuestions}
              </p>
              <p className="text-lg mb-2">
                <span className="font-medium">Grade:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  grade === 'A' ? 'bg-green-100 text-green-800' :
                  grade === 'B' ? 'bg-blue-100 text-blue-800' :
                  grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                  grade === 'D' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {grade}
                </span>
              </p>
              <p className="text-lg">
                <span className="font-medium">Date:</span> {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => setShowReview(true)}
              className="flex items-center bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Review Answers
            </button>
            <button
              onClick={onRetake}
              className="flex items-center bg-white text-indigo-600 px-6 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Retake Quiz
            </button>
          </div>

          {quizHistory.length > 1 && (
            <div className="mt-8 bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Previous Attempts</h4>
              <div className="space-y-2">
                {quizHistory.slice(1).map((attempt, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>Attempt #{quizHistory.length - index - 1}</span>
                    <span className="font-medium">
                      {attempt.score}/{attempt.total_questions} ({Math.round((attempt.score / attempt.total_questions) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-left max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setShowReview(false)}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Results
            </button>
            <h4 className="text-lg font-semibold">Question Review</h4>
            <div></div> {/* Empty div for spacing */}
          </div>
          
          {questions.map((question, index) => {
            const answer = answers[index];
            return (
              <div 
                key={index} 
                className={`mb-6 p-4 rounded-lg ${answer?.correct ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex items-center mb-2">
                  {answer?.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium">Question {index + 1}</span>
                </div>
                <p className="mb-2">{question.question_text}</p>
                <p className="text-sm">
                  <span className="font-medium">Your answer:</span> {answer?.selected}
                </p>
                {!answer?.correct && (
                  <p className="text-sm">
                    <span className="font-medium">Correct answer:</span> {question.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const [quizResponse, historyResponse] = await Promise.all([
          getQuizDetails(id),
          getQuizHistory(id)
        ]);
        
        setQuiz(quizResponse.data);
        setQuizHistory(historyResponse.data);
        
        // Check if there's a completed result or if we should show results directly
        const completedQuiz = historyResponse.data.find(r => r.completed);
        const shouldShowResults = location.state?.showResults || completedQuiz;
        
        if (shouldShowResults) {
          setQuizCompleted(true);
          setScore(completedQuiz.score);
          setAnswers(completedQuiz.answers || []);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [id, navigate, location.state]);

  const handleNextQuestion = () => {
    const isCorrect = selectedOption === quiz.questions[currentQuestion].answer;
    const newAnswers = [...answers, {
      questionId: quiz.questions[currentQuestion].id,
      selected: selectedOption,
      correct: isCorrect
    }];
    
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = async (answerData) => {
    setSubmitting(true);
    try {
      const finalScore = score + (selectedOption === quiz.questions[currentQuestion].answer ? 1 : 0);
      
      await submitQuizResults({
        quiz_id: id,
        score: finalScore,
        total_questions: quiz.questions.length,
        answers: answerData
      });
      
      setQuizCompleted(true);
      setScore(finalScore);
      
      // Refresh history after completion
      const historyResponse = await getQuizHistory(id);
      setQuizHistory(historyResponse.data);
    } catch (error) {
      console.error("Error submitting quiz results:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeQuiz = async () => {
    try {
      await retakeQuiz(id);
      setCurrentQuestion(0);
      setSelectedOption(null);
      setScore(0);
      setQuizCompleted(false);
      setAnswers([]);
      
      // Refresh history after retaking
      const historyResponse = await getQuizHistory(id);
      setQuizHistory(historyResponse.data);
    } catch (error) {
      console.error("Error retaking quiz:", error);
    }
  };

  if (loading || !quiz) {
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
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/quizzes')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Quizzes
          </button>
          <div className="flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-600">
            <FileQuestion className="w-5 h-5 mr-2" />
            <span className="font-medium">Quiz</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {quizCompleted ? (
            <QuizResultsView 
              score={score}
              totalQuestions={quiz.questions.length}
              questions={quiz.questions}
              answers={answers}
              onRetake={handleRetakeQuiz}
              onBack={() => navigate('/quizzes')}
              materialId={quiz.material?.id}
              quizHistory={quizHistory}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
                  {quiz.material && (
                    <p className="text-gray-600">Based on: {quiz.material.title}</p>
                  )}
                </div>
                <div className="text-lg font-medium">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium text-gray-800 mb-4">
                  {quiz.questions[currentQuestion].question_text}
                </h3>
                <div className="space-y-3">
                  {quiz.questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(option)}
                      className={`w-full text-left p-4 rounded-lg border ${
                        selectedOption === option ? 
                        'border-indigo-500 bg-indigo-50' : 
                        'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                {currentQuestion > 0 && (
                  <button
                    onClick={() => {
                      setCurrentQuestion(currentQuestion - 1);
                      setSelectedOption(answers[currentQuestion - 1]?.selected || null);
                    }}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 px-4 py-2"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNextQuestion}
                  disabled={!selectedOption || submitting}
                  className={`ml-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors ${
                    !selectedOption ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {currentQuestion === quiz.questions.length - 1 ? (
                    submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                        Submitting...
                      </>
                    ) : 'Finish Quiz'
                  ) : (
                    <>
                      Next <ChevronRight className="w-5 h-5 ml-1 inline" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}