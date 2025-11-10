import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-container">
        <div className="notfound-content">
          <div className="notfound-header">
            <div className="notfound-code">404</div>
            <div className="notfound-divider"></div>
            <div className="notfound-message">
              <h1>Page Not Found</h1>
              <p>The rift you're looking for doesn't exist.</p>
            </div>
          </div>

          <div className="notfound-description">
            <p>
              Looks like you've wandered into the fog of war. This page might have been deleted,
              moved, or never existed in the first place.
            </p>
          </div>

          <div className="notfound-actions">
            <button
              className="notfound-btn primary"
              onClick={() => navigate('/')}
            >
              Return Home
            </button>
            <button
              className="notfound-btn secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>

          <div className="notfound-suggestions">
            <p className="suggestions-title">Try one of these instead:</p>
            <div className="suggestions-links">
              <button onClick={() => navigate('/')} className="suggestion-link">
                <span className="link-icon">🏠</span>
                <span className="link-text">Search for Summoners</span>
              </button>
              <button onClick={() => navigate('/stats')} className="suggestion-link">
                <span className="link-icon">📊</span>
                <span className="link-text">View Stats</span>
              </button>
              <button onClick={() => navigate('/climb')} className="suggestion-link">
                <span className="link-icon">📈</span>
                <span className="link-text">Climb Insights</span>
              </button>
            </div>
          </div>
        </div>

        <div className="notfound-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
