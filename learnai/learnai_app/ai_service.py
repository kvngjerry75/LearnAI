import google.generativeai as genai
from django.conf import settings
import json
import logging
import re

# Set up basic logging
logging.basicConfig(level=logging.ERROR)  # Configure logging to handle errors

def extract_json_from_text(text):
    """
    Extract the first JSON object or array from a string, even if wrapped in markdown/code blocks.
    """
    # Remove markdown code block markers
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE)
    # Find the first JSON array or object in the text
    match = re.search(r'(\[.*\]|\{.*\})', text, re.DOTALL)
    if match:
        return match.group(1)
    return text  # fallback

def generate_content(material_text, content_type):
    """
    Generate different types of content using Gemini AI.

    Args:
        material_text (str): The input study material.
        content_type (str): The type of content to generate ('summary', 'notes', 'flashcards', 'quiz').

    Returns:
        dict: A dictionary containing the generated content and its type, or None on error.
              - 'content': The generated content (str, list, or dict).
              - 'type': The content type (str).
    """
    # Initialize the Gemini client
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logging.error(f"Error configuring Gemini API: {e}")
        return None  # Important: Return None on error

    model_name = 'gemini-1.5-flash'  # Use the recommended model
    model = genai.GenerativeModel(model_name)

    try:
        if content_type == 'summary':
            prompt = f"""
                Please generate a concise and well-structured summary of the following study material.
                The summary should capture all key concepts, main ideas, and important details.
                Use clear headings and bullet points for better readability.

                Study Material:
                {material_text}
                """
            response = model.generate_content(prompt)
            return {
                'content': response.text,
                'type': 'summary'
            }

        elif content_type == 'notes':
            prompt = f"""
                Transform this study material into comprehensive study notes.
                Organize the content with clear headings, subheadings, and bullet points.
                Include definitions of key terms, important concepts, and relevant examples.
                Make sure the notes are well-structured for effective studying.

                Study Material:
                {material_text}
                """
            response = model.generate_content(prompt)
            return {
                'content': response.text,
                'type': 'notes'
            }

        elif content_type == 'flashcards':
            prompt = f"""
                Create a set of flashcards (10-15 cards) from this study material.
                For each flashcard, provide a clear question or term on the front,
                and a concise, accurate answer or definition on the back.
                Format your response as a JSON array where each element has 'front' and 'back' keys.

                Study Material:
                {material_text}
                """
            response = model.generate_content(prompt)
            try:
                json_text = extract_json_from_text(response.text)
                flashcards = json.loads(json_text)
                return {
                    'content': flashcards,
                    'type': 'flashcards'
                }
            except json.JSONDecodeError:
                error_message = "Could not parse flashcards JSON.  Check the Gemini output."
                logging.error(error_message)
                return {
                    'content': [{'front': 'Parsing Error', 'back': error_message}],
                    'type': 'flashcards'
                }

        elif content_type == 'quiz':
            prompt = f"""
        Generate a 10-question quiz based EXCLUSIVELY on the following study material.
        Questions should directly test understanding of the key concepts in the material.
        Include multiple choice questions with 4 options each.
        Provide the correct answer for each question.
        Format your response as JSON with:
        - question_text: The question
        - options: Array of 4 options (one must be correct)
        - answer: The correct answer
        
        IMPORTANT:
        - All questions must be directly based on the provided material
        - Do not include general knowledge questions
        - Focus on the most important concepts from the material
        
        Study Material:
        {material_text}
        """
            response = model.generate_content(prompt)
            try:
                json_text = extract_json_from_text(response.text)
                quiz = json.loads(json_text)
                return {
                    'content': quiz,
                    'type': 'quiz'
                }
            except json.JSONDecodeError:
                error_message = "Could not parse quiz JSON. Check the Gemini output."
                logging.error(error_message)
                return {
                    'content': [{
                        'question_text': 'Parsing Error',
                        'options': ['Error', 'Error', 'Error', 'Error'],
                        'answer': 'Error'
                    }],
                    'type': 'quiz'
                }
        else:
            logging.error(f"Invalid content type: {content_type}")
            return None  # Handle invalid content types

    except Exception as e:
        logging.error(f"Error generating content: {e}")
        return None  # Important: Return None on error
