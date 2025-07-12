import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { X, Plus } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const DonatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    gender: '',
    ageCategory: '',
    category: '',
    ngo: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Shirts', 'Pants', 'Dresses', 'Jackets', 'Shoes', 'Accessories'];
  const genders = ['men', 'women', 'kids'];
  const ageCategories = ['adult', 'teen', 'child'];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.title || !formData.gender || !formData.ageCategory || !formData.category || !formData.ngo) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (!image) {
      setError('Please upload an image');
      setIsLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('gender', formData.gender);
      submitData.append('ageCategory', formData.ageCategory);
      submitData.append('category', formData.category);
      submitData.append('ngo', formData.ngo);
      submitData.append('image', image);

      await axios.post(`${BACKEND_URL}/api/donations`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit donation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <p className="text-gray-700 text-lg">Please login to donate items</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Donate an Item</h1>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-4 mb-6">
              <p className="text-rose-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {['title', 'ngo'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field} *
                </label>
                <input
                  type="text"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>
            ))}

            {[{ id: 'gender', options: genders }, { id: 'ageCategory', options: ageCategories }, { id: 'category', options: categories }].map(({ id, options }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {id.replace(/([A-Z])/g, ' $1')} *
                </label>
                <select
                  id={id}
                  name={id}
                  value={formData[id]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  required
                >
                  <option value="">Select {id}</option>
                  {options.map((option) => (
                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-purple-300 rounded-md relative">
                {!imagePreview ? (
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-rose-100 rounded-full p-1"
                    >
                      <X className="h-4 w-4 text-rose-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-purple-700 hover:to-pink-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Submit Donation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
