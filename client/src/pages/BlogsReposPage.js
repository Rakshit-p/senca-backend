// // src/pages/BlogsReposPage.js
// import React from 'react';
// import { Link } from 'react-router-dom';

// function BlogsReposPage() {
//   return (
//     <>
//       {/* Navbar */}
//       <div className="navbar">
//         <div className="logo">Senca</div>
//         <div className="nav-links">
//                     {/* Removed any "Home" link from navbar */}
//             <Link to="/blogs-repos">Trending AI Blogs &amp; Projects</Link>
//             <Link to="/research-papers">Trending AI Research Papers</Link>
//             <Link to="/tweets-podcasts-videos">
//                 Trending AI Tweets, Podcasts &amp; Videos
//             </Link>
//             <Link to="/tutorials">Trending AI Tools &amp; Tutorials</Link>
//             <a href="about-image">About</a>
//             <a href="#">Contact</a>
//         </div>
//       </div>

//       {/* Heading */}
//       <div
//         style={{
//           textAlign: 'center',
//           marginTop: '80px',
//           color: '#fff',
//           fontFamily: 'Arial, sans-serif',
//         }}
//       >
//         <h1 style={{ fontSize: '42px', marginBottom: '10px' }}>
//           Top AI Blogs and Repos
//         </h1>
//         <hr
//           style={{
//             width: '90%',
//             margin: '10px auto',
//             border: '0.5px solid rgba(255, 255, 255, 0.5)',
//           }}
//         />
//       </div>

//       {/* Card 1 */}
//       <div
//         className="blogs-card"
//         style={{
//           backgroundColor: 'rgba(255, 255, 255, 0.08)',
//           color: '#fff',
//           display: 'flex',
//           alignItems: 'center',
//           padding: '50px',
//           borderRadius: '15px',
//           margin: '40px auto',
//           boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//           width: '90%',
//           fontFamily: 'Arial, sans-serif',
//           border: '1px solid rgba(255, 255, 255, 0.2)',
//           /* We'll add a little transition for the hover border effect: */
//           transition: 'border-color 0.3s ease',
//         }}
//       >
//         {/* Left side: Image */}
//         <div
//           style={{
//             width: '300px',
//             height: '200px',
//             background:
//               'url("/pic3.jpg") center center / cover no-repeat',
//             borderRadius: '10px',
//             marginRight: '20px',
//           }}
//         ></div>
//         {/* Right side: Text content */}
//         <div>
//           <h3
//             style={{
//               fontSize: '24px',
//               marginBottom: '10px',
//               fontWeight: '600',
//             }}
//           >
//             Create a website that reflects your personal brand
//           </h3>
//           <p
//             style={{
//               fontSize: '16px',
//               lineHeight: '1.5',
//               color: 'rgba(255, 255, 255, 0.8)',
//             }}
//           >
//             Start your free trial with Squarespace and create a personal
//             brand that stands out. Discover the tools you need to build and
//             grow your online presence.
//           </p>
//         </div>
//       </div>

//       {/* Card 2 */}
//       <div
//         className="blogs-card"
//         style={{
//           backgroundColor: 'rgba(255, 255, 255, 0.08)',
//           color: '#fff',
//           display: 'flex',
//           alignItems: 'center',
//           padding: '40px',
//           borderRadius: '15px',
//           margin: '40px auto',
//           boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//           width: '90%',
//           fontFamily: 'Arial, sans-serif',
//           border: '1px solid rgba(255, 255, 255, 0.2)',
//           transition: 'border-color 0.3s ease',
//         }}
//       >
//         {/* Left side: Image */}
//         <div
//           style={{
//             width: '300px',
//             height: '200px',
//             background:
//               'url("/pic3.jpg") center center / cover no-repeat',
//             borderRadius: '10px',
//             marginRight: '20px',
//           }}
//         ></div>
//         {/* Right side: Text content */}
//         <div>
//           <h3
//             style={{
//               fontSize: '24px',
//               marginBottom: '10px',
//               fontWeight: '600',
//             }}
//           >
//             Create a website that reflects your personal brand
//           </h3>
//           <p
//             style={{
//               fontSize: '16px',
//               lineHeight: '1.5',
//               color: 'rgba(255, 255, 255, 0.8)',
//             }}
//           >
//             Start your free trial with Squarespace and create a personal
//             brand that stands out. Discover the tools you need to build and
//             grow your online presence.
//           </p>
//         </div>
//       </div>

//       {/* Card 3 */}
//       <div
//         className="blogs-card"
//         style={{
//           backgroundColor: 'rgba(255, 255, 255, 0.08)',
//           color: '#fff',
//           display: 'flex',
//           alignItems: 'center',
//           padding: '40px',
//           borderRadius: '15px',
//           margin: '40px auto',
//           boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//           width: '90%',
//           fontFamily: 'Arial, sans-serif',
//           border: '1px solid rgba(255, 255, 255, 0.2)',
//           transition: 'border-color 0.3s ease',
//         }}
//       >
//         {/* Left side: Image */}
//         <div
//           style={{
//             width: '300px',
//             height: '200px',
//             background:
//               'url("/pic3.jpg") center center / cover no-repeat',
//             borderRadius: '10px',
//             marginRight: '20px',
//           }}
//         ></div>
//         {/* Right side: Text content */}
//         <div>
//           <h3
//             style={{
//               fontSize: '24px',
//               marginBottom: '10px',
//               fontWeight: '600',
//             }}
//           >
//             Create a website that reflects your personal brand
//           </h3>
//           <p
//             style={{
//               fontSize: '16px',
//               lineHeight: '1.5',
//               color: 'rgba(255, 255, 255, 0.8)',
//             }}
//           >
//             Start your free trial with Squarespace and create a personal
//             brand that stands out. Discover the tools you need to build and
//             grow your online presence.
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }

// export default BlogsReposPage;


//src/pages/BlogsReposPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';

function BlogsReposPage() {
  const [blogReposData, setBlogReposData] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    // We'll fetch all 4 endpoints in parallel, then combine
    async function fetchAll() {
      try {
        const [devtoRes, githubRes, hfRes, newsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/devto-resources`),
          fetch(`${process.env.REACT_APP_API_URL}/api/github-resources`),
          fetch(`${process.env.REACT_APP_API_URL}/api/huggingface-resources`),
          fetch(`${process.env.REACT_APP_API_URL}/api/newsapi-resources`)
        ]);
        const devtoData = await devtoRes.json();
        const githubData = await githubRes.json();
        const hfData = await hfRes.json();
        const newsData = await newsRes.json();

        // Combine them (if they are arrays)
        const combined = []
          .concat(Array.isArray(devtoData) ? devtoData : [])
          .concat(Array.isArray(githubData) ? githubData : [])
          .concat(Array.isArray(hfData) ? hfData : [])
          .concat(Array.isArray(newsData) ? newsData : []);

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
          Top AI Blogs and Repos
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

      {/* Render our combined data using <ResourceCard> */}
      {blogReposData.map((item) => (
        <ResourceCard key={item._id} resource={item} />
      ))}
    </>
  );
}

export default BlogsReposPage;

