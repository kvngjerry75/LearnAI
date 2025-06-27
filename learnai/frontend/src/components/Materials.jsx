import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, FileText, FileInput, FileX, Loader2 } from "lucide-react";
import Layout from "./Layout";
import { getStudyMaterials, uploadStudyMaterial, deleteStudyMaterial } from "../api/api.jsx";

export default function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await getStudyMaterials();
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    
    try {
      const response = await uploadStudyMaterial(formData);
      setMaterials([response.data, ...materials]);
      setFile(null);
      setTitle("");
    } catch (error) {
      console.error("Error uploading material:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteStudyMaterial(id);
        setMaterials(materials.filter(material => material.id !== id));
      } catch (error) {
        console.error("Error deleting material:", error);
      }
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
          <h1 className="text-3xl font-bold text-gray-800">Study Materials</h1>
          <button 
            onClick={() => navigate('/materials/upload')}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FileUp className="w-5 h-5 mr-2" />
            Upload Material
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Material</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter a title for your material"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <div className="flex items-center">
                <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <FileInput className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {file ? file.name : "Click to select a file"}
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileUp className="w-5 h-5 mr-2" />
                  Upload Material
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Materials</h2>
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto w-12 h-12 text-gray-400" />
              <p className="mt-4 text-gray-500">You haven't uploaded any materials yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-full mr-4">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{material.title}</h3>
                      <p className="text-sm text-gray-500">
                        {material.file_type.toUpperCase()} • {new Date(material.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/materials/${material.id}`)}
                      className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-1 text-gray-500 hover:text-red-500"
                    >
                      <FileX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}