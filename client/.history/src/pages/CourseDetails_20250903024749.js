import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import VideoPlayer from '../components/common/VideoPlayer';
import PurchaseButton from '../components/student/PurchaseButton';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import { useTheme } from '../context/ThemeContext';
import '../styles/pages/CourseDetails.css';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { fetchCourseById } = useCourses();
  const { isDarkMode } = useTheme();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [courseVideos, setCourseVideos] = useState([]);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course details for ID:', id);
        const courseData = await fetchCourseById(id);
        console.log('Course data received:', courseData);
        setCourse(courseData);
        
        // Fetch course videos if available
        if (courseData && user) {
          await fetchCourseVideos(courseData._id || courseData.id);
        }
        
        // Check enrollment status if user is logged in
        if (user && courseData) {
          setCheckingEnrollment(true);
          const enrolled = await checkEnrollmentStatus(courseData._id || courseData.id);
          setIsEnrolled(enrolled);
          setCheckingEnrollment(false);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, fetchCourseById, user]);

  const fetchCourseVideos = async (courseId) => {
    try {
      const token = getToken();
      if (!token) return;

      console.log('Fetching course videos for course:', courseId);
      
      const response = await fetch(`${API_BASE_URL}/courses/videos/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.videos) {
          console.log(`Found ${data.data.videos.length} videos for course`);
          setCourseVideos(data.data.videos);
        }
      }
    } catch (error) {
      console.error('Error fetching course videos:', error);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const checkEnrollmentStatus = async (courseId) => {
    try {
      const token = getToken();
      if (!token || !user) return false;

      console.log('Checking enrollment status for course:', courseId);

      const response = await fetch(`${API_BASE_URL}/student/enrolled-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.courses) {
          const enrolled = data.data.courses.some(enrolledCourse => 
            (enrolledCourse._id === courseId || enrolledCourse.id === courseId ||
             enrolledCourse.course?._id === courseId || enrolledCourse.course?.id === courseId)
          );
          console.log('Enrollment status:', enrolled);
          return enrolled;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  };

  // Enhanced function to get preview video
  const getPreviewVideo = () => {
    // Check if course has a specific preview video
    if (course.previewVideo) {
      return course.previewVideo;
    }

    // Look for preview video in sections/lessons
    if (course.sections && course.sections.length > 0) {
      for (const section of course.sections) {
        if (section.lessons && section.lessons.length > 0) {
          for (const lesson of section.lessons) {
            if (lesson.videos && lesson.videos.length > 0) {
              const previewVideo = lesson.videos.find(video => video.isPreview);
              if (previewVideo) {
                return previewVideo.url || previewVideo.videoUrl;
              }
            }
          }
        }
      }
      
      // If no preview found, use first video as preview
      const firstSection = course.sections[0];
      if (firstSection.lessons && firstSection.lessons[0] && 
          firstSection.lessons[0].videos && firstSection.lessons[0].videos[0]) {
        return firstSection.lessons[0].videos[0].url || firstSection.lessons[0].videos[0].videoUrl;
      }
    }

    // Check course videos array
    if (courseVideos.length > 0) {
      const previewVideo = courseVideos.find(video => video.settings?.isPreview);
      if (previewVideo) {
        return previewVideo.videoUrl;
      }
      // Use first video as fallback
      return courseVideos[0].videoUrl;
    }

    return null;
  };

  // Enhanced function to get instructor info
  const getInstructorInfo = () => {
    if (course.instructor) {
      if (typeof course.instructor === 'object') {
        return {
          name: course.instructor.name || 
                `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() ||
                course.instructor.email?.split('@')[0] || 'Unknown Instructor',
          avatar: course.instructor.profile?.avatar || course.instructor.avatar,
          title: course.instructor.title || course.instructor.profile?.title || 'Course Instructor',
          bio: course.instructor.profile?.bio || course.instructor.bio,
          rating: course.instructor.rating || 4.5,
          students: course.instructor.totalStudents || 0,
          courses: course.instructor.totalCourses || 1
        };
      }
    }
    
    return {
      name: course.instructorName || 'Unknown Instructor',
      avatar: null,
      title: 'Course Instructor',
      bio: 'No instructor information available.',
      rating: 4.5,
      students: 0,
      courses: 1
    };
  };

  // Enhanced curriculum rendering with video data
  const renderCurriculum = () => {
    let sections = course.sections || [];
    
    // If no sections but we have videos, create sections from videos
    if (sections.length === 0 && courseVideos.length > 0) {
      const videoSections = {};
      
      courseVideos.forEach((video) => {
        const sectionNum = video.sectionNumber || 1;
        if (!videoSections[sectionNum]) {
          videoSections[sectionNum] = {
            _id: `section_${sectionNum}`,
            title: `Section ${sectionNum}`,
            lessons: []
          };
        }
        
        videoSections[sectionNum].lessons.push({
          _id: video._id,
          title: video.title,
          duration: video.duration || 0,
          isPreview: video.settings?.isPreview || false,
          videos: [video]
        });
      });
      
      sections = Object.values(videoSections);
    }

    if (sections.length === 0) {
      return (
        <div className="no-curriculum">
          <p>Curriculum will be available after enrollment.</p>
        </div>
      );
    }

    return sections.map((section, index) => (
      <div key={section._id || section.id || index} className="section-item">
        <button
          onClick={() => toggleSection(section._id || section.id || index)}
          className="section-header"
        >
          <div className="section-info">
            <h4 className="section-title">
              Section {index + 1}: {section.title}
            </h4>
            <p className="section-meta">
              {(section.lessons || []).length} lectures • {section.duration || calculateSectionDuration(section)}
            </p>
          </div>
          <span className="expand-icon">
            {expandedSection === (section._id || section.id || index) ? '−' : '+'}
          </span>
        </button>
        
        {expandedSection === (section._id || section.id || index) && (
          <div className="section-content">
            {(section.lessons || []).map((lesson, lectureIndex) => (
              <div key={lesson._id || lesson.id || lectureIndex} className="lecture-item">
                <div className="lecture-info">
                  <span className="play-icon">▷</span>
                  <span className="lecture-title">{lesson.title}</span>
                  {lesson.isPreview && <span className="preview-badge">Preview</span>}
                </div>
                <span className="lecture-duration">
                  {formatDuration(lesson.duration || 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  const calculateSectionDuration = (section) => {
    if (!section.lessons) return '0 min';
    
    const totalMinutes = section.lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
    
    return formatDuration(totalMinutes);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = Math.round(minutes % 60);
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const getTotalStats = () => {
    let totalSections = course.sections?.length || 0;
    let totalLectures = 0;
    let totalDuration = 0;

    if (course.sections && course.sections.length > 0) {
      course.sections.forEach(section => {
        if (section.lessons) {
          totalLectures += section.lessons.length;
          section.lessons.forEach(lesson => {
            totalDuration += lesson.duration || 0;
          });
        }
      });
    } else if (courseVideos.length > 0) {
      totalLectures = courseVideos.length;
      totalDuration = courseVideos.reduce((total, video) => total + (video.duration || 0), 0);
      totalSections = Math.max(1, new Set(courseVideos.map(v => v.sectionNumber || 1)).size);
    } else {
      totalLectures = course.totalLessons || course.totalLectures || 0;
      totalDuration = course.totalDuration || (course.estimatedHours * 60) || 0;
      totalSections = 1;
    }

    return { totalSections, totalLectures, totalDuration };
  };

  if (loading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="course-details-container">
        <Navbar />
        <div className="course-not-found">
          <div className="not-found-content">
            <div className="not-found-icon">📚</div>
            <h1>Course Not Found</h1>
            <p>The course you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/courses')}
              className="browse-courses-btn"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const instructorInfo = getInstructorInfo();
  const stats = getTotalStats();
  const previewVideoUrl = getPreviewVideo();

  return (
    <div className="course-details-container">
      <Navbar />
      
      <main className="course-details-main">
        <div className="course-details-grid">
          {/* Main Content */}
          <div className="course-main-content">
            {/* Course Header */}
            <div className="course-header-card">
              <div className="course-category">
                <span className="category-badge">
                  {typeof course.category === 'object' ? course.category.name : course.category || 'General'}
                </span>
              </div>
              
              <h1 className="course-title">{course.title}</h1>
              <p className="course-description">{course.shortDescription || course.description}</p>
              
              <div className="course-meta">
                <div className="rating-info">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.floor(course.averageRating || 4.5) ? 'filled' : ''}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">
                    {(course.averageRating || course.rating || 4.5).toFixed(1)}
                  </span>
                  <span className="reviews-count">
                    ({course.totalReviews || course.reviewCount || 0} reviews)
                  </span>
                </div>
                
                <div className="meta-divider">•</div>
                <div className="students-count">
                  👥 {course.totalEnrollments || course.totalStudents || course.studentsEnrolled || 0} students
                </div>
                
                <div className="meta-divider">•</div>
                <div className="instructor-name">
                  Created by {instructorInfo.name}
                </div>
                
                <div className="meta-divider">•</div>
                <div className="last-updated">
                  Updated {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Video Preview */}
            {previewVideoUrl && (
              <div className="video-preview-card">
                <VideoPlayer
                  src={previewVideoUrl}
                  poster={course.thumbnail?.url || course.thumbnail}
                  title="Course Preview"
                />
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="course-tabs-container">
              <div className="tabs-navigation">
                {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="tab-panel overview-panel">
                    {(course.learningOutcomes || course.learningObjectives || []).length > 0 && (
                      <div className="learning-outcomes-section">
                        <h3 className="section-title">What you'll learn</h3>
                        <div className="outcomes-grid">
                          {(course.learningOutcomes || course.learningObjectives || []).map((outcome, index) => (
                            <div key={index} className="outcome-item">
                              <span className="check-icon">✓</span>
                              <span className="outcome-text">{outcome}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {course.requirements && course.requirements.length > 0 && (
                      <div className="requirements-section">
                        <h3 className="section-title">Requirements</h3>
                        <ul className="requirements-list">
                          {course.requirements.map((requirement, index) => (
                            <li key={index} className="requirement-item">
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="full-description-section">
                      <h3 className="section-title">Description</h3>
                      <div className="description-content">
                        {course.fullDescription || course.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div className="tab-panel curriculum-panel">
                    <div className="curriculum-stats">
                      <span className="stat-item">
                        {stats.totalSections} sections
                      </span>
                      <span className="stat-divider">•</span>
                      <span className="stat-item">
                        {stats.totalLectures} lectures
                      </span>
                      <span className="stat-divider">•</span>
                      <span className="stat-item">
                        {formatDuration(stats.totalDuration)}
                      </span>
                    </div>
                    
                    <div className="sections-list">
                      {renderCurriculum()}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div className="tab-panel instructor-panel">
                    <div className="instructor-header">
                      <img
                        src={instructorInfo.avatar || '/default-avatar.jpg'}
                        alt={instructorInfo.name}
                        className="instructor-avatar"
                        onError={(e) => {
                          e.target.src = '/default-avatar.jpg';
                        }}
                      />
                      <div className="instructor-details">
                        <h3 className="instructor-name">{instructorInfo.name}</h3>
                        <p className="instructor-title">{instructorInfo.title}</p>
                        <div className="instructor-stats">
                          <span className="stat">⭐ {instructorInfo.rating} rating</span>
                          <span className="stat">👥 {instructorInfo.students} students</span>
                          <span className="stat">📚 {instructorInfo.courses} courses</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="instructor-bio">
                      {instructorInfo.bio}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="tab-panel reviews-panel">
                    <div className="reviews-summary">
                      <div className="rating-overview">
                        <span className="overall-rating">
                          {(course.averageRating || course.rating || 4.5).toFixed(1)}
                        </span>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="star filled">★</span>
                          ))}
                        </div>
                        <p className="total-reviews">
                          {course.totalReviews || course.reviewCount || 0} reviews
                        </p>
                      </div>
                    </div>
                    
                    <div className="reviews-list">
                      {course.reviews && course.reviews.length > 0 ? (
                        course.reviews.map((review, index) => (
                          <div key={review.id || review._id || index} className="review-item">
                            <div className="review-header">
                              <img
                                src={review.user?.avatar || '/default-avatar.jpg'}
                                alt={review.user?.name || 'Student'}
                                className="reviewer-avatar"
                                onError={(e) => {
                                  e.target.src = '/default-avatar.jpg';
                                }}
                              />
                              <div className="reviewer-info">
                                <h4 className="reviewer-name">
                                  {review.user?.name || 'Anonymous Student'}
                                </h4>
                                <div className="review-rating">
                                  {[...Array(review.rating || 5)].map((_, i) => (
                                    <span key={i} className="star">★</span>
                                  ))}
                                </div>
                                <p className="review-date">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="no-reviews">
                          <p>No reviews yet. Be the first to review this course!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            <div className="pricing-card">
              <div className="price-section">
                <div className="current-price">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <div className="original-price">
                    ${course.originalPrice}
                  </div>
                )}
                {course.discountPrice && course.discountPrice < course.price && (
                  <div className="discount-badge">
                    {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                  </div>
                )}
              </div>

              {checkingEnrollment ? (
                <button className="purchase-button" disabled>
                  Checking enrollment...
                </button>
              ) : isEnrolled ? (
                <button 
                  className="purchase-button enrolled"
                  onClick={() => navigate(`/student/course/${course._id || course.id}/progress`)}
                >
                  Continue Learning
                </button>
              ) : (
                <PurchaseButton course={course} />
              )}

              <div className="course-features">
                <div className="feature-item">
                  <span className="feature-label">Duration:</span>
                  <span className="feature-value">
                    {formatDuration(stats.totalDuration)}
                  </span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Lectures:</span>
                  <span className="feature-value">{stats.totalLectures}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Level:</span>
                  <span className="feature-value">{course.level || 'Beginner'}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Certificate:</span>
                  <span className="feature-value">
                    {course.certificateEligible !== false ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Access:</span>
                  <span className="feature-value">Lifetime</span>
                </div>
              </div>

              <div className="includes-section">
                <h4 className="includes-title">This course includes:</h4>
                <ul className="includes-list">
                  <li className="include-item">
                    <span className="include-icon">📹</span>
                    <span>On-demand video</span>
                  </li>
                  <li className="include-item">
                    <span className="include-icon">📝</span>
                    <span>Assignments</span>
                  </li>
                  <li className="include-item">
                    <span className="include-icon">📱</span>
                    <span>Mobile access</span>
                  </li>
                  <li className="include-item">
                    <span className="include-icon">🏆</span>
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;