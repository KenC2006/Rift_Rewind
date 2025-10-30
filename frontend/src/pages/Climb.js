import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Climb.css';
import EnhancedInsightsPanel from '../components/EnhancedInsightsPanel';
import { usePlayer } from '../context/PlayerContext';

function Climb() {
  const navigate = useNavigate();
  const { playerData } = usePlayer();

  useEffect(() => {
    // Scroll to top smoothly when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
      <div className="climb-header">
        <div className="header-content">
          <h2>Improvement Roadmap</h2>
          <p>AI-powered coaching insights tailored to your playstyle</p>
        </div>
        <div className="header-stats">
          <div className="quick-stat">
          </div>
          <div className="quick-stat">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{playerData.stats.win_rate?.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="climb-container">
        <EnhancedInsightsPanel insights={playerData.insights} />
      </div>
    </div>
  );
}

export default Climb;
