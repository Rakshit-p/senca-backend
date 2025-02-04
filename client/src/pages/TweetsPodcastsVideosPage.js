// src/pages/TweetsPodcastsVideosPage.js
import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import { Link } from 'react-router-dom';
import './HomePage.css';

function TweetsPodcastsVideosPage() {
  const [resources, setResources] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [spotifyRes, tweetsRes, youtubeRes] = await Promise.all([
          fetch('/api/spotify1-resources'),
          fetch('/api/tweet-resources'),
          fetch('/api/youtube-resources')
        ]);
        const spotifyData = await spotifyRes.json();
        const tweetsData  = await tweetsRes.json();
        const ytData      = await youtubeRes.json();

        const combined = []
          .concat(Array.isArray(spotifyData) ? spotifyData : [])
          .concat(Array.isArray(tweetsData)  ? tweetsData  : [])
          .concat(Array.isArray(ytData)      ? ytData      : []);

        setResources(combined);
      } catch (err) {
        console.error('Error fetching tweets/podcasts/videos:', err);
      }
    }
    fetchAll();
  }, []);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <>
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="logo">Senca</Link>
          
          {/* Add hamburger button */}
          <button 
            className="nav-toggle" 
            onClick={toggleMobileNav}
            aria-label="Toggle navigation menu"
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>

          {/* Modified nav-links to support mobile toggle */}
          <div className={`nav-links ${mobileNavOpen ? 'open' : ''}`}>
            <Link to="/blogs-repos">Trending AI Blogs &amp; Projects</Link>
            <Link to="/research-papers">Trending AI Research Papers</Link>
            <Link to="/tweets-podcasts-videos">Trending AI Tweets, Podcasts &amp; Videos</Link>
            <Link to="/tutorials">Trending AI Tools &amp; Tutorials</Link>
            <a href="/#about-section">About</a>
            <a href="/#contact-section">Contact</a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '160px',
          color: '#fff',
          fontFamily: '"Segoe UI", "Roboto", sans-serif',
          position: 'relative',
        }}
      >
        <h1 
          style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: '600',
            background: 'linear-gradient(120deg, #fff, #a5a5a5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(255,255,255,0.2)',
          }}
        >
          Trending AI Tweets, Podcasts &amp; Videos
        </h1>
        <hr
          style={{
            width: '60%',
            margin: '20px auto',
            border: 'none',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
            boxShadow: '0 0 10px rgba(255,255,255,0.3)',
          }}
        />
        {resources.map(item => (
          <ResourceCard key={item._id} resource={item} />
        ))}
      </div>
    </>
  );
}

export default TweetsPodcastsVideosPage;