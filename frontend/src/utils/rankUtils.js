/**
 * Rank utility functions
 */

/**
 * Normalizes rank tier for benchmark lookups
 * Master, Grandmaster, and Challenger are grouped as MASTER+
 * @param {Object} player - Player object with rank property
 * @returns {string} - Normalized rank tier (e.g., 'SILVER', 'GOLD', 'MASTER+')
 */
export const getRankTier = (player) => {
  if (!player || !player.rank) return 'SILVER';
  const tier = player.rank.tier;
  if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) return 'MASTER+';
  return tier;
};
