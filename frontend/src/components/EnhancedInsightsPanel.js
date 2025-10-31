import React, { useState } from 'react';
import './EnhancedInsightsPanel.css';

const EnhancedInsightsPanel = ({ insights }) => {
  const [activeSection, setActiveSection] = useState(0);

  // Parse insights into sections
  const parseSections = (text) => {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];

    const sectionConfig = {
      'EXECUTIVE SUMMARY': { 
        icon: '🎯', 
        color: '#C89B3C', 
        shortName: 'Overview'
      },
      'STRENGTHS ANALYSIS': { 
        icon: '💪', 
        color: '#10b981', 
        shortName: 'Strengths'
      },
      'CRITICAL IMPROVEMENT': { 
        icon: '⚠️', 
        color: '#ef4444', 
        shortName: 'Focus Areas'
      },
      'PRACTICE STRUCTURE': { 
        icon: '📋', 
        color: '#8b5cf6', 
        shortName: 'Practice Plan'
      },
      'CHAMPION POOL': { 
        icon: '🏆', 
        color: '#ec4899', 
        shortName: 'Champions'
      },
      'ROLE-SPECIFIC': { 
        icon: '🎮', 
        color: '#3b82f6', 
        shortName: 'Role Guide'
      },
      'MACRO': { 
        icon: '🗺️', 
        color: '#06b6d4', 
        shortName: 'Macro'
      },
      'ROADMAP': { 
        icon: '🚀', 
        color: '#10b981', 
        shortName: 'Growth Path'
      },
      'OBJECTIVES': { 
        icon: '🎯', 
        color: '#06b6d4', 
        shortName: 'Objectives'
      },
      'IMPROVEMENT': { 
        icon: '📈', 
        color: '#f59e0b', 
        shortName: 'Improve'
      },
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      let matchedHeader = null;

      for (const [key, config] of Object.entries(sectionConfig)) {
        if (trimmedLine.includes(key)) {
          matchedHeader = { name: trimmedLine.replace(':', '').replace(/^\d+\.\s*/, ''), key, config };
          break;
        }
      }

      if (matchedHeader) {
        if (currentSection) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n')
          });
        }
        currentSection = {
          title: matchedHeader.name,
          shortName: matchedHeader.config.shortName,
          icon: matchedHeader.config.icon,
          color: matchedHeader.config.color
        };
        currentContent = [];
      } else if (currentSection && trimmedLine) {
        currentContent.push(line);
      }
    });

    if (currentSection && currentContent.length > 0) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n')
      });
    }

    return sections;
  };

  const sections = parseSections(insights);

  // Extract visual metrics from text
  const extractMetrics = (content) => {
    const metrics = [];
    const percentagePattern = /(\d+\.?\d*%)/g;
    const ratePattern = /(\d+\.?\d+)\s*(CS|KDA|wins|games|deaths)/gi;
    
    let match;
    while ((match = percentagePattern.exec(content)) !== null) {
      metrics.push({ value: match[1], type: 'percentage' });
      if (metrics.length >= 4) break;
    }
    
    return metrics;
  };

  // Extract key action items
  const extractActionItems = (content) => {
    const lines = content.split('\n');
    const items = [];
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if ((trimmed.startsWith('-') || trimmed.startsWith('•')) && items.length < 5) {
        const text = trimmed.substring(1).trim();
        if (text.length > 10 && text.length < 150) {
          items.push(text);
        }
      }
    });
    
    return items;
  };

  // Extract rating/score if present
  const extractRating = (content) => {
    const ratingMatch = content.match(/([A-F][+-]?)\s*(tier|grade|rating)/i);
    if (ratingMatch) return ratingMatch[1];
    
    const emojiMatch = content.match(/([✓✗⚠️])/);
    if (emojiMatch) {
      if (emojiMatch[1] === '✓') return 'A';
      if (emojiMatch[1] === '⚠️') return 'C';
      if (emojiMatch[1] === '✗') return 'F';
    }
    
    return null;
  };

  // Extract champion tiers (S/B/C)
  const extractChampionTiers = (content) => {
    const tiers = { S: [], B: [], C: [] };
    const lines = content.split('\n');
    let currentTier = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Match tier headers
      if (trimmed.match(/S[-\s]?TIER|YOUR POCKET PICKS|ACTUALLY BUILT DIFFERENT/i)) {
        currentTier = 'S';
      } else if (trimmed.match(/B[-\s]?TIER|SITUATIONAL|DON'T INT YOUR PROMOS/i)) {
        currentTier = 'B';
      } else if (trimmed.match(/C[-\s]?TIER|DODGE LIST|RESPECTFULLY.*DON'T/i)) {
        currentTier = 'C';
      }
      
      // Extract champion names (look for champion: data pattern or - ChampionName:)
      if (currentTier && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        const champMatch = trimmed.match(/[-•]\s*([A-Z][a-zA-Z'\s]+)[:]/);
        if (champMatch) {
          const champName = champMatch[1].trim();
          // Extract win rate if present
          const wrMatch = trimmed.match(/(\d+\.?\d*)%\s*WR/i);
          const gamesMatch = trimmed.match(/(\d+)\s*games/i);
          
          tiers[currentTier].push({
            name: champName,
            winRate: wrMatch ? parseFloat(wrMatch[1]) : null,
            games: gamesMatch ? parseInt(gamesMatch[1]) : null,
            note: trimmed.split(':')[1]?.trim() || ''
          });
        }
      }
    });

    return tiers;
  };

  // Extract 3-2-1 practice method
  const extract321Method = (content) => {
    const method = { immediate: [], weekly: [], vod: null };
    const lines = content.split('\n');
    let section = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.match(/3\s*Immediate\s*Changes/i)) {
        section = 'immediate';
      } else if (trimmed.match(/2\s*Practice\s*Drills/i)) {
        section = 'weekly';
      } else if (trimmed.match(/1\s*VOD\s*Review/i)) {
        section = 'vod';
      }
      
      if (section && (trimmed.match(/^\d+\./))) {
        const text = trimmed.replace(/^\d+\.\s*/, '');
        if (section === 'immediate' && method.immediate.length < 3) {
          method.immediate.push(text);
        } else if (section === 'weekly' && method.weekly.length < 2) {
          method.weekly.push(text);
        } else if (section === 'vod' && !method.vod) {
          method.vod = text;
        }
      }
    });

    return method;
  };

  // Extract roadmap timeline
  const extractRoadmap = (content) => {
    const roadmap = [];
    const lines = content.split('\n');
    let currentPhase = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Match phase headers
      const phaseMatch = trimmed.match(/DAYS?\s*(\d+)[-–](\d+)|WEEK\s*(\d+)[-–](\d+)/i);
      if (phaseMatch) {
        const start = phaseMatch[1] || ((parseInt(phaseMatch[3]) - 1) * 7 + 1);
        const end = phaseMatch[2] || (parseInt(phaseMatch[4]) * 7);
        
        currentPhase = {
          start: parseInt(start),
          end: parseInt(end),
          title: trimmed,
          goals: [],
          metrics: []
        };
        roadmap.push(currentPhase);
      }
      
      // Extract goals and metrics
      if (currentPhase) {
        if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const goal = trimmed.substring(1).trim();
          if (goal.length > 10 && goal.length < 200) {
            currentPhase.goals.push(goal);
          }
        }
        
        // Extract expected results
        const resultMatch = trimmed.match(/Expected\s*Results?:\s*(.+)/i);
        if (resultMatch) {
          currentPhase.metrics.push(resultMatch[1]);
        }
      }
    });

    return roadmap;
  };

  // Extract benchmarks and targets
  const extractBenchmarks = (content) => {
    const benchmarks = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      // Look for "Your X: Y | Target: Z" patterns
      const benchMatch = line.match(/([^:]+):\s*([\d.]+)[^\|]*\|\s*Target[^:]*:\s*([\d.]+)/i);
      if (benchMatch) {
        benchmarks.push({
          metric: benchMatch[1].trim(),
          current: parseFloat(benchMatch[2]),
          target: parseFloat(benchMatch[3])
        });
      }
      
      // Also look for "CS/min: X | Target for ROLE: Y" patterns
      const csMatch = line.match(/(CS\/min|KDA|Vision):\s*([\d.]+)[^\|]*Target[^:]*:\s*([\d.]+)/i);
      if (csMatch) {
        benchmarks.push({
          metric: csMatch[1],
          current: parseFloat(csMatch[2]),
          target: parseFloat(csMatch[3])
        });
      }
    });

    return benchmarks;
  };

  return (
    <div className="enhanced-insights-visual">
      {/* Navigation Pills */}
      <div className="insights-nav">
        <div className="nav-pills">
          {sections.map((section, index) => (
            <button
              key={index}
              className={`nav-pill ${activeSection === index ? 'active' : ''}`}
              onClick={() => setActiveSection(index)}
              style={{ '--pill-color': section.color }}
            >
              <span className="pill-icon">{section.icon}</span>
              <span className="pill-label">{section.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Display */}
      <div className="section-display">
        {sections.map((section, index) => {
          if (activeSection !== index) return null;
          
          const actionItems = extractActionItems(section.content);
          const metrics = extractMetrics(section.content);
          const rating = extractRating(section.content);
          const championTiers = extractChampionTiers(section.content);
          const method321 = extract321Method(section.content);
          const roadmap = extractRoadmap(section.content);
          const benchmarks = extractBenchmarks(section.content);
          
          // Determine which special components to show
          const isChampionPool = section.title.includes('CHAMPION POOL');
          const isPractice = section.title.includes('PRACTICE') || section.title.includes('IMPROVEMENT');
          const isRoadmap = section.title.includes('ROADMAP') || section.title.includes('30/60/90');
          const hasBenchmarks = benchmarks.length > 0;
          
          return (
            <div 
              key={index} 
              className="section-view"
              style={{ '--section-color': section.color }}
            >
              {/* Section Header */}
              <div className="section-header-visual">
                <div className="header-icon-large">
                  {section.icon}
                </div>
                <div className="header-text">
                  <h2 className="section-title-visual">{section.title}</h2>
                  <p className="section-subtitle">Section {index + 1} of {sections.length}</p>
                </div>
                {rating && (
                  <div className="rating-badge-large">
                    <div className="rating-letter">{rating}</div>
                    <div className="rating-label">Grade</div>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              {metrics.length > 0 && (
                <div className="metrics-grid">
                  {metrics.map((metric, i) => (
                    <div key={i} className="metric-card">
                      <div className="metric-value">{metric.value}</div>
                      <div className="metric-label">Key Stat</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Benchmarks Progress Bars */}
              {hasBenchmarks && benchmarks.length > 0 && (
                <div className="benchmarks-section">
                  <h3 className="subsection-title">
                    <span className="title-icon">📊</span>
                    Your Performance vs Target
                  </h3>
                  <div className="benchmarks-grid">
                    {benchmarks.map((bench, i) => {
                      const percentage = (bench.current / bench.target) * 100;
                      const isGood = percentage >= 95;
                      const isOk = percentage >= 85 && percentage < 95;
                      
                      return (
                        <div key={i} className="benchmark-card">
                          <div className="benchmark-header">
                            <span className="benchmark-metric">{bench.metric}</span>
                            <span className={`benchmark-status ${isGood ? 'good' : isOk ? 'ok' : 'needs-work'}`}>
                              {isGood ? '✓ Good' : isOk ? '→ Close' : '⚠ Focus'}
                            </span>
                          </div>
                          <div className="benchmark-values">
                            <span className="current-value">{bench.current}</span>
                            <span className="value-separator">/</span>
                            <span className="target-value">{bench.target}</span>
                          </div>
                          <div className="benchmark-progress-bar">
                            <div 
                              className={`benchmark-progress-fill ${isGood ? 'good' : isOk ? 'ok' : 'needs-work'}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Champion Tier List */}
              {isChampionPool && (championTiers.S.length > 0 || championTiers.B.length > 0 || championTiers.C.length > 0) && (
                <div className="champion-tiers-section">
                  <h3 className="subsection-title">
                    <span className="title-icon">🏆</span>
                    Your Champion Pool Breakdown
                  </h3>
                  
                  {championTiers.S.length > 0 && (
                    <div className="tier-group tier-s">
                      <div className="tier-header">
                        <span className="tier-badge tier-s-badge">S</span>
                        <span className="tier-label">Your Pocket Picks</span>
                      </div>
                      <div className="tier-champions">
                        {championTiers.S.map((champ, i) => (
                          <div key={i} className="champion-tier-card tier-s-card">
                            <div className="champion-name">{champ.name}</div>
                            {champ.winRate && (
                              <div className="champion-stats">
                                <span className="wr-stat">{champ.winRate}% WR</span>
                                {champ.games && <span className="games-stat">{champ.games}G</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {championTiers.B.length > 0 && (
                    <div className="tier-group tier-b">
                      <div className="tier-header">
                        <span className="tier-badge tier-b-badge">B</span>
                        <span className="tier-label">Situational Picks</span>
                      </div>
                      <div className="tier-champions">
                        {championTiers.B.map((champ, i) => (
                          <div key={i} className="champion-tier-card tier-b-card">
                            <div className="champion-name">{champ.name}</div>
                            {champ.winRate && (
                              <div className="champion-stats">
                                <span className="wr-stat">{champ.winRate}% WR</span>
                                {champ.games && <span className="games-stat">{champ.games}G</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {championTiers.C.length > 0 && (
                    <div className="tier-group tier-c">
                      <div className="tier-header">
                        <span className="tier-badge tier-c-badge">C</span>
                        <span className="tier-label">Needs Practice</span>
                      </div>
                      <div className="tier-champions">
                        {championTiers.C.map((champ, i) => (
                          <div key={i} className="champion-tier-card tier-c-card">
                            <div className="champion-name">{champ.name}</div>
                            {champ.winRate && (
                              <div className="champion-stats">
                                <span className="wr-stat">{champ.winRate}% WR</span>
                                {champ.games && <span className="games-stat">{champ.games}G</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3-2-1 Practice Method */}
              {isPractice && (method321.immediate.length > 0 || method321.weekly.length > 0) && (
                <div className="practice-321-section">
                  <h3 className="subsection-title">
                    <span className="title-icon">⚡</span>
                    3-2-1 Practice Method
                  </h3>
                  
                  {method321.immediate.length > 0 && (
                    <div className="practice-group">
                      <div className="practice-group-header">
                        <span className="practice-number">3</span>
                        <span className="practice-title">Immediate Changes (Today)</span>
                      </div>
                      <div className="practice-checklist">
                        {method321.immediate.map((item, i) => (
                          <div key={i} className="practice-checklist-item">
                            <div className="checklist-checkbox">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {method321.weekly.length > 0 && (
                    <div className="practice-group">
                      <div className="practice-group-header">
                        <span className="practice-number">2</span>
                        <span className="practice-title">Practice Drills (This Week)</span>
                      </div>
                      <div className="practice-checklist">
                        {method321.weekly.map((item, i) => (
                          <div key={i} className="practice-checklist-item">
                            <div className="checklist-checkbox">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {method321.vod && (
                    <div className="practice-group">
                      <div className="practice-group-header">
                        <span className="practice-number">1</span>
                        <span className="practice-title">VOD Review Focus</span>
                      </div>
                      <div className="vod-focus-card">
                        <span className="vod-icon">🎬</span>
                        <span>{method321.vod}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline Roadmap */}
              {isRoadmap && roadmap.length > 0 && (
                <div className="roadmap-timeline-section">
                  <h3 className="subsection-title">
                    <span className="title-icon">🗓️</span>
                    Your Growth Timeline
                  </h3>
                  <div className="timeline-container">
                    {roadmap.map((phase, i) => (
                      <div key={i} className="timeline-phase">
                        <div className="timeline-marker">
                          <div className="timeline-dot"></div>
                          {i < roadmap.length - 1 && <div className="timeline-line"></div>}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-days">Day {phase.start}-{phase.end}</span>
                            <span className="timeline-duration">{phase.end - phase.start + 1} days</span>
                          </div>
                          {phase.goals.length > 0 && (
                            <div className="timeline-goals">
                              {phase.goals.slice(0, 3).map((goal, gi) => (
                                <div key={gi} className="timeline-goal">• {goal}</div>
                              ))}
                            </div>
                          )}
                          {phase.metrics.length > 0 && (
                            <div className="timeline-metrics">
                              <span className="metrics-icon">🎯</span>
                              {phase.metrics[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items Visual List */}
              {actionItems.length > 0 && (
                <div className="action-items-section">
                  <h3 className="subsection-title">
                    <span className="title-icon">✓</span>
                    Key Takeaways
                  </h3>
                  <div className="action-items-grid">
                    {actionItems.map((item, i) => (
                      <div key={i} className="action-item-card">
                        <div className="item-number">{i + 1}</div>
                        <div className="item-content">
                          <p>{item}</p>
                        </div>
                        <div className="item-check">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Content Accordion */}
              <div className="full-content-section">
                <details className="content-accordion">
                  <summary className="accordion-trigger">
                    <span>View Full Analysis</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </summary>
                  <div className="accordion-content">
                    {section.content.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      
                      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                        return (
                          <div key={i} className="content-bullet">
                            <span className="bullet-marker">▸</span>
                            <span>{trimmed.substring(1).trim()}</span>
                          </div>
                        );
                      }
                      
                      if (/^\d+\./.test(trimmed) || trimmed === trimmed.toUpperCase()) {
                        return (
                          <div key={i} className="content-heading">
                            {trimmed}
                          </div>
                        );
                      }
                      
                      return (
                        <p key={i} className="content-paragraph">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </details>
              </div>

              {/* Progress Indicator */}
              <div className="section-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((index + 1) / sections.length) * 100}%` }}
                  />
                </div>
                <div className="progress-label">
                  {index + 1} / {sections.length} sections complete
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="section-nav-buttons">
                {index > 0 && (
                  <button 
                    className="nav-btn prev-btn"
                    onClick={() => setActiveSection(index - 1)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Previous
                  </button>
                )}
                {index < sections.length - 1 && (
                  <button 
                    className="nav-btn next-btn"
                    onClick={() => setActiveSection(index + 1)}
                  >
                    Next
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedInsightsPanel;
