// src/pages/HomePage.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Make sure this path is correct.

function HomePage() {
  useEffect(() => {
    // Fade-up on scroll
    const faders = document.querySelectorAll('.fade-up');
    const options = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          obs.unobserve(entry.target);
        }
      });
    }, options);

    faders.forEach((fader) => observer.observe(fader));

    return () => {
      faders.forEach((fader) => observer.unobserve(fader));
    };
  }, []);

  return (
    <>
      {/* Navbar */}
      <div className="navbar fade-up">
        <div className="logo">Senca</div>
        <div className="nav-links">
          {/* Removed "Home" link as requested; add your own links as needed */}
          <Link to="/blogs-repos">Trending AI Blogs &amp; Projects</Link>
          <Link to="/research-papers">Trending AI Research Papers</Link>
          <Link to="/tweets-podcasts-videos">
            Trending AI Tweets, Podcasts &amp; Videos
          </Link>
          <Link to="/tutorials">Trending AI Tools &amp; Tutorials</Link>
          <a href="#about-section">About</a>
          <a href="#contact-section">Contact</a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section fade-up">
        <div className="blob-cont">
          <div className="blob blue"></div>
          <div className="blob pink"></div>
          <div className="blob orange"></div>
        </div>
        <div className="hero-content">
          <h1>Senca</h1>
          <p>
            Your automated source for the latest tech insights, research, and
            code—summarized and ready to explore.
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section fade-up" id="about-section">
        <div className="about-image"></div>
        <div className="about-content">
          <h2>About</h2>
          <p>
            Welcome to Senca – your gateway to the latest in technology and
            innovation. Our mission is to keep you at the forefront of tech
            advancements by automatically curating the most popular tech blogs,
            groundbreaking research papers, and essential GitHub repositories,
            all summarized for easy access and understanding.
          </p>
        </div>
      </div>

      {/* Scrolling Boxes Section */}
      <div className="scrolling-section fade-up">
        <div className="scroll-description">
          <h2>Scrolling Section</h2>
          <p>
            Welcome to Senca – your gateway to the latest in technology and
            innovation. Our mission is to keep you at the forefront of tech
            advancements by automatically curating the most popular tech blogs,
            groundbreaking research papers, and essential GitHub repositories,
            all summarized for easy access and understanding.
          </p>
        </div>

        {/* Continuous scroll container */}
        <div className="scroll-container">
          <div className="scroll-content">
            {/* First set of cards */}
            <div className="scroll-card">
              <div className="scroll-card-image"></div>
              <div>
                <h3>Create a website that reflects your personal brand</h3>
                <p>
                  Explore beautiful templates, powerful e-commerce, and
                  integrated marketing features that help your business grow.
                </p>
              </div>
            </div>

            <div className="scroll-card">
              <div className="scroll-card-image"></div>
              <div>
                <h3>Build your online presence effectively</h3>
                <p>
                  Explore beautiful templates, powerful e-commerce, and
                  integrated marketing features that help your business grow.
                </p>
              </div>
            </div>

            <div className="scroll-card">
              <div className="scroll-card-image"></div>
              <div>
                <h3>Showcase your portfolio in style</h3>
                <p>
                  Whether you&apos;re a photographer or a writer, easily share
                  your creations and achievements with the world.
                </p>
              </div>
            </div>

            {/* Second set: duplicate for the infinite loop */}
            <div className="scroll-card">
              <div className="scroll-card-image"></div>
              <div>
                <h3>Create a website that reflects your personal brand</h3>
                <p>
                  Explore beautiful templates, powerful e-commerce, and
                  integrated marketing features that help your business grow.
                </p>
              </div>
            </div>

            <div className="scroll-card">
              <div className="scroll-card-image"></div>
              <div>
                <h3>Build your online presence effectively</h3>
                <p>
                  Explore beautiful templates, powerful e-commerce, and
                  integrated marketing features that help your business grow.
                </p>
              </div>
            </div>

            <div className="scroll-card">
              <div className="scroll-card-image"></div>
              <div>
                <h3>Showcase your portfolio in style</h3>
                <p>
                  Whether you&apos;re a photographer or a writer, easily share
                  your creations and achievements with the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Section */}
      <div className="explore-section fade-up" id="explore-section">
        <h2 className="explore-heading">Explore</h2>
        <div className="explore-boxes">
          <div className="explore-box">
            <div className="explore-image"></div>
            <div className="explore-content">
              <span className="activity-label">EXPLORE</span>
              <h2>Githubs</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt anim id est bmt est.
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  border: '1px solid #FFFFFF',
                  background: 'none',
                  color: '#FFFFFF',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Explore benefits ➔
              </button>
            </div>
          </div>
          <div className="explore-box1">
            <div className="explore-image"></div>
            <div className="explore-content">
              <span className="activity-label">EXPLORE</span>
              <h2>Research</h2>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  border: '1px solid #FFFFFF',
                  background: 'none',
                  color: '#FFFFFF',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Learn more ➔
              </button>
            </div>
          </div>
          <div className="explore-box2">
            <div className="explore-image"></div>
            <div className="explore-content">
              <span className="activity-label">EXPLORE</span>
              <h2>Blogs and Other</h2>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  border: '1px solid #FFFFFF',
                  background: 'none',
                  color: '#FFFFFF',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Discover more ➔
              </button>
            </div>
          </div>
          <div className="explore-box3">
            <div className="explore-image"></div>
            <div className="explore-content">
              <span className="activity-label">EXPLORE</span>
              <h2>Blogs and Other</h2>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  border: '1px solid #FFFFFF',
                  background: 'none',
                  color: '#FFFFFF',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Discover more ➔
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section fade-up" id="contact-section">
        <h2>Contact</h2>
        <p>We&apos;d love to hear from you!</p>
        {/* 
          Example Formspree form: set it to your own form ID and 
          configure Formspree to forward submissions to rakshitp13@gmail.com.
          This way, your actual email is never exposed in the frontend code.
        */}
        <form
          className="contact-form"
          method="POST"
          action="https://formspree.io/f/yourFormIDHere"
        >
          <input type="text" name="name" placeholder="Full Name" required />
          <input type="email" name="_replyto" placeholder="Email" required />
          <textarea name="message" placeholder="Type your Message..." required></textarea>
          <button type="submit">Send</button>
        </form>
      </div>

      {/* Footer */}
      <div className="footer fade-up">
        <p>Made with ❤️ by Senca</p>
      </div>
    </>
  );
}

export default HomePage;