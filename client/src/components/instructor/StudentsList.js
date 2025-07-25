import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import '../../styles/dashboards/StudentsList.css';

const StudentsList = ({ courseId }) => {
  const { user } = useAuth();
  const { apiCall, loading } = useApi();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortBy, setSortBy] = useState('enrollmentDate');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, sortBy, sortOrder]);

  const fetchStudents = async () => {
    try {
      const endpoint = courseId 
        ? `/instructor/${user.id}/courses/${courseId}/students`
        : `/instructor/${user.id}/students`;
      
      const response = await apiCall(endpoint, 'GET');
      
      if (response.success) {
        setStudents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.courseName && student.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort students
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'enrollmentDate' || sortBy === 'lastAccessed') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === 'progress') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStudents(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const sendMessage = async (studentId) => {
    try {
      // Navigate to messaging or open message modal
      console.log('Send message to student:', studentId);
      // Implement messaging functionality
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const exportStudentData = () => {
    const csvContent = [
      ['Name', 'Email', 'Course', 'Enrollment Date', 'Progress', 'Last Accessed'],
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        student.courseName || 'All Courses',
        new Date(student.enrollmentDate).toLocaleDateString(),
        `${student.progress}%`,
        new Date(student.lastAccessed).toLocaleDateString()
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600 bg-green-100';
    if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (lastAccessed) => {
    const daysSinceAccess = Math.floor((Date.now() - new Date(lastAccessed)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceAccess <= 1) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
    } else if (daysSinceAccess <= 7) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Recent</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>;
    }
  };

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  if (loading) return <Loading />;

  return (
    <div className="students-list">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {courseId ? 'Course Students' : 'All Students'}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredStudents.length} total)
            </span>
          </h2>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportStudentData}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search students by name, email, or course..."
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="enrollmentDate-desc">Newest First</option>
              <option value="enrollmentDate-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="progress-desc">Highest Progress</option>
              <option value="progress-asc">Lowest Progress</option>
              <option value="lastAccessed-desc">Recently Active</option>
              <option value="lastAccessed-asc">Least Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {currentStudents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm ? 'No students match your search.' : 'No students enrolled yet.'}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Student Name
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  {!courseId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                  )}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('enrollmentDate')}
                  >
                    Enrolled
                    {sortBy === 'enrollmentDate' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('progress')}
                  >
                    Progress
                    {sortBy === 'progress' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={`${student.id}-${student.courseId || 'all'}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3B82F6&color=fff`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email}
                    </td>
                    {!courseId && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.courseName || 'Multiple Courses'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getProgressColor(student.progress)}`}>
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student.lastAccessed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStudentClick(student)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => sendMessage(student.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Message
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Student Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStudent(null);
        }}
        title="Student Details"
      >
        {selectedStudent && (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=3B82F6&color=fff`}
                alt=""
              />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedStudent.name}</h3>
                <p className="text-sm text-gray-500">{selectedStudent.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Enrollment Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Enrolled:</span> {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Last Accessed:</span> {new Date(selectedStudent.lastAccessed).toLocaleDateString()}</p>
                  {selectedStudent.courseName && (
                    <p><span className="font-medium">Course:</span> {selectedStudent.courseName}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Progress Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Overall Progress:</span> {selectedStudent.progress}%</p>
                  <p><span className="font-medium">Lessons Completed:</span> {selectedStudent.completedLessons || 0} / {selectedStudent.totalLessons || 0}</p>
                  <p><span className="font-medium">Time Spent:</span> {selectedStudent.timeSpent || '0h 0m'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => sendMessage(selectedStudent.id)}
              >
                Send Message
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedStudent(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsList;
