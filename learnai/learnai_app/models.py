from django.db import models
from django.contrib.auth.models import User
import os
from datetime import datetime
import textract
from PyPDF2 import PdfReader

def extract_text_pypdf2(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = PdfReader(pdf_file)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text with PyPDF2: {e}")
        return None
    

    
def user_directory_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f'user_{instance.user.id}/{datetime.now().strftime("%Y%m%d_%H%M%S")}_{filename}'
    

class StudyMaterial(models.Model):
    MATERIAL_TYPES = [
        ('pdf', 'PDF'),
        ('docx', 'Word Document'),
        ('ppt', 'PowerPoint'),
        ('txt', 'Text File'),
        ('img', 'Image'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=user_directory_path)
    file_type = models.CharField(max_length=10, choices=MATERIAL_TYPES)
    extracted_text = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Set file type based on extension
        ext = os.path.splitext(self.file.name)[1][1:].lower()
        if ext in ['pdf', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png']:
            self.file_type = ext if ext != 'pptx' else 'ppt'

        super().save(*args, **kwargs)

        # Extract text if not already processed
        if not self.processed and self.file_type in ['pdf', 'docx', 'ppt', 'txt']:
            self.extract_text()

    def extract_text(self):
        try:
            if self.file_type == 'pdf':
                text = ""
                try:
                    with open(self.file.path, 'rb') as pdf_file:  
                        pdf_reader = PdfReader(pdf_file)
                        for page_num in range(len(pdf_reader.pages)):
                            page = pdf_reader.pages[page_num]
                            page_text = page.extract_text()
                            if page_text:  # Check if page_text is not None
                                text += page_text + "\n"  # Add a newline between pages (optional)
                except Exception as pdf_exception:
                    print(f"Error extracting text from PDF with PyPDF2: {pdf_exception}")
                    text = ""  # set to empty string to avoid errors.
            else:
                text = textract.process(self.file.path).decode('utf-8')
            self.extracted_text = text
            self.processed = True
            self.save()
        except Exception as e:
            print(f"Error extracting text: {e}")
            self.extracted_text = ""  # Important: Handle errors to prevent unexpected behavior
            self.processed = False
            self.save()  # save the model even on error

class GeneratedContent(models.Model):
    CONTENT_TYPES = [
        ('summary', 'Summary'),
        ('notes', 'Study Notes'),
        ('flashcards', 'Flashcards'),
        ('quiz', 'Quiz'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    material = models.ForeignKey(StudyMaterial, on_delete=models.CASCADE)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 

    class Meta:
        unique_together = ('user', 'material', 'content_type') 

class Quiz(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    material = models.ForeignKey(StudyMaterial, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    answer = models.TextField()
    options = models.JSONField(default=list)  # For multiple choice questions


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    summaries_generated = models.PositiveIntegerField(default=0)
    quizzes_taken = models.PositiveIntegerField(default=0)
    flashcards_generated = models.PositiveIntegerField(default=0)
    notes_generated = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"



class QuizResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=True)  # New field
    
    class Meta:
        ordering = ['-completed_at']
        unique_together = ('user', 'quiz')  # One result per user per quiz unless retaken

    def percentage(self):
        return round((self.score / self.total_questions) * 100) if self.total_questions > 0 else 0

class QuizAnswer(models.Model):
    quiz_result = models.ForeignKey(QuizResult, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.TextField()
    is_correct = models.BooleanField()