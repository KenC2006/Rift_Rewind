import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatInput = ({ onSend, disabled, suggestedQuestions }) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef(null);

  const maxLength = 500;

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      setShowSuggestions(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (question) => {
    onSend(question);
    setShowSuggestions(false);
  };

  return (
    <div className="chat-input-container">
      {showSuggestions && suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="suggested-questions">
          <div className="suggestions-label">Suggested questions:</div>
          <div className="suggestions-chips">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(question)}
                disabled={disabled}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about improving your gameplay..."
            disabled={disabled}
            className="chat-textarea"
            rows={1}
          />
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="send-button"
          >
            {disabled ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
        <div className="input-footer">
          <span className="char-count">{message.length}/{maxLength}</span>
          <span className="input-hint">Press Enter to send, Shift+Enter for new line</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
