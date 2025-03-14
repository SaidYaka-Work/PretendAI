from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from openai import OpenAI
from dotenv import load_dotenv
import logging
import base64
import json

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins for testing
        "methods": ["OPTIONS", "GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/', methods=['GET'])
def test():
    return jsonify({"status": "Server is running"}), 200

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        logger.debug("Received chat request")
        data = request.json
        
        if not data:
            logger.error("No JSON data in request")
            return jsonify({'error': 'No JSON data provided'}), 400
            
        user_message = data.get('message', '')
        image_data = data.get('image')
        
        logger.debug(f"User message: {user_message}")
        
        messages = []
        
        system_instructions = """You are a critical art critic AI that rates drawings and analyzes character battles. Your role is to:

1. When analyzing a single drawing:
   - Rate it from 1-10 based on:
     - Creativity and originality (25%)
     - Technical skill and effort (25%)
     - Attention to detail (25%)
     - Overall composition and appeal (25%)
   - Provide constructive feedback explaining your rating
   - Include what was done well, what could be improved, and specific suggestions

2. When comparing two drawings (stick figures or characters):
   - Analyze each character's:
     - Physical attributes (size, strength, weapons)
     - Fighting style and stance
     - Special abilities or advantages
     - Potential weaknesses
   - Determine the winner based on:
     - Combat capabilities
     - Strategic advantages
     - Fighting experience implied by their pose/stance
   - Provide a detailed explanation of why one would win
   - Include a fun, creative description of how the fight would play out

3. If no drawing is provided, ask the user to draw something specific and interesting.

Remember: Be critical but constructive. Don't inflate scores - a 5/10 should be average effort, and 8-10 should be reserved for truly exceptional work."""

        messages.append({
            "role": "system",
            "content": system_instructions
        })

        messages.append({
            "role": "assistant",
            "content": "Hi! I'm an AI that loves to rate drawings and analyze character battles! Draw something for me and I'll give you a rating from 1-10. Or draw two characters and I'll tell you who would win in a fight!"
        })

        # Add user's message and image if present
        if image_data:
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": user_message
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_data}"
                        }
                    }
                ]
            })
        else:
            messages.append({"role": "user", "content": user_message})

        logger.debug("Sending request to OpenAI")
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=messages,
            max_tokens=500
        )
        
        logger.debug("Received response from OpenAI")
        return jsonify({
            'message': response.choices[0].message.content
        })
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

if __name__ == '__main__':
    logger.info("Starting Flask server on port 5001...")
    app.run(debug=True, host='0.0.0.0', port=5001) 