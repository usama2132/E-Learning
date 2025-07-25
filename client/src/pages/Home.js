import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/student/CourseCard';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import '../styles/pages/Home.css';
import { Search, Book, Clock, Award, Users } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { courses, loading, fetchCourses } = useCourses();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      // Featured courses (highest rated)
      const featured = courses
        .filter(course => course.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
      
      // Popular courses (most enrolled)
      const popular = courses
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 8);
      
      // Recent courses
      const recent = courses
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

      setFeaturedCourses(featured);
      setPopularCourses(popular);
      setRecentCourses(recent);
    }
  }, [courses]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      // Navigate to courses page with search term
      window.location.href = `/courses?search=${encodeURIComponent(term)}`;
    }
  };

  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, course) => sum + course.enrollmentCount, 0),
    totalInstructors: new Set(courses.map(course => course.instructorId)).size,
    avgRating: courses.length > 0 
      ? (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)
      : '0.0'
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Learn Without Limits</h1>
            <p>
              Discover thousands of courses from expert instructors and advance your career 
              with skills that matter in today's world.
            </p>
            
            <div className="hero-search">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="What do you want to learn today?"
                size="large"
              />
            </div>

            <div className="hero-actions">
              {!user ? (
                <>
                  <Button as={Link} to="/register" size="large">
                    Get Started Free
                  </Button>
                  <Button as={Link} to="/courses" variant="outline" size="large">
                    Browse Courses
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/dashboard" size="large">
                    Go to Dashboard
                  </Button>
                  <Button as={Link} to="/courses" variant="outline" size="large">
                    Explore Courses
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-illustration">
              <svg viewBox="0 0 400 300" fill="none">
                <rect x="50" y="50" width="300" height="200" rx="10" fill="#f0f9ff" stroke="#0ea5e9"/>
                <circle cx="100" cy="100" r="30" fill="#0ea5e9"/>
                <rect x="150" y="85" width="120" height="10" rx="5" fill="#cbd5e1"/>
                <rect x="150" y="105" width="80" height="10" rx="5" fill="#cbd5e1"/>
                <rect x="80" y="150" width="200" height="60" rx="8" fill="#e0f2fe"/>
                <circle cx="320" cy="80" r="8" fill="#10b981"/>
                <path d="M315 80L318 83L325 76" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <h3>{stats.totalCourses.toLocaleString()}</h3>
            <p>Courses Available</p>
          </div>
          <div className="stat-item">
            <h3>{stats.totalStudents.toLocaleString()}</h3>
            <p>Students Enrolled</p>
          </div>
          <div className="stat-item">
            <h3>{stats.totalInstructors}</h3>
            <p>Expert Instructors</p>
          </div>
          <div className="stat-item">
            <h3>{stats.avgRating}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>Featured Courses</h2>
            <p>Top-rated courses chosen by our community</p>
            <Link to="/courses?filter=featured" className="view-all-link">
              View All Featured →
            </Link>
          </div>
          <div className="courses-grid">
            {featuredCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course}
                showInstructor={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Popular Courses */}
      {popularCourses.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>Most Popular</h2>
            <p>Courses with the highest enrollment</p>
            <Link to="/courses?filter=popular" className="view-all-link">
              View All Popular →
            </Link>
          </div>
          <div className="courses-grid">
            {popularCourses.slice(0, 6).map(course => (
              <CourseCard 
                key={course.id} 
                course={course}
                showInstructor={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>New & Fresh</h2>
            <p>Recently added courses from our instructors</p>
            <Link to="/courses?filter=recent" className="view-all-link">
              View All New →
            </Link>
          </div>
          <div className="courses-grid">
            {recentCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course}
                showInstructor={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3>Expert-Led Content</h3>
            <p>Learn from industry professionals with years of experience</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h3>Learn at Your Pace</h3>
            <p>Flexible scheduling that fits your lifestyle and commitments</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <h3>Certification</h3>
            <p>Earn certificates to showcase your new skills to employers</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Community Support</h3>
            <p>Connect with peers and get help from our active community</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Learning?</h2>
          <p>Join thousands of students already learning on our platform</p>
          <div className="cta-buttons">
            {!user ? (
              <>
                <Button as={Link} to="/register" size="large">
                  Sign Up Now
                </Button>
                <Button as={Link} to="/login" variant="outline" size="large">
                  Sign In
                </Button>
              </>
            ) : (
              <Button as={Link} to="/courses" size="large">
                Browse All Courses
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;