import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import CourseCard from '../components/student/CourseCard';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import '../styles/pages/Home.css';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // State for real backend data
  const [homeData, setHomeData] = useState({
    featuredCourses: [],
    recentCourses: [],
    categories: [],
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      totalInstructors: 0,
      totalExperts: 8 // Keep static or fetch from backend
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from backend on component mount
  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🏠 Fetching home page data from backend...');
        
        // Fetch all courses first
        const coursesResponse = await api.courses.getCourses({
          limit: 12,
          sortBy: 'newest'
        });
        
        console.log('📚 Courses response:', coursesResponse);
        
        let allCourses = [];
        let totalCourses = 0;
        
        if (coursesResponse.success && coursesResponse.data?.courses) {
          allCourses = coursesResponse.data.courses;
          totalCourses = coursesResponse.data.pagination?.totalCourses || allCourses.length;
        }
        
        // Try to fetch featured courses
        let featuredCourses = [];
        try {
          const featuredResponse = await api.courses.getFeaturedCourses();
          if (featuredResponse.success && featuredResponse.data?.courses) {
            featuredCourses = featuredResponse.data.courses.slice(0, 6);
          }
        } catch (featuredError) {
          console.warn('Featured courses failed, using recent courses:', featuredError.message);
          featuredCourses = allCourses.slice(0, 6);
        }
        
        // If no featured courses, use the first 6 from all courses
        if (featuredCourses.length === 0) {
          featuredCourses = allCourses.slice(0, 6);
        }
        
        // Try to fetch categories
        let categories = [];
        try {
          const categoriesResponse = await api.courses.getAllCategories();
          if (categoriesResponse.success && categoriesResponse.data?.categories) {
            categories = categoriesResponse.data.categories.slice(0, 8);
          }
        } catch (categoriesError) {
          console.warn('Categories failed:', categoriesError.message);
          // Fallback categories
          categories = [
            { _id: '1', name: 'Programming', description: 'Software development courses' },
            { _id: '2', name: 'Web Development', description: 'Frontend and backend courses' },
            { _id: '3', name: 'Data Science', description: 'Data analysis and AI' },
            { _id: '4', name: 'Design', description: 'UI/UX and graphic design' },
            { _id: '5', name: 'Business', description: 'Business and entrepreneurship' },
            { _id: '6', name: 'Marketing', description: 'Digital marketing' },
            { _id: '7', name: 'Mobile Development', description: 'iOS and Android apps' },
            { _id: '8', name: 'DevOps', description: 'Deployment and infrastructure' }
          ];
        }
        
        // Calculate student count from courses
        let totalStudents = 0;
        if (allCourses.length > 0) {
          totalStudents = allCourses.reduce((sum, course) => {
            return sum + (course.totalStudents || course.totalEnrollments || course.enrolledCount || 0);
          }, 0);
        }
        
        // Count unique instructors
        const instructorIds = new Set();
        allCourses.forEach(course => {
          if (course.instructor) {
            const instructorId = typeof course.instructor === 'string' ? 
              course.instructor : course.instructor._id || course.instructor.id;
            if (instructorId) instructorIds.add(instructorId);
          }
        });
        
        const finalHomeData = {
          featuredCourses: featuredCourses,
          recentCourses: allCourses.slice(0, 8),
          categories: categories,
          stats: {
            totalCourses: totalCourses,
            totalStudents: totalStudents,
            totalInstructors: instructorIds.size,
            totalExperts: 8
          }
        };
        
        console.log('✅ Home data processed:', {
          featuredCoursesCount: finalHomeData.featuredCourses.length,
          recentCoursesCount: finalHomeData.recentCourses.length,
          categoriesCount: finalHomeData.categories.length,
          stats: finalHomeData.stats
        });
        
        setHomeData(finalHomeData);
        
      } catch (error) {
        console.error('❌ Home data fetch failed:', error);
        setError('Failed to load content. Please try again.');
        
        // Set fallback data
        setHomeData({
          featuredCourses: [],
          recentCourses: [],
          categories: [
            { _id: '1', name: 'Programming', description: 'Software development' },
            { _id: '2', name: 'Design', description: 'Creative design' },
            { _id: '3', name: 'Business', description: 'Business courses' }
          ],
          stats: {
            totalCourses: 0,
            totalStudents: 0,
            totalInstructors: 0,
            totalExperts: 8
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleExploreCourses = () => {
    navigate('/courses');
  };

  if (isLoading) {
    return (
      <div className="home-loading">
        <Loading />
        <p>Loading amazing courses for you...</p>
      </div>
    );
  }

  return (
    <div className={`home ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__background">
          <div className="hero__overlay"></div>
        </div>
        
        <div className="hero__content">
          <div className="hero__text">
            <h1 className="hero__title">
              Learn Without Limits
              <span className="hero__title-highlight"> Transform Your Future</span>
            </h1>
            <p className="hero__subtitle">
              Discover world-class courses from expert instructors. Start your learning journey today 
              with interactive content, practical projects, and personalized guidance.
            </p>
            
            <div className="hero__search">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="What do you want to learn today?"
                showIcon={true}
                size="large"
              />
            </div>
            
            <div className="hero__actions">
              <Button 
                variant="primary" 
                size="large" 
                onClick={handleGetStarted}
                className="hero__cta-primary"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>
              <Button 
                variant="outline" 
                size="large" 
                onClick={handleExploreCourses}
                className="hero__cta-secondary"
              >
                Explore Courses
              </Button>
            </div>
          </div>
          
          <div className="hero__image">
            <div className="hero__image-container">
              <img 
                src="/api/placeholder/600/400" 
                alt="Students learning online"
                className="hero__main-image"
              />
              <div className="hero__floating-cards">
                <div className="hero__card hero__card--course">
                  <h4>📚 {homeData.stats.totalCourses}+ Courses</h4>
                  <p>Expert-led curriculum</p>
                </div>
                <div className="hero__card hero__card--students">
                  <h4>👥 {homeData.stats.totalStudents}+ Students</h4>
                  <p>Learning community</p>
                </div>
                <div className="hero__card hero__card--experts">
                  <h4>⭐ {homeData.stats.totalExperts}+ Experts</h4>
                  <p>Industry professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats__container">
          <div className="stats__grid">
            <div className="stat-item">
              <div className="stat-item__icon">📚</div>
              <div className="stat-item__content">
                <h3 className="stat-item__number">{homeData.stats.totalCourses}+</h3>
                <p className="stat-item__label">Quality Courses</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-item__icon">👥</div>
              <div className="stat-item__content">
                <h3 className="stat-item__number">{homeData.stats.totalStudents}+</h3>
                <p className="stat-item__label">Active Students</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-item__icon">👨‍🏫</div>
              <div className="stat-item__content">
                <h3 className="stat-item__number">{homeData.stats.totalInstructors}+</h3>
                <p className="stat-item__label">Expert Instructors</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-item__icon">⭐</div>
              <div className="stat-item__content">
                <h3 className="stat-item__number">{homeData.stats.totalExperts}+</h3>
                <p className="stat-item__label">Industry Experts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="featured-courses">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Featured Courses</h2>
            <p className="section-subtitle">
              Handpicked courses from our expert instructors
            </p>
            <Link to="/courses" className="section-link">
              View All Courses →
            </Link>
          </div>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          
          <div className="courses-grid">
            {homeData.featuredCourses.length > 0 ? (
              homeData.featuredCourses.map(course => (
                <CourseCard 
                  key={course._id || course.id}
                  course={course}
                  variant="featured"
                  showInstructor={true}
                />
              ))
            ) : (
              <div className="no-courses">
                <h3>No Courses Available</h3>
                <p>We're working on adding amazing courses for you!</p>
                <Link to="/courses">
                  <Button variant="primary">Check All Courses</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Explore Categories</h2>
            <p className="section-subtitle">
              Find the perfect course in your area of interest
            </p>
          </div>
          
          <div className="categories-grid">
            {homeData.categories.map(category => (
              <Link 
                key={category._id || category.id}
                to={`/courses?category=${category._id || category.id}`}
                className="category-card"
              >
                <div className="category-card__icon">
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="category-card__title">{category.name}</h3>
                <p className="category-card__description">
                  {category.description || `Explore ${category.name} courses`}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Courses Section */}
      {homeData.recentCourses.length > 0 && (
        <section className="recent-courses">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Recently Added</h2>
              <p className="section-subtitle">
                Fresh content from our latest course additions
              </p>
            </div>
            
            <div className="courses-grid">
              {homeData.recentCourses.slice(0, 4).map(course => (
                <CourseCard 
                  key={course._id || course.id}
                  course={course}
                  variant="recent"
                  showInstructor={true}
                />
              ))}
            </div>
            
            <div className="section-actions">
              <Link to="/courses">
                <Button variant="outline" size="large">
                  Browse All Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta">
        <div className="cta__container">
          <div className="cta__content">
            <h2 className="cta__title">Ready to Start Learning?</h2>
            <p className="cta__subtitle">
              Join thousands of students already learning on our platform
            </p>
            <div className="cta__actions">
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <Button variant="primary" size="large">
                      Start Learning Today
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button variant="outline" size="large">
                      Browse Courses
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/courses">
                    <Button variant="primary" size="large">
                      Explore Courses
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="large">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper function to get category icons
const getCategoryIcon = (categoryName) => {
  const icons = {
    'Programming': '💻',
    'Web Development': '🌐',
    'Mobile Development': '📱',
    'Data Science': '📊',
    'Machine Learning': '🤖',
    'AI': '🧠',
    'Design': '🎨',
    'UI/UX': '✨',
    'Business': '💼',
    'Marketing': '📢',
    'DevOps': '⚙️',
    'Cloud Computing': '☁️',
    'Cybersecurity': '🔒',
    'Database': '🗄️',
    'Testing': '🧪',
    'Project Management': '📋'
  };
  
  return icons[categoryName] || '📚';
};

export default Home;