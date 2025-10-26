import React from 'react';
import './InsightsPanel.css';

const InsightsPanel = ({ insights }) => {
  // Split insights into paragraphs for better formatting
  const paragraphs = insights.split('\n\n').filter(p => p.trim());

  return (
    <div className="insights-panel">
      <h2 className="section-title">
        <span className="ai-badge">AI</span>
        Your Personalized Recap
      </h2>
      <div className="insights-content">
        <div className="insights-decoration-top"></div>
        {paragraphs.map((paragraph, index) => (
          <div
            key={index}
            className="insight-paragraph"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {paragraph.split('\n').map((line, lineIndex) => (
              <p key={lineIndex} className="insight-line">
                {line}
              </p>
            ))}
          </div>
        ))}
        <div className="insights-decoration-bottom"></div>
        <div className="powered-by">
          <span className="ai-icon">🤖</span>
          Powered by AWS Bedrock & Claude AI
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
