// src/pages/BlogsReposPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';

function BlogsReposPage() {
  const [blogReposData, setBlogReposData] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // We'll fetch all 4 endpoints in parallel, then combine
    async function fetchAll() {
      try {
        const [devtoRes, githubRes, hfRes, newsRes] = await Promise.all([
          fetch('https://senca.onrender.com/api/devto-resources'),
          fetch('https://senca.onrender.com/api/github-resources'),
          fetch('https://senca.onrender.com/api/huggingface-resources'),
          fetch('https://senca.onrender.com/api/newsapi-resources')
        ]);
        const devtoData = await devtoRes.json();
        const githubData = await githubRes.json();
        const hfData = await hfRes.json();
        const newsData = await newsRes.json();

        // Add console.log to check data sources
        console.log('Sample items:', {
          devto: devtoData[0],
          github: githubData[0],
          hf: hfData[0],
          news: newsData[0]
        });

        // Combine them (if they are arrays)
        const combined = []
          .concat(Array.isArray(devtoData) ? devtoData.map(item => ({...item, dataSource: 'devto-resources'})) : [])
          .concat(Array.isArray(githubData) ? githubData.map(item => ({...item, dataSource: 'github-resources'})) : [])
          .concat(Array.isArray(hfData) ? hfData.map(item => ({...item, dataSource: 'huggingface-resources'})) : [])
          .concat(Array.isArray(newsData) ? newsData.map(item => ({...item, dataSource: 'newsapi-resources'})) : []);

        setBlogReposData(combined);
      } catch (err) {
        console.error("Error fetching blog/repos data:", err);
      }
    }
    fetchAll();
  }, []);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const CategoryButtons = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      margin: '20px auto',
      width: '90%',
      maxWidth: '800px',
      padding: '20px 0',
      flexWrap: 'wrap',
    }}>
      {['all', 'blogs', 'projects', 'news'].map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          style={{
            padding: '8px 16px',
            fontSize: 'clamp(12px, 3vw, 16px)',
            backgroundColor: selectedCategory === category ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            textTransform: 'capitalize',
            transition: 'all 0.3s ease',
            outline: 'none',
            position: 'relative',
            overflow: 'hidden',
            fontWeight: selectedCategory === category ? '600' : '400',
            letterSpacing: '0.5px',
            boxShadow: selectedCategory === category ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
            minWidth: '70px',
            margin: '5px',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = selectedCategory === category ? 'rgba(255, 255, 255, 0.15)' : 'transparent';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = selectedCategory === category ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none';
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );

  const filteredData = blogReposData.filter(item => {
    // First apply search filter
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author?.toLowerCase().includes(searchTerm.toLowerCase());

    // Then apply category filter
    if (!matchesSearch) return false;
    
    if (selectedCategory === 'all') return true;
    
    switch (selectedCategory) {
      case 'blogs':
        return item.dataSource === 'devto-resources';
      case 'projects':
        return item.dataSource === 'github-resources' || item.dataSource === 'huggingface-resources';
      case 'news':
        return item.dataSource === 'newsapi-resources';
      default:
        return true;
    }
  });

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
            <Link to="/blogs-repos">Trending AI Blogs, Projects, and News</Link>
            <Link to="/research-papers">Trending AI Research Papers</Link>
            <Link to="/tweets-podcasts-videos">Trending AI Tweets, Podcasts &amp; Videos</Link>
            <Link to="/tutorials">Trending AI Tools</Link>
            <a href="/#about-section">About</a>
            <a href="/#contact-section">Contact</a>
          </div>
        </div>
      </div>

      {/* Heading */}
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
          Top AI Blogs, Projects, & News
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
      </div>

      {/* Enhanced search section */}
      <div
        style={{
          width: '80%',
          maxWidth: '800px',
          margin: '40px auto',
          position: 'relative',
        }}
      >
        <input
          type="text"
          placeholder="Search blogs and projects..."
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

      {/* Add category buttons */}
      <CategoryButtons />

      {/* Render our filtered data using <ResourceCard> */}
      {filteredData.map((item) => (
        <ResourceCard key={item._id} resource={item} />
      ))}
    </>
  );
}

export default BlogsReposPage;

