import React from 'react';
import './StatsOverview.css';

const StatsOverview = ({ stats }) => {
  const winRate = stats.win_rate || 0;
  const kda = stats.avg_deaths > 0
    ? ((stats.avg_kills + stats.avg_assists) / stats.avg_deaths).toFixed(2)
    : (stats.avg_kills + stats.avg_assists).toFixed(2);

  const statCards = [
    {
      label: 'Total Matches',
      value: stats.total_matches,
      color: '#c89b3c'
    },
    {
      label: 'Average KDA',
      value: kda,
      color: kda >= 3 ? '#4CAF50' : kda >= 2 ? '#FFA726' : '#EF5350',
      subtitle: `${stats.avg_kills?.toFixed(1)} / ${stats.avg_deaths?.toFixed(1)} / ${stats.avg_assists?.toFixed(1)}`
    },
    {
      label: 'Pentakills',
      value: stats.pentakills || 0,
      color: '#9C27B0'
    }
  ];

  return (
    <div className="stats-overview">
      <h2 className="section-title">Season Highlights</h2>
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              {stat.subtitle && (
                <div className="stat-subtitle">{stat.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Win Rate Progress Bar */}
      <div className="win-rate-bar">
        <div className="bar-header">
          <span>Victory Rate</span>
          <span className="bar-percentage">{winRate.toFixed(1)}%</span>
        </div>
        <div className="bar-track">
          <div
            className="bar-fill"
            style={{
              width: `${Math.min(winRate, 100)}%`,
              background: winRate >= 50
                ? 'linear-gradient(90deg, #00c853 0%, #69f0ae 100%)'
                : 'linear-gradient(90deg, #ff5252 0%, #ff8a80 100%)'
            }}
          ></div>
        </div>
        <div className="bar-caption">
          {stats.wins}W / {stats.losses}L
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
