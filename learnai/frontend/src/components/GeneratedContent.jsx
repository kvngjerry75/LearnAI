import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, BookOpen, FileQuestion, Sparkles, Loader2, Eye, XCircle } from "lucide-react";
import Layout from "./Layout";
import { getStudyMaterials, generateContent as generateContentApi } from "../api/api.jsx";
import api from "../api/api.jsx";

export default function GeneratedContent() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [existingContent, setExistingContent] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await getStudyMaterials();
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
        setError("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (selectedMaterial) {
      const checkExistingContent = async () => {
        try {
          const response = await api.get(`/content/existing/?material_id=${selectedMaterial.id}`);
          setExistingContent(response.data);
        } catch (error) {
          console.error("Error checking existing content:", error);
        }
      };
      checkExistingContent();
    }
  }, [selectedMaterial]);

  const handleGenerateContent = async (type) => {
    if (!selectedMaterial) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const response = await generateContentApi({
        material_id: selectedMaterial.id,
        content_type: type
      });
      
      if (type === 'quiz' && response.data.quiz_id) {
        navigate(`/quizzes/${response.data.quiz_id}`);
      } else {
        navigate(`/content/${selectedMaterial.id}/${type}`, {
          state: {
            content: response.data.content,
            title: selectedMaterial.title
          }
        });
      }
    } catch (err) {
      console.error("Error generating content:", err);
      setError("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateOrView = async (type) => {
  if (existingContent[type]) {
    try {
      if (type === 'quiz') {
        // For quizzes, navigate directly to the quiz details
        navigate(`/quizzes/${existingContent[type].id}`);
      } else {
        // For other content types, fetch the existing content first
        const response = await api.get(`/content/${existingContent[type].id}/`);
        navigate(`/content/${selectedMaterial.id}/${type}`, {
          state: { 
            content: response.data.content,
            title: selectedMaterial.title,
            fromExisting: true
          }
        });
      }
    } catch (err) {
      console.error("Error fetching existing content:", err);
      setError("Failed to load existing content. Please try again.");
    }
  } else {
    // Generate new content
    await handleGenerateContent(type);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Content</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Materials List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Study Materials</h2>
            {materials.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                You haven't uploaded any materials yet.
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => setSelectedMaterial(material)}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedMaterial?.id === material.id 
                        ? 'bg-indigo-50 border border-indigo-200' 
                        : 'hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-indigo-600 mr-3" />
                      <span className="font-medium">{material.title}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {material.file_type.toUpperCase()} • {new Date(material.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Generation Options */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedMaterial ? `Generate from "${selectedMaterial.title}"` : "Select a material to generate content"}
              </h2>
              
              {selectedMaterial ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ContentButton
                    type="summary"
                    label="Summary"
                    icon={Sparkles}
                    description="View or generate a concise summary"
                    existing={existingContent.summary}
                    onClick={handleGenerateOrView}
                    generating={generating}
                  />

                  <ContentButton
                    type="notes"
                    label="Study Notes"
                    icon={BookOpen}
                    description="View or create organized study notes"
                    existing={existingContent.notes}
                    onClick={handleGenerateOrView}
                    generating={generating}
                  />

                  <ContentButton
                    type="flashcards"
                    label="Flashcards"
                    icon={FileText}
                    description="View or generate question-answer pairs"
                    existing={existingContent.flashcards}
                    onClick={handleGenerateOrView}
                    generating={generating}
                  />

                  <ContentButton
                    type="quiz"
                    label="Practice Quiz"
                    icon={FileQuestion}
                    description="View or create a quiz"
                    existing={existingContent.quiz}
                    onClick={handleGenerateOrView}
                    generating={generating}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="mx-auto w-10 h-10 mb-4 text-gray-300" />
                  <p>Select a study material from the list to generate content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ContentButton({ type, label, icon: Icon, description, existing, onClick, generating }) {
  const buttonText = existing ? `View ${label}` : `Generate ${label}`;
  const actionText = existing ? "View" : "Generate";
  
  return (
    <button
      onClick={() => onClick(type)}
      disabled={generating}
      className={`flex flex-col items-center p-6 border rounded-xl transition-colors disabled:opacity-50 ${
        existing
          ? 'border-green-200 bg-green-50 hover:bg-green-100'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className={`p-3 rounded-full mb-3 ${
        existing ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
      }`}>
        {generating ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : existing ? (
          <Eye className="w-6 h-6" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>
      <h3 className="font-medium text-gray-800 mb-1">{label}</h3>
      <p className="text-sm text-gray-500 text-center">{description}</p>
      <span className="text-xs mt-2 font-medium">
        {generating ? 'Processing...' : actionText}
      </span>
    </button>
  );
}