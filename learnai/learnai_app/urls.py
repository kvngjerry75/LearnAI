from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    StudyMaterialListCreateView,
    StudyMaterialDetailView,
    GeneratedContentListView,
    QuizListView,
    DashboardStatsView,
    RecentActivityView,
    generate_ai_content,
    get_user_stats,
    submit_quiz_results,
    get_quiz_details,
    check_existing_content,
    GeneratedContentDetailView,
    get_quiz_history,
    retake_quiz,
    )

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Study Materials
    path('materials/', StudyMaterialListCreateView.as_view(), name='material-list'),
    path('materials/<int:pk>/', StudyMaterialDetailView.as_view(), name='material-detail'),
    
    # Generated Content
    path('content/', GeneratedContentListView.as_view(), name='content-list'),
    
    # Quizzes
    path('quizzes/', QuizListView.as_view(), name='quiz-list'),
    
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/activity/', RecentActivityView.as_view(), name='recent-activity'),
    path('generate-content/', generate_ai_content, name='generate-content'),
    path('user-stats/', get_user_stats, name='user-stats'),


    path('quiz-results/', submit_quiz_results, name='submit-quiz-results'),
    path('quizzes/<int:pk>/', get_quiz_details, name='quiz-details'),

    path('content/existing/', check_existing_content, name='check-existing-content'),

    path('content/<int:pk>/', GeneratedContentDetailView.as_view(), name='content-detail'),

    path('quizzes/<int:quiz_id>/history/', get_quiz_history, name='quiz-history'),
    path('quizzes/<int:quiz_id>/retake/', retake_quiz, name='retake-quiz'),
]