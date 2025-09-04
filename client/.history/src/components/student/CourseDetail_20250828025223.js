import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import VideoPlayer from '../components/common/VideoPlayer';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { formatCurrency, formatDuration } from '../utils/formatters';
import '../styles/pages/CourseDetails.css';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, getToken } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError('Course ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching course details for ID:', id);
        
        const response = await api.courses.getCourseById(id);
        
        if (response.success && response.data) {
          const courseData = response.data.course || response.data;
          setCourse(courseData);
          
          // Check if user is enrolled
          if (user && isAuthenticated) {
            const enrollmentCheck = await checkEnrollmentStatus(courseData._id);
            setIsEnrolled(enrollmentCheck);
          }
          
          console.log('Course details loaded:', courseData.title);
        } else {
          setError('Course not found');
        }
        
      } catch (error) {
        console.error('Error fetching course:', error);
        setError(error.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user, isAuthenticated]);

  const checkEnrollmentStatus = async (courseId) => {
    if (!isAuthenticated) return false;
    
    try {
      const token = getToken();
      if (!token) return false;

      const response = await fetch(`http://localhost:5000/api/student/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const enrolledCourses = data.data.recentEnrollments || [];
          return enrolledCourses.some(enrollment => 
            enrollment.course?._id === courseId || 
            enrollment.course === courseId
          );
        }
      }
    } catch (error) {
      console.log('Could not check enrollment status:', error.message);
    }
    
    return false;
  };

  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/courses/${id}` } });
      return;
    }

    if (isEnrolled) {
      navigate(`/student/course/${id}/progress`);
      return;
    }

    if (course.instructor && user && (
      user._id === course.instructor._id || 
      user._id === course.instructor ||
      user.id === course.instructor._id ||
      user.id === course.instructor
    )) {
      navigate(`/instructor/courses`);
      return;
    }

    setEnrolling(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Enrolling in course:', id);

      if (course.price === 0) {
        // Free course enrollment
        const response = await fetch(`http://localhost:5000/api/courses/${id}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            courseId: String(course._id || id),
            paymentMethod: 'free'
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        if (result.success) {
          console.log('Successfully enrolled in free course');
          setIsEnrolled(true);
          alert('Successfully enrolled! Redirecting to course...');
          navigate(`/student/course/${id}/progress`);
        } else {
          throw new Error(result.message || 'Enrollment failed');
        }
      } else {
        // Paid course - redirect to checkout
        navigate(`/checkout/${id}`);
      }

    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error.message || 'Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSection(expandedSection === sectionIndex ? null : sectionIndex);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`star ${i < Math.floor(rating) ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Loading message="Loading course details..." />
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Course Not Found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error ? 'There was an error loading the course.' : "The course you're looking for doesn't exist."}
            </p>
            <button 
              onClick={() => navigate('/courses')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {course.category?.name || course.category || 'General'}
                </span>
                <span className="ml-2 inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {course.level || 'Beginner'}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-4">
                {course.shortDescription || course.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {renderStars(course.averageRating || 0)}
                  </div>
                  <span className="font-medium">{(course.averageRating || 0).toFixed(1)}</span>
                  <span>({course.totalReviews || 0} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>👥</span>
                  <span>{course.totalStudents || 0} students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>👨‍🏫</span>
                  <span>Created by {course.instructor?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            {course.previewVideo?.url && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <VideoPlayer
                  src={course.previewVideo.url}
                  poster={course.thumbnail?.url || course.thumbnail}
                  title="Course Preview"
                />
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h3>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {course.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span className="text-gray-700">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {course.requirements && course.requirements.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                        <ul className="space-y-1">
                          {course.requirements.map((requirement, index) => (
                            <li key={index} className="text-gray-700">• {requirement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <div className="prose max-w-none text-gray-700">
                        <p>{course.description}</p>
                      </div>
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-600">
                        {course.sections?.length || 0} sections • {course.totalLessons || 0} lessons • {formatDuration(course.totalDuration)}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {course.sections?.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleSection(sectionIndex)}
                            className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Section {sectionIndex + 1}: {section.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {section.lessons?.length || 0} lectures • {formatDuration(section.duration)}
                              </p>
                            </div>
                            <span className="text-gray-400">
                              {expandedSection === sectionIndex ? '−' : '+'}
                            </span>
                          </button>
                          
                          {expandedSection === sectionIndex && section.lessons && (
                            <div className="px-4 pb-4">
                              {section.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="flex items-center justify-between py-2 text-sm">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-gray-400">
                                      {lesson.isPreview ? '🔓' : '🔒'}
                                    </span>
                                    <span className="text-gray-700">{lesson.title}</span>
                                    {lesson.isPreview && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-gray-500">{formatDuration(lesson.duration)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-8">
                          Course curriculum will be available soon.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div>
                    <div className="flex items-start space-x-4 mb-6">
                      <img
                        src={course.instructor?.profile?.avatar || course.instructor?.avatar || '/default-avatar.png'}
                        alt={course.instructor?.name || 'Instructor'}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.instructor?.name || 'Unknown Instructor'}
                        </h3>
                        <p className="text-gray-600">
                          {course.instructor?.profile?.title || course.instructor?.title || 'Course Instructor'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <span>⭐</span>
                            <span>{course.instructor?.averageRating || 'N/A'} rating</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>👥</span>
                            <span>{course.instructor?.totalStudents || 0} students</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>📚</span>
                            <span>{course.instructor?.totalCourses || 0} courses</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none text-gray-700">
                      <p>
                        {course.instructor?.profile?.bio || 
                         course.instructor?.bio || 
                         'Bio not available for this instructor.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          {(course.averageRating || 0).toFixed(1)}
                        </span>
                        <div>
                          <div className="flex items-center mb-1">
                            {renderStars(course.averageRating || 0)}
                          </div>
                          <p className="text-gray-600">{course.totalReviews || 0} reviews</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {course.reviews && course.reviews.length > 0 ? (
                        course.reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-200 pb-6">
                            <div className="flex items-start space-x-3">
                              <img
                                src={review.student?.profile?.avatar || review.student?.avatar || '/default-avatar.png'}
                                alt={review.student?.name || 'Student'}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium text-gray-900">
                                    {review.student?.name || 'Anonymous'}
                                  </h4>
                                  <div className="flex">
                                    {renderStars(review.rating)}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No reviews yet. Be the first to review this course!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Course Thumbnail */}
              <div className="mb-6">
                <img
                  src={course.thumbnail?.url || course.thumbnail || '/placeholder-course.png'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-course.png';
                  }}
                />
              </div>

              {/* Pricing */}
              <div className="mb-6">
                {course.price === 0 ? (
                  <div className="text-3xl font-bold text-green-600">
                    Free
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatCurrency(course.discountPrice && course.discountPrice < course.price ? course.discountPrice : course.price)}
                    </div>
                    {course.discountPrice && course.discountPrice < course.price && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg text-gray-500 line-through">
                          {formatCurrency(course.price)}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                          {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% off
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purchase/Enroll Button */}
              <div className="mb-6">
                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/student/course/${course._id}/progress`)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Go to Course
                  </button>
                ) : (
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
                  >
                    {enrolling ? 'Processing...' : (course.price === 0 ? 'Enroll for Free' : 'Enroll Now')}
                  </button>
                )}
              </div>

              {/* Course Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formatDuration(course.totalDuration)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lessons:</span>
                  <span className="font-medium">{course.totalLessons || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium">{course.level || 'Beginner'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{course.language || 'English'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Certificate:</span>
                  <span className="font-medium">
                    {course.features?.certificate ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Access:</span>
                  <span className="font-medium">
                    {course.features?.lifetimeAccess ? 'Lifetime' : 'Limited'}
                  </span>
                </div>
              </div>

              {/* Course Features */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">This course includes:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-500">📹</span>
                    <span>On-demand video</span>
                  </li>
                  {course.features?.downloadableResources && (
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-500">📁</span>
                      <span>Downloadable resources</span>
                    </li>
                  )}
                  {course.features?.mobileAccess && (
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-500">📱</span>
                      <span>Mobile access</span>
                    </li>
                  )}
                  {course.features?.certificate && (
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-500">🏆</span>
                      <span>Certificate of completion</span>
                    </li>
                  )}
                  {course.features?.lifetimeAccess && (
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-500">♾️</span>
                      <span>Full lifetime access</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetails;