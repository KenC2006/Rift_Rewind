import React, { useState } from 'react';
import './App.css';

// Components
import SearchForm from './components/SearchForm';
import Loading from './components/Loading';
import PlayerCard from './components/PlayerCard';
import StatsOverview from './components/StatsOverview';
import ChampionGrid from './components/ChampionGrid';
import EnhancedInsightsPanel from './components/EnhancedInsightsPanel';
import VisualizationDashboard from './components/VisualizationDashboard';

// API Service
import { analyzePlayer } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (riotId) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await analyzePlayer(riotId);

      if (result.success) {
        setData(result.data);
        // Smooth scroll to results
        setTimeout(() => {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }, 100);
      } else {
        setError(result.error || 'Failed to analyze player');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(
        err.error ||
        err.message ||
        'An error occurred while analyzing the player. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <SearchForm onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div>
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && <Loading />}

      {data && !loading && (
        <div className="results-container">
          <PlayerCard player={data.player} />
          <StatsOverview stats={data.stats} />
          <VisualizationDashboard stats={data.stats} />
          <ChampionGrid champions={data.stats.champions_played} />
          <EnhancedInsightsPanel insights={data.insights} />
        </div>
      )}

      {!data && !loading && !error && (
        <div className="welcome-message">
          <div className="welcome-content">
            <h2>Discover Your League Legacy</h2>
            <p>
              Enter your Riot ID above to get a personalized AI-powered recap of your 2024
              League of Legends journey
            </p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Comprehensive Stats</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🏆</span>
                <span>Achievement Highlights</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <span>AI-Powered Insights</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>
          Rift Rewind is not endorsed by Riot Games and does not reflect the views or
          opinions of Riot Games or anyone officially involved in producing or managing
          Riot Games properties.
        </p>
        <p className="footer-tech">
          Built with AWS Bedrock, Claude AI, and Riot Games API
        </p>
      </footer>
    </div>
  );
}

export default App;
