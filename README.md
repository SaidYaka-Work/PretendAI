# AI Art Chatbot

A modern AI application with ability to draw and get feedback from an AI critique

## Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd <repo-name>
```

2. Install dependencies
```bash
# Frontend
npm install

# Backend
pip install -r requirements.txt
```

3. Set up environment variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_api_key_here
```

4. Start the servers
```bash
# Start the Flask backend (in one terminal)
python server.py

# Start the React frontend (in another terminal)
npm start
```

5. Open http://localhost:3000 in your browser

## Features

- Multiple chat screens
- Real-time chat with GPT-3.5
- Modern black and white terminal-style UI
- Responsive design
- Error handling and loading states

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key

## Security Note

Never commit your `.env` file or expose your API keys. The `.env` file is included in `.gitignore` to prevent accidental commits. 
