import React, { useState } from 'react';
import './SearchForm.css';

const SearchForm = ({ onSearch, loading }) => {
  const [riotId, setRiotId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (riotId.trim() && riotId.includes('#')) {
      onSearch(riotId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="input-group">
        <div className="input-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          placeholder="Enter Summoner Name#TAG"
          className="search-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="search-submit"
          disabled={loading || !riotId.includes('#')}
        >
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
