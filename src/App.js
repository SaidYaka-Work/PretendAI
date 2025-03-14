import React, { useState, useRef, useEffect } from 'react';
import { Container, Paper, TextField, Button, Box, Typography, Alert, IconButton, CircularProgress, Fade, Tabs, Tab, Grid, Rating } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import BrushIcon from '@mui/icons-material/Brush';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DrawingCanvas from './components/DrawingCanvas';

const API_BASE_URL = 'http://localhost:5001';

// Pixel art border style
const pixelBorder = (color, size = 4) => `
  ${size}px ${size}px 0 0 ${color},
  ${-size}px ${size}px 0 0 ${color},
  ${size}px ${-size}px 0 0 ${color},
  ${-size}px ${-size}px 0 0 ${color},
  0 ${size}px 0 0 ${color},
  0 ${-size}px 0 0 ${color},
  ${size}px 0 0 0 ${color},
  ${-size}px 0 0 0 ${color}
`;

const theme = {
  primary: '#FFFFFF',
  secondary: '#000000',
  background: '#000000',
  paper: '#000000',
  userMessage: '#FFFFFF',
  botMessage: '#000000',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  error: '#FF0000',
  inputBg: '#000000',
  inputBorder: '#FFFFFF',
  headerGradient: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
  pixelAccent: '#FFFFFF',
  dimAccent: '#CCCCCC',
  darkAccent: '#666666'
};

