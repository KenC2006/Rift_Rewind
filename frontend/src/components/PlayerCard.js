import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player }) => {
  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profileIconId}.png`;

  // Get rank data if available
  const rank = player.rank;
  const hasRank = rank && rank.tier;

  return (
    <div className="player-card">
      <div className="player-banner">
        <div className="player-icon-wrapper">
          <img
            src={iconUrl}
            alt="Profile Icon"
            className="player-icon"
            onError={(e) => {
              e.target.src = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png';
            }}
          />
          <div className="level-badge">{player.summonerLevel}</div>
        </div>
        <div className="player-info">
          <h2 className="player-name">
            {player.gameName}
            <span className="player-tag">#{player.tagLine}</span>
          </h2>
          <p className="player-subtitle">2024 Year in Review</p>
          {hasRank && (
            <div className="rank-display">
              <span className="rank-tier">{rank.tier} {rank.division}</span>
              <span className="rank-lp">{rank.lp} LP</span>
              <span className="rank-wr">{rank.wins}W {rank.losses}L</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
