import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Stats.css';
import PlayerCard from '../components/PlayerCard';
import StatsOverview from '../components/StatsOverview';
import ChampionGrid from '../components/ChampionGrid';
import VisualizationDashboard from '../components/VisualizationDashboard';
import { usePlayer } from '../context/PlayerContext';

function Stats() {
  const navigate = useNavigate();
  const { playerData } = usePlayer();

  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo(0, 0);
  }, []);

  if (!playerData) {
    return (
      <div className="stats-page">
        <div className="stats-header">
          <h2>No Player Data</h2>
          <p>Search for a summoner on the home page to view stats</p>
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
    <div className="stats-page">
      {/* Full-width Hero Section */}
      <div className="stats-hero">
        <div className="hero-gradient-bg"></div>
        <PlayerCard player={playerData.player} />
      </div>

      {/* Analytics Dashboard - Full Width */}
      <div className="analytics-section">
        <StatsOverview stats={playerData.stats} />
      </div>

      {/* Content Sections */}
      <div className="content-wrapper">
        <VisualizationDashboard stats={playerData.stats} player={playerData.player} />
        <ChampionGrid champions={playerData.stats.champions_played} />
      </div>
    </div>
  );
}

export default Stats;
