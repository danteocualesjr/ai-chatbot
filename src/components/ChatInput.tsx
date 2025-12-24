import { useState, type KeyboardEvent } from 'react';
import { FileUpload } from './FileUpload';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string, imageData?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ 
  onSend, 
  disabled = false,
  placeholder = 'Type your question here...' 
}: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSend = () => {
    if ((input.trim() || selectedImage) && !disabled) {
      onSend(input.trim() || 'What\'s in this image?', selectedImage || undefined);
      setInput('');
      setSelectedImage(null);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (_file: File, preview: string) => {
    setSelectedImage(preview);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="chat-input-container">
      {selectedImage && (
        <div className="chat-input-image-preview">
          <img src={selectedImage} alt="Preview" />
          <button
            type="button"
            className="chat-input-image-remove"
            onClick={handleRemoveImage}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}
      <FileUpload onFileSelect={handleFileSelect} disabled={disabled} />
      <input
        type="text"
        className="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        className="chat-send-button"
        onClick={handleSend}
        disabled={disabled || (!input.trim() && !selectedImage)}
        aria-label="Send message"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
};

