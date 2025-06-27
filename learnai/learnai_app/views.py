from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.serializers import ModelSerializer
from django.utils import timezone
from datetime import datetime   

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import StudyMaterial, GeneratedContent, Quiz, Question, UserProfile, QuizAnswer, QuizResult
from .serializers import StudyMaterialSerializer, GeneratedContentSerializer, QuizSerializer, QuizResultSerializer, QuizAnswerSerializer, QuestionSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser


from .ai_service import generate_content
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
import json

class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer





class StudyMaterialListCreateView(generics.ListCreateAPIView):
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return StudyMaterial.objects.filter(user=self.request.user).order_by('-uploaded_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StudyMaterialDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return StudyMaterial.objects.filter(user=self.request.user)

class GeneratedContentListView(generics.ListAPIView):
    serializer_class = GeneratedContentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GeneratedContent.objects.filter(user=self.request.user).order_by('-created_at')

class QuizListView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Annotate each quiz with its latest result status
        from django.db.models import Max, OuterRef, Subquery
        from django.db.models.functions import Coalesce

        # Subquery to get the latest result for each quiz
        latest_results = QuizResult.objects.filter(
            quiz=OuterRef('pk'),
            user=self.request.user,
            completed=True  # Only look at completed quizzes
        ).order_by('-completed_at')

        quizzes = Quiz.objects.filter(user=self.request.user).annotate(
            is_completed=Coalesce(
                Subquery(latest_results.values('completed')[:1]),
                False
            ),
            latest_score=Coalesce(
                Subquery(latest_results.values('score')[:1]),
                0
            ),
            latest_total=Coalesce(
                Subquery(latest_results.values('total_questions')[:1]),
                0
            )
        ).order_by('-created_at')

        return quizzes
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DashboardStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        stats = {
            'uploaded_documents': StudyMaterial.objects.filter(user=user).count(),
            'study_materials': StudyMaterial.objects.filter(user=user).count(),
            'generated_summaries': GeneratedContent.objects.filter(user=user, content_type='summary').count(),
            'practice_quizzes': Quiz.objects.filter(user=user).count(),
        }
        return Response(stats)

class RecentActivityView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        recent_materials = StudyMaterial.objects.filter(user=user).order_by('-uploaded_at')[:3]
        recent_content = GeneratedContent.objects.filter(user=user).order_by('-created_at')[:3]
        
        activities = []
        
        for material in recent_materials:
            activities.append({
                'id': material.id,
                'action': f"Uploaded {material.title}",
                'time': material.uploaded_at,
                'type': 'material'
            })
        
        for content in recent_content:
            activities.append({
                'id': content.id,
                'action': f"Generated {content.get_content_type_display()} for {content.material.title}",
                'time': content.created_at,
                'type': 'content'
            })
        
        # Sort by time descending
        activities.sort(key=lambda x: x['time'], reverse=True)
        
        return Response(activities[:4])
    




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_ai_content(request):
    """
    Generate AI content for a study material
    """
    material_id = request.data.get('material_id')
    content_type = request.data.get('content_type')
    regenerate = request.data.get('regenerate', False)
    
    
    try:
        material = StudyMaterial.objects.get(id=material_id, user=request.user)
        
        if not material.extracted_text:
            return JsonResponse({'error': 'No extracted text available'}, status=400)
            
        # Check if content exists and regeneration is allowed
        if not regenerate and content_type in ['summary', 'notes']:
            existing = GeneratedContent.objects.filter(
                user=request.user,
                material=material,
                content_type=content_type
            ).first()
            if existing:
                return JsonResponse({
                    'content_id': existing.id,
                    'content': json.loads(existing.content) if existing.content.startswith('[') or existing.content.startswith('{') else existing.content,
                    'type': content_type,
                    'message': 'Using previously generated content'
                })

        # Generate content using AI
        ai_response = generate_content(material.extracted_text, content_type)
        
        if not ai_response:
            return JsonResponse({'error': 'Failed to generate content'}, status=500)
            
        # Save or update generated content
        content_data = {
            'content': json.dumps(ai_response['content']) if isinstance(ai_response['content'], (list, dict)) else ai_response['content']
        }
        
        generated_content, created = GeneratedContent.objects.update_or_create(
            user=request.user,
            material=material,
            content_type=content_type,
            defaults=content_data
        )
        
        # If it's a quiz, create quiz records
        if content_type == 'quiz' and isinstance(ai_response['content'], list):
            quiz = Quiz.objects.create(
                user=request.user,
                material=material,
                title=f"Quiz: {material.title} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            )
            
            for question_data in ai_response['content']:
                Question.objects.create(
                    quiz=quiz,
                    question_text=question_data.get('question_text', ''),
                    answer=question_data.get('answer', ''),
                    options=question_data.get('options', [])
                )
            
            return JsonResponse({
                'quiz_id': quiz.id,
                'content': ai_response['content'],  # Return the content for immediate use
                'message': 'Quiz generated successfully'
            })

        
        # Update user profile stats for other content types
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        if content_type == 'summary':
            profile.summaries_generated += 1
        elif content_type == 'notes':
            profile.notes_generated += 1
        elif content_type == 'flashcards':
            profile.flashcards_generated += 1
        profile.save()
        
        return JsonResponse({
            'content_id': generated_content.id,
            'content': ai_response['content'],
            'type': content_type
        })
        
    except StudyMaterial.DoesNotExist:
        return JsonResponse({'error': 'Material not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_stats(request):
    """
    Get user statistics for dashboard
    """
    try:
        profile = UserProfile.objects.get(user=request.user)
        return JsonResponse({
            'uploaded_documents': StudyMaterial.objects.filter(user=request.user).count(),
            'study_materials': StudyMaterial.objects.filter(user=request.user).count(),
            'generated_summaries': profile.summaries_generated,
            'practice_quizzes': profile.quizzes_taken,
            'flashcards_created': profile.flashcards_generated,
            'notes_created': profile.notes_generated
        })
    except UserProfile.DoesNotExist:
        return JsonResponse({
            'uploaded_documents': 0,
            'study_materials': 0,
            'generated_summaries': 0,
            'practice_quizzes': 0,
            'flashcards_created': 0,
            'notes_created': 0
        })
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_results(request):
    try:
        quiz_id = request.data.get('quiz_id')
        if not quiz_id:
            return JsonResponse({'error': 'Quiz ID is required'}, status=400)
            
        quiz = Quiz.objects.filter(id=quiz_id, user=request.user).first()
        if not quiz:
            return JsonResponse({'error': 'Quiz not found'}, status=404)
            
        score = request.data.get('score')
        total_questions = request.data.get('total_questions')
        answers = request.data.get('answers', [])
        is_retake = request.data.get('is_retake', False)
        
        # Check if quiz was already completed and this is not a retake
        existing_result = QuizResult.objects.filter(
            user=request.user,
            quiz=quiz,
            completed=True
        ).first()
        
        if existing_result and not is_retake:
            return JsonResponse({
                'error': 'Quiz already completed. Use retake option to try again.',
                'result_id': existing_result.id
            }, status=400)
        
        # If it's a retake, mark previous results as not completed
        if is_retake:
            QuizResult.objects.filter(
                user=request.user,
                quiz=quiz,
                completed=True
            ).update(completed=False)
        
        # Create new quiz result
        quiz_result = QuizResult.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            total_questions=total_questions,
            completed=True
        )
        
        # Create quiz answers
        for answer in answers:
            try:
                question = Question.objects.get(id=answer['questionId'], quiz=quiz)
                QuizAnswer.objects.create(
                    quiz_result=quiz_result,
                    question=question,
                    selected_option=answer['selected'],
                    is_correct=answer['correct']
                )
            except Question.DoesNotExist:
                continue
        
        # Update user profile
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.quizzes_taken += 1
        profile.save()
        
        return JsonResponse({
            'result_id': quiz_result.id,
            'percentage': quiz_result.percentage(),
            'message': 'Quiz results saved successfully'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# Add new view for quiz history
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_history(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id, user=request.user)
        results = QuizResult.objects.filter(
            user=request.user,
            quiz=quiz
        ).order_by('-completed_at')
        
        serializer = QuizResultSerializer(results, many=True)
        return Response(serializer.data)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retake_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id, user=request.user)
        
        # Mark previous result as not completed (for history)
        QuizResult.objects.filter(
            user=request.user,
            quiz=quiz,
            completed=True
        ).update(completed=False)
        
        return JsonResponse({
            'message': 'Quiz reset for retaking',
            'quiz_id': quiz.id
        })
    except Quiz.DoesNotExist:
        return JsonResponse({'error': 'Quiz not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_details(request, pk):
    try:
        quiz = Quiz.objects.get(id=pk, user=request.user)
        questions = Question.objects.filter(quiz=quiz)
        
        quiz_serializer = QuizSerializer(quiz)
        question_serializer = QuestionSerializer(questions, many=True)
        
        return JsonResponse({
            'quiz': quiz_serializer.data,
            'questions': question_serializer.data
        })
    except Quiz.DoesNotExist:
        return JsonResponse({'error': 'Quiz not found'}, status=404)
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_existing_content(request):
    material_id = request.GET.get('material_id')
    if not material_id:
        return Response({'error': 'material_id is required'}, status=400)
    
    try:
        material = StudyMaterial.objects.get(id=material_id, user=request.user)
        existing_content = GeneratedContent.objects.filter(
            user=request.user,
            material=material
        ).exclude(content_type__in=['quiz', 'flashcards'])  # Exclude quizzes and flashcards
        
        result = {
            'summary': None,
            'notes': None,
            'flashcards': None,
            'quiz': None
        }
        
        for content in existing_content:
            result[content.content_type] = {
                'id': content.id,
                'created_at': content.created_at,
                'updated_at': content.updated_at
            }
        
        return Response(result)
    except StudyMaterial.DoesNotExist:
        return Response({'error': 'Material not found'}, status=404)
    

    

class GeneratedContentDetailView(generics.RetrieveAPIView):
    serializer_class = GeneratedContentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GeneratedContent.objects.filter(user=self.request.user)