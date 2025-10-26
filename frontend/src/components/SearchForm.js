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
    <div className="search-container">
      <div className="search-header">
        <h1 className="logo">
          <span className="rift">RIFT</span>
          <span className="rewind">REWIND</span>
        </h1>
        <p className="tagline">Your Year in League of Legends</p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            placeholder="GameName#TAG (e.g., Doublelift#NA1)"
            className="search-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading || !riotId.includes('#')}
          >
            {loading ? 'Analyzing...' : 'Generate Recap'}
          </button>
        </div>
        <p className="hint">Enter your Riot ID to see your 2024 year in review</p>
      </form>
    </div>
  );
};

export default SearchForm;
