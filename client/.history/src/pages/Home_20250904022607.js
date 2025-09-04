import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CourseCard from '../components/student/CourseCard';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import '../styles/pages/Home.css';
import { Search, Book, Clock, Award, Users, ArrowRight, Play, Star, TrendingUp } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // State for Home page data - simplified approach
  const [homeData, setHomeData] = useState({
    courses: [],
    loading: true,
    error: null
  });

  // Fetch only courses and calculate everything from that
  const fetchCoursesAndCalculateStats = async () => {
    try {
      setHomeData(prev => ({ ...prev, loading: true, error: null }));
      console.log('Fetching courses from backend...');
      
      const response = await fetch('http://localhost:5000/api/courses?limit=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.courses) {
          const courses = data.data.courses;
          console.log(`Successfully loaded ${courses.length} courses`);
          
          setHomeData({
            courses: courses,
            loading: false,
            error: null
          });
        } else {
          throw new Error('Invalid response structure');
        }
      } else {
        throw new Error(`HTTP ${response.status}: Failed to fetch courses`);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      setHomeData({
        courses: [],
        loading: false,
        error: error.message
      });
    }
  };

  // Load courses on component mount
  useEffect(() => {
    fetchCoursesAndCalculateStats();
  }, []);

  // Calculate stats directly from courses - no analytics endpoint needed
  const stats = useMemo(() => {
    const { courses } = homeData;
    
    if (!courses || courses.length === 0) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalInstructors: 0,
        avgRating: '0.0'
      };
    }

    // Count unique instructors
    const uniqueInstructors = new Set();
    let totalEnrollments = 0;
    let totalRatingSum = 0;
    let coursesWithRating = 0;

    courses.forEach(course => {
      // Count unique instructors
      const instructorId = course.instructor?._id || course.instructor || course.instructorId;
      if (instructorId) {
        uniqueInstructors.add(instructorId.toString());
      }
      
      // Sum up all enrollments
      const enrollments = course.enrollmentCount || course.students || course.totalEnrollments || 0;
      totalEnrollments += enrollments;
      
      // Calculate average rating
      const rating = course.rating || course.averageRating || course.avgRating || 0;
      if (rating > 0) {
        totalRatingSum += rating;
        coursesWithRating++;
      }
    });

    const avgRating = coursesWithRating > 0 
      ? (totalRatingSum / coursesWithRating).toFixed(1) 
      : '0.0';

    const calculatedStats = {
      totalCourses: courses.length,
      totalStudents: totalEnrollments,
      totalInstructors: uniqueInstructors.size,
      avgRating: avgRating
    };

    console.log('Calculated stats from courses:', calculatedStats);
    return calculatedStats;
  }, [homeData.courses]);

  // Process courses for different sections
  const processedCourses = useMemo(() => {
    const { courses } = homeData;
    
    if (!courses || courses.length === 0) {
      return { featured: [], popular: [], recent: [] };
    }
    
    // Featured courses (highest rated with minimum rating)
    const featured = courses
      .filter(course => {
        const rating = course.rating || course.averageRating || course.avgRating || 0;
        return rating >= 4.0;
      })
      .sort((a, b) => {
        const aRating = a.rating || a.averageRating || a.avgRating || 0;
        const bRating = b.rating || b.averageRating || b.avgRating || 0;
        return bRating - aRating;
      })
      .slice(0, 6);
    
    // Popular courses (most enrolled)
    const popular = courses
      .sort((a, b) => {
        const aEnrollments = a.enrollmentCount || a.students || a.totalEnrollments || 0;
        const bEnrollments = b.enrollmentCount || b.students || b.totalEnrollments || 0;
        return bEnrollments - aEnrollments;
      })
      .slice(0, 6);
    
    // Recent courses (newest)
    const recent = courses
      .sort((a, b) => {
        const aDate = new Date(a.createdAt || 0);
        const bDate = new Date(b.createdAt || 0);
        return bDate - aDate;
      })
      .slice(0, 6);

    return { featured, popular, recent };
  }, [homeData.courses]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Show loading state
  if (homeData.loading) {
    return <Loading message="Loading courses..." />;
  }

  // Show error state
  if (homeData.error) {
    return (
      <div className="home-error">
        <div className="error-content">
          <h3>Unable to load courses</h3>
          <p>{homeData.error}</p>
          <Button onClick={fetchCoursesAndCalculateStats}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-particles">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-main">Learn Without</span>
              <span className="title-highlight">Limits</span>
            </h1>
            
            <p className="hero-description">
              Discover thousands of courses from expert instructors and advance your career 
              with skills that matter in today's world.
            </p>
            
            <div className="hero-search-container">
              <form onSubmit={handleSearch} className="search-form">
                <div className={`search-input-wrapper ${isSearchFocused ? 'focused' : ''}`}>
                  <div className="search-icon">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="What do you want to learn today?"
                    className="search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  <button type="submit" className="search-submit">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </div>

            <div className="hero-actions">
              {!user ? (
                <>
                  <Button 
                    onClick={handleGetStarted}
                    className="primary-cta"
                  >
                    <Play size={18} />
                    Get Started Free
                  </Button>
                  <Button as={Link} to="/courses" variant="outline" className="secondary-cta">
                    Browse Courses
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/dashboard" className="primary-cta">
                    <Book size={18} />
                    Go to Dashboard
                  </Button>
                  <Button as={Link} to="/courses" variant="outline" className="secondary-cta">
                    Explore Courses
                  </Button>
                </>
              )}
            </div>

            <div className="hero-trust-indicators">
              <div className="trust-item">
                <Star className="trust-icon" />
                <span>{stats.avgRating}/5 Average Rating</span>
              </div>
              <div className="trust-item">
                <Users className="trust-icon" />
                <span>{stats.totalStudents.toLocaleString()}+ Students</span>
              </div>
              <div className="trust-item">
                <TrendingUp className="trust-icon" />
                <span>Expert Instructors</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-illustration">
              <div className="floating-cards">
                <div className="floating-card card-1">
                  <div className="card-icon">
                    <Book size={24} />
                  </div>
                  <div className="card-content">
                    <h4>Web Development</h4>
                    <p>{Math.max(1, Math.ceil(stats.totalStudents / 10))} students</p>
                  </div>
                </div>
                
                <div className="floating-card card-2">
                  <div className="card-icon">
                    <Award size={24} />
                  </div>
                  <div className="card-content">
                    <h4>Get Certified</h4>
                    <p>Industry recognized</p>
                  </div>
                </div>
                
                <div className="floating-card card-3">
                  <div className="card-icon">
                    <Clock size={24} />
                  </div>
                  <div className="card-content">
                    <h4>Learn at your pace</h4>
                    <p>24/7 access</p>
                  </div>
                </div>
              </div>
              
              <div className="hero-main-visual">
                <div className="visual-backdrop"></div>
                <div className="visual-content">
                  <div className="progress-ring">
                    <svg width="160" height="160" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                      <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gradient)" strokeWidth="4" 
                              strokeDasharray="565" strokeDashoffset="113" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="ring-center">
                      <Play size={24} className="play-icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Real Database Data */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">
              <Book size={32} />
            </div>
            <h3>{stats.totalCourses.toLocaleString()}</h3>
            <p>Courses Available</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Users size={32} />
            </div>
            <h3>{stats.totalStudents.toLocaleString()}</h3>
            <p>Students Enrolled</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Award size={32} />
            </div>
            <h3>{stats.totalInstructors.toLocaleString()}</h3>
            <p>Expert Instructors</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <Star size={32} />
            </div>
            <h3>{stats.avgRating}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {processedCourses.featured.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>Featured Courses</h2>
            <p>Top-rated courses chosen by our community</p>
            <Link to="/courses?filter=featured" className="view-all-link">
              View All Featured <ArrowRight size={16} />
            </Link>
          </div>
          <div className="courses-grid">
            {processedCourses.featured.map(course => (
              <CourseCard 
                key={course._id || course.id} 
                course={course}
                showInstructor={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Popular Courses */}
      {processedCourses.popular.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>Most Popular</h2>
            <p>Courses with the highest enrollment</p>
            <Link to="/courses?filter=popular" className="view-all-link">
              View All Popular <ArrowRight size={16} />
            </Link>
          </div>
          <div className="courses-grid">
            {processedCourses.popular.map(course => (
              <CourseCard 
                key={course._id || course.id} 
                course={course}
                showInstructor={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Courses */}
      {processedCourses.recent.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>New & Fresh</h2>
            <p>Recently added courses from our instructors</p>
            <Link to="/courses?filter=recent" className="view-all-link">
              View All New <ArrowRight size={16} />
            </Link>
          </div>
          <div className="courses-grid">
            {processedCourses.recent.map(course => (
              <CourseCard 
                key={course._id || course.id} 
                course={course}
                showInstructor={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: 'var(--bg-color, #ffffff)',
        color: 'var(--text-color, #333333)'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '50px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Why Choose Our Platform?
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '25px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            { icon: Book, title: 'Expert-Led Content', desc: 'Learn from industry professionals with years of experience', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
            { icon: Clock, title: 'Learn at Your Pace', desc: 'Flexible scheduling that fits your lifestyle and commitments', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
            { icon: Award, title: 'Certification', desc: 'Earn certificates to showcase your new skills to employers', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
            { icon: Users, title: 'Community Support', desc: 'Connect with peers and get help from our active community', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'var(--card-bg, #ffffff)',
              padding: '35px 25px',
              borderRadius: '15px',
              textAlign: 'center',
              transition: 'transform 0.2s ease',
              boxShadow: 'var(--card-shadow, 0 8px 25px rgba(0,0,0,0.1))',
              border: '1px solid var(--border-color, rgba(0,0,0,0.1))'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                margin: '0 auto 20px auto',
                background: feature.gradient,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <feature.icon size={28} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text-color, #333333)'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '0.95rem',
                lineHeight: '1.5',
                color: '#969ba2',
                margin: '0'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
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
                <Button as={Link} to="/register" className="cta-primary">
                  Sign Up Now
                </Button>
                <Button as={Link} to="/login" variant="outline" className="cta-secondary">
                  Sign In
                </Button>
              </>
            ) : (
              <Button as={Link} to="/courses" className="cta-primary">
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