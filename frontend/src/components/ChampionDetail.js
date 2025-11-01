import React from 'react';
import { FiX, FiTrendingUp, FiTarget, FiAward } from 'react-icons/fi';
import './ChampionDetail.css';

const ChampionDetail = ({ champion, championData, onClose }) => {
  if (!champion || !championData) return null;

  const getChampionImage = (championName) => {
    const formattedName = championName.replace(/[^a-zA-Z]/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${formattedName}.png`;
  };

  const getSplashArt = (championName) => {
    const formattedName = championName.replace(/[^a-zA-Z]/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formattedName}_0.jpg`;
  };

  const winRate = championData.games > 0 ? (championData.wins / championData.games) * 100 : 0;
  const avgKills = championData.games > 0 ? championData.kills / championData.games : 0;
  const avgDeaths = championData.games > 0 ? championData.deaths / championData.games : 0;
  const avgAssists = championData.games > 0 ? championData.assists / championData.games : 0;
  const avgCS = championData.games > 0 ? championData.cs / championData.games : 0;
  const kda = avgDeaths > 0 ? (avgKills + avgAssists) / avgDeaths : (avgKills + avgAssists);
  const games = championData.games;

  const getPerformanceGrade = () => {
    // S Tier: Dominant performance (55%+ WR and 3.5+ KDA with decent games)
    if (winRate >= 55 && kda >= 3.5 && games >= 10) {
      return { grade: 'S', color: '#ffd700', label: 'Dominant' };
    }

    // A Tier: Strong performance (52%+ WR and 3.0+ KDA)
    if (winRate >= 52 && kda >= 3.0 && games >= 5) {
      return { grade: 'A', color: '#10b981', label: 'Excellent' };
    }

    // B Tier: Above average (48%+ WR and 2.5+ KDA)
    if (winRate >= 48 && kda >= 2.5 && games >= 3) {
      return { grade: 'B', color: '#3b82f6', label: 'Solid' };
    }

    // C Tier: Average or learning (42%+ WR and 2.0+ KDA, or low sample size)
    if ((winRate >= 42 && kda >= 2.0) || games < 3) {
      return { grade: 'C', color: '#f59e0b', label: games < 3 ? 'Learning' : 'Average' };
    }

    // D Tier: Needs improvement (below 42% WR or below 2.0 KDA)
    return { grade: 'D', color: '#ef4444', label: 'Needs Work' };
  };

  const getChampionTips = () => {
    const tips = [];

    // Tip 1: Overall Performance Assessment
    if (performance.grade === 'S') {
      tips.push({
        type: 'success',
        text: `You're absolutely dominating on ${champion}! With ${winRate.toFixed(0)}% wins and ${kda.toFixed(1)} KDA over ${games} games, this is your go-to champion for climbing ranked.`
      });
    } else if (performance.grade === 'A') {
      tips.push({
        type: 'success',
        text: `${champion} is one of your strongest picks! ${winRate.toFixed(0)}% win rate across ${games} games shows consistent mastery. Focus on your winning patterns.`
      });
    } else if (performance.grade === 'B') {
      tips.push({
        type: 'info',
        text: `You're performing solidly on ${champion} with a positive win rate. To reach the next level, analyze what separates your wins from your losses.`
      });
    } else if (performance.grade === 'C' && games < 3) {
      tips.push({
        type: 'info',
        text: `You're still learning ${champion} with only ${games} games played. Keep practicing to develop consistency and muscle memory with their kit.`
      });
    } else if (performance.grade === 'C') {
      tips.push({
        type: 'warning',
        text: `Your performance on ${champion} is inconsistent. Watch replays to identify whether it's mechanics, decision-making, or matchup knowledge holding you back.`
      });
    } else {
      tips.push({
        type: 'warning',
        text: `${champion} isn't working out with ${winRate.toFixed(0)}% wins over ${games} games. Consider switching to a different champion or reviewing fundamentals in normals first.`
      });
    }

    // Tip 2: KDA/Combat Performance
    if (kda >= 4.0 && avgDeaths <= 3.5) {
      tips.push({
        type: 'success',
        text: `Outstanding ${kda.toFixed(1)} KDA with only ${avgDeaths.toFixed(1)} deaths per game! Your positioning and fight selection on ${champion} is elite-level.`
      });
    } else if (kda >= 3.0) {
      tips.push({
        type: 'success',
        text: `Strong ${kda.toFixed(1)} KDA shows you understand ${champion}'s damage windows and teamfight role. Keep up the smart trading and positioning.`
      });
    } else if (avgDeaths >= 6) {
      tips.push({
        type: 'warning',
        text: `Averaging ${avgDeaths.toFixed(1)} deaths per game is too high. On ${champion}, focus on respecting enemy threats and only taking calculated fights when your team can follow up.`
      });
    } else if (kda < 2.0) {
      tips.push({
        type: 'warning',
        text: `Your ${kda.toFixed(1)} KDA suggests struggles with ${champion}'s combat patterns. Review trading stance, ability combos, and when to disengage versus commit.`
      });
    } else if (avgKills + avgAssists < 8) {
      tips.push({
        type: 'info',
        text: `Your kill participation seems low on ${champion}. Look for more opportunities to impact skirmishes and teamfights, even if just for an assist.`
      });
    } else {
      tips.push({
        type: 'info',
        text: `Decent ${kda.toFixed(1)} KDA on ${champion}. To improve, focus on dying less in lost fights and securing more kills in winning ones.`
      });
    }

    // Tip 3: CS/Economic Performance
    if (avgCS >= 220) {
      tips.push({
        type: 'success',
        text: `Excellent ${avgCS.toFixed(0)} CS per game! Your farming on ${champion} gives you consistent gold advantages to carry teamfights.`
      });
    } else if (avgCS >= 180) {
      tips.push({
        type: 'info',
        text: `Solid ${avgCS.toFixed(0)} CS per game. To maximize ${champion}'s potential, aim for 200+ by optimizing wave management and back timings.`
      });
    } else if (avgCS >= 150) {
      tips.push({
        type: 'info',
        text: `${avgCS.toFixed(0)} CS per game is acceptable but leaves gold on the table. Practice last-hitting and jungle camp timings to boost your economy on ${champion}.`
      });
    } else if (avgCS > 0) {
      tips.push({
        type: 'warning',
        text: `${avgCS.toFixed(0)} CS per game is significantly hurting your item spikes. Even on roaming champions, prioritize wave management and farm efficiency between plays.`
      });
    }

    return tips;
  };

  const performance = getPerformanceGrade();
  const championTips = getChampionTips();

  return (
    <div className="champion-detail-overlay" onClick={onClose}>
      <div className="champion-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with splash art */}
        <div className="modal-header">
          <div className="header-background">
            <img src={getSplashArt(champion)} alt={champion} />
            <div className="header-overlay"></div>
          </div>
          <div className="header-content">
            <img src={getChampionImage(champion)} alt={champion} className="champion-portrait" />
            <div className="header-info">
              <h2>{champion}</h2>
              <div className="performance-badge" style={{ borderColor: performance.color }}>
                <span className="grade" style={{ color: performance.color }}>{performance.grade}</span>
                <span className="grade-label">Performance</span>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Stats Overview */}
        <div className="modal-body">
          <div className="stats-grid-detail">
            <div className="stat-card-detail">
              <div className="stat-icon-detail">
                <FiAward />
              </div>
              <div className="stat-info">
                <div className="stat-value-detail">{championData.games}</div>
                <div className="stat-label-detail">Games Played</div>
              </div>
            </div>

            <div className="stat-card-detail">
              <div className="stat-icon-detail" style={{ color: winRate >= 50 ? '#10b981' : '#ef4444' }}>
                <FiTrendingUp />
              </div>
              <div className="stat-info">
                <div className="stat-value-detail" style={{ color: winRate >= 50 ? '#10b981' : '#ef4444' }}>
                  {winRate.toFixed(1)}%
                </div>
                <div className="stat-label-detail">{championData.wins}W {championData.games - championData.wins}L</div>
              </div>
            </div>

            <div className="stat-card-detail">
              <div className="stat-icon-detail">
                <FiTarget />
              </div>
              <div className="stat-info">
                <div className="stat-value-detail">{kda.toFixed(2)}</div>
                <div className="stat-label-detail">KDA Ratio</div>
              </div>
            </div>
          </div>

          {/* Detailed Performance */}
          <div className="performance-section">
            <h3>Performance Breakdown</h3>
            <div className="performance-bars">
              <div className="perf-bar-item">
                <div className="perf-bar-header">
                  <span className="perf-label">Average Kills</span>
                  <span className="perf-value">{avgKills.toFixed(1)}</span>
                </div>
                <div className="perf-bar-track">
                  <div className="perf-bar-fill kills" style={{ width: `${Math.min((avgKills / 15) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div className="perf-bar-item">
                <div className="perf-bar-header">
                  <span className="perf-label">Average Deaths</span>
                  <span className="perf-value">{avgDeaths.toFixed(1)}</span>
                </div>
                <div className="perf-bar-track">
                  <div className="perf-bar-fill deaths" style={{ width: `${Math.min((avgDeaths / 10) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div className="perf-bar-item">
                <div className="perf-bar-header">
                  <span className="perf-label">Average Assists</span>
                  <span className="perf-value">{avgAssists.toFixed(1)}</span>
                </div>
                <div className="perf-bar-track">
                  <div className="perf-bar-fill assists" style={{ width: `${Math.min((avgAssists / 15) * 100, 100)}%` }}></div>
                </div>
              </div>

              <div className="perf-bar-item">
                <div className="perf-bar-header">
                  <span className="perf-label">CS per Game</span>
                  <span className="perf-value">{avgCS.toFixed(0)}</span>
                </div>
                <div className="perf-bar-track">
                  <div className="perf-bar-fill cs" style={{ width: `${Math.min((avgCS / 250) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations-section">
            <h3>Champion-Specific Tips</h3>
            <div className="tips-list">
              {championTips.map((tip, index) => (
                <div key={index} className={`tip-item ${tip.type}`}>
                  <span className="tip-icon">
                    {tip.type === 'success' ? '✓' : tip.type === 'warning' ? '!' : '•'}
                  </span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionDetail;
