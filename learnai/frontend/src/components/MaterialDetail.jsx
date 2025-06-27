import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, FileX, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Layout from "./Layout";
import { getStudyMaterials } from "../api/api.jsx";

export default function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("text");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await getStudyMaterials();
        const foundMaterial = response.data.find(m => m.id === parseInt(id));
        if (foundMaterial) {
          setMaterial(foundMaterial);
        } else {
          navigate('/materials');
        }
      } catch (error) {
        console.error("Error fetching material:", error);
        navigate('/materials');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterial();
  }, [id, navigate]);

  const generateSummary = async () => {
    setGenerating(true);
    try {
      // Here you would call your AI service
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Summary generated successfully!");
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !material) {
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
        <button 
          onClick={() => navigate('/materials')}
          className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Materials
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{material.title}</h1>
          <div className="flex space-x-2">
            <button 
              onClick={generateSummary}
              disabled={generating}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Summary
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('text')}
            >
              Extracted Text
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('info')}
            >
              File Information
            </button>
          </div>

          {activeTab === 'text' ? (
            <div className="prose max-w-none">
              {material.extracted_text ? (
                <pre className="whitespace-pre-wrap font-sans">{material.extracted_text}</pre>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No text extracted from this file.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex">
                <div className="w-1/3 font-medium text-gray-500">File Type</div>
                <div className="w-2/3">{material.file_type.toUpperCase()}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 font-medium text-gray-500">Uploaded</div>
                <div className="w-2/3">{new Date(material.uploaded_at).toLocaleString()}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 font-medium text-gray-500">Status</div>
                <div className="w-2/3">
                  {material.processed ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Processed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  )}
                </div>
              </div>
              <div className="flex">
                <div className="w-1/3 font-medium text-gray-500">Actions</div>
                <div className="w-2/3">
                  <a 
                    href={material.file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 mr-4"
                  >
                    Download Original
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}