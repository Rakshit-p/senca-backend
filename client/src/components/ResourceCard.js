// src/components/ResourceCard.js
import React from 'react';
import './ResourceCard.css';

// Import all images
import blog1 from './1.png';
import blog2 from './2.png';
import blog3 from './3.png';
import blog4 from './4.png';
import blog5 from './5.png';
import blog7 from './7.png';

function ResourceCard({ resource }) {
  /*
    resource might have:
      resource.title
      resource.link
      resource.url
      resource.image
      resource.summary
      resource.createdAt or publishedAt, etc.
  */
  const {
    title,
    link,
    image,
    summary,
    publishedAt,
    createdAt
  } = resource;

  // Check if this is a tools1-resource
  const isToolsResource = link && (
    link.includes('tools1-resources') || 
    window.location.pathname === '/tutorials'
  );

  // Enhanced date helper function to handle more date formats
  const getResourceDate = () => {
    if (isToolsResource) return null;
    
    // Handle different date fields and formats
    const possibleDateFields = [
      resource.publishedAt,
      resource.createdAt,
      resource.date,
      resource.created_at,
      resource.published_at,
      resource.timestamp,  // For tweets
      resource.snippet?.publishedAt,  // For YouTube videos
      resource.pubDate,    // For RSS feeds
      resource.published_time
    ];

    // Find the first valid date
    const date = possibleDateFields.find(d => d !== undefined && d !== null);
    
    if (!date) return null;
    
    // Convert string date to Date object
    try {
      // Handle Unix timestamps (e.g., from Twitter)
      if (typeof date === 'number') {
        return new Date(date * 1000);
      }
      return new Date(date);
    } catch (e) {
      console.error('Invalid date format:', date);
      return null;
    }
  };

  // Update date display logic to use the new helper function
  const dateToDisplay = getResourceDate();
  const formattedDate = dateToDisplay ? 
    dateToDisplay.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).replace(/(\d+)/, '$1th') : null;

  // Helper function to determine default image based on resource type
  const getDefaultImage = (link) => {
    console.log("Checking link:", link);
    
    const currentPath = window.location.pathname;
    console.log("Current path:", currentPath);

    if (currentPath === '/tutorials') {
      return blog7;
    }
    
    if (!link) return blog1;
    
    if (link.startsWith('/api/')) {
      const endpoint = link.split('/')[2];
      console.log("API endpoint:", endpoint);
      
      switch(endpoint) {
        case 'devto-resources':
        case 'github-resources':
        case 'huggingface-resources':
        case 'newsapi-resources':
          return blog1;
        case 'papers-resources':
        case 'arxiv-resources':
          return blog2;
        case 'spotify1-resources':
          return blog5;
        case 'tweet-resources':
          return blog3;
        case 'youtube-resources':
          return blog4;
        case 'tools1-resources':
          return blog7;
        default:
          return blog1;
      }
    }
    
    if (link.includes('spotify.com')) return blog5;
    if (link.includes('twitter.com')) return blog3;
    if (link.includes('youtube.com')) return blog4;
    if (link.includes('arxiv.org')) return blog2;
    
    return blog1;
  };

  // Helper function to get the actual URL for clicking
  const getClickableLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('/api/')) {
      return resource.link;
    }
    return link;
  };

  // Handle click on the entire card
  const handleCardClick = (e) => {
    // Prevent default behavior
    e.preventDefault();
    
    // Get the URL
    const url = getClickableLink(link);
    
    // Open URL in new tab
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Fallback image if resource.image is missing or "No image"
  const displayImage =
    !image || image.toLowerCase().includes("no image")
      ? getDefaultImage(link)
      : image;

  console.log("Selected image:", displayImage);

  // Add state for hover
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="resource-card" 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '40px',
        borderRadius: '15px',
        margin: '40px auto',
        boxShadow: isHovered 
          ? '0 6px 20px rgba(138, 43, 226, 0.4), 0 6px 20px rgba(0, 123, 255, 0.4)'
          : '0 4px 8px rgba(0, 0, 0, 0.2)',
        width: '90%',
        maxWidth: '1400px',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        flexDirection: 'row',
        position: 'relative',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Left side: Image */}
      <div style={{
        width: '300px',
        height: '200px',
        background: `url(${displayImage}) center center / cover no-repeat`,
        borderRadius: '10px',
        marginRight: '20px',
        flexShrink: 0,
      }}></div>

      {/* Right side: Text content */}
      <div style={{ flex: '1' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '24px',
          marginBottom: '10px',
          fontWeight: '600',
          color: '#fff',
          textDecoration: 'none'
        }}>
          {title}
        </h3>

        {/* Only show date if it's not a tools resource AND we have a valid date */}
        {!isToolsResource && formattedDate && (
          <div style={{
            display: 'inline-block',
            backgroundColor: '#2196F3',
            padding: '6px 12px',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <p style={{ 
              fontStyle: 'italic', 
              fontSize: '14px',
              margin: 0,
              color: '#fff'
            }}>
              {formattedDate}
            </p>
          </div>
        )}

        {/* Summary */}
        <p style={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: 'rgba(255, 255, 255, 0.8)',
        }}>
          {summary}
        </p>
      </div>
    </div>
  );
}

export default ResourceCard;