import React from 'react';
import './ChampionGrid.css';

const ChampionGrid = ({ champions }) => {
  // Convert champions object to array and sort by games played
  const championArray = Object.entries(champions)
    .map(([name, data]) => ({
      name,
      ...data,
      winRate: data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : 0,
      kda: data.deaths > 0
        ? ((data.kills + data.assists) / data.deaths).toFixed(2)
        : (data.kills + data.assists).toFixed(2)
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 12); // Show top 12 champions

  const getChampionImage = (championName) => {
    // Format champion name for URL (remove spaces, handle special characters)
    const formattedName = championName.replace(/[^a-zA-Z]/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${formattedName}.png`;
  };

  return (
    <div className="champion-grid-container">
      <h2 className="section-title">Champion Mastery</h2>
      <div className="champion-grid">
        {championArray.map((champ, index) => (
          <div
            key={champ.name}
            className="champion-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="champion-image-wrapper">
              <img
                src={getChampionImage(champ.name)}
                alt={champ.name}
                className="champion-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="champion-overlay">
                <div className="games-badge">{champ.games} games</div>
              </div>
            </div>
            <div className="champion-info">
              <div className="champion-name">{champ.name}</div>
              <div className="champion-stats">
                <div className="stat-item">
                  <span className="stat-label">WR:</span>
                  <span
                    className="stat-value"
                    style={{
                      color: champ.winRate >= 50 ? '#00c853' : '#ff5252'
                    }}
                  >
                    {champ.winRate}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">KDA:</span>
                  <span className="stat-value">{champ.kda}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChampionGrid;
