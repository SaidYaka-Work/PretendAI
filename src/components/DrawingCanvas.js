import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, Typography, Button } from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const DrawingCanvas = ({ onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [currentColor, setCurrentColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(2);
  const [isEraser, setIsEraser] = useState(false);

  const colors = [
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#008000', // Dark Green
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    // Set drawing style
    ctx.strokeStyle = isEraser ? '#000000' : currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    
    setContext(ctx);
  }, [currentColor, brushSize, isEraser]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastX(x);
    setLastY(y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(x, y);
    context.stroke();
    
    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    onSave(imageData);
    clearCanvas();
  };

  const handleColorChange = (color) => {
    setCurrentColor(color);
    setIsEraser(false);
    context.strokeStyle = color;
    context.globalCompositeOperation = 'source-over';
  };

  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
    context.lineWidth = size;
  };

  const toggleEraser = () => {
    setIsEraser(!isEraser);
    context.globalCompositeOperation = !isEraser ? 'destination-out' : 'source-over';
    context.strokeStyle = !isEraser ? '#000000' : currentColor;
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 100, 
      right: 20, 
      bgcolor: '#000000',
      border: '2px solid #FFFFFF',
      borderRadius: 0,
      p: 2,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: '#FFFFFF', fontFamily: 'monospace' }}>Draw Something</Typography>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#FFFFFF', color: '#000000' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {colors.map((color) => (
          <Box
            key={color}
            onClick={() => handleColorChange(color)}
            sx={{
              width: 30,
              height: 30,
              bgcolor: color,
              border: `2px solid ${currentColor === color ? '#FFFFFF' : 'transparent'}`,
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s',
              },
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography sx={{ color: '#FFFFFF', fontFamily: 'monospace' }}>Brush Size:</Typography>
          {[1, 2, 4, 8, 16].map((size) => (
            <Box
              key={size}
              onClick={() => handleBrushSizeChange(size)}
              sx={{
                width: size * 2,
                height: size * 2,
                bgcolor: brushSize === size ? '#FFFFFF' : '#333333',
                border: '2px solid #FFFFFF',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#FFFFFF',
                },
              }}
            />
          ))}
        </Box>

        <IconButton
          onClick={toggleEraser}
          sx={{
            color: isEraser ? '#000000' : '#FFFFFF',
            bgcolor: isEraser ? '#FFFFFF' : 'transparent',
            border: '2px solid #FFFFFF',
            '&:hover': {
              bgcolor: isEraser ? '#FFFFFF' : '#333333',
            },
          }}
        >
          <AutoFixHighIcon />
        </IconButton>
      </Box>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        style={{
          border: '2px solid #FFFFFF',
          cursor: 'crosshair',
          backgroundColor: '#000000',
        }}
      />
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          onClick={clearCanvas}
          sx={{
            color: '#FFFFFF',
            border: '2px solid #FFFFFF',
            borderRadius: 0,
            '&:hover': { bgcolor: '#FFFFFF', color: '#000000' }
          }}
        >
          Clear
        </Button>
        <Button
          onClick={handleSave}
          sx={{
            color: '#FFFFFF',
            border: '2px solid #FFFFFF',
            borderRadius: 0,
            '&:hover': { bgcolor: '#FFFFFF', color: '#000000' }
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default DrawingCanvas; 