from rest_framework import serializers
from .models import StudyMaterial, GeneratedContent, Quiz, Question, QuizAnswer, QuizResult
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class StudyMaterialSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudyMaterial
        fields = ['id', 'user', 'title', 'file', 'file_type', 'extracted_text', 'uploaded_at', 'processed']
        read_only_fields = ['file_type', 'extracted_text', 'uploaded_at', 'processed']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class GeneratedContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedContent
        fields = ['id', 'material', 'content_type', 'content', 'created_at']

class QuizSerializer(serializers.ModelSerializer):
    # These field names must match the annotated fields in the view
    is_completed = serializers.BooleanField(read_only=True, default=False)
    latest_score = serializers.IntegerField(read_only=True, default=0)
    latest_total = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 
            'material', 
            'title', 
            'created_at',
            'is_completed',
            'latest_score',
            'latest_total'
        ]

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'question_text', 'answer', 'options']


class QuizResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizResult
        fields = ['id', 'quiz', 'score', 'total_questions', 'completed_at']

class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['question', 'selected_option', 'is_correct']