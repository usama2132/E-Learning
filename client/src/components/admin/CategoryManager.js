import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import '../../styles/dashboards/CategoryManager.css';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#007bff'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockCategories = [
        { id: 1, name: 'Web Development', description: 'Learn web technologies', icon: 'code', color: '#007bff', courseCount: 15 },
        { id: 2, name: 'Data Science', description: 'Master data analysis', icon: 'chart', color: '#28a745', courseCount: 8 },
        { id: 3, name: 'Mobile Development', description: 'Build mobile apps', icon: 'mobile', color: '#ffc107', courseCount: 12 },
        { id: 4, name: 'Design', description: 'UI/UX and graphic design', icon: 'palette', color: '#e83e8c', courseCount: 6 }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingCategory) {
        // Update category
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...formData }
            : cat
        ));
      } else {
        // Create new category
        const newCategory = {
          id: Date.now(),
          ...formData,
          courseCount: 0
        };
        setCategories(prev => [...prev, newCategory]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#007bff'
    });
  };

  const iconOptions = [
    { value: 'code', label: 'Code' },
    { value: 'chart', label: 'Chart' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'palette', label: 'Palette' },
    { value: 'book', label: 'Book' },
    { value: 'briefcase', label: 'Business' },
    { value: 'camera', label: 'Photography' },
    { value: 'music', label: 'Music' }
  ];

  if (loading && categories.length === 0) {
    return <Loading />;
  }

  return (
    <div className="category-manager">
      <div className="page-header">
        <h2>Category Management</h2>
        <Button onClick={() => setShowModal(true)}>
          Add New Category
        </Button>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-header">
              <div className="category-icon" style={{ backgroundColor: category.color }}>
                <span>{category.icon}</span>
              </div>
              <div className="category-actions">
                <button onClick={() => handleEdit(category)} className="edit-btn">
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(category.id)} 
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="category-content">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="category-stats">
                <span className="course-count">{category.courseCount} courses</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No categories found</h3>
          <p>Start by creating your first category</p>
          <Button onClick={() => setShowModal(true)}>
            Create Category
          </Button>
        </div>
      )}

      {showModal && (
        <Modal
          title={editingCategory ? 'Edit Category' : 'Create New Category'}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit}>
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter category name"
            />

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Icon</label>
              <select name="icon" value={formData.icon} onChange={handleInputChange}>
                <option value="">Select an icon</option>
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="#007bff"
                />
              </div>
            </div>

            <div className="modal-actions">
              <Button type="submit" loading={loading}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CategoryManager;
