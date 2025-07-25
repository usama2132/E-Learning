import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import VideoPlayer from '../components/common/VideoPlayer';
import PurchaseButton from '../components/student/PurchaseButton';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import '../styles/pages/CourseDetails.css';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCourseById } = useCourses();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(id);
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, getCourseById]);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  if (loading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/courses')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
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
                  {course.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span>{course.rating}</span>
                  <span>({course.reviewCount} reviews)</span>
                </div>
                <div>{course.studentsEnrolled} students</div>
                <div>Created by {course.instructor.name}</div>
                <div>Last updated {new Date(course.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Video Preview */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <VideoPlayer
                src={course.previewVideo}
                poster={course.thumbnail}
                title="Course Preview"
              />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h3>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {course.learningOutcomes?.map((outcome, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-gray-700">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                      <ul className="space-y-1">
                        {course.requirements?.map((requirement, index) => (
                          <li key={index} className="text-gray-700">• {requirement}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <div className="prose max-w-none text-gray-700">
                        {course.fullDescription}
                      </div>
                    </div>
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-600">
                        {course.sections?.length} sections • {course.totalLectures} lectures • {course.totalDuration}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {course.sections?.map((section, index) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Section {index + 1}: {section.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {section.lectures.length} lectures • {section.duration}
                              </p>
                            </div>
                            <span className="text-gray-400">
                              {expandedSection === section.id ? '−' : '+'}
                            </span>
                          </button>
                          
                          {expandedSection === section.id && (
                            <div className="px-4 pb-4">
                              {section.lectures.map((lecture) => (
                                <div key={lecture.id} className="flex items-center justify-between py-2 text-sm">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-gray-400">▷</span>
                                    <span className="text-gray-700">{lecture.title}</span>
                                  </div>
                                  <span className="text-gray-500">{lecture.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div>
                    <div className="flex items-start space-x-4 mb-6">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{course.instructor.name}</h3>
                        <p className="text-gray-600">{course.instructor.title}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>⭐ {course.instructor.rating} rating</span>
                          <span>👥 {course.instructor.students} students</span>
                          <span>📚 {course.instructor.courses} courses</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none text-gray-700">
                      {course.instructor.bio}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-4xl font-bold text-gray-900">{course.rating}</span>
                        <div>
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-yellow-500">★</span>
                            ))}
                          </div>
                          <p className="text-gray-600">{course.reviewCount} reviews</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {course.reviews?.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-start space-x-3">
                            <img
                              src={review.user.avatar}
                              alt={review.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                                <div className="flex">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <span key={i} className="text-yellow-500 text-sm">★</span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${course.price}
                </div>
                {course.originalPrice && (
                  <div className="text-lg text-gray-500 line-through">
                    ${course.originalPrice}
                  </div>
                )}
              </div>

              <PurchaseButton course={course} />

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{course.totalDuration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lectures:</span>
                  <span className="font-medium">{course.totalLectures}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Certificate:</span>
                  <span className="font-medium">Yes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Access:</span>
                  <span className="font-medium">Lifetime</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">This course includes:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-500">📹</span>
                    <span>On-demand video</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-500">📝</span>
                    <span>Assignments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-500">📱</span>
                    <span>Mobile access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-500">🏆</span>
                    <span>Certificate of completion</span>
                  </li>
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
