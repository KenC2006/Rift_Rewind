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
    // Scroll to top smoothly when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="stats-header">
        <h2>Performance Analysis</h2>
        <p>Season statistics and insights</p>
      </div>

      <div className="results-container">
        <PlayerCard player={playerData.player} />
        <StatsOverview stats={playerData.stats} />
        <VisualizationDashboard stats={playerData.stats} />
        <ChampionGrid champions={playerData.stats.champions_played} />
      </div>
    </div>
  );
}

export default Stats;
