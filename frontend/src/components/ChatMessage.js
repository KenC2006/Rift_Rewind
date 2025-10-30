import React from 'react';
import './ChatBot.css';

const ChatMessage = ({ message, isUser }) => {
  const formatTimestamp = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Simple markdown-like formatting
  const formatContent = (text) => {
    // Split by line breaks and format each line
    return text.split('\n').map((line, index) => {
      // Check for bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <div key={index} className="chat-bullet">
            <span className="bullet-dot">•</span>
            <span>{line.trim().substring(1).trim()}</span>
          </div>
        );
      }

      // Check for bold text (wrapped in **)
      const boldPattern = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldPattern.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p key={index} className="chat-text">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {isUser ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        )}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-sender">{isUser ? 'You' : 'Ryze'}</span>
          <span className="message-time">{formatTimestamp(new Date(message.timestamp))}</span>
        </div>
        <div className="message-body">
          {formatContent(message.content)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
