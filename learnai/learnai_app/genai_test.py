import google.generativeai as genai
from django.conf import settings

def test_gemini_api_key():
    """Tests the Gemini API key by making a simple text generation request."""
    try:
        # Initialize the Gemini client with your API key
        genai.configure(api_key=settings.GEMINI_API_KEY)

        # Load the recommended Gemini 1.5 Flash model
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Generate content using the Gemini 1.5 Flash model
        response = model.generate_content("Write a very short poem about a flower.")

        # Check if the response contains text
        if response and response.text:
            print("Gemini API key is working!")
            print("Generated text:", response.text)
            return True
        else:
            print("Error: Could not generate text. Check your API key and connection.")
            return False

    except Exception as e:
        print(f"An error occurred: {e}")
        print("Please double-check your API key and ensure your network connection is stable.")
        return False

if __name__ == "__main__":
    from django.conf import settings
    settings.configure(GEMINI_API_KEY="hahahahahha defo not my api key heheheheehe") 

    test_gemini_api_key()
