// src/pages/TweetsPodcastsVideosPage.js
import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import { Link } from 'react-router-dom';
import './HomePage.css';

function TweetsPodcastsVideosPage() {
  const [resources, setResources] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function fetchAll() {
      try {
        const [spotifyRes, tweetsRes, youtubeRes] = await Promise.all([
          fetch('https://senca.onrender.com/api/spotify1-resources'),
          fetch('https://senca.onrender.com/api/tweet-resources'),
          fetch('https://senca.onrender.com/api/youtube-resources')
        ]);
        const spotifyData = await spotifyRes.json();
        const tweetsData = await tweetsRes.json();
        const ytData = await youtubeRes.json();

        // Add source identifiers to each item
        const spotifyWithSource = spotifyData.map(item => ({ ...item, dataSource: 'podcast' }));
        const tweetsWithSource = tweetsData.map(item => ({ ...item, dataSource: 'tweet' }));
        const ytWithSource = ytData.map(item => ({ ...item, dataSource: 'youtube' }));

        const combined = []
          .concat(Array.isArray(spotifyWithSource) ? spotifyWithSource : [])
          .concat(Array.isArray(tweetsWithSource) ? tweetsWithSource : [])
          .concat(Array.isArray(ytWithSource) ? ytWithSource : []);

        // Sort the combined array by date
        const sortedCombined = combined.sort((a, b) => {
          const getDate = (item) => {
            const date = item.publishedAt || 
                        item.createdAt || 
                        item.date || 
                        item.created_at || 
                        item.published_at ||
                        item.timestamp ||
                        item.snippet?.publishedAt ||
                        item.pubDate;
            
            if (!date) return null;
            
            // Handle Unix timestamps (e.g., from Twitter)
            if (typeof date === 'number') {
              return new Date(date * 1000);
            }
            return new Date(date);
          };

          const dateA = getDate(a);
          const dateB = getDate(b);

          if (!dateA) return 1;  // Items without dates go to the end
          if (!dateB) return -1;

          return dateB - dateA; // Sort in descending order (newest first)
        });

        setResources(sortedCombined);
        setFilteredData(sortedCombined);
      } catch (err) {
        console.error('Error fetching tweets/podcasts/videos:', err);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    // First apply search filter
    let results = resources.filter(item =>
      (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.author?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Then apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(item => {
        switch (selectedCategory) {
          case 'tweet':
            return item.dataSource === 'tweet';
          case 'youtube':
            return item.dataSource === 'youtube';
          case 'podcast':
            return item.dataSource === 'podcast';
          default:
            return true;
        }
      });
    }

    setFilteredData(results);
  }, [searchTerm, resources, selectedCategory]);

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
      {['all', 'tweet', 'youtube', 'podcast'].map((category) => (
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
          Trending AI Tweets, Podcasts & Videos
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
          zIndex: '1',
        }}
      >
        <input
          type="text"
          placeholder="Search tweets, podcasts and videos..."
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

      {/* Category buttons */}
      <CategoryButtons />

      {/* Results section */}
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
          filteredData.map(item => (
            <ResourceCard key={item._id} resource={item} />
          ))
        )}
      </div>
    </>
  );
}

export default TweetsPodcastsVideosPage;