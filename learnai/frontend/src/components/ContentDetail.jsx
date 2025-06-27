import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  FileText, 
  FileQuestion, 
  Check, 
  X, 
  RefreshCw,
  Loader2,
  Clipboard,
  Download
} from "lucide-react";
import Layout from "./Layout";
import { generateContent as generateContentApi } from "../api/api.jsx";
import api from "../api/api.jsx";

const ContentRenderer = ({ content }) => {
  if (typeof content !== 'string') {
    return <pre className="whitespace-pre-wrap font-sans p-4 bg-gray-50 rounded-lg">{JSON.stringify(content, null, 2)}</pre>;
  }

  const sections = content.split(/(## .+|\*\*.+\*\*)/).filter(Boolean);
  
  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        if (section.match(/^## /)) {
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200">
              {section.replace('## ', '')}
            </h2>
          );
        }
        if (section.match(/^\*\*/)) {
          return (
            <h3 key={index} className="text-xl font-semibold text-gray-700 mt-6 mb-3">
              {section.replace(/\*\*/g, '')}
            </h3>
          );
        }
        if (section.match(/^\* /)) {
          return (
            <ul key={index} className="list-disc pl-6 space-y-2">
              {section.split('\n').filter(Boolean).map((item, i) => (
                <li key={i} className="text-gray-700 leading-relaxed">
                  {item.replace(/^\* /, '').trim()}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-gray-700 leading-relaxed">
            {section.split('\n').map((paragraph, i) => (
              <span key={i}>
                {paragraph}
                <br />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default function ContentDetail() {
  const { id, type } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [canRegenerate, setCanRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (state?.content) {
      try {
        const parsedContent = typeof state.content === 'string' ? 
          JSON.parse(state.content) : state.content;
        setContent(parsedContent);
      } catch (e) {
        setContent(state.content);
      }
      setLoading(false);
    } else {
      navigate('/content');
    }

    setCanRegenerate(
      (type === 'quiz' || type === 'flashcards') && 
      !state?.fromExisting
    );
  }, [state, navigate, type]);

  const contentTypes = {
    summary: {
      title: "Summary",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-600",
      description: "Concise overview of key points"
    },
    notes: {
      title: "Study Notes",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      description: "Organized notes with explanations"
    },
    flashcards: {
      title: "Flashcards",
      icon: FileText,
      color: "bg-green-100 text-green-600",
      description: "Question-answer pairs for memorization"
    },
    quiz: {
      title: "Practice Quiz",
      icon: FileQuestion,
      color: "bg-yellow-100 text-yellow-600",
      description: "Test your understanding"
    }
  };

  const currentType = contentTypes[type] || contentTypes.summary;

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex(prev => (prev + 1) % content.length);
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex(prev => (prev - 1 + content.length) % content.length);
  };

  const handleRegenerate = async () => {
    if (!canRegenerate) return;
    
    setRegenerating(true);
    try {
      const response = await generateContentApi({
        material_id: id,
        content_type: type,
        regenerate: true
      });
      
      if (type === 'quiz' && response.data.quiz_id) {
        navigate(`/quizzes/${response.data.quiz_id}`, { replace: true });
      } else {
        navigate(`/content/${id}/${type}`, {
          state: { 
            content: response.data.content,
            title: state?.title,
            regenerated: true
          },
          replace: true
        });
      }
    } catch (error) {
      console.error("Regeneration failed:", error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log("Download as PDF");
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/content')}
              className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className={`flex items-center px-4 py-2 rounded-full ${currentType.color}`}>
              <currentType.icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{currentType.title}</span>
            </div>
            <span className="ml-4 text-gray-600">{state?.title || ''}</span>
          </div>
          
          {canRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
            >
              {regenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Regenerate
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
          {(type === 'summary' || type === 'notes') && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={handleCopyToClipboard}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                title="Copy to clipboard"
              >
                <Clipboard className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                title="Download as PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}

          {type === 'flashcards' && Array.isArray(content) ? (
            <div className="flex flex-col items-center">
              <div 
                className={`w-full max-w-lg h-64 rounded-xl shadow-md cursor-pointer transition-all duration-500 ${
                  isFlipped ? 'bg-indigo-50' : 'bg-white'
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`flex items-center justify-center h-full p-6 text-center ${
                  isFlipped ? 'hidden' : 'block'
                }`}>
                  <h3 className="text-xl font-medium">{content[flashcardIndex]?.front || 'Front of card'}</h3>
                </div>
                <div className={`flex items-center justify-center h-full p-6 text-center ${
                  isFlipped ? 'block' : 'hidden'
                }`}>
                  <p className="text-lg">{content[flashcardIndex]?.back || 'Back of card'}</p>
                </div>
              </div>
              
              <div className="flex justify-between w-full max-w-lg mt-6">
                <button
                  onClick={handlePrevFlashcard}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Previous
                </button>
                <span className="self-center text-gray-500">
                  {flashcardIndex + 1} / {content.length}
                </span>
                <button
                  onClick={handleNextFlashcard}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          ) : type === 'quiz' && Array.isArray(content) ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz: {state?.title || ''}</h2>
              <div className="space-y-6">
                {content.map((question, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">{index + 1}. {question.question_text}</h3>
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div 
                          key={optIndex}
                          className={`p-3 border rounded-lg ${
                            question.answer === option 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            {question.answer === option ? (
                              <Check className="w-5 h-5 text-green-500 mr-2" />
                            ) : (
                              <div className="w-5 h-5 mr-2"></div>
                            )}
                            {option}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : type === 'summary' ? (
            <div className="summary-content p-4">
              <ContentRenderer content={content} />
              {state?.title && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  Generated from: {state.title}
                </div>
              )}
            </div>
          ) : type === 'notes' ? (
            <div className="notes-content p-4">
              <ContentRenderer content={content} />
              {state?.title && (
                <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  Generated from: {state.title}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Unsupported content type</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}