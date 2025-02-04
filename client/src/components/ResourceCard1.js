// src/components/ResourceCard.js
import React from 'react';

function ResourceCard({ resource }) {
  /*
    resource might have:
      resource.title
      resource.link
      resource.image
      resource.summary
      resource.createdAt or publishedAt, etc.
  */
  const {
    title,
    link,
    image,
    summary,
    publishedAt, // or date or whatever field
    createdAt
  } = resource;

  // Decide on a fallback date if none is present
  const dateToDisplay = publishedAt || createdAt || "No Date";

  // Fallback image if resource.image is missing or "No image"
  const displayImage =
    !image || image.toLowerCase().includes("no image")
      ? "/pic10.png"
      : image;

  return (
    <div
      className="resource-card"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '40px',
        borderRadius: '15px',
        margin: '40px auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        width: '90%',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Left side: Image */}
      <div
        style={{
          width: '300px',
          height: '200px',
          background: `url("${displayImage}") center center / cover no-repeat`,
          borderRadius: '10px',
          marginRight: '20px',
        }}
      ></div>

      {/* Right side: Text content */}
      <div style={{ flex: '1' }}>
        {/* Title with link */}
        <h3
          style={{
            fontSize: '24px',
            marginBottom: '10px',
            fontWeight: '600',
          }}
        >
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff', textDecoration: 'none' }}
          >
            {title}
          </a>
        </h3>

        {/* Date (if any) */}
        <p style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '10px' }}>
          {dateToDisplay}
        </p>

        {/* Summary */}
        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.5',
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {summary}
        </p>
      </div>
    </div>
  );
}

export default ResourceCard;