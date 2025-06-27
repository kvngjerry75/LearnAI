import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import MaterialDetail from './components/MaterialDetail';
import StudyMaterials from './components/materials';
import GeneratedContent from './components/GeneratedContent';
import ContentDetail from './components/ContentDetail';
import Quizzes from './components/Quizzes';
import QuizDetail from './components/QuizDetail';
import Settings from './components/Settings';


function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <PrivateRoute>
              <StudyMaterials />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/materials/:id"
          element={
            <PrivateRoute>
              <MaterialDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/content"
          element={
            <PrivateRoute>
              <GeneratedContent />
            </PrivateRoute>
          }
        />

        <Route
          path="/content/:id/:type"
          element={
            <PrivateRoute>
              <ContentDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/quizzes"
          element={
            <PrivateRoute>
              <Quizzes />
            </PrivateRoute>
          }
        />

        <Route
          path="/quizzes/:id"
          element={
            <PrivateRoute>
              <QuizDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        
      </Routes>
    </Router>
  );
}