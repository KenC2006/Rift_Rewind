/**
 * API Service for Rift Rewind
 * Handles all communication with the Flask backend
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Analyze a player and get full year-in-review
 * @param {string} riotId - Riot ID in format "GameName#TAG"
 * @returns {Promise} - Player data, stats, and AI insights
 */
export const analyzePlayer = async (riotId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
      riotId: riotId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get player information only
 * @param {string} riotId - Riot ID in format "GameName#TAG"
 * @returns {Promise} - Basic player info
 */
export const getPlayerInfo = async (riotId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/player/${riotId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get player statistics without AI insights
 * @param {string} riotId - Riot ID in format "GameName#TAG"
 * @returns {Promise} - Player stats
 */
export const getPlayerStats = async (riotId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/stats/${riotId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Health check
 * @returns {Promise} - API health status
 */
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
