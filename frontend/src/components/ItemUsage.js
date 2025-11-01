import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import './ItemUsage.css';
import { getItemsMapping } from '../services/api';

const CHAMP_IMG = (name) => `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${(name || '').replace(/[^a-zA-Z]/g, '')}.png`;
const ITEM_IMG = (id) => `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${id}.png`;

// Item phase component with detailed stats
const ItemPhase = ({ lists, idToName, totalMatches, phase }) => {
  const summary = useMemo(() => {
    const counts = {};
    const matchLists = lists || [];
    matchLists.forEach((arr) => {
      const unique = new Set(arr || []);
      unique.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    const items = Object.entries(counts)
      .map(([id, c]) => ({ id: String(id), count: c, pct: totalMatches ? (c / totalMatches) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
    return { items };
  }, [lists, totalMatches]);

  if (!lists || lists.length === 0) {
    return <div className="no-data-text">No {phase} item data available.</div>;
  }

  const getItemRarity = (pct) => {
    if (pct >= 70) return 'core';
    if (pct >= 50) return 'frequent';
    if (pct >= 30) return 'situational';
    return 'rare';
  };

  const getItemLabel = (pct) => {
    if (pct >= 70) return 'Core Item';
    if (pct >= 50) return 'Frequent';
    if (pct >= 30) return 'Situational';
    return 'Rare';
  };

  return (
    <div className="items-phase-grid">
      {summary.items.map((it) => {
        const rarity = getItemRarity(it.pct);
        const label = getItemLabel(it.pct);
        return (
          <div className={`item-tile rarity-${rarity}`} key={`${phase}-${it.id}`}>
            <div className="item-icon-wrapper">
              <img className="item-icon" src={ITEM_IMG(it.id)} alt={idToName[it.id] || it.id} />
              <div className="item-rarity-badge">{label}</div>
            </div>
            <div className="item-meta">
              <div className="item-name" title={idToName[it.id] || it.id}>{idToName[it.id] || `Item ${it.id}`}</div>
              <div className="item-stats">
                <div className="item-pct">{it.pct.toFixed(0)}%</div>
                <div className="item-count">{it.count}/{totalMatches} games</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ItemUsageModal = ({ champion, data, idToName, onClose, championStats }) => {
  const [activeTab, setActiveTab] = useState('final');

  if (!champion || !data) return null;

  const totalMatches = data.matches || 0;
  const winRate = championStats ? (championStats.wins / championStats.games * 100).toFixed(1) : 0;
  const avgKDA = championStats
    ? ((championStats.kills + championStats.assists) / Math.max(championStats.deaths, 1)).toFixed(2)
    : 0;

  const getPhaseDescription = (phase) => {
    const descriptions = {
      start: 'Items purchased in the first 2 minutes. These set up your early laning phase and first back.',
      mid: 'Mid-game items around 15-20 minutes. Your power spikes and core build starts to take shape.',
      final: 'Full build at game end. Your complete 6-item build showing your preferred playstyle and adaptation.'
    };
    return descriptions[phase] || '';
  };

  const tabs = [
    { id: 'final', label: 'Final Build', icon: '🎯' },
    { id: 'mid', label: 'Mid Game', icon: '⚔️' },
    { id: 'start', label: 'Early Game', icon: '🌱' }
  ];

  const modalContent = (
    <div className="iu-modal-overlay" onClick={onClose}>
      <div className="iu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="iu-modal-header">
          <div className="iu-header-left">
            <div className="iu-champ">
              <img className="iu-champ-img" src={CHAMP_IMG(champion)} alt={champion} />
              <div className="iu-champ-info">
                <div className="iu-champ-name">{champion}</div>
                <div className="iu-champ-stats">
                  {totalMatches} games • {winRate}% WR • {avgKDA} KDA
                </div>
              </div>
            </div>
          </div>
          <button className="iu-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="iu-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`iu-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="iu-modal-content">
          <div className="phase-description">
            <div className="phase-title">{tabs.find(t => t.id === activeTab)?.label || 'Items'}</div>
            <p className="phase-desc-text">{getPhaseDescription(activeTab)}</p>
          </div>

          {activeTab === 'final' && (
            <div className="phase-section">
              <ItemPhase
                lists={data.final || []}
                idToName={idToName}
                totalMatches={totalMatches}
                phase="final"
              />
              <div className="phase-insights">
                <div className="insight-box">
                  <div className="insight-icon">💡</div>
                  <div className="insight-content">
                    <div className="insight-title">Build Tips</div>
                    <div className="insight-text">
                      Items marked as "Core" appear in 70%+ of your games - these are your go-to choices.
                      "Situational" items (30-50%) suggest good adaptation to enemy team comps.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mid' && (
            <div className="phase-section">
              <ItemPhase
                lists={data.mid || []}
                idToName={idToName}
                totalMatches={totalMatches}
                phase="mid"
              />
              <div className="phase-insights">
                <div className="insight-box">
                  <div className="insight-icon">⚡</div>
                  <div className="insight-content">
                    <div className="insight-title">Mid-Game Power Spikes</div>
                    <div className="insight-text">
                      This shows your 2-3 item core. Consistent mid-game items indicate you know your champion's power spikes.
                      High variation might mean you're experimenting or adapting well to different game states.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'start' && (
            <div className="phase-section">
              <ItemPhase
                lists={data.start || []}
                idToName={idToName}
                totalMatches={totalMatches}
                phase="start"
              />
              <div className="phase-insights">
                <div className="insight-box">
                  <div className="insight-icon">📚</div>
                  <div className="insight-content">
                    <div className="insight-title">Starting Items</div>
                    <div className="insight-text">
                      Your starting items should match your lane matchup and strategy. Consistency here (70%+) is good,
                      but some variation shows you're adapting to different opponents and team compositions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="build-legend">
            <div className="legend-title">Item Frequency Guide:</div>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-badge rarity-core">Core</span>
                <span className="legend-text">70%+ - Essential to your build</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge rarity-frequent">Frequent</span>
                <span className="legend-text">50-70% - Common choices</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge rarity-situational">Situational</span>
                <span className="legend-text">30-50% - Adaptive picks</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge rarity-rare">Rare</span>
                <span className="legend-text">&lt;30% - Niche situations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

const ItemUsage = ({ stats }) => {
  const [selected, setSelected] = useState(null); // champion name
  const [idToName, setIdToName] = useState({});
  const [sortBy, setSortBy] = useState('games'); // games, winrate

  useEffect(() => {
    const load = async () => {
      try {
        const json = await getItemsMapping();
        if (json?.success && json?.data) setIdToName(json.data);
      } catch {}
    };
    load();
  }, []);

  const invByChamp = stats?.inventory_by_champion || {};
  const champions = useMemo(() => {
    const all = Object.keys(stats?.champions_played || {});
    const filtered = all.filter((name) => {
      const games = stats?.champions_played?.[name]?.games || 0;
      const hasInv = !!invByChamp[name];
      return games >= 5 && hasInv; // only show champs with 5+ games and inventory data
    });
    filtered.sort((a, b) => {
      if (sortBy === 'winrate') {
        const wrA = (stats?.champions_played?.[a]?.wins || 0) / Math.max(stats?.champions_played?.[a]?.games || 1, 1);
        const wrB = (stats?.champions_played?.[b]?.wins || 0) / Math.max(stats?.champions_played?.[b]?.games || 1, 1);
        if (Math.abs(wrB - wrA) > 0.01) return wrB - wrA;
      }
      const ga = stats?.champions_played?.[a]?.games || 0;
      const gb = stats?.champions_played?.[b]?.games || 0;
      if (gb !== ga) return gb - ga; // descending by games (usage)
      return a.localeCompare(b);
    });
    return filtered;
  }, [stats, invByChamp, sortBy]);

  const totalChampions = champions.length;
  const totalGamesWithData = champions.reduce((sum, name) => sum + (stats?.champions_played?.[name]?.games || 0), 0);

  return (
    <div className="item-usage">
      <div className="iu-header-section">
        <div className="iu-header-content">
          <h3 className="iu-title">Item Build Analysis</h3>
          <p className="iu-subtitle">
            Analyzing {totalChampions} champions across {totalGamesWithData} games.
            View your most purchased items at different game stages and discover your itemization patterns.
          </p>
        </div>
        <div className="iu-sort-controls">
          <label className="iu-sort-label">Sort by:</label>
          <select
            className="iu-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="games">Most Played</option>
            <option value="winrate">Highest Win Rate</option>
          </select>
        </div>
      </div>

      {champions.length === 0 ? (
        <div className="no-data-message">
          <div className="no-data-icon">📦</div>
          <div className="no-data-title">No Item Data Available</div>
          <div className="no-data-text">
            Play at least 5 games on a champion to see detailed item build analysis.
          </div>
        </div>
      ) : (
        <div className="iu-champ-grid">
          {champions.map((name) => {
            const champData = stats?.champions_played?.[name] || {};
            const games = champData.games || 0;
            const winRate = games > 0 ? ((champData.wins || 0) / games * 100).toFixed(0) : 0;
            const kda = ((champData.kills || 0) + (champData.assists || 0)) / Math.max(champData.deaths || 1, 1);

            return (
              <button
                key={name}
                className="iu-champ-card"
                onClick={() => setSelected(name)}
                aria-label={`View item usage for ${name}`}
              >
                <img
                  className="iu-champ-card-img"
                  src={CHAMP_IMG(name)}
                  alt={name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="iu-champ-card-name">{name}</div>
                <div className="iu-champ-card-stats">
                  <div className="champ-stat">
                    <span className="stat-label">Games:</span>
                    <span className="stat-value">{games}</span>
                  </div>
                  <div className="champ-stat">
                    <span className="stat-label">WR:</span>
                    <span className={`stat-value ${winRate >= 50 ? 'positive' : 'negative'}`}>{winRate}%</span>
                  </div>
                  <div className="champ-stat">
                    <span className="stat-label">KDA:</span>
                    <span className="stat-value">{kda.toFixed(1)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && invByChamp[selected] && (
        <ItemUsageModal
          champion={selected}
          data={invByChamp[selected]}
          championStats={stats?.champions_played?.[selected]}
          idToName={idToName}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default ItemUsage;


