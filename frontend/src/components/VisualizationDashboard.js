import React from 'react';
import PerformanceRadar from './PerformanceRadar';
import TeamContribution from './TeamContribution';
import RoleDistribution from './RoleDistribution';
import ObjectiveParticipation from './ObjectiveParticipation';
import KDAScatter from './KDAScatter';
import './VisualizationDashboard.css';

const VisualizationDashboard = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="visualization-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          <span className="title-icon">📊</span>
          Performance Analytics
        </h2>
      </div>

      {/* Top Row - Performance Radar & Team Contribution */}
      <div className="dashboard-row two-columns">
        <div className="dashboard-col">
          <PerformanceRadar stats={stats} />
        </div>
        <div className="dashboard-col">
          <TeamContribution stats={stats} />
        </div>
      </div>

      {/* Second Row - Role Distribution & Objective Participation */}
      <div className="dashboard-row two-columns">
        <div className="dashboard-col">
          <RoleDistribution rolesPlayed={stats.roles_played} />
        </div>
        <div className="dashboard-col">
          <ObjectiveParticipation stats={stats} />
        </div>
      </div>

      {/* Third Row - Full Width KDA Scatter Plot */}
      <div className="dashboard-row full-width">
        <KDAScatter champions={stats.champions_played} />
      </div>

      {/* Stats Summary Cards */}
      <div className="dashboard-row stats-cards">
        <div className="stat-card-viz">
          <div className="stat-icon-viz">📈</div>
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.cs_per_min?.toFixed(1)}</div>
            <div className="stat-label-viz">CS per Minute</div>
            <div className="stat-detail">{stats.avg_cs_at_10?.toFixed(0)} @ 10min</div>
          </div>
        </div>

        <div className="stat-card-viz">
          <div className="stat-icon-viz">💰</div>
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.gold_per_min?.toFixed(2)}</div>
            <div className="stat-label-viz">Gold per Minute</div>
            <div className="stat-detail">Economy Control</div>
          </div>
        </div>

        <div className="stat-card-viz">
          <div className="stat-icon-viz">💥</div>
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.damage_per_min?.toFixed(2)}</div>
            <div className="stat-label-viz">Damage per Minute</div>
            <div className="stat-detail">Combat Impact</div>
          </div>
        </div>

        <div className="stat-card-viz">
          <div className="stat-icon-viz">👁️</div>
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.avg_vision_score?.toFixed(1)}</div>
            <div className="stat-label-viz">Vision Score</div>
            <div className="stat-detail">{stats.avg_control_wards?.toFixed(1)} Control Wards</div>
          </div>
        </div>

        <div className="stat-card-viz">
          <div className="stat-icon-viz">🎯</div>
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.avg_kill_participation?.toFixed(0)}%</div>
            <div className="stat-label-viz">Kill Participation</div>
            <div className="stat-detail">Team Fight Presence</div>
          </div>
        </div>
      </div>

      {/* Best Champion Highlight */}
      {stats.best_champion && (
        <div className="best-champion-highlight">
          <div className="highlight-content">
            <div className="highlight-icon">🏆</div>
            <div className="highlight-text">
              <div className="highlight-title">Your Best Champion</div>
              <div className="highlight-champion">{stats.best_champion.name}</div>
              <div className="highlight-stats">
                {stats.best_champion.win_rate?.toFixed(0)}% Win Rate • {stats.best_champion.games} Games
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizationDashboard;

