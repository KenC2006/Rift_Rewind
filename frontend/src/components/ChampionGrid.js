import React, { useState, useRef, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiAward, FiTarget, FiChevronDown, FiBarChart2, FiCrosshair } from 'react-icons/fi';
import ChampionDetail from './ChampionDetail';
import './ChampionGrid.css';

const ChampionGrid = ({ champions }) => {
  const [sortBy, setSortBy] = useState('games'); // games, winRate, kda, cs
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [viewMode, setViewMode] = useState('featured'); // featured, grid
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Convert champions object to array with all calculated stats
  const championArray = Object.entries(champions)
    .map(([name, data]) => ({
      name,
      games: data.games || 0,
      wins: data.wins || 0,
      losses: (data.games || 0) - (data.wins || 0),
      kills: data.kills || 0,
      deaths: data.deaths || 0,
      assists: data.assists || 0,
      cs: data.cs || 0,
      winRate: data.games > 0 ? ((data.wins / data.games) * 100) : 0,
      kda: data.deaths > 0
        ? ((data.kills + data.assists) / data.deaths)
        : (data.kills + data.assists),
      avgKills: data.games > 0 ? (data.kills / data.games) : 0,
      avgDeaths: data.games > 0 ? (data.deaths / data.games) : 0,
      avgAssists: data.games > 0 ? (data.assists / data.games) : 0,
      avgCS: data.games > 0 ? (data.cs / data.games) : 0
    }))
    .sort((a, b) => {
      switch (sortBy) {
        case 'winRate':
          return b.winRate - a.winRate;
        case 'kda':
          return b.kda - a.kda;
        case 'cs':
          return b.avgCS - a.avgCS;
        case 'games':
        default:
          return b.games - a.games;
      }
    });

  // Split into featured (top 3) and rest
  const featuredChampions = championArray.slice(0, 3);
  const remainingChampions = championArray.slice(3);

  const getChampionImage = (championName) => {
    const formattedName = championName.replace(/[^a-zA-Z]/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${formattedName}.png`;
  };

  const getSplashArt = (championName) => {
    const formattedName = championName.replace(/[^a-zA-Z]/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formattedName}_0.jpg`;
  };

  const getWinRateColor = (wr) => {
    if (wr >= 55) return '#10b981';
    if (wr >= 50) return '#3b82f6';
    if (wr >= 45) return '#f59e0b';
    return '#ef4444';
  };

  const getKDAColor = (kda) => {
    if (kda >= 4) return '#10b981';
    if (kda >= 3) return '#3b82f6';
    if (kda >= 2) return '#f59e0b';
    return '#ef4444';
  };

  const getPerformanceGrade = (champ) => {
    const { winRate, kda, games } = champ;
    // S Tier: Dominant performance (55%+ WR and 3.5+ KDA with decent games)
    if (winRate >= 55 && kda >= 3.5 && games >= 10) {
      return { grade: 'S', color: '#ffd700' };
    }
    // A Tier: Strong performance (52%+ WR and 3.0+ KDA)
    if (winRate >= 52 && kda >= 3.0 && games >= 5) {
      return { grade: 'A', color: '#10b981' };
    }
    // B Tier: Above average (48%+ WR and 2.5+ KDA)
    if (winRate >= 48 && kda >= 2.5 && games >= 3) {
      return { grade: 'B', color: '#3b82f6' };
    }
    // C Tier: Average or learning (42%+ WR and 2.0+ KDA, or low sample size)
    if ((winRate >= 42 && kda >= 2.0) || games < 3) {
      return { grade: 'C', color: '#f59e0b' };
    }
    // D Tier: Needs improvement
    return { grade: 'D', color: '#ef4444' };
  };

  // Sort options with icons
  const sortOptions = [
    { value: 'games', label: 'Games Played', icon: FiBarChart2 },
    { value: 'winRate', label: 'Win Rate', icon: FiTrendingUp },
    { value: 'kda', label: 'KDA Ratio', icon: FiCrosshair },
    { value: 'cs', label: 'CS per Game', icon: FiTarget }
  ];

  const currentSort = sortOptions.find(opt => opt.value === sortBy);

  const handleSortChange = (value) => {
    setSortBy(value);
    setDropdownOpen(false);
  };

  return (
    <div className="champion-mastery-container">
      <div className="mastery-header">
        <div className="mastery-title-section">
          <h2 className="mastery-title">Champion Performance</h2>
          <p className="mastery-subtitle">
            Your {championArray.length} champions ranked by performance
          </p>
        </div>

        <div className="mastery-controls">
          <div className="mastery-sort">
            <label>Sort by:</label>
            <div className="custom-dropdown" ref={dropdownRef}>
              <button
                className="dropdown-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <currentSort.icon className="dropdown-icon" />
                <span className="dropdown-text">{currentSort.label}</span>
                <FiChevronDown className={`dropdown-chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`dropdown-item ${sortBy === option.value ? 'active' : ''}`}
                      onClick={() => handleSortChange(option.value)}
                    >
                      <option.icon className="dropdown-item-icon" />
                      <span>{option.label}</span>
                      {sortBy === option.value && <div className="active-indicator" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {championArray.length === 0 ? (
        <div className="no-champions">
          <p>No champion data available</p>
        </div>
      ) : (
        <>
          {/* Featured Top 3 Champions */}
          {featuredChampions.length > 0 && (
            <div className="featured-section">
              <div className="section-label">
                <FiAward className="section-icon" />
                <span>Top Performers</span>
              </div>
              <div className="featured-grid">
                {featuredChampions.map((champ, index) => {
                  const performance = getPerformanceGrade(champ);
                  return (
                    <div
                      key={champ.name}
                      className="featured-champion-card"
                      onClick={() => setSelectedChampion({ name: champ.name, data: champ })}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="featured-bg">
                        <img src={getSplashArt(champ.name)} alt={champ.name} />
                        <div className="featured-overlay"></div>
                      </div>
                      <div className="featured-content">
                        <div className="featured-rank">#{index + 1}</div>
                        <div className="featured-grade" style={{ color: performance.color, borderColor: performance.color }}>
                          {performance.grade}
                        </div>
                        <img src={getChampionImage(champ.name)} alt={champ.name} className="featured-avatar" />
                        <h3 className="featured-name">{champ.name}</h3>
                        <div className="featured-stats-row">
                          <div className="featured-stat">
                            <span className="stat-value">{champ.games}</span>
                            <span className="stat-label">Games</span>
                          </div>
                          <div className="featured-stat">
                            <span className="stat-value" style={{ color: getWinRateColor(champ.winRate) }}>
                              {champ.winRate.toFixed(0)}%
                            </span>
                            <span className="stat-label">Win Rate</span>
                          </div>
                          <div className="featured-stat">
                            <span className="stat-value" style={{ color: getKDAColor(champ.kda) }}>
                              {champ.kda.toFixed(1)}
                            </span>
                            <span className="stat-label">KDA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remaining Champions Grid */}
          {remainingChampions.length > 0 && (
            <div className="champions-grid-section">
              <div className="section-label">
                <FiTarget className="section-icon" />
                <span>Champion Pool</span>
              </div>
              <div className="champions-grid">
                {remainingChampions.map((champ, index) => {
                  const performance = getPerformanceGrade(champ);
                  return (
                    <div
                      key={champ.name}
                      className="champion-card"
                      onClick={() => setSelectedChampion({ name: champ.name, data: champ })}
                      style={{ animationDelay: `${(index + 3) * 0.03}s` }}
                    >
                      <div className="card-header">
                        <div className="card-rank">#{index + 4}</div>
                        <div className="card-grade" style={{ color: performance.color }}>
                          {performance.grade}
                        </div>
                      </div>
                      <div className="card-avatar-wrapper">
                        <img
                          src={getChampionImage(champ.name)}
                          alt={champ.name}
                          className="card-avatar"
                          onError={(e) => {
                            e.target.src = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png';
                          }}
                        />
                      </div>
                      <h4 className="card-name">{champ.name}</h4>
                      <div className="card-stats">
                        <div className="card-stat-item">
                          <span className="card-stat-label">Games</span>
                          <span className="card-stat-value">{champ.games}</span>
                        </div>
                        <div className="card-stat-item">
                          <span className="card-stat-label">Win Rate</span>
                          <span className="card-stat-value" style={{ color: getWinRateColor(champ.winRate) }}>
                            {champ.winRate.toFixed(0)}%
                          </span>
                        </div>
                        <div className="card-stat-item">
                          <span className="card-stat-label">KDA</span>
                          <span className="card-stat-value" style={{ color: getKDAColor(champ.kda) }}>
                            {champ.kda.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="card-kda-breakdown">
                        <span className="kda-k">{champ.avgKills.toFixed(1)}</span>
                        <span className="kda-sep">/</span>
                        <span className="kda-d">{champ.avgDeaths.toFixed(1)}</span>
                        <span className="kda-sep">/</span>
                        <span className="kda-a">{champ.avgAssists.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Champion Detail Modal */}
      {selectedChampion && (
        <ChampionDetail
          champion={selectedChampion.name}
          championData={selectedChampion.data}
          onClose={() => setSelectedChampion(null)}
        />
      )}
    </div>
  );
};

export default ChampionGrid;
