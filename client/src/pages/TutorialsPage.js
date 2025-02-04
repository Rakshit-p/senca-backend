// src/pages/TutorialsPage.js
import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import { Link } from 'react-router-dom';
import './HomePage.css';

function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function fetchTutorials() {
      try {
        const response = await fetch('/api/tools1-resources');
        const data = await response.json();
        if (Array.isArray(data)) {
          // Remove date-related fields from each tutorial
          const tutorialsWithoutDates = data.map(({ createdAt, date, ...rest }) => rest);
          setTutorials(tutorialsWithoutDates);
        }
      } catch (err) {
        console.error("Error fetching tutorials:", err);
      }
    }
    fetchTutorials();
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
          
          <button 
            className="nav-toggle" 
            onClick={toggleMobileNav}
            aria-label="Toggle navigation menu"
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>

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
          Trending AI Tools & Tutorials
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
        {tutorials.map((tutorial) => (
          <ResourceCard key={tutorial._id} resource={tutorial} />
        ))}
      </div>
    </>
  );
}

export default TutorialsPage;