import React, { useState } from 'react';
import './EnhancedInsightsPanel.css';

const EnhancedInsightsPanel = ({ insights }) => {
  const [expandedSections, setExpandedSections] = useState({
    0: true, // Executive Summary expanded by default
  });

  // Parse insights into sections
  const parseSections = (text) => {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];

    // Section headers and their colors
    const sectionConfig = {
      'EXECUTIVE SUMMARY': { color: '#4FC3F7', priority: 'high' },
      'STRENGTHS ANALYSIS': { color: '#66BB6A', priority: 'high' },
      'WEAKNESSES': { color: '#FFA726', priority: 'high' },
      'PRACTICE STRUCTURE': { color: '#AB47BC', priority: 'medium' },
      'CHAMPION POOL': { color: '#EC407A', priority: 'high' },
      'ROLE-SPECIFIC': { color: '#EF5350', priority: 'medium' },
      'MACRO': { color: '#42A5F5', priority: 'high' },
      'ROADMAP': { color: '#66BB6A', priority: 'high' },
      'OBJECTIVES': { color: '#42A5F5', priority: 'high' },
    };

    lines.forEach((line) => {
      // Check if line is a section header (all caps, ends with :)
      const trimmedLine = line.trim();
      let matchedHeader = null;

      for (const [key, config] of Object.entries(sectionConfig)) {
        if (trimmedLine.includes(key)) {
          matchedHeader = { name: trimmedLine.replace(':', ''), key, config };
          break;
        }
      }

      if (matchedHeader) {
        // Save previous section
        if (currentSection) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n')
          });
        }
        // Start new section
        currentSection = {
          title: matchedHeader.name,
          color: matchedHeader.config.color,
          priority: matchedHeader.config.priority
        };
        currentContent = [];
      } else if (currentSection && trimmedLine) {
        currentContent.push(line);
      }
    });

    // Add last section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n')
      });
    }

    return sections;
  };

  const sections = parseSections(insights);

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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
          <div key={index} className={`insight-bullet ${isRecommendation ? 'recommendation' : ''}`}>
            <span className="bullet-icon">▸</span>
            {highlightMetrics(text)}
          </div>
        );
      }
      
      // Check for headers (starts with number or CAPS)
      if (/^\d+\./.test(trimmedLine) || trimmedLine === trimmedLine.toUpperCase()) {
        return (
          <div key={index} className="insight-subheader">
            {trimmedLine}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="insight-text">
          {highlightMetrics(line)}
        </p>
      );
    });
  };

  // Highlight metrics and special markers
  const highlightMetrics = (text) => {
    // Replace ✓ and ⚠️ with styled versions
    let processedText = text;
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
        <span key={match.index} className={className}>
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

  // Special rendering for roadmap section (timeline)
  const isRoadmapSection = (title) => {
    return title.includes('ROADMAP') || title.includes('30/60/90');
  };

  return (
    <div className="enhanced-insights-panel">
      <div className="insights-header">
        <h2 className="insights-title">
          <span className="ai-badge-enhanced">AI Coach</span>
          Your Personalized Analysis
        </h2>
        <p className="insights-subtitle">
          Powered by AWS Bedrock & Claude AI
        </p>
      </div>

      <div className="insights-sections">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`insight-section ${expandedSections[index] ? 'expanded' : ''} priority-${section.priority}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className="section-header"
              onClick={() => toggleSection(index)}
              style={{ borderLeftColor: section.color }}
            >
              <div className="section-header-left">
                <div className="section-indicator" style={{ backgroundColor: section.color }}></div>
                <h3 className="section-title">{section.title}</h3>
              </div>
              <span className={`expand-icon ${expandedSections[index] ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>

            {expandedSections[index] && (
              <div className="section-content">
                {isRoadmapSection(section.title) ? (
                  <div className="roadmap-timeline">
                    {renderContent(section.content)}
                  </div>
                ) : (
                  <div className="section-body">
                    {renderContent(section.content)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="insights-footer">
        <div className="footer-tip">
          <span>Click any section to expand or collapse</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInsightsPanel;

