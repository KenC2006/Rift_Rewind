import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('riftRewindPlayerData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPlayerData(parsed);
      } catch (err) {
        console.error('Failed to parse saved player data:', err);
        localStorage.removeItem('riftRewindPlayerData');
      }
    }
  }, []);

  // Save to localStorage whenever playerData changes
  useEffect(() => {
    if (playerData) {
      localStorage.setItem('riftRewindPlayerData', JSON.stringify(playerData));
    }
  }, [playerData]);

  const updatePlayerData = (data) => {
    setPlayerData(data);
  };

  const clearPlayerData = () => {
    setPlayerData(null);
    localStorage.removeItem('riftRewindPlayerData');
    setError(null);
  };

  const value = {
    playerData,
    loading,
    error,
    setLoading,
    setError,
    updatePlayerData,
    clearPlayerData
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
