import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Rift Rewind</h1>
        <p className="about-subtitle">AI-powered League of Legends analytics platform</p>
      </div>

      <div className="about-content">
        <section className="about-section primary">
          <h2>What is Rift Rewind?</h2>
          <p>
            Rift Rewind is a comprehensive analytics platform that analyzes your League of Legends gameplay from 2024
            and provides actionable insights powered by artificial intelligence. Enter your Riot ID to receive
            a detailed breakdown of your performance, playstyle patterns, and strategic recommendations.
          </p>
        </section>

        <section className="about-section">
          <h2>Technology</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>Frontend</h4>
              <p>React 19 with D3.js visualization library</p>
            </div>
            <div className="tech-item">
              <h4>Backend</h4>
              <p>Python Flask REST API</p>
            </div>
            <div className="tech-item">
              <h4>AI Engine</h4>
              <p>AWS Bedrock with Claude 3.5 Sonnet</p>
            </div>
            <div className="tech-item">
              <h4>Data Source</h4>
              <p>Riot Games Official API</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <h4>Performance Analytics</h4>
              <p>Detailed KDA ratios, win rates, damage metrics, and objective participation statistics</p>
            </div>
            <div className="feature-item">
              <h4>Champion Insights</h4>
              <p>Champion-specific performance data with mastery analysis and pick rate tracking</p>
            </div>
            <div className="feature-item">
              <h4>Visual Data</h4>
              <p>Interactive charts and graphs for trend analysis and performance comparison</p>
            </div>
            <div className="feature-item">
              <h4>AI Analysis</h4>
              <p>Machine learning-powered insights that identify strengths and areas for improvement</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Privacy</h2>
          <p>
            Rift Rewind accesses only publicly available data through the official Riot Games API.
            No personal information is stored on our servers. All analysis is performed in real-time
            and results are not persisted beyond the active session.
          </p>
        </section>

        <section className="about-section disclaimer">
          <div className="disclaimer-content">
            <h2>Legal Disclaimer</h2>
            <p>
              Rift Rewind is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games
              or anyone officially involved in producing or managing Riot Games properties. Riot Games and all
              associated properties are trademarks or registered trademarks of Riot Games, Inc.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
