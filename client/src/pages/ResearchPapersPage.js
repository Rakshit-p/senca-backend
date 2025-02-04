// src/pages/ResearchPapersPage.js
import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import { Link } from 'react-router-dom';
import './HomePage.css';

function ResearchPapersPage() {
  const [papers, setPapers] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function fetchAllPapers() {
      try {
        const [papersRes, arxivRes] = await Promise.all([
          fetch('/api/papers-resources'),
          fetch('/api/arxiv-resources')
        ]);
        const papersData = await papersRes.json();
        const arxivData  = await arxivRes.json();

        const combined = []
          .concat(Array.isArray(papersData) ? papersData : [])
          .concat(Array.isArray(arxivData)  ? arxivData  : []);
        setPapers(combined);
      } catch (err) {
        console.error("Error fetching research papers data:", err);
      }
    }
    fetchAllPapers();
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
          Trending AI Research Papers
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
        {papers.map((paper) => (
          <ResourceCard key={paper._id} resource={paper} />
        ))}
      </div>
    </>
  );
}

export default ResearchPapersPage;