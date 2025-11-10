import React, { useState } from 'react';
import { FiActivity, FiTarget, FiPieChart, FiTrendingUp, FiAward, FiShoppingBag } from 'react-icons/fi';
import PerformanceRadar from './PerformanceRadar';
import TeamContribution from './TeamContribution';
import RoleDistribution from './RoleDistribution';
import ObjectiveParticipation from './ObjectiveParticipation';
import KDAScatter from './KDAScatter';
import ItemUsage from './ItemUsage';
import './VisualizationDashboard.css';

const VisualizationDashboard = ({ stats, player }) => {
  const [featuredChart, setFeaturedChart] = useState('radar');

  if (!stats) return null;

  const getChampionImage = (championName) => {
    const formattedName = championName.replace(/[^a-zA-Z]/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${formattedName}.png`;
  };

  // Define all available charts
  const charts = [
    {
      id: 'radar',
      name: 'Performance Radar',
      icon: FiActivity,
      description: 'Multi-dimensional analysis',
      component: <PerformanceRadar stats={stats} player={player} />,
      color: '#9B59B6'
    },
    {
      id: 'scatter',
      name: 'Champion Performance',
      icon: FiTarget,
      description: 'KDA vs Win Rate map',
      component: <KDAScatter champions={stats.champions_played} />,
      color: '#3b82f6'
    },
    {
      id: 'contribution',
      name: 'Team Contribution',
      icon: FiTrendingUp,
      description: 'Damage & Gold share',
      component: <TeamContribution stats={stats} player={player} />,
      color: '#10b981'
    },
    {
      id: 'roles',
      name: 'Role Distribution',
      icon: FiPieChart,
      description: 'Games per role',
      component: <RoleDistribution rolesPlayed={stats.roles_played} />,
      color: '#f59e0b'
    },
    {
      id: 'objectives',
      name: 'Objective Control',
      icon: FiAward,
      description: 'Dragons, Barons, Turrets',
      component: <ObjectiveParticipation stats={stats} player={player} />,
      color: '#C89B3C'
    },
    {
      id: 'items',
      name: 'Item Builds',
      icon: FiShoppingBag,
      description: 'Build patterns',
      component: <ItemUsage stats={stats} />,
      color: '#ef4444'
    }
  ];

  const activeChart = charts.find(c => c.id === featuredChart) || charts[0];

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
        <p className="section-subtitle">Click any chart below to view it in detail</p>
      </div>

      {/* Split Dashboard Layout */}
      <div className="split-dashboard">
        {/* Main Featured Chart */}
        <div className="featured-chart-container">
          <div className="featured-chart-header">
            <div className="featured-chart-info">
              <activeChart.icon className="featured-chart-icon" style={{ color: activeChart.color }} />
              <div>
                <h3 className="featured-chart-title">{activeChart.name}</h3>
                <p className="featured-chart-description">{activeChart.description}</p>
              </div>
            </div>
          </div>
          <div className="featured-chart-body">
            {activeChart.component}
          </div>
        </div>

        {/* Sidebar with Chart Previews */}
        <div className="chart-sidebar">
          <div className="sidebar-header">
            <h4 className="sidebar-title">All Analytics</h4>
            <span className="sidebar-count">{charts.length} Charts</span>
          </div>
          <div className="chart-preview-grid">
            {charts.map((chart, index) => (
              <button
                key={chart.id}
                className={`chart-preview-card ${featuredChart === chart.id ? 'active' : ''}`}
                onClick={() => setFeaturedChart(chart.id)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="preview-card-header">
                  <chart.icon
                    className="preview-icon"
                    style={{ color: featuredChart === chart.id ? chart.color : '#94a3b8' }}
                  />
                  {featuredChart === chart.id && (
                    <span className="active-badge">Active</span>
                  )}
                </div>
                <div className="preview-card-content">
                  <h5 className="preview-title">{chart.name}</h5>
                  <p className="preview-description">{chart.description}</p>
                </div>
                <div
                  className="preview-accent"
                  style={{
                    background: featuredChart === chart.id
                      ? `linear-gradient(90deg, ${chart.color}40, transparent)`
                      : 'transparent'
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationDashboard;

