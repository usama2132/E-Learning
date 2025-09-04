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
  
  // FIXED: Local state for Home page data
  const [homeState, setHomeState] = useState({
    courses: [],
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      totalInstructors: 0,
      avgRating: '0.0'
    },
    loading: true,
    error: null
  });

  // FIXED: Fetch real analytics data from backend
  const fetchHomePageData = async () => {
    try {
      setHomeState(prev => ({ ...prev, loading: true, error: null }));
      console.log('Fetching home page data from backend...');
      
      // Parallel requests for better performance
      const [coursesResponse, analyticsResponse] = await Promise.all([
        // Get courses
        fetch('http://localhost:5000/api/courses?limit=50&status=approved', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }),
        
        // Get platform analytics
        fetch('http://localhost:5000/api/analytics/overview', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(user && localStorage.getItem('token') ? {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            } : {})
          },
          credentials: 'include'
        })
      ]);

      // Handle courses response
      let courses = [];
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        if (coursesData.success) {
          courses = coursesData.data.courses || [];
          console.log(`Loaded ${courses.length} courses from backend`);
        }
      } else {
        console.warn('Failed to fetch courses:', coursesResponse.status);
      }

      // Handle analytics response
      let realStats = {
        totalCourses: 0,
        totalStudents: 0,
        totalInstructors: 0,
        avgRating: '0.0'
      };

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success && analyticsData.data.overview) {
          const overview = analyticsData.data.overview;
          
          // FIXED: Map real backend data to stats
          realStats = {
            totalCourses: overview.summary?.totalCourses || courses.length || 0,
            totalStudents: overview.summary?.totalUsers || overview.usersByRole?.find(role => role.role === 'student')?.total || 0,
            totalInstructors: overview.usersByRole?.find(role => role.role === 'instructor')?.total || 0,
            avgRating: overview.summary?.avgRating?.toFixed(1) || '0.0'
          };
          
          console.log('Real analytics loaded:', realStats);
        } else {
          console.warn('Analytics data structure unexpected:', analyticsData);
        }
      } else if (analyticsResponse.status === 401) {
        console.log('Analytics requires auth, using basic stats from courses');
        // Fallback to basic stats from courses data
        const instructors = new Set(courses.map(course => course.instructorId || course.instructor)).size;
        const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrollmentCount || course.students || 0), 0);
        const avgRating = courses.length > 0 
          ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
          : '0.0';
          
        realStats = {
          totalCourses: courses.length,
          totalStudents: totalEnrollments,
          totalInstructors: instructors,
          avgRating: avgRating
        };
        
        console.log('Using fallback stats from courses:', realStats);
      } else {
        console.warn('Failed to fetch analytics:', analyticsResponse.status);
      }

      // Update state with real data
      setHomeState({
        courses,
        stats: realStats,
        loading: false,
        error: null
      });
      
      console.log('Home page data loaded successfully:', {
        coursesCount: courses.length,
        stats: realStats
      });

    } catch (error) {
      console.error('Home page data fetch error:', error);
      setHomeState({
        courses: [],
        stats: {
          totalCourses: 0,
          totalStudents: 0,
          totalInstructors: 0,
          avgRating: '0.0'
        },
        loading: false,
        error: error.message
      });
    }
  };

  // FIXED: Load data on component mount
  useEffect(() => {
    fetchHomePageData();
  }, [user]); // Re-fetch if user changes (login/logout)

  // Memoize processed courses to prevent recalculation on every render
  const processedCourses = useMemo(() => {
    const { courses } = homeState;
    
    if (!courses || courses.length === 0) {
      return { featured: [], popular: [], recent: [] };
    }
    
    // Featured courses (highest rated)
    const featured = courses
      .filter(course => (course.rating || course.averageRating || 0) >= 4.0)
      .sort((a, b) => ((b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0)))
      .slice(0, 6);
    
    // Popular courses (most enrolled)
    const popular = courses
      .sort((a, b) => {
        const aEnrollments = a.enrollmentCount || a.students || a.totalEnrollments || 0;
        const bEnrollments = b.enrollmentCount || b.students || b.totalEnrollments || 0;
        return bEnrollments - aEnrollments;
      })
      .slice(0, 6);
    
    // Recent courses
    const recent = courses
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);

    console.log('Processed courses:', {
      featuredCount: featured.length,
      popularCount: popular.length,
      recentCount: recent.length
    });

    return { featured, popular, recent };
  }, [homeState.courses]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // FIXED: Show loading/error states for Home page specifically
  if (homeState.loading) {
    return <Loading message="Loading homepage..." />;
  }

  if (homeState.error) {
    return (
      <div className="home-error">
        <div className="error-content">
          <h3>Unable to load homepage data</h3>
          <p>{homeState.error}</p>
          <Button onClick={fetchHomePageData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { stats } = homeState;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-particles">
            {/* Reduced particles from 20 to 5 for performance */}
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
                  <Button as={Link} to="/register" className="primary-cta">
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
                    <p>{Math.ceil(stats.totalStudents / 5)} students</p>
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

      {/* FIXED: Stats Section with Real Data */}
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