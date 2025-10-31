import React, { useEffect } from 'react';
import './BentoGrid.css';

const InsightModal = ({ section, onClose }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!section) return null;

  // Enhanced content rendering with formatting
  const renderContent = (content) => {
    const lines = content.split('\n').filter(line => line.trim());

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Check for bullet points or dashes
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        const text = trimmedLine.substring(1).trim();
        const isRecommendation = text.toLowerCase().includes('keep') ||
                                 text.toLowerCase().includes('practice') ||
                                 text.toLowerCase().includes('avoid');

        return (
          <div key={index} className={`modal-bullet ${isRecommendation ? 'recommendation' : ''}`}>
            <span className="bullet-icon" style={{ color: section.color }}>▸</span>
            {highlightMetrics(text, section.color)}
          </div>
        );
      }

      // Check for headers (starts with number or CAPS)
      if (/^\d+\./.test(trimmedLine) || trimmedLine === trimmedLine.toUpperCase()) {
        return (
          <div key={index} className="modal-subheader" style={{ borderLeftColor: section.color }}>
            {trimmedLine}
          </div>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="modal-text">
          {highlightMetrics(line, section.color)}
        </p>
      );
    });
  };

  // Highlight metrics and special markers
  const highlightMetrics = (text, color) => {
    const parts = [];
    let lastIndex = 0;

    // Regex to find numbers with % or special patterns
    const metricPattern = /(\d+\.?\d*%|\d+W|\d+L|✓|⚠️|KEEP PLAYING:|PRACTICE MORE:|AVOID\/DODGE:)/g;
    let match;

    while ((match = metricPattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add highlighted match
      const value = match[0];
      let className = 'metric';

      if (value.includes('✓')) className = 'metric-good';
      else if (value.includes('⚠️')) className = 'metric-warning';
      else if (value.includes('KEEP PLAYING')) className = 'metric-good';
      else if (value.includes('AVOID')) className = 'metric-warning';
      else if (value.includes('PRACTICE')) className = 'metric-neutral';

      parts.push(
        <span key={match.index} className={className} style={{ color: color }}>
          {value}
        </span>
      );

      lastIndex = match.index + value.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottomColor: section.color }}>
          <div className="modal-header-left">
            <div className="modal-icon" style={{ backgroundColor: `${section.color}20`, borderColor: section.color, color: section.color }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <div>
              <h2 className="modal-title">{section.title}</h2>
              <p className="modal-subtitle" style={{ color: section.color }}>
                {section.priority === 'high' ? '⚡ High Priority' : '📋 Focus Area'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {renderContent(section.content)}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="modal-button-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="modal-button-primary modal-button-ask-ryze"
            style={{
              background: `linear-gradient(135deg, #C89B3C 0%, #F0E6D2 100%)`
            }}
            onClick={() => {
              const snippet = (section.content || '').split('\n').slice(0, 6).join(' ').slice(0, 400);
              const message = `Ask about: ${section.title}. Key details: ${snippet}`.trim();
              window.dispatchEvent(new CustomEvent('ryze:ask', { detail: { message } }));
              onClose();
            }}
            title="Send this topic to Ryze chat and close the modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Ask Ryze About This
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightModal;
