import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player }) => {
  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profileIconId}.png`;

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
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
