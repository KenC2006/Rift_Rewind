import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import './ItemUsage.css';
import { getItemsMapping } from '../services/api';

const CHAMP_IMG = (name) => `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${(name || '').replace(/[^a-zA-Z]/g, '')}.png`;
const ITEM_IMG = (id) => `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${id}.png`;

// Compute most-used final items for a champion
const FinalItems = ({ lists, idToName, totalMatches }) => {
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
    return <div style={{ color: '#7f93ad', fontSize: 12 }}>No final item data.</div>;
  }

  return (
    <div className="items-grid">
      {summary.items.map((it) => (
        <div className={`item-tile ${it.pct >= 60 ? 'highlight' : ''}`} key={`final-${it.id}`}>
          <img className="item-icon" src={ITEM_IMG(it.id)} alt={idToName[it.id] || it.id} />
          <div className="item-meta">
            <div className="item-name">{idToName[it.id] || it.id}</div>
            <div className="item-pct">{it.pct.toFixed(0)}% ({it.count}/{totalMatches})</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ItemUsageModal = ({ champion, data, idToName, onClose }) => {
  if (!champion || !data) return null;
  const totalMatches = data.matches || 0;
  
  const modalContent = (
    <div className="iu-modal-overlay" onClick={onClose}>
      <div className="iu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="iu-modal-header">
          <div className="iu-champ">
            <img className="iu-champ-img" src={CHAMP_IMG(champion)} alt={champion} />
            <div className="iu-champ-name">{champion}</div>
          </div>
          <button className="iu-close" onClick={onClose}>×</button>
        </div>
        <div className="iu-modal-content">
          <div className="phase-section">
            <div className="phase-title">Final Items</div>
            <FinalItems lists={data.final || []} idToName={idToName} totalMatches={totalMatches} />
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
      const ga = stats?.champions_played?.[a]?.games || 0;
      const gb = stats?.champions_played?.[b]?.games || 0;
      if (gb !== ga) return gb - ga; // descending by games (usage)
      return a.localeCompare(b);
    });
    return filtered;
  }, [stats, invByChamp]);

  return (
    <div className="item-usage">
      <h3 className="iu-title">Item Usage</h3>
      <p className="iu-subtitle">Only champions with 5+ games are shown. Click a champion to view your most common final items.</p>
      <div className="iu-champ-grid">
        {champions.map((name) => (
          <button
            key={name}
            className="iu-champ-card"
            onClick={() => setSelected(name)}
            aria-label={`View item usage for ${name}`}
          >
            <img className="iu-champ-card-img" src={CHAMP_IMG(name)} alt={name} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="iu-champ-card-name">{name}</div>
          </button>
        ))}
      </div>

      {selected && invByChamp[selected] && (
        <ItemUsageModal
          champion={selected}
          data={invByChamp[selected]}
          idToName={idToName}
          onClose={() => setSelected(null)}
        />
      )}
      {selected && !invByChamp[selected] && (
        <div style={{ marginTop: 8, color: '#9fb3c8' }}>No item data available for {selected}.</div>
      )}
    </div>
  );
};

export default ItemUsage;


