import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { sendChatMessage } from '../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './ChatBot.css';

const ChatBot = ({ integrated = false }) => {
  const { playerData } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const suggestedQuestions = [
    "How can I improve my KDA?",
    "What champions should I focus on?",
    "Tips for climbing ranked?",
    "Analyze my farming"
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (playerData && messages.length === 0) {
      const playerName = `${playerData.player?.gameName || 'Summoner'}`;
      const welcomeMessages = [
        `Hello ${playerName}. I've analyzed your performance data and I'm ready to help you improve. What would you like to work on?`,
        `Welcome, ${playerName}. I've reviewed your match history and stats. Ask me about any aspect of your gameplay you'd like to improve.`,
        `${playerName}, I've completed my analysis of your season. Let me know which areas you'd like to focus on.`,
        `Ready to discuss your gameplay, ${playerName}. I can provide insights on mechanics, decision-making, champion pool, and more. What's your priority?`
      ];
      const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      setMessages([
        {
          content: randomWelcome,
          isUser: false,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [playerData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!playerData) {
      setError('No player data loaded');
      return;
    }

    // Add user message
    const userMessage = {
      content: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      // Send to API
      const response = await sendChatMessage(messageText, playerData, conversationHistory);

      if (response.success) {
        // Add AI response
        const aiMessage = {
          content: response.data.response,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.error || err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const playerName = `${playerData?.player?.gameName || 'Summoner'}`;
    setMessages([
      {
        content: `Hello ${playerName}. I've analyzed your performance data and I'm ready to help you improve. What would you like to work on?`,
        isUser: false,
        timestamp: new Date().toISOString()
      }
    ]);
    setError(null);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  if (!playerData) {
    return null; // Don't show chat if no player data loaded
  }

  // Integrated mode - render directly without floating button
  if (integrated) {
    return (
      <div className="chat-panel-integrated">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div>
              <div className="chat-title">Ryze</div>
              <div className="chat-subtitle">The Rune Mage</div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="icon-button" onClick={handleClearChat} title="Clear chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} isUser={msg.isUser} />
          ))}
          {loading && (
            <div className="chat-message ai-message typing-indicator">
              <div className="message-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div className="message-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="chat-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={loading}
          suggestedQuestions={messages.length <= 1 ? suggestedQuestions : []}
        />
      </div>
    );
  }

  // Floating mode - original behavior
  return (
    <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Floating button when closed */}
      {!isOpen && (
        <button className="chat-toggle-button" onClick={toggleChat}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="chat-badge">Ryze</span>
        </button>
      )}

      {/* Chat panel when open */}
      {isOpen && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div>
                <div className="chat-title">Ryze</div>
                <div className="chat-subtitle">The Rune Mage</div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="icon-button" onClick={handleClearChat} title="Clear chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
              <button className="icon-button" onClick={toggleChat} title="Close chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} isUser={msg.isUser} />
            ))}
            {loading && (
              <div className="chat-message ai-message typing-indicator">
                <div className="message-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div className="message-content">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="chat-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={loading}
            suggestedQuestions={messages.length <= 1 ? suggestedQuestions : []}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBot;
