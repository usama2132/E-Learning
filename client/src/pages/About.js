

import '../styles/pages/About.css';

const About = () => {
  return (
    <div className="about-page">
    
      
      <main className="about-container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1 className="about-title">About Our Platform</h1>
          <p className="about-subtitle">
            Empowering learners worldwide through innovative education and connecting passionate instructors with curious minds
          </p>
        </section>
        
        {/* Main Content */}
        <div className="about-content">
          <section className="about-mission">
            <h2 className="about-section-title">Our Mission</h2>
            <p className="about-text">
              We believe that quality education should be accessible to everyone, everywhere. 
              Our platform connects passionate instructors with eager learners, creating a 
              vibrant community dedicated to knowledge sharing and skill development. Through 
              innovative technology and human-centered design, we're breaking down barriers 
              to education and fostering a world where learning never stops.
            </p>
            
            <h2 className="about-section-title">What We Offer</h2>
            <div className="about-features">
              <div className="feature-card">
                <h3 className="feature-title">For Students</h3>
                <ul className="feature-list">
                  <li>Access to thousands of expert-created courses</li>
                  <li>Interactive learning experience with hands-on projects</li>
                  <li>Progress tracking and industry-recognized certificates</li>
                  <li>Flexible learning schedules that fit your lifestyle</li>
                  <li>Community support and peer collaboration</li>
                  <li>Mobile learning for education on-the-go</li>
                </ul>
              </div>
              <div className="feature-card">
                <h3 className="feature-title">For Instructors</h3>
                <ul className="feature-list">
                  <li>Intuitive course creation tools and templates</li>
                  <li>Advanced analytics and student engagement insights</li>
                  <li>Competitive revenue sharing program</li>
                  <li>Global reach to millions of learners</li>
                  <li>Marketing support and promotional opportunities</li>
                  <li>Dedicated instructor community and resources</li>
                </ul>
              </div>
            </div>
            
            <h2 className="about-values-title">Our Core Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  🎓
                </div>
                <h3 className="value-title">Excellence</h3>
                <p className="value-description">
                  We're committed to delivering the highest quality educational content and maintaining rigorous standards across all our courses.
                </p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  🌍
                </div>
                <h3 className="value-title">Accessibility</h3>
                <p className="value-description">
                  Education should know no boundaries. We make learning accessible to everyone, regardless of location, background, or circumstances.
                </p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  💡
                </div>
                <h3 className="value-title">Innovation</h3>
                <p className="value-description">
                  We continuously push the boundaries of educational technology to create more engaging and effective learning experiences.
                </p>
              </div>
            </div>
          </section>
        </div>
        
        {/* Call to Action */}
        <section className="about-cta">
          <h2 className="cta-title">Join Our Learning Revolution</h2>
          <p className="cta-description">
            Whether you're looking to acquire new skills, advance your career, or share your expertise with the world, 
            we invite you to be part of our transformative educational community.
          </p>
          <div className="cta-buttons">
            <a href="/courses" className="cta-button cta-button-primary">
              Explore Courses
            </a>
            <a href="/instructor/signup" className="cta-button cta-button-secondary">
              Become an Instructor
            </a>
          </div>
        </section>
      </main>
      
     
    </div>
  );
};

export default About;