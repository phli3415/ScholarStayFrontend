import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AddHousePage.css';

const AddHousePage = () => {
  const [formData, setFormData] = useState({
    province: '',
    city: '',
    street: '',
    house_number: '',
    monthly_rent: '',
    has_kitchen: false,
    has_washer: false,
    has_parking: false,
    distance_to_university: '',
    landlord_phone_number: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is not logged in
    if (!session || !session.user) {
      navigate('/login');
    }
  }, [session, navigate]);

  useEffect(() => {
    // Validate the form whenever formData or image changes
    const validateForm = () => {
      const { province, city, street, house_number, monthly_rent, distance_to_university, landlord_phone_number, description } = formData;
      const isDataComplete = province && city && street && house_number && monthly_rent && distance_to_university && landlord_phone_number && description && image;
      setIsFormValid(!!isDataComplete);
    };
    validateForm();
  }, [formData, image]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please fill in all fields and upload an image.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const submissionData = new FormData();
    // Append all form fields to FormData
    Object.keys(formData).forEach(key => {
        submissionData.append(key, formData[key]);
    });
    submissionData.append('image', image);
    submissionData.append('is_rented', 'false'); // Default value as requested

    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/houses/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.token}`,
                // 'Content-Type': 'multipart/form-data' is set automatically by the browser with FormData
            },
            body: submissionData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add the house. Please try again.');
        }

        // On success, maybe show a success message and redirect
        alert('House added successfully!');
        navigate('/');

    } catch (err) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="add-house-container">
      <div className="add-house-card">
        <h2>List a New Property</h2>
        <p>Fill out the details below to add a new house to the listings.</p>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Text Inputs */}
          <div className="form-grid">
            <div className="input-group">
                <label htmlFor="province">Province</label>
                <input type="text" name="province" value={formData.province} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label htmlFor="city">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label htmlFor="street">Street</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label htmlFor="house_number">House/Apt Number</label>
                <input type="text" name="house_number" value={formData.house_number} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label htmlFor="monthly_rent">Monthly Rent ($)</label>
                <input type="number" name="monthly_rent" value={formData.monthly_rent} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label htmlFor="distance_to_university">Distance to University (km)</label>
                <input type="number" name="distance_to_university" value={formData.distance_to_university} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label htmlFor="landlord_phone_number">Landlord's Phone</label>
                <input type="tel" name="landlord_phone_number" value={formData.landlord_phone_number} onChange={handleChange} required />
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
              <label htmlFor="description">Description</label>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required></textarea>
          </div>

          {/* Checkboxes */}
          <div className="checkbox-group">
            <label><input type="checkbox" name="has_kitchen" checked={formData.has_kitchen} onChange={handleChange} /> Has Kitchen</label>
            <label><input type="checkbox" name="has_washer" checked={formData.has_washer} onChange={handleChange} /> Has Washer</label>
            <label><input type="checkbox" name="has_parking" checked={formData.has_parking} onChange={handleChange} /> Has Parking</label>
          </div>

          {/* Image Upload */}
          <div className="input-group">
              <label htmlFor="image">Property Image</label>
              <input type="file" name="image" accept="image/*" onChange={handleImageChange} required />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="submit-button" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Add House'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHousePage;
