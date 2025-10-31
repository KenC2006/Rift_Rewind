import React, { useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Climb.css';
import EnhancedInsightsPanel from '../components/EnhancedInsightsPanel';
import ChatBot from '../components/ChatBot';
import { usePlayer } from '../context/PlayerContext';

function Climb() {
  const navigate = useNavigate();
  const { playerData } = usePlayer();
  const [chatOpen, setChatOpen] = useState(false);

  useLayoutEffect(() => {
    // Force scroll to top before paint
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Inventory snapshots removed from Bento; no extra sections

  if (!playerData) {
    return (
      <div className="climb-page">
        <div className="climb-header">
          <h2>No Player Data</h2>
          <p>Search for a summoner to get personalized improvement insights</p>
        </div>
        <div className="no-data-container">
          <button className="search-button" onClick={() => navigate('/')}>
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="climb-page">
      {/* Header */}
      <div className="climb-header">
        <div className="header-content">
          <h2>
            <span className="title-gradient">Improvement Roadmap</span>
          </h2>
          <p className="header-subtitle">AI-powered coaching insights tailored to your playstyle</p>
        </div>
        <div className="header-stats">
          <div className="quick-stat">
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <span className="stat-label">Current Rank</span>
              <span className="stat-value">
                {playerData.player.rank
                  ? `${playerData.player.rank.tier} ${playerData.player.rank.division}`
                  : 'Unranked'}
              </span>
            </div>
          </div>
          <div className="quick-stat">
            <div className="stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
            </div>
            <div>
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">{playerData.stats.win_rate?.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="climb-main">
        <div className="climb-content-full">
          <EnhancedInsightsPanel insights={playerData.insights} />
        </div>
      </div>

      {/* Floating Chat Toggle Button */}
      <button 
        className="chat-toggle-fab"
        onClick={() => setChatOpen(!chatOpen)}
        aria-label="Toggle AI Coach Chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <path d="M8 10h.01M12 10h.01M16 10h.01"/>
        </svg>
        <span className="fab-badge">AI Coach</span>
      </button>

      {/* Floating Chat Panel */}
      {chatOpen && (
        <>
          <div className="chat-overlay" onClick={() => setChatOpen(false)} />
          <div className="chat-panel-floating">
            <div className="chat-panel-header">
              <div className="chat-header-title">
                <span className="chat-icon">🎓</span>
                <span>AI Coach</span>
              </div>
              <button 
                className="chat-close-btn"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="chat-panel-body">
              <ChatBot integrated={true} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Climb;
