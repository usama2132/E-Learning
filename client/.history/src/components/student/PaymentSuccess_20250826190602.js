import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import '../../styles/dashboards/PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  
  const course = location.state?.course;
  const transactionId = location.state?.transactionId;

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Set enrollment details from location state or defaults
      setEnrollmentDetails({
        course: course || {
          title: 'Course Enrollment',
          instructor: { name: 'Instructor' },
          price: 0,
          thumbnail: '/placeholder-course.png'
        },
        transactionId: transactionId || 'DEMO_TRANSACTION',
        enrollmentDate: new Date(),
        accessInfo: {
          lifetimeAccess: true,
          certificateEligible: true,
          downloadableResources: true,
          mobileAccess: true
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [course, transactionId]);

  const handleStartLearning = () => {
    if (course && course._id) {
      navigate(`/student/course/${course._id}/progress`);
    } else {
      navigate('/student/learning');
    }
  };

  const handleViewAllCourses = () => {
    navigate('/student/learning');
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert('Receipt download functionality will be implemented with PDF generation service');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your enrollment...</p>
        </div>
      </div>
    );
  }

  if (!enrollmentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Information Missing</h2>
          <p className="text-gray-600 mb-6">We couldn't find your payment details.</p>
          <Button onClick={() => navigate('/courses')} variant="primary">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-600">
              Congratulations! You're now enrolled in the course.
            </p>
          </div>

          {/* Course Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-4">
              <img
                src={enrollmentDetails.course.thumbnail?.url || enrollmentDetails.course.thumbnail}
                alt={enrollmentDetails.course.title}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-course.png';
                }}
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {enrollmentDetails.course.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  By {enrollmentDetails.course.instructor?.name || 'Unknown Instructor'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <span>💰</span>
                    <span>{formatCurrency(enrollmentDetails.course.price || 0)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>📅</span>
                    <span>{enrollmentDetails.enrollmentDate.toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-medium text-gray-900">{enrollmentDetails.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Date</p>
                <p className="font-medium text-gray-900">
                  {enrollmentDetails.enrollmentDate.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium text-gray-900">Credit Card</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(enrollmentDetails.course.price || 0)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleDownloadReceipt}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Download Receipt
              </button>
            </div>
          </div>

          {/* Course Access Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What You Get</h3>
            <div className="space-y-3">
              {enrollmentDetails.accessInfo.lifetimeAccess && (
                <div className="flex items-center space-x-3">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Lifetime access to course content</span>
                </div>
              )}
              {enrollmentDetails.accessInfo.certificateEligible && (
                <div className="flex items-center space-x-3">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Certificate of completion</span>
                </div>
              )}
              {enrollmentDetails.accessInfo.downloadableResources && (
                <div className="flex items-center space-x-3">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Downloadable resources</span>
                </div>
              )}
              {enrollmentDetails.accessInfo.mobileAccess && (
                <div className="flex items-center space-x-3">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Mobile and desktop access</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">30-day money-back guarantee</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              onClick={handleStartLearning}
              variant="primary"
              size="large"
              className="flex-1"
            >
              Start Learning Now
            </Button>
            <Button
              onClick={handleViewAllCourses}
              variant="outline"
              size="large"
              className="flex-1"
            >
              View My Courses
            </Button>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <h4 className="font-medium text-blue-900">Getting Started Tips</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Access your course anytime from the "My Learning" section</li>
                  <li>• Take notes and bookmarks to track your progress</li>
                  <li>• Complete all lessons to earn your certificate</li>
                  <li>• Join course discussions to connect with other students</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Support Information */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Need help? Contact our support team at{' '}
              <a href="mailto:support@yourplatform.com" className="text-blue-600 underline">
                support@yourplatform.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;