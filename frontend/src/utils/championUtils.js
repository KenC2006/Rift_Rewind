/**
 * Champion utility functions for image URLs and formatting
 */

/**
 * Formats champion name for use in Data Dragon URLs
 * @param {string} championName - The champion name to format
 * @returns {string} - Formatted champion name (letters only)
 */
export const formatChampionName = (championName) => {
  return championName.replace(/[^a-zA-Z]/g, '');
};

/**
 * Gets the champion icon image URL
 * @param {string} championName - The champion name
 * @returns {string} - URL to champion icon
 */
export const getChampionImage = (championName) => {
  const formattedName = formatChampionName(championName);
  return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${formattedName}.png`;
};

/**
 * Gets the champion splash art URL
 * @param {string} championName - The champion name
 * @returns {string} - URL to champion splash art
 */
export const getSplashArt = (championName) => {
  const formattedName = formatChampionName(championName);
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formattedName}_0.jpg`;
};
