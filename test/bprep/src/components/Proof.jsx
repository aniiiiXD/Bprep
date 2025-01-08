import React, { useState, useEffect } from 'react';
import { Edit, Save } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bprep-backend-cikh309f6-aniiiixds-projects.vercel.app/api',
  withCredentials: true
});

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    CATscore: '0',
    QApercentile: '0',
    DILRpercentile: '0',
    VARCpercentile: '0',
    BSchools: '',
    WorkExp: '',
    gradSchool: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/profile');
      if (response.data.success) {
        // Convert null/undefined values to empty strings or '0'
        const formattedData = Object.keys(profileData).reduce((acc, key) => {
          const value = response.data.profile[key];
          acc[key] = ['CATscore', 'QApercentile', 'DILRpercentile', 'VARCpercentile'].includes(key)
            ? (value ?? '0').toString()
            : (value ?? '').toString();
          return acc;
        }, {});
        setProfileData(formattedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrors({ fetch: 'Failed to load profile' });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert empty strings to '0' for number fields
    const newValue = ['CATscore', 'QApercentile', 'DILRpercentile', 'VARCpercentile'].includes(name) 
      ? value === '' ? '0' : value
      : value;
    
    setProfileData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required.';
    }
    if (profileData.phoneNumber && !/^\d{10}$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone Number must be 10 digits.';
    }
    if (profileData.CATscore && (profileData.CATscore < 0 || profileData.CATscore > 100)) {
      newErrors.CATscore = 'CAT Score must be between 0 and 100.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const saveProfile = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        const response = await api.put('/user/profile', profileData);
        
        if (response.data.success) {
          setIsEditing(false);
          setProfileData(response.data.profile);
          alert('Profile saved successfully!');
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        setErrors({ 
          submit: error.response?.data?.message || 'Failed to save profile'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Profile Details</h2>
        <div className="space-x-2">
          {!isEditing ? (
            <button
              onClick={toggleEditMode}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="mr-2 w-5 h-5" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={saveProfile}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Save className="mr-2 w-5 h-5" /> {loading ? 'Saving...' : 'Save Profile'}
            </button>
          )}
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Name', name: 'name', type: 'text', required: true },
          { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
          { label: 'CAT Score', name: 'CATscore', type: 'number' },
          { label: 'QA Percentile', name: 'QApercentile', type: 'number' },
          { label: 'DILR Percentile', name: 'DILRpercentile', type: 'number' },
          { label: 'VARC Percentile', name: 'VARCpercentile', type: 'number' },
          { label: 'Business Schools', name: 'BSchools', type: 'text' },
          { label: 'Work Experience', name: 'WorkExp', type: 'text' },
          { label: 'Grad School', name: 'gradSchool', type: 'text' },
        ].map(({ label, name, type, required }) => (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              name={name}
              value={profileData[name]}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'
                } rounded-md bg-white text-gray-900 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required={required}
            />
            {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
          </div>
        ))}
      </form>
    </div>
  );
};

export default Profile;
