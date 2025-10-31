import React from 'react';
import { FiTrendingUp, FiTarget, FiZap, FiAward } from 'react-icons/fi';
import './StatsOverview.css';

const StatsOverview = ({ stats }) => {
  const winRate = stats.win_rate || 0;
  const kda = stats.avg_deaths > 0
    ? ((stats.avg_kills + stats.avg_assists) / stats.avg_deaths).toFixed(2)
    : (stats.avg_kills + stats.avg_assists).toFixed(2);

  const csPerMin = stats.cs_per_min || 0;
  const visionScore = stats.avg_vision_score || 0;
  const damagePerMin = stats.damage_per_min || 0;
  const goldPerMin = stats.gold_per_min || 0;

  return (
    <div className="stats-overview">
      <div className="overview-container">
        {/* Primary Stats Row */}
        <div className="primary-stats">
          {/* Win Rate Card - Featured */}
          <div className="stat-card-featured" style={{ animationDelay: '0s' }}>
            <div className="card-header">
              <FiTrendingUp className="card-icon" />
              <span className="card-label">Win Rate</span>
            </div>
            <div className="card-body">
              <div className="featured-value" style={{
                color: winRate >= 50 ? '#10b981' : '#ef4444'
              }}>
                {winRate.toFixed(1)}%
              </div>
              <div className="featured-subtitle">
                {stats.wins}W - {stats.losses}L
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(winRate, 100)}%`,
                    background: winRate >= 50
                      ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                      : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* KDA Card - Featured */}
          <div className="stat-card-featured" style={{ animationDelay: '0.1s' }}>
            <div className="card-header">
              <FiTarget className="card-icon" />
              <span className="card-label">KDA Ratio</span>
            </div>
            <div className="card-body">
              <div className="featured-value" style={{
                color: kda >= 3 ? '#10b981' : kda >= 2 ? '#f59e0b' : '#ef4444'
              }}>
                {kda}
              </div>
              <div className="kda-breakdown">
                <span className="kda-k">{stats.avg_kills?.toFixed(1)}</span>
                <span className="kda-sep">/</span>
                <span className="kda-d">{stats.avg_deaths?.toFixed(1)}</span>
                <span className="kda-sep">/</span>
                <span className="kda-a">{stats.avg_assists?.toFixed(1)}</span>
              </div>
              <div className="featured-subtitle">Average K/D/A</div>
            </div>
          </div>

          {/* Total Games Card */}
          <div className="stat-card-compact" style={{ animationDelay: '0.2s' }}>
            <FiZap className="compact-icon" />
            <div className="compact-content">
              <div className="compact-value">{stats.total_matches}</div>
              <div className="compact-label">Total Games</div>
            </div>
          </div>

          {/* Pentakills Card */}
          <div className="stat-card-compact highlight" style={{ animationDelay: '0.3s' }}>
            <FiAward className="compact-icon" />
            <div className="compact-content">
              <div className="compact-value">{stats.pentakills || 0}</div>
              <div className="compact-label">Pentakills</div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="secondary-stats">
          <div className="stat-mini" style={{ animationDelay: '0.4s' }}>
            <div className="mini-label">CS/Min</div>
            <div className="mini-value">{csPerMin.toFixed(1)}</div>
          </div>

          <div className="stat-mini" style={{ animationDelay: '0.45s' }}>
            <div className="mini-label">Gold/Min</div>
            <div className="mini-value">{goldPerMin.toFixed(0)}</div>
          </div>

          <div className="stat-mini" style={{ animationDelay: '0.5s' }}>
            <div className="mini-label">Damage/Min</div>
            <div className="mini-value">{damagePerMin.toFixed(0)}</div>
          </div>

          <div className="stat-mini" style={{ animationDelay: '0.55s' }}>
            <div className="mini-label">Vision Score</div>
            <div className="mini-value">{visionScore.toFixed(1)}</div>
          </div>

          <div className="stat-mini" style={{ animationDelay: '0.6s' }}>
            <div className="mini-label">Kill Part.</div>
            <div className="mini-value">{(stats.avg_kill_participation || 0).toFixed(0)}%</div>
          </div>

          <div className="stat-mini" style={{ animationDelay: '0.65s' }}>
            <div className="mini-label">Dragons</div>
            <div className="mini-value">{(stats.avg_dragons || 0).toFixed(1)}</div>
          </div>

          <div className="stat-mini" style={{ animationDelay: '0.7s' }}>
            <div className="mini-label">Barons</div>
            <div className="mini-value">{(stats.avg_barons || 0).toFixed(2)}</div>
          </div>

          <div className="stat-mini" style={{ animationDelay: '0.75s' }}>
            <div className="mini-label">First Bloods</div>
            <div className="mini-value">{stats.first_bloods || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
