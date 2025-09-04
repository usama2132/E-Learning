import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import ProgressBar from './ProgressBar';

const StudentProgress = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/student/enrolled-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses || []);
      }
    } catch (error) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="student-progress-container p-6">
      <h1 className="text-2xl font-bold mb-6">My Learning Progress</h1>
      
      {enrolledCourses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg mb-4">No courses enrolled yet</h3>
          <button 
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {enrolledCourses.map(course => (
            <div key={course._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <p className="text-gray-600">{course.instructor?.name}</p>
                </div>
                <button
                  onClick={() => navigate(`/student/course/${course._id}/progress`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  View Details
                </button>
              </div>
              
              <ProgressBar 
                current={course.progress?.completedLessons || 0} 
                total={course.totalLessons || 0}
                showPercentage={true}
              />
              
              <div className="mt-4 text-sm text-gray-600">
                <span>{course.progress?.completedLessons || 0} of {course.totalLessons || 0} lessons completed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentProgress;