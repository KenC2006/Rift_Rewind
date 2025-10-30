import React from 'react';
import { FiBarChart2, FiCpu } from 'react-icons/fi';
import { GiGamepad } from 'react-icons/gi';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="spinner"></div>
        <h2 className="loading-text">Analyzing Your Legend...</h2>
        <div className="loading-steps">
          <div className="step">
            <FiBarChart2 className="step-icon" size={24} />
            <span>Fetching match history</span>
          </div>
          <div className="step">
            <GiGamepad className="step-icon" size={24} />
            <span>Processing statistics</span>
          </div>
          <div className="step">
            <FiCpu className="step-icon" size={24} />
            <span>Generating AI insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
