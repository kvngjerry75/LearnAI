 LearnAI - Intelligent Learning Assistant

A full-stack web application that leverages AI to transform study materials into interactive learning content. Built with Django REST Framework and React.

 Features

- User Authentication & Authorization
  - JWT-based authentication
  - Secure user registration and login
  - Protected routes and API endpoints

- Study Material Management
  - Upload and manage study materials (PDF, TXT)
  - Organize learning resources
  - View and track uploaded materials

- AI-Powered Content Generation
  - Generate summaries from study materials
  - Create interactive study notes
  - Generate flashcards for effective learning
  - Auto-generate quizzes based on content

- Interactive Learning
  - Take AI-generated quizzes
  - Review flashcards
  - Track learning progress
  - Save and revisit generated content

 Tech Stack

 Backend
- Django
- Django REST Framework
- Google GenerativeAI
- SQLite3
- JWT Authentication

 Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

 Getting Started

 Prerequisites
- Python 3.x
- Node.js
- npm/yarn

 API Endpoints
/api/register/ - User registration
/api/token/ - JWT token obtainment
/api/token/refresh/ - JWT token refresh
/api/materials/ - Study material management
/api/content/ - Generated content endpoints
/api/quizzes/ - Quiz management  
