import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Context
import { PlayerProvider } from './context/PlayerContext';

// Components
import StaggeredMenu from './components/StaggeredMenu';

// Pages
import Home from './pages/Home';
import Stats from './pages/Stats';
import Climb from './pages/Climb';
import About from './pages/About';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force immediate scroll to top on route change
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

function App() {
  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'Stats', ariaLabel: 'View your stats', link: '/stats' },
    { label: 'Climb', ariaLabel: 'Get improvement insights', link: '/climb' },
    { label: 'About', ariaLabel: 'Learn about Rift Rewind', link: '/about' }
  ];

  return (
    <Router>
      <PlayerProvider>
        <ScrollToTop />
        <div className="App">
          <StaggeredMenu
            position="right"
            items={menuItems}
            displayItemNumbering={true}
            menuButtonColor="#C89B3C"
            openMenuButtonColor="#C89B3C"
            changeMenuColorOnOpen={false}
            colors={['#0A1428', '#091428']}
            accentColor="#C89B3C"
            isFixed={true}
          />

          <div className="results-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/climb" element={<Climb />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>

          <footer className="app-footer">
            <p>
              Rift Rewind is not endorsed by Riot Games and does not reflect the views or
              opinions of Riot Games or anyone officially involved in producing or managing
              Riot Games properties.
            </p>
            <p className="footer-tech">
              Built with AWS Bedrock, Claude AI, and Riot Games API
            </p>
          </footer>
        </div>
      </PlayerProvider>
    </Router>
  );
}

export default App;
