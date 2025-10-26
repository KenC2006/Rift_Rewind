import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="spinner"></div>
        <h2 className="loading-text">Analyzing Your Legend...</h2>
        <div className="loading-steps">
          <div className="step">
            <span className="step-icon">📊</span>
            <span>Fetching match history</span>
          </div>
          <div className="step">
            <span className="step-icon">🎮</span>
            <span>Processing statistics</span>
          </div>
          <div className="step">
            <span className="step-icon">🤖</span>
            <span>Generating AI insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
