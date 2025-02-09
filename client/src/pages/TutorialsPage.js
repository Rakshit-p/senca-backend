// src/pages/TutorialsPage.js
import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import { Link } from 'react-router-dom';
import './HomePage.css';

function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    async function fetchTutorials() {
      try {
        const response = await fetch('https://senca.onrender.com/api/tools1-resources');
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

  // Add search filtering useEffect
  useEffect(() => {
    const results = tutorials.filter(item =>
      (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.author?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(results);
  }, [searchTerm, tutorials]);

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
            <Link to="/blogs-repos">Trending AI Blogs, Projects, and News</Link>
            <Link to="/research-papers">Trending AI Research Papers</Link>
            <Link to="/tweets-podcasts-videos">Trending AI Tweets, Podcasts &amp; Videos</Link>
            <Link to="/tutorials">Trending AI Tools</Link>
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
        {/* Add search section */}
        <div
          style={{
            width: '80%',
            maxWidth: '800px',
            margin: '40px auto',
            position: 'relative',
            zIndex: '1',
          }}
        >
          <input
            type="text"
            placeholder="Search tools and tutorials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '18px 25px',
              fontSize: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              color: '#fff',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              letterSpacing: '0.5px',
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          />
          <div 
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.6)',
              pointerEvents: 'none',
              fontSize: '20px',
            }}
          >
            🔍
          </div>
        </div>

        {/* Update rendering section */}
        <div style={{ marginTop: '20px' }}>
          {filteredData.length === 0 && searchTerm !== '' ? (
            <div style={{
              textAlign: 'center',
              color: '#fff',
              padding: '40px',
              fontSize: '18px',
              opacity: 0.7
            }}>
              No results found for "{searchTerm}"
            </div>
          ) : (
            filteredData.map((tutorial) => (
              <ResourceCard key={tutorial._id} resource={tutorial} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default TutorialsPage;