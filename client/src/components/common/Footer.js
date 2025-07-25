import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Company Info */}
          <div className="footer__section">
            <div className="footer__brand">
              <h3 className="footer__brand-name">EduPlatform</h3>
              <p className="footer__brand-description">
                Empowering learners worldwide with quality education and expert-led courses.
              </p>
            </div>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Facebook">
                📘
              </a>
              <a href="#" className="footer__social-link" aria-label="Twitter">
                🐦
              </a>
              <a href="#" className="footer__social-link" aria-label="LinkedIn">
                💼
              </a>
              <a href="#" className="footer__social-link" aria-label="Instagram">
                📷
              </a>
              <a href="#" className="footer__social-link" aria-label="YouTube">
                📺
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__section-title">Quick Links</h4>
            <ul className="footer__links">
              <li><Link to="/" className="footer__link">Home</Link></li>
              <li><Link to="/courses" className="footer__link">Courses</Link></li>
              <li><Link to="/about" className="footer__link">About Us</Link></li>
              <li><Link to="/contact" className="footer__link">Contact</Link></li>
              <li><Link to="/dashboard" className="footer__link">Dashboard</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer__section">
            <h4 className="footer__section-title">Categories</h4>
            <ul className="footer__links">
              <li><Link to="/courses?category=web-development" className="footer__link">Web Development</Link></li>
              <li><Link to="/courses?category=data-science" className="footer__link">Data Science</Link></li>
              <li><Link to="/courses?category=mobile-development" className="footer__link">Mobile Development</Link></li>
              <li><Link to="/courses?category=design" className="footer__link">Design</Link></li>
              <li><Link to="/courses?category=business" className="footer__link">Business</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer__section">
            <h4 className="footer__section-title">Support</h4>
            <ul className="footer__links">
              <li><Link to="/help" className="footer__link">Help Center</Link></li>
              <li><Link to="/privacy-policy" className="footer__link">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="footer__link">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="footer__link">Refund Policy</Link></li>
              <li><Link to="/accessibility" className="footer__link">Accessibility</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer__section">
            <h4 className="footer__section-title">Stay Updated</h4>
            <p className="footer__newsletter-text">
              Subscribe to get updates on new courses and special offers.
            </p>
            <form className="footer__newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="footer__newsletter-input"
                required
              />
              <button
                type="submit"
                className="footer__newsletter-button"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-content">
            <p className="footer__copyright">
              © {currentYear} LearnHub. All rights reserved.
            </p>
            <div className="footer__bottom-links">
              <Link to="/privacy-policy" className="footer__bottom-link">Privacy</Link>
              <Link to="/terms-of-service" className="footer__bottom-link">Terms</Link>
              <Link to="/sitemap" className="footer__bottom-link">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
