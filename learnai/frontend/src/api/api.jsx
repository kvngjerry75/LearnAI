import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests for axios-based calls
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication using fetch correctly
export async function loginUser(username, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: await response.text() };
      }
      throw new Error(errorData.detail || "Login failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export const registerUser = async (username, password) => {
  const response = await fetch(`${BASE_URL}/api/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
};

// Study Materials using axios instance
export const getStudyMaterials = () => api.get('/materials/',{
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
});
export const uploadStudyMaterial = (formData) => api.post('/materials/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    
  },
});
export const deleteStudyMaterial = (id) => api.delete(`/materials/${id}/`);

// Generated Content using axios instance
export const getGeneratedContent = () => api.get('/content/');

// Quizzes using axios instance
export const getQuizzes = () => api.get('/quizzes/');
export const createQuiz = (data) => api.post('/quizzes/', data);

// Dashboard using axios instance
export const getDashboardStats = () => api.get('/dashboard/stats/');
export const getRecentActivity = () => api.get('/dashboard/activity/');

export const generateContent = (data) => api.post('/generate-content/', data);
export const getQuizDetails = (id) => api.get(`/quizzes/${id}/`);
// export const submitQuizResults = (data) => api.post('/quiz-results/', data);

export const submitQuizResults = (data) => api.post('/quiz-results/', {
    quiz_id: data.quiz_id,  // Explicitly reference the quiz_id
    score: data.score,
    total_questions: data.total_questions,
    answers: data.answers
  });
export const getUserStats = () => api.get('/user-stats/');

export const getQuizHistory = (quizId) => api.get(`/quizzes/${quizId}/history/`);
export const retakeQuiz = (quizId) => api.post(`/quizzes/${quizId}/retake/`);

export default api;