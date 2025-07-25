import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import '../styles/pages/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-illustration">
            <div className="error-code">404</div>
            <div className="error-animation">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" stroke="#e5e7eb" strokeWidth="2" fill="none" strokeDasharray="10,5"/>
                <circle cx="75" cy="85" r="8" fill="#6b7280"/>
                <circle cx="125" cy="85" r="8" fill="#6b7280"/>
                <path d="M70 130 Q100 150 130 130" stroke="#6b7280" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M100 40 L100 20 M100 20 L90 30 M100 20 L110 30" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                <text x="100" y="25" textAnchor="middle" fontSize="12" fill="#ef4444">!</text>
              </svg>
            </div>
          </div>

          <div className="error-text">
            <h1>Oops! Page Not Found</h1>
            <p>
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, it happens to the best of us!
            </p>
          </div>

          <div className="error-actions">
            <Button onClick={handleGoBack} variant="outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Go Back
            </Button>
            
            <Button onClick={handleGoHome}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Go Home
            </Button>
          </div>

          <div className="helpful-links">
            <h3>Maybe you're looking for:</h3>
            <ul>
              <li>
                <Link to="/courses">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  Browse All Courses
                </Link>
              </li>
              <li>
                <Link to="/dashboard">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Your Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Your Profile
                </Link>
              </li>
            </ul>
          </div>

          <div className="search-suggestion">
            <p>Or search for what you need:</p>
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search courses, topics..." 
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/courses?search=${encodeURIComponent(e.target.value)}`);
                  }
                }}
              />
              <button 
                onClick={(e) => {
                  const input = e.target.parentElement.querySelector('input');
                  if (input.value.trim()) {
                    navigate(`/courses?search=${encodeURIComponent(input.value)}`);
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="error-details">
          <details>
            <summary>Technical Details</summary>
            <div className="tech-info">
              <p><strong>Error:</strong> 404 - Page Not Found</p>
              <p><strong>URL:</strong> {window.location.pathname}</p>
              <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </details>
        </div>
      </div>

      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .not-found-container {
          max-width: 600px;
          width: 100%;
          text-align: center;
        }

        .error-illustration {
          margin-bottom: 2rem;
          position: relative;
        }

        .error-code {
          font-size: 6rem;
          font-weight: 900;
          color: #e2e8f0;
          line-height: 1;
          margin-bottom: 1rem;
        }

        .error-animation {
          margin: 2rem auto;
        }

        .error-text h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .error-text p {
          font-size: 1.1rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .helpful-links {
          text-align: left;
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .helpful-links h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .helpful-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .helpful-links li {
          margin-bottom: 0.75rem;
        }

        .helpful-links a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          color: #4f46e5;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .helpful-links a:hover {
          background-color: #f3f4f6;
          color: #3730a3;
        }

        .search-suggestion {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .search-suggestion p {
          margin-bottom: 1rem;
          color: #374151;
          font-weight: 500;
        }

        .search-container {
          display: flex;
          gap: 0.5rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .search-container input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .search-container input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .search-container button {
          padding: 0.75rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .search-container button:hover {
          background: #3730a3;
        }

        .error-details {
          margin-top: 2rem;
        }

        .error-details summary {
          color: #6b7280;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .tech-info {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          text-align: left;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #374151;
        }

        .tech-info p {
          margin: 0.25rem 0;
        }

        @media (max-width: 640px) {
          .error-code {
            font-size: 4rem;
          }

          .error-text h1 {
            font-size: 1.5rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
          }

          .helpful-links,
          .search-suggestion {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
