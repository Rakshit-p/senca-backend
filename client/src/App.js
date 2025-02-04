// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResearchPapersPage from './pages/ResearchPapersPage';
import TweetsPodcastsVideosPage from './pages/TweetsPodcastsVideosPage';
import BlogsReposPage from './pages/BlogsReposPage';
import TutorialsPage from './pages/TutorialsPage';

function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/"></Link>
        <Link to="/tweets-podcasts-videos"></Link>
        <Link to="/blogs-repos"></Link>
        <Link to="/tutorials"></Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/tweets-podcasts-videos"
          element={<TweetsPodcastsVideosPage />}
        />
        <Route path="/blogs-repos" element={<BlogsReposPage />} />
        <Route path="/research-papers" element={<ResearchPapersPage />} />
        <Route path="/tutorials" element={<TutorialsPage />} />
        {/* <Route path="/research-papers" element={<ResearchPapersPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;