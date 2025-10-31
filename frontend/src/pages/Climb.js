import React, { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Climb.css';
import BentoGrid from '../components/BentoGrid';
import ChatBot from '../components/ChatBot';
import { usePlayer } from '../context/PlayerContext';

function Climb() {
  const navigate = useNavigate();
  const { playerData } = usePlayer();

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
              <span className="stat-value">{playerData.player.rank || 'Unranked'}</span>
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

      {/* Main Content - Split View */}
      <div className="climb-main">
        <div className="climb-content-wrapper">
          {/* Left: Bento Grid Insights */}
          <div className="insights-column">
            <BentoGrid insights={playerData.insights} />
          </div>

          {/* Right: AI Chat */}
          <div className="chat-column">
            <ChatBot integrated={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Climb;
