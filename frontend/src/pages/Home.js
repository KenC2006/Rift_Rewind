import React from "react";
import "./Home.css";
import SearchForm from "../components/SearchForm";
import Loading from "../components/Loading";
import { analyzePlayer } from "../services/api";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import poroCoolGuy from "../graphics/Poro_sticker_coolguy.webp";
import poroCry from "../graphics/Poro_sticker_cry.webp";
import poroAngry from "../graphics/Poro_sticker_angry.webp";
import poroBlush from "../graphics/Poro_sticker_blush.webp";
import poroLaugh from "../graphics/Poro_sticker_laugh.webp";
import poroSleepy from "../graphics/Poro_sticker_sleepy.webp";
import poroQuestion from "../graphics/Poro_sticker_question.webp";
import poroSad from "../graphics/Poro_sticker_sad.webp";

function Home() {
  const navigate = useNavigate();
  const {
    loading,
    error,
    setLoading,
    setError,
    updatePlayerData,
    playerData,
    clearPlayerData,
  } = usePlayer();

  const handleSearch = async (riotId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzePlayer(riotId);

      if (result.success) {
        // Update global player data
        updatePlayerData(result.data);
        // Auto-navigate to stats page
        navigate('/stats');
      } else {
        setError(result.error || "Failed to analyze player");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.error ||
          err.message ||
          "An error occurred while analyzing the player. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="hero-container">
        <div className="hero-background">
          <div className="hero-grid"></div>
          <div className="hero-glow"></div>
          <div className="poro-container">
            <img src={poroCoolGuy} alt="poro" className="poro" />
            <img src={poroCry} alt="poro" className="poro" />
            <img src={poroAngry} alt="poro" className="poro" />
            <img src={poroBlush} alt="poro" className="poro" />
            <img src={poroLaugh} alt="poro" className="poro" />
            <img src={poroSleepy} alt="poro" className="poro" />
            <img src={poroQuestion} alt="poro" className="poro" />
            <img src={poroSad} alt="poro" className="poro" />
          </div>
        </div>

        <div className="hero-content">
          <div className="year-badge">
            <span className="badge-dot"></span>
            2024 RECAP
          </div>

          <h1 className="main-title">
            Rift Rewind
            <br />
            <span className="title-gradient">One Year Of League</span>
          </h1>

          <p className="hero-description">
            Revisit where you stood one year ago. Recognize how far you've come.
            How much further you can go?
          </p>

          <div className="search-wrapper">
            <div className="search-box">
              <SearchForm onSearch={handleSearch} loading={loading} />
              <p className="search-hint">
                Enter your Riot ID (e.g., PlayerName#NA1)
              </p>
            </div>

            {error && (
              <div className="error-banner">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {loading && <Loading />}
          </div>
        </div>
      </div>

      {!loading && (
        <>
          <div className="features-section">
            <div className="section-header">
              <h2>Powerful Analytics</h2>
              <p>Set the Z-drive back one year</p>
            </div>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                </div>
                <h3>Performance Metrics</h3>
                <p>
                  Track KDA, win rates, damage dealt, and objective
                  participation across all your matches
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                </div>
                <h3>Champion Analysis</h3>
                <p>
                  Deep dive into your most played champions with detailed
                  statistics and mastery tracking
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <h3>Insight</h3>
                <p>
                  Get personalized recommendations and strategic insights
                </p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3v18h18" />
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                  </svg>
                </div>
                <h3>Visual Data</h3>
                <p>
                  Beautiful interactive charts that make your performance data
                  easy to understand
                </p>
              </div>
            </div>
          </div>

          <div className="process-section">
            <div className="section-header">
              <h2>Simple Process</h2>
              <p>Get your personalized analysis in seconds</p>
            </div>

            <div className="process-timeline">
              <div className="timeline-item">
                <div className="timeline-marker">1</div>
                <div className="timeline-content">
                  <h4>Search</h4>
                  <p>Enter your summoner name</p>
                </div>
              </div>

              <div className="timeline-connector"></div>

              <div className="timeline-item">
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <h4>Analyze</h4>
                  <p>AI processes your data</p>
                </div>
              </div>

              <div className="timeline-connector"></div>

              <div className="timeline-item">
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <h4>Discover</h4>
                  <p>View your insights</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
