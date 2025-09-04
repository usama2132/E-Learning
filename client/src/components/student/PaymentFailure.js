import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import '../../styles/dashboards/PaymentFailure.css';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const course = location.state?.course;
  const error = location.state?.error || 'Payment processing failed';

  const handleTryAgain = () => {
    if (course && course._id) {
      navigate(`/checkout/${course._id}`);
    } else {
      navigate('/courses');
    }
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or redirect to support page
    window.location.href = 'mailto:support@yourplatform.com?subject=Payment Issue&body=I encountered an issue with my payment. Please help me resolve this.';
  };

  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  const getErrorMessage = () => {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('declined')) {
      return {
        title: 'Payment Declined',
        message: 'Your payment was declined by your bank. Please check your card details or try a different payment method.',
        icon: '❌',
        suggestions: [
          'Verify your card number, expiry date, and CVV',
          'Check if your card has sufficient funds',
          'Try using a different payment method',
          'Contact your bank if the issue persists'
        ]
      };
    } else if (lowerError.includes('insufficient')) {
      return {
        title: 'Insufficient Funds',
        message: 'Your account doesn\'t have sufficient funds to complete this transaction.',
        icon: '💳',
        suggestions: [
          'Add funds to your account',
          'Try a different payment method',
          'Use a different card'
        ]
      };
    } else if (lowerError.includes('expired')) {
      return {
        title: 'Card Expired',
        message: 'The payment card you\'re trying to use has expired.',
        icon: '📅',
        suggestions: [
          'Update your card expiry date',
          'Use a different card',
          'Contact your bank for a replacement card'
        ]
      };
    } else if (lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        title: 'Connection Error',
        message: 'There was a network error while processing your payment.',
        icon: '🌐',
        suggestions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Use a different device or browser'
        ]
      };
    } else {
      return {
        title: 'Payment Failed',
        message: 'We encountered an issue while processing your payment.',
        icon: '⚠️',
        suggestions: [
          'Double-check your payment information',
          'Try a different payment method',
          'Contact support if the problem continues'
        ]
      };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <span className="text-4xl">{errorInfo.icon}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{errorInfo.title}</h1>
            <p className="text-lg text-gray-600">
              {errorInfo.message}
            </p>
          </div>

          {/* Course Information */}
          {course && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
              <div className="flex items-start space-x-4">
                <img
                  src={course.thumbnail?.url || course.thumbnail}
                  alt={course.title}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-course.png';
                  }}
                />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-1">
                    {course.title}
                  </h4>
                  <p className="text-gray-600 mb-2">
                    By {course.instructor?.name || 'Unknown Instructor'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <span>💰</span>
                      <span>{formatCurrency(course.price || 0)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{course.averageRating?.toFixed(1) || 'N/A'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>{course.totalStudents || 0} students</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happened?</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-3">Suggested Solutions:</h4>
            <ul className="space-y-2">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button
              onClick={handleTryAgain}
              variant="primary"
              size="large"
              className="flex-1"
            >
              Try Again
            </Button>
            <Button
              onClick={handleContactSupport}
              variant="outline"
              size="large"
              className="flex-1"
            >
              Contact Support
            </Button>
          </div>

          {/* Alternative Options */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alternative Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Browse Other Courses</h4>
                  <p className="text-sm text-gray-600">Explore our course catalog while you resolve the payment issue</p>
                </div>
                <Button
                  onClick={handleBrowseCourses}
                  variant="outline"
                  size="small"
                >
                  Browse Courses
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Save for Later</h4>
                  <p className="text-sm text-gray-600">Add this course to your wishlist to purchase later</p>
                </div>
                <Button
                  onClick={() => {
                    // In a real app, this would add to wishlist
                    alert('Course saved to wishlist!');
                  }}
                  variant="outline"
                  size="small"
                >
                  Add to Wishlist
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Payment Help</h4>
                  <p className="text-sm text-gray-600">Get assistance with payment methods and billing</p>
                </div>
                <Button
                  onClick={() => {
                    window.open('https://stripe.com/docs/testing#cards', '_blank');
                  }}
                  variant="outline"
                  size="small"
                >
                  Payment FAQ
                </Button>
              </div>
            </div>
          </div>

          {/* Common Payment Issues */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Common Payment Issues</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-blue-900">Card Declined</h4>
                <p className="text-blue-800">Usually due to insufficient funds, expired card, or bank security measures</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Invalid Card Information</h4>
                <p className="text-blue-800">Double-check your card number, expiry date, and CVV code</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">International Payments</h4>
                <p className="text-blue-800">Some banks block international transactions - contact your bank if needed</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Browser Issues</h4>
                <p className="text-blue-800">Try clearing your browser cache or using a different browser</p>
              </div>
            </div>
          </div>

          {/* Test Card Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">For Testing Purposes</h3>
            <p className="text-yellow-800 mb-3">
              If you're testing the payment system, you can use these test card numbers:
            </p>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center justify-between bg-yellow-100 p-2 rounded">
                <span className="text-yellow-900">4242 4242 4242 4242</span>
                <span className="text-yellow-700">Visa (Success)</span>
              </div>
              <div className="flex items-center justify-between bg-yellow-100 p-2 rounded">
                <span className="text-yellow-900">4000 0000 0000 0002</span>
                <span className="text-yellow-700">Visa (Declined)</span>
              </div>
              <div className="flex items-center justify-between bg-yellow-100 p-2 rounded">
                <span className="text-yellow-900">4000 0000 0000 9995</span>
                <span className="text-yellow-700">Visa (Insufficient Funds)</span>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              Use any future expiry date (MM/YY) and any 3-digit CVV
            </p>
          </div>

          {/* Support Information */}
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Still Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Our support team is here to help you resolve any payment issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@yourplatform.com"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <span>📧</span>
                  <span>support@yourplatform.com</span>
                </a>
                <a
                  href="tel:+1-800-555-0123"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <span>📞</span>
                  <span>1-800-555-0123</span>
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Support hours: Monday - Friday, 9 AM - 6 PM EST
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;