const FeedbackCard = ({ message }) => {
  // Extract rating from message
  const ratingMatch = message.match(/(\d+)\/10/);
  const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;

  // Extract sections using regex
  const strengthsMatch = message.match(/What was done well:([^]*?)(?=What could be improved:|$)/s);
  const improvementsMatch = message.match(/What could be improved:([^]*?)(?=Specific suggestions:|$)/s);
  const suggestionsMatch = message.match(/Specific suggestions:([^]*?)(?=A text-based example:|$)/s);
  const exampleMatch = message.match(/A text-based example:([^]*?)$/s);

  if (!rating) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: theme.userMessage,
        color: '#000000',
        border: `2px solid ${theme.pixelAccent}`,
        borderRadius: 0,
        position: 'relative',
        fontFamily: 'monospace',
        width: '100%',
      }}
    >
      <Grid container spacing={2}>
        {/* Rating Section */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              Rating:
            </Typography>
            <Rating 
              value={rating} 
              max={10} 
              readOnly 
              sx={{ 
                '& .MuiRating-icon': { 
                  color: theme.pixelAccent,
                  fontSize: '1.5rem'
                }
              }}
            />
            <Typography sx={{ fontFamily: 'monospace', ml: 1 }}>
              {rating}/10
            </Typography>
          </Box>
        </Grid>

        {/* Strengths Section */}
        {strengthsMatch && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <CheckCircleIcon sx={{ color: theme.pixelAccent, mt: 0.5 }} />
              <Box>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>
                  What was done well:
                </Typography>
                <Typography sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                  {strengthsMatch[1].trim()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Areas for Improvement */}
        {improvementsMatch && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <WarningIcon sx={{ color: theme.pixelAccent, mt: 0.5 }} />
              <Box>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>
                  Areas for Improvement:
                </Typography>
                <Typography sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                  {improvementsMatch[1].trim()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Suggestions */}
        {suggestionsMatch && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <LightbulbIcon sx={{ color: theme.pixelAccent, mt: 0.5 }} />
              <Box>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>
                  Suggestions:
                </Typography>
                <Typography sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                  {suggestionsMatch[1].trim()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Example */}
        {exampleMatch && (
          <Grid item xs={12}>
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#f5f5f5', 
              border: `2px solid ${theme.dimAccent}`,
              borderRadius: 0,
            }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>
                Example Improvement:
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                {exampleMatch[1].trim()}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

function App() {
  const [chatScreens, setChatScreens] = useState([
    { id: 0, name: 'Drawing AI', messages: [
      { text: "Hi! I'm an AI that loves to rate drawings! Draw something for me and I'll give you a rating from 1-10!", sender: 'bot' }
    ] }
  ]);
  const [activeScreen, setActiveScreen] = useState(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    // Test server connection on component mount
    const testConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
          const data = await response.json();
          console.log('Server status:', data);
          setServerStatus('connected');
        } else {
          setServerStatus('error');
          setError('Could not connect to server');
        }
      } catch (error) {
        console.error('Server connection test failed:', error);
        setServerStatus('error');
        setError(`Could not connect to server. Please ensure the backend is running on ${API_BASE_URL}`);
      }
    };

    testConnection();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatScreens]);

  const clearMessages = () => {
    setChatScreens(screens => 
      screens.map(screen => 
        screen.id === activeScreen 
          ? { ...screen, messages: [] }
          : screen
      )
    );
  };

  const addNewChatScreen = () => {
    const newId = chatScreens.length;
    setChatScreens([
      ...chatScreens,
      { id: newId, name: `Chat ${newId + 1}`, messages: [] }
    ]);
    setActiveScreen(newId);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    setChatScreens(screens =>
      screens.map(screen =>
        screen.id === activeScreen
          ? { ...screen, messages: [...screen.messages, { text: userMessage, sender: 'user' }] }
          : screen
      )
    );
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: userMessage,
          chatScreen: activeScreen
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } catch (e) {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setChatScreens(screens =>
        screens.map(screen =>
          screen.id === activeScreen
            ? { ...screen, messages: [...screen.messages, { text: data.message, sender: 'bot' }] }
            : screen
        )
      );
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error.message || 'Failed to communicate with the server');
      setChatScreens(screens =>
        screens.map(screen =>
          screen.id === activeScreen
            ? {
                ...screen,
                messages: [
                  ...screen.messages,
                  { 
                    text: `Error: ${error.message || 'Failed to communicate with the server'}`,
                    sender: 'bot',
                    isError: true 
                  }
                ]
              }
            : screen
        )
      );
    }

    setIsLoading(false);
  };

  const handleDrawingSave = async (imageData) => {
    setShowDrawingCanvas(false);
    
    try {
      // Add the drawing to the chat immediately
      setChatScreens(screens =>
        screens.map(screen =>
          screen.id === activeScreen
            ? { 
                ...screen, 
                messages: [
                  ...screen.messages, 
                  { 
                    text: "Here's my drawing!", 
                    sender: 'user',
                    image: imageData 
                  }
                ] 
              }
            : screen
        )
      );

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: "Here's my drawing!",
          image: imageData,
          chatScreen: activeScreen
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Check for rating in the response
      const ratingMatch = data.message.match(/(\d+)\/10/);
      if (ratingMatch) {
        const rating = parseInt(ratingMatch[1]);
        setTotalScore(prevScore => prevScore + rating);
      }

      setChatScreens(screens =>
        screens.map(screen =>
          screen.id === activeScreen
            ? { ...screen, messages: [...screen.messages, { text: data.message, sender: 'bot' }] }
            : screen
        )
      );
    } catch (error) {
      console.error('Error sending drawing:', error);
      setError(error.message || 'Failed to send drawing');
    }
  };

  const currentChat = chatScreens.find(screen => screen.id === activeScreen) || chatScreens[0];

  return (
    <Container maxWidth="md" sx={{ 
      height: '100vh',
      py: { xs: 2, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.background,
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      '@keyframes pixelate': {
        '0%': { opacity: 0, transform: 'scale(0.95)' },
        '50%': { opacity: 0.5, transform: 'scale(1.02)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
      },
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: theme.paper,
          border: `4px solid ${theme.pixelAccent}`,
          borderRadius: 0,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -4,
            boxShadow: pixelBorder(theme.pixelAccent),
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            background: theme.headerGradient,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderBottom: `4px solid ${theme.pixelAccent}`,
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: theme.pixelAccent,
                  p: 1,
                  border: `2px solid ${theme.dimAccent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                  },
                }}
              >
                <SmartToyIcon sx={{ color: theme.secondary, fontSize: 24 }} />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.text,
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  textShadow: '2px 2px 0 #000000',
                }}
              >
                Drawing AI
              </Typography>
              <Typography
                sx={{
                  color: theme.text,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  ml: 2,
                }}
              >
                Total Score: {totalScore}
              </Typography>
            </Box>
            <IconButton 
              onClick={clearMessages}
              disabled={!currentChat.messages.length}
              sx={{ 
                color: theme.text,
                border: `2px solid ${theme.pixelAccent}`,
                borderRadius: 0,
                p: 1,
                '&:hover': {
                  bgcolor: theme.pixelAccent,
                  '& svg': {
                    color: theme.secondary,
                  },
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                  border: `2px solid ${theme.darkAccent}`,
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Fade in={true}>
            <Alert 
              severity="error" 
              sx={{ 
                m: 2,
                borderRadius: 0,
                border: `2px solid ${theme.error}`,
                bgcolor: '#330000',
                color: theme.error,
                '& .MuiAlert-message': {
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                },
                '& .MuiAlert-icon': {
                  color: theme.error
                }
              }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: theme.background,
            '&::-webkit-scrollbar': {
              width: '12px',
              background: theme.background,
              border: `2px solid ${theme.pixelAccent}`,
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.pixelAccent,
              border: `2px solid ${theme.pixelAccent}`,
            },
            '&::-webkit-scrollbar-track': {
              background: theme.background,
            },
            '&::-webkit-scrollbar-corner': {
              background: theme.background,
            },
          }}
        >
          {currentChat.messages.map((message, index) => (
            <Fade in={true} key={index} timeout={300}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-start' : 'flex-end',
                  gap: 2,
                  alignItems: 'flex-start',
                  animation: 'pixelate 0.3s ease-out',
                }}
              >
                {message.sender === 'user' && (
                  <Box
                    sx={{
                      bgcolor: theme.pixelAccent,
                      p: 1,
                      border: `2px solid ${theme.dimAccent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SmartToyIcon sx={{ color: '#000000', fontSize: 20 }} />
                  </Box>
                )}
                {message.sender === 'bot' && message.text.includes('/10') ? (
                  <FeedbackCard message={message.text} />
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.isError ? '#330000' : 
                              message.sender === 'user' ? theme.botMessage : theme.userMessage,
                      color: message.sender === 'user' ? theme.text : '#000000',
                      border: `2px solid ${message.isError ? theme.error : theme.pixelAccent}`,
                      borderRadius: 0,
                      position: 'relative',
                      fontFamily: 'monospace',
                    }}
                  >
                    <Typography sx={{ 
                      lineHeight: 1.6, 
                      fontSize: '0.95rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.5px',
                    }}>
                      {message.text}
                    </Typography>
                    {message.image && (
                      <Box sx={{ mt: 2, maxWidth: '100%' }}>
                        <img 
                          src={message.image} 
                          alt="Drawing" 
                          style={{ 
                            maxWidth: '100%', 
                            height: 'auto',
                            border: `2px solid ${theme.pixelAccent}`,
                            borderRadius: '0',
                          }} 
                        />
                      </Box>
                    )}
                  </Paper>
                )}
                {message.sender === 'bot' && (
                  <Box
                    sx={{
                      bgcolor: theme.userMessage,
                      p: 1,
                      border: `2px solid ${theme.dimAccent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonIcon sx={{ color: '#000000', fontSize: 20 }} />
                  </Box>
                )}
              </Box>
            </Fade>
          ))}
          {isLoading && (
            <Fade in={true}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    bgcolor: theme.pixelAccent,
                    p: 1,
                    border: `2px solid ${theme.dimAccent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SmartToyIcon sx={{ color: '#000000', fontSize: 20 }} />
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: theme.botMessage,
                    color: theme.text,
                    border: `2px solid ${theme.pixelAccent}`,
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box sx={{ 
                    animation: 'loading 1s steps(4) infinite',
                    '@keyframes loading': {
                      '0%': { content: '"."' },
                      '33%': { content: '".."' },
                      '66%': { content: '"..."' },
                      '100%': { content: '"."' },
                    },
                  }}>
                    <Typography sx={{ 
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      letterSpacing: '1px',
                    }}>
                      Processing...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ 
          p: { xs: 2, md: 3 }, 
          bgcolor: theme.paper,
          borderTop: `4px solid ${theme.pixelAccent}`,
        }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading || serverStatus === 'error'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  backgroundColor: theme.inputBg,
                  border: `2px solid ${theme.pixelAccent}`,
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    border: `2px solid ${theme.text}`,
                  },
                  '&.Mui-focused': {
                    border: `2px solid ${theme.text}`,
                  },
                  '& input': {
                    color: theme.text,
                    padding: '14px',
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: theme.textSecondary,
                  opacity: 0.7,
                  fontFamily: 'monospace',
                },
              }}
            />
            <IconButton
              onClick={() => setShowDrawingCanvas(true)}
              sx={{
                color: theme.text,
                border: `2px solid ${theme.pixelAccent}`,
                borderRadius: 0,
                p: 1,
                '&:hover': {
                  bgcolor: theme.pixelAccent,
                  '& svg': {
                    color: theme.secondary,
                  },
                },
              }}
            >
              <BrushIcon />
            </IconButton>
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isLoading || serverStatus === 'error' || !input.trim()}
              sx={{ 
                minWidth: '120px',
                borderRadius: 0,
                bgcolor: theme.pixelAccent,
                border: `2px solid ${theme.dimAccent}`,
                color: theme.secondary,
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                letterSpacing: '1px',
                '&:hover': {
                  bgcolor: theme.dimAccent,
                },
                '&.Mui-disabled': {
                  bgcolor: theme.darkAccent,
                  border: `2px solid ${theme.darkAccent}`,
                  color: theme.dimAccent,
                }
              }}
            >
              {isLoading ? (
                <Box sx={{ 
                  animation: 'loading 1s steps(4) infinite',
                  '@keyframes loading': {
                    '0%': { content: '"."' },
                    '33%': { content: '".."' },
                    '66%': { content: '"..."' },
                    '100%': { content: '"."' },
                  },
                }}>...</Box>
              ) : (
                <>
                  Send
                  <SendIcon sx={{ ml: 1, fontSize: 18 }} />
                </>
              )}
            </Button>
          </Box>
        </Box>
      </Paper>

      {showDrawingCanvas && (
        <DrawingCanvas
          onSave={handleDrawingSave}
          onClose={() => setShowDrawingCanvas(false)}
        />
      )}
    </Container>
  );
}

export default App; 