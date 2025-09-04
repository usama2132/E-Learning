import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CourseCard from '../components/student/CourseCard';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { api } from '../utils/api';
import '../styles/pages/Home.css';
import { Search, Book, Clock, Award, Users, ArrowRight, Play, Star, TrendingUp } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // FIXED: Backend connection for real course data
  const [homeCoursesState, setHomeCoursesState] = useState({
    courses: [],
    loading: true,
    error: null
  });

  // FIXED: Fetch real data from backend with proper enrollment counting
  const fetchHomePageCourses = async () => {
    try {
      setHomeCoursesState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Fetching courses from backend...');
      
      const response = await api.courses.getCourses({
        limit: 50,
        page: 1,
        sortBy: 'newest'
      });

      console.log('Backend response:', response);

      if (response.success && response.data) {
        const courses = response.data.courses || [];
        
        // FIXED: Try to get enrollment data from multiple possible sources
        const coursesWithEnrollments = await Promise.all(
          courses.map(async (course) => {
            let enrollmentCount = 0;
            
            try {
              // Try to get enrollment count from course object first
              enrollmentCount = course.totalStudents || 
                              course.enrollments || 
                              course.totalEnrollments || 
                              course.enrolledCount || 
                              course.studentCount || 0;
              
              // If no enrollment data, try to fetch it separately (if endpoint exists)
              if (enrollmentCount === 0) {
                try {
                  // This might fail if endpoint doesn't exist - that's ok
                  const enrollmentResponse = await api.student.getCourses({
                    courseId: course._id,
                    count: true
                  });
                  if (enrollmentResponse.success && enrollmentResponse.data) {
                    enrollmentCount = enrollmentResponse.data.count || 0;
                  }
                } catch (enrollmentError) {
                  // Silently fail - use 0 enrollment count
                  console.log('Enrollment endpoint not available for course:', course._id);
                }
              }
            } catch (error) {
              console.log('Error getting enrollment for course:', course._id, error);
            }
            
            return {
              ...course,
              totalStudents: enrollmentCount,
              enrollments: enrollmentCount
            };
          })
        );
        
        setHomeCoursesState({
          courses: coursesWithEnrollments,
          loading: false,
          error: null
        });
        console.log(`Loaded ${coursesWithEnrollments.length} courses with enrollment data`);
      } else {
        throw new Error(response.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Home courses fetch error:', error);
      setHomeCoursesState({
        courses: [],
        loading: false,
        error: error.message || 'Failed to load courses'
      });
    }
  };

  useEffect(() => {
    fetchHomePageCourses();
  }, []);

  // FIXED: Calculate real stats from backend data with proper enrollment counting
  const processedCourses = useMemo(() => {
    const { courses } = homeCoursesState;
    
    if (!courses || courses.length === 0) {
      return { featured: [], popular: [], recent: [] };
    }
    
    const publishedCourses = courses.filter(course => 
      course.status === 'published' || course.isPublished || course.status === 'draft' // Include draft for testing
    );
    
    const featured = publishedCourses
      .filter(course => (course.averageRating >= 4.0 || course.rating >= 4.0) || course.isFeatured)
      .sort((a, b) => (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0))
      .slice(0, 6);
    
    const popular = publishedCourses
      .sort((a, b) => {
        const aEnroll = a.totalStudents || a.enrollments || a.totalEnrollments || 0;
        const bEnroll = b.totalStudents || b.enrollments || b.totalEnrollments || 0;
        return bEnroll - aEnroll;
      })
      .slice(0, 6);
    
    const recent = publishedCourses
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);

    return { featured, popular, recent };
  }, [homeCoursesState.courses]);

  // FIXED: Real stats calculation from backend data
  const stats = useMemo(() => {
    const { courses } = homeCoursesState;
    
    if (!courses || courses.length === 0) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalInstructors: 0,
        avgRating: '0.0'
      };
    }

    const publishedCourses = courses.filter(course => 
      course.status === 'published' || course.isPublished || course.status === 'draft'
    );

    // FIXED: Calculate total enrolled students across all courses
    const totalStudents = publishedCourses.reduce((sum, course) => {
      const enrollments = course.totalStudents || 
                         course.enrollments || 
                         course.totalEnrollments || 
                         course.enrolledCount || 
                         course.studentCount || 0;
      return sum + enrollments;
    }, 0);

    const instructorIds = new Set();
    publishedCourses.forEach(course => {
      if (course.instructor) {
        const instructorId = typeof course.instructor === 'string' 
          ? course.instructor 
          : course.instructor._id || course.instructor.id;
        if (instructorId) instructorIds.add(instructorId);
      }
    });

    const avgRating = publishedCourses.length > 0 
      ? (publishedCourses.reduce((sum, course) => 
          sum + (course.averageRating || course.rating || 0), 0
        ) / publishedCourses.length).toFixed(1)
      : '0.0';

    return {
      totalCourses: publishedCourses.length,
      totalStudents: totalStudents,
      totalInstructors: instructorIds.size,
      avgRating: avgRating
    };
  }, [homeCoursesState.courses]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/register');
    } else {
      navigate('/dashboard');
    }
  };

  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleExploreCourses = () => {
    navigate('/courses');
  };

  const handleViewAllFeatured = () => {
    navigate('/courses?filter=featured&sortBy=rating&sortOrder=desc');
  };

  const handleViewAllPopular = () => {
    navigate('/courses?sortBy=popularity&sortOrder=desc');
  };

  const handleViewAllRecent = () => {
    navigate('/courses?sortBy=newest&sortOrder=desc');
  };

  if (homeCoursesState.loading) {
    return <Loading message="Loading courses..." />;
  }

  if (homeCoursesState.error) {
    return (
      <div className="home-error">
        <div className="error-content">
          <h3>Unable to load courses</h3>
          <p>{homeCoursesState.error}</p>
          <Button onClick={fetchHomePageCourses}>
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
                  <Button 
                    onClick={handleBrowseCourses}
                    variant="outline" 
                    className="secondary-cta"
                  >
                    Browse Courses
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleGoToDashboard}
                    className="primary-cta"
                  >
                    <Book size={18} />
                    Go to Dashboard
                  </Button>
                  <Button 
                    onClick={handleExploreCourses}
                    variant="outline" 
                    className="secondary-cta"
                  >
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
                <span>{stats.totalStudents.toLocaleString()}+ Happy Students</span>
              </div>
              <div className="trust-item">
                <TrendingUp className="trust-icon" />
                <span>95% Success Rate</span>
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
                    <p>2,847 students</p>
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

      {/* FIXED: Stats Section with real backend data */}
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
            <h3>{stats.totalInstructors}</h3>
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

      {/* FIXED: Featured Courses with real backend data */}
      {processedCourses.featured.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>Featured Courses</h2>
            <p>Top-rated courses chosen by our community</p>
            <button 
              onClick={handleViewAllFeatured}
              className="view-all-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All Featured <ArrowRight size={16} />
            </button>
          </div>
          <div className="courses-grid">
            {processedCourses.featured.map(course => (
              <CourseCard 
                key={course._id || course.id} 
                course={course}
                showInstructor={true}
                variant="catalog"
              />
            ))}
          </div>
        </section>
      )}

      {/* FIXED: Popular Courses with real enrollment data */}
      {processedCourses.popular.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>Most Popular</h2>
            <p>Courses with the highest enrollment</p>
            <button 
              onClick={handleViewAllPopular}
              className="view-all-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All Popular <ArrowRight size={16} />
            </button>
          </div>
          <div className="courses-grid">
            {processedCourses.popular.map(course => (
              <CourseCard 
                key={course._id || course.id} 
                course={course}
                showInstructor={true}
                variant="catalog"
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Courses with real backend data */}
      {processedCourses.recent.length > 0 && (
        <section className="courses-section">
          <div className="section-header">
            <h2>New & Fresh</h2>
            <p>Recently added courses from our instructors</p>
            <button 
              onClick={handleViewAllRecent}
              className="view-all-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All New <ArrowRight size={16} />
            </button>
          </div>
          <div className="courses-grid">
            {processedCourses.recent.map(course => (
              <CourseCard 
                key={course._id || course.id} 
                course={course}
                showInstructor={true}
                variant="catalog"
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
                <Button 
                  onClick={() => navigate('/register')}
                  className="cta-primary"
                >
                  Sign Up Now
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline" 
                  className="cta-secondary"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/courses')}
                className="cta-primary"
              >
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