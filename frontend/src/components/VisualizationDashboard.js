import React from 'react';
import PerformanceRadar from './PerformanceRadar';
import TeamContribution from './TeamContribution';
import RoleDistribution from './RoleDistribution';
import ObjectiveParticipation from './ObjectiveParticipation';
import KDAScatter from './KDAScatter';
import ItemUsage from './ItemUsage';
import './VisualizationDashboard.css';

const VisualizationDashboard = ({ stats }) => {
  if (!stats) return null;

  const getChampionImage = (championName) => {
    const formattedName = championName.replace(/[^a-zA-Z]/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${formattedName}.png`;
  };

  return (
    <div className="visualization-dashboard">
      {/* Best Champion Banner */}
      {stats.best_champion && (
        <div className="best-champion-banner">
          <div className="banner-container">
            <div className="banner-badge">Top Performer</div>
            <div className="banner-content">
              <img
                className="banner-champion-img"
                src={getChampionImage(stats.best_champion.name)}
                alt={stats.best_champion.name}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="banner-info">
                <div className="banner-champion-name">{stats.best_champion.name}</div>
                <div className="banner-stats">
                  <span className="banner-stat-value">{stats.best_champion.win_rate?.toFixed(1)}%</span>
                  <span className="banner-stat-label">Win Rate</span>
                  <span className="banner-divider">•</span>
                  <span className="banner-stat-value">{stats.best_champion.games}</span>
                  <span className="banner-stat-label">Games</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Title */}
      <div className="section-header">
        <h2 className="section-title">Performance Analytics</h2>
      </div>

      {/* Charts Grid - Bento Box Layout */}
      <div className="charts-grid">
        {/* Featured Large Chart - Takes up 2x2 space */}
        <div className="chart-card chart-featured">
          <div className="chart-card-header">
            <h3 className="chart-title">Performance Overview</h3>
            <p className="chart-subtitle">Multi-dimensional performance analysis</p>
          </div>
          <div className="chart-card-body">
            <PerformanceRadar stats={stats} />
          </div>
        </div>

        {/* Top Right - Champion Scatter */}
        <div className="chart-card chart-tall">
          <div className="chart-card-header">
            <h3 className="chart-title">Champion Performance Map</h3>
            <p className="chart-subtitle">Win rate vs KDA distribution</p>
          </div>
          <div className="chart-card-body">
            <KDAScatter champions={stats.champions_played} />
          </div>
        </div>

        {/* Middle Left - Team Contribution */}
        <div className="chart-card chart-wide">
          <div className="chart-card-header">
            <h3 className="chart-title">Team Contribution</h3>
            <p className="chart-subtitle">Your impact breakdown</p>
          </div>
          <div className="chart-card-body">
            <TeamContribution stats={stats} />
          </div>
        </div>

        {/* Middle Right - Role Distribution */}
        <div className="chart-card chart-compact">
          <div className="chart-card-header">
            <h3 className="chart-title">Role Distribution</h3>
          </div>
          <div className="chart-card-body">
            <RoleDistribution rolesPlayed={stats.roles_played} />
          </div>
        </div>

        {/* Bottom Left - Objectives */}
        <div className="chart-card chart-compact">
          <div className="chart-card-header">
            <h3 className="chart-title">Objective Participation</h3>
          </div>
          <div className="chart-card-body">
            <ObjectiveParticipation stats={stats} />
          </div>
        </div>

        {/* Bottom Wide - Item Usage */}
        <div className="chart-card chart-wide">
          <div className="chart-card-header">
            <h3 className="chart-title">Item Usage Patterns</h3>
            <p className="chart-subtitle">Most purchased items</p>
          </div>
          <div className="chart-card-body">
            <ItemUsage stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationDashboard;

