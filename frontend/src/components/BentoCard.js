import React from 'react';
import './BentoGrid.css';

const BentoCard = ({ section, onClick, index }) => {
  // Icon mapping for different sections
  const getIcon = (title) => {
    if (title.includes('EXECUTIVE') || title.includes('SUMMARY')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      );
    } else if (title.includes('STRENGTH')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      );
    } else if (title.includes('WEAK')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      );
    } else if (title.includes('PRACTICE')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    } else if (title.includes('CHAMPION')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      );
    } else if (title.includes('ROLE')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    } else if (title.includes('MACRO')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      );
    } else if (title.includes('ROADMAP') || title.includes('30/60/90')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <polyline points="19 12 12 19 5 12"/>
        </svg>
      );
    } else if (title.includes('OBJECTIVE')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      );
    }
  };

  // Get preview text (first 80 characters)
  const getPreview = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
    }
    return 'Click to view details';
  };

  // Count action items (bullet points) in the content
  const getActionItemCount = (content) => {
    const lines = content.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('-') || trimmed.startsWith('•');
    });
    return lines.length;
  };

  // Determine card size based on priority and index
  const getCardClass = () => {
    const baseClass = 'bento-card';
    // Make first card (Executive Summary) and ROADMAP cards larger
    if (index === 0 || section.title.includes('ROADMAP')) {
      return `${baseClass} bento-card-large`;
    }
    return baseClass;
  };

  return (
    <div
      className={getCardClass()}
      onClick={onClick}
      style={{
        borderLeftColor: section.color,
        animationDelay: `${index * 0.05}s`
      }}
    >
      <div className="bento-card-header">
        <div className="bento-card-icon" style={{ backgroundColor: `${section.color}20`, borderColor: section.color }}>
          {getIcon(section.title)}
        </div>
        <div className="bento-card-badges">
          <div className="bento-card-priority" style={{ color: section.color }}>
            {section.priority === 'high' ? '⚡ Priority' : '📋 Focus'}
          </div>
          {getActionItemCount(section.content) > 0 && (
            <div className="bento-card-count" style={{ backgroundColor: `${section.color}30`, color: section.color }}>
              {getActionItemCount(section.content)} tips
            </div>
          )}
        </div>
      </div>
      <h3 className="bento-card-title">{section.title}</h3>
      <p className="bento-card-preview">{getPreview(section.content)}</p>
      <div className="bento-card-footer">
        <span className="bento-card-cta">View Details</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  );
};

export default BentoCard;
