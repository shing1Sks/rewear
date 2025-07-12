import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Heart, Upload, X } from 'lucide-react';

const NGOs = [
  {
    name: 'Goodwill Industries',
    mission: 'Providing job training and employment services through clothing donations'
  },
  {
    name: 'The Salvation Army',
    mission: 'Supporting families in need through clothing and household items'
  },
  {
    name: 'Local Homeless Shelter',
    mission: 'Providing warm clothing and essentials to homeless individuals'
  },
  {
    name: 'Women\'s Shelter Network',
    mission: 'Supporting women and children escaping domestic violence'
  },
  {
    name: 'Youth Community Center',
    mission: 'Providing clothing assistance to underprivileged youth'
  }
];

export const DonatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    condition: '',
    category: '',
    ngo: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Shirts', 'Pants', 'Dresses', 'Jackets', 'Shoes', 'Accessories'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.title || !formData.condition || !formData.category || !formData.ngo) {
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
      submitData.append('condition', formData.condition);
      submitData.append('category', formData.category);
      submitData.append('ngo', formData.ngo);
      submitData.append('image', image);

      await axios.post('http://localhost:5000/api/donations', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit donation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Please login to make donations</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Donate to NGO</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Make a difference by donating your unused clothing to our partner NGOs. 
            Help those in need while earning 15 points for your generosity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NGO List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Partner NGOs</h2>
            <div className="space-y-4">
              {NGOs.map((ngo, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.ngo === ngo.name
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                  onClick={() => setFormData({ ...formData, ngo: ngo.name })}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{ngo.name}</h3>
                  <p className="text-sm text-gray-600">{ngo.mission}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Donation Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Donation Details</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 rounded-md h-48 flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">Upload Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Winter Coat"
                />
              </div>

              {/* Category and Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    value={formData.condition}
                    onChange={handleInputChange}
                  >
                    <option value="">Select condition</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.ngo}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Submitting Donation...' : 'Submit Donation (+15 points)'}
                </button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Your donation will be reviewed before approval
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};