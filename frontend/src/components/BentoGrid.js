import React, { useState } from 'react';
import BentoCard from './BentoCard';
import InsightModal from './InsightModal';
import './BentoGrid.css';

const BentoGrid = ({ insights }) => {
  const [selectedSection, setSelectedSection] = useState(null);

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

  const handleCardClick = (section) => {
    setSelectedSection(section);
  };

  const handleCloseModal = () => {
    setSelectedSection(null);
  };

  return (
    <div className="bento-grid-container">
      <div className="bento-grid-header">
        <h2 className="bento-grid-title">
          <span className="ai-badge">Ryze</span>
          Your Personalized Analysis
        </h2>
        <p className="bento-grid-subtitle">
          Click any card to explore detailed insights and recommendations
        </p>
      </div>

      <div className="bento-grid">
        {sections.map((section, index) => (
          <BentoCard
            key={index}
            section={section}
            index={index}
            onClick={() => handleCardClick(section)}
          />
        ))}
      </div>

      {selectedSection && (
        <InsightModal section={selectedSection} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default BentoGrid;
