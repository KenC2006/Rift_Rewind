/**
 * Performance benchmarks by role and rank
 * Based on League of Legends statistical data
 * Matching backend.py benchmark values
 */

// CS/min benchmarks by role and elo
export const CS_BENCHMARKS = {
  MIDDLE: {
    IRON: 4.0, BRONZE: 4.5, SILVER: 5.0, GOLD: 5.5,
    PLATINUM: 6.0, EMERALD: 6.5, DIAMOND: 7.0, 'MASTER+': 7.5
  },
  TOP: {
    IRON: 3.8, BRONZE: 4.2, SILVER: 4.7, GOLD: 5.2,
    PLATINUM: 5.7, EMERALD: 6.2, DIAMOND: 6.7, 'MASTER+': 7.2
  },
  JUNGLE: {
    IRON: 3.0, BRONZE: 3.5, SILVER: 4.0, GOLD: 4.5,
    PLATINUM: 5.0, EMERALD: 5.5, DIAMOND: 6.0, 'MASTER+': 6.5
  },
  BOTTOM: {
    IRON: 4.5, BRONZE: 5.0, SILVER: 5.5, GOLD: 6.0,
    PLATINUM: 6.5, EMERALD: 7.0, DIAMOND: 7.5, 'MASTER+': 8.0
  },
  SUPPORT: {
    IRON: 1.0, BRONZE: 1.2, SILVER: 1.5, GOLD: 1.8,
    PLATINUM: 2.0, EMERALD: 2.3, DIAMOND: 2.5, 'MASTER+': 3.0
  }
};

// Vision score benchmarks by role and elo
export const VISION_BENCHMARKS = {
  MIDDLE: {
    IRON: 15, BRONZE: 18, SILVER: 22, GOLD: 26,
    PLATINUM: 30, EMERALD: 34, DIAMOND: 38, 'MASTER+': 42
  },
  TOP: {
    IRON: 12, BRONZE: 15, SILVER: 18, GOLD: 22,
    PLATINUM: 26, EMERALD: 30, DIAMOND: 34, 'MASTER+': 38
  },
  JUNGLE: {
    IRON: 20, BRONZE: 24, SILVER: 28, GOLD: 32,
    PLATINUM: 36, EMERALD: 40, DIAMOND: 44, 'MASTER+': 48
  },
  BOTTOM: {
    IRON: 10, BRONZE: 13, SILVER: 16, GOLD: 19,
    PLATINUM: 22, EMERALD: 25, DIAMOND: 28, 'MASTER+': 32
  },
  SUPPORT: {
    IRON: 45, BRONZE: 55, SILVER: 65, GOLD: 75,
    PLATINUM: 85, EMERALD: 95, DIAMOND: 105, 'MASTER+': 115
  }
};

// KDA benchmarks by elo
export const KDA_BENCHMARKS = {
  IRON: 1.8, BRONZE: 2.0, SILVER: 2.3, GOLD: 2.6,
  PLATINUM: 2.9, EMERALD: 3.2, DIAMOND: 3.5, 'MASTER+': 4.0
};

// Kill participation benchmarks by role and rank (from LeagueMath data)
export const KILL_PARTICIPATION_BENCHMARKS = {
  TOP: {
    IRON: 42, BRONZE: 43, SILVER: 44, GOLD: 45,
    PLATINUM: 46, EMERALD: 46, DIAMOND: 46, 'MASTER+': 47
  },
  JUNGLE: {
    IRON: 48, BRONZE: 48, SILVER: 51, GOLD: 53,
    PLATINUM: 54, EMERALD: 54, DIAMOND: 55, 'MASTER+': 56
  },
  MIDDLE: {
    IRON: 49, BRONZE: 49, SILVER: 51, GOLD: 52,
    PLATINUM: 53, EMERALD: 53, DIAMOND: 53, 'MASTER+': 53
  },
  BOTTOM: {
    IRON: 49, BRONZE: 50, SILVER: 51, GOLD: 53,
    PLATINUM: 53, EMERALD: 53, DIAMOND: 53, 'MASTER+': 53
  },
  SUPPORT: {
    IRON: 50, BRONZE: 50, SILVER: 52, GOLD: 54,
    PLATINUM: 55, EMERALD: 56, DIAMOND: 56, 'MASTER+': 58
  }
};

// Objective participation benchmarks by rank (dragons + barons per game)
export const OBJECTIVE_PARTICIPATION_BENCHMARKS = {
  IRON: 0.45, BRONZE: 0.50, SILVER: 0.55, GOLD: 0.60,
  PLATINUM: 0.65, EMERALD: 0.68, DIAMOND: 0.72, 'MASTER+': 0.78
};

// Damage share benchmarks by role and rank (from LeagueMath data)
export const DAMAGE_SHARE_BENCHMARKS = {
  TOP: {
    IRON: 23.3, BRONZE: 23.3, SILVER: 22.4, GOLD: 21.7,
    PLATINUM: 21.4, EMERALD: 21.5, DIAMOND: 21.6, 'MASTER+': 19.5
  },
  JUNGLE: {
    IRON: 18.5, BRONZE: 18.5, SILVER: 17.8, GOLD: 17.2,
    PLATINUM: 16.8, EMERALD: 16.5, DIAMOND: 16.2, 'MASTER+': 16.0
  },
  MIDDLE: {
    IRON: 34.0, BRONZE: 34.0, SILVER: 34.2, GOLD: 33.8,
    PLATINUM: 33.5, EMERALD: 33.2, DIAMOND: 32.8, 'MASTER+': 33.0
  },
  BOTTOM: {
    IRON: 27.6, BRONZE: 27.6, SILVER: 31.2, GOLD: 34.0,
    PLATINUM: 35.1, EMERALD: 35.0, DIAMOND: 35.0, 'MASTER+': 35.1
  },
  SUPPORT: {
    IRON: 5.0, BRONZE: 5.0, SILVER: 3.0, GOLD: 2.3,
    PLATINUM: 2.0, EMERALD: 2.0, DIAMOND: 2.1, 'MASTER+': 2.3
  }
};

// Gold share benchmarks by role and rank
export const GOLD_SHARE_BENCHMARKS = {
  TOP: {
    IRON: 20.5, BRONZE: 20.5, SILVER: 20.3, GOLD: 20.0,
    PLATINUM: 19.8, EMERALD: 19.5, DIAMOND: 19.3, 'MASTER+': 19.0
  },
  JUNGLE: {
    IRON: 19.0, BRONZE: 19.0, SILVER: 18.5, GOLD: 18.0,
    PLATINUM: 17.8, EMERALD: 17.5, DIAMOND: 17.3, 'MASTER+': 17.0
  },
  MIDDLE: {
    IRON: 21.5, BRONZE: 21.5, SILVER: 22.0, GOLD: 22.5,
    PLATINUM: 23.0, EMERALD: 23.3, DIAMOND: 23.5, 'MASTER+': 23.8
  },
  BOTTOM: {
    IRON: 23.0, BRONZE: 23.0, SILVER: 23.5, GOLD: 24.0,
    PLATINUM: 24.5, EMERALD: 25.0, DIAMOND: 25.3, 'MASTER+': 25.5
  },
  SUPPORT: {
    IRON: 15.5, BRONZE: 15.5, SILVER: 15.2, GOLD: 15.0,
    PLATINUM: 14.4, EMERALD: 14.2, DIAMOND: 14.1, 'MASTER+': 14.2
  }
};
