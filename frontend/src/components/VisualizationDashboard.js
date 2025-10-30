import React, { useState } from 'react';
import PerformanceRadar from './PerformanceRadar';
import TeamContribution from './TeamContribution';
import RoleDistribution from './RoleDistribution';
import ObjectiveParticipation from './ObjectiveParticipation';
import KDAScatter from './KDAScatter';
import { FiBarChart2, FiTrendingUp, FiDollarSign, FiZap, FiEye, FiTarget, FiAward, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './VisualizationDashboard.css';

const VisualizationDashboard = ({ stats }) => {
  const [currentChart, setCurrentChart] = useState(0);

  if (!stats) return null;

  const charts = [
    { component: <PerformanceRadar stats={stats} />, name: 'Performance Radar' },
    { component: <TeamContribution stats={stats} />, name: 'Team Contribution' },
    { component: <RoleDistribution rolesPlayed={stats.roles_played} />, name: 'Role Distribution' },
    { component: <ObjectiveParticipation stats={stats} />, name: 'Objective Participation' },
    { component: <KDAScatter champions={stats.champions_played} />, name: 'Champion Performance Map' }
  ];

  const nextChart = () => {
    setCurrentChart((prev) => (prev + 1) % charts.length);
  };

  const prevChart = () => {
    setCurrentChart((prev) => (prev - 1 + charts.length) % charts.length);
  };

  return (
    <div className="visualization-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          <FiBarChart2 className="title-icon" size={36} />
          Performance Analytics
        </h2>
      </div>

      {/* Chart Carousel */}
      <div className="chart-carousel">
        <button className="carousel-arrow carousel-arrow-left" onClick={prevChart}>
          <FiChevronLeft size={32} />
        </button>

        <div className="carousel-content">
          <div className="carousel-chart">
            {charts[currentChart].component}
          </div>
          <div className="carousel-indicators">
            {charts.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentChart ? 'active' : ''}`}
                onClick={() => setCurrentChart(index)}
              />
            ))}
          </div>
        </div>

        <button className="carousel-arrow carousel-arrow-right" onClick={nextChart}>
          <FiChevronRight size={32} />
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="dashboard-row stats-cards">
        <div className="stat-card-viz">
          <FiTrendingUp className="stat-icon-viz" size={32} />
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.cs_per_min?.toFixed(1)}</div>
            <div className="stat-label-viz">CS per Minute</div>
            <div className="stat-detail">{stats.avg_cs_at_10?.toFixed(0)} @ 10min</div>
          </div>
        </div>

        <div className="stat-card-viz">
          <FiDollarSign className="stat-icon-viz" size={32} />
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.gold_per_min?.toFixed(2)}</div>
            <div className="stat-label-viz">Gold per Minute</div>
            <div className="stat-detail">Economy Control</div>
          </div>
        </div>

        <div className="stat-card-viz">
          <FiZap className="stat-icon-viz" size={32} />
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.damage_per_min?.toFixed(2)}</div>
            <div className="stat-label-viz">Damage per Minute</div>
            <div className="stat-detail">Combat Impact</div>
          </div>
        </div>

        <div className="stat-card-viz">
          <FiEye className="stat-icon-viz" size={32} />
          <div className="stat-content-viz">
            <div className="stat-value-viz">{stats.avg_vision_score?.toFixed(1)}</div>
            <div className="stat-label-viz">Vision Score</div>
            <div className="stat-detail">{stats.avg_control_wards?.toFixed(1)} Control Wards</div>
          </div>
        </div>

        <div className="stat-card-viz">
          <FiTarget className="stat-icon-viz" size={32} />
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
            <FiAward className="highlight-icon" size={48} />
            <div className="highlight-text">
              <div className="highlight-title">Your Best Champion</div>
              <div className="highlight-champion-row">
                <img
                  className="highlight-champion-img"
                  src={getChampionImage(stats.best_champion.name)}
                  alt={stats.best_champion.name}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="highlight-champion">{stats.best_champion.name}</div>
              </div>
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

