import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, User, Calendar, Tag, Package, Users } from 'lucide-react';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userItems, setUserItems] = useState([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedOfferedItem, setSelectedOfferedItem] = useState('');
  const [swapMessage, setSwapMessage] = useState('');

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  useEffect(() => {
    if (user) fetchUserItems();
  }, [user]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/items/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const availableItems = response.data.items.filter(
        item => item.status === 'approved' && item._id !== id
      );
      setUserItems(availableItems);
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };

  const handleRequestSwap = () => {
    if (!user) return navigate('/login');
    if (userItems.length === 0) {
      alert('You need approved items to offer. Please add items first.');
      return;
    }
    setShowSwapModal(true);
  };

  const handleSubmitSwapRequest = async () => {
    if (!selectedOfferedItem) {
      alert('Please select an item to offer for swap');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/swaps/request',
        {
          requestedItemId: id,
          offeredItemId: selectedOfferedItem,
          message: swapMessage
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setShowSwapModal(false);
      setSelectedOfferedItem('');
      setSwapMessage('');
      alert('Swap request sent successfully!');
      navigate('/swaps');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send swap request');
    }
  };

  const handleRedeemPoints = () => {
    alert('Point redemption functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Item not found</p>
      </div>
    );
  }

  const isOwner = user && user.id === item.owner._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={
                  item.images[currentImageIndex]
                    ? `http://localhost:5000/uploads/${item.images[currentImageIndex]}`
                    : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800'
                }
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-white rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-pink-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={`http://localhost:5000/uploads/${image}`}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Size: {item.size}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Category: {item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">
                    Gender: {item.gender?.charAt(0).toUpperCase() + item.gender?.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">
                    Age: {item.ageCategory?.charAt(0).toUpperCase() + item.ageCategory?.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">
                    Listed: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-600">Tags: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Listed by</h2>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.owner.name}</p>
                  <p className="text-sm text-gray-500">Community member</p>
                </div>
              </div>
            </div>

            {!isOwner && user && (
              <div className="space-y-3">
                <button
                  onClick={handleRequestSwap}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-colors"
                >
                  Request Swap
                </button>
                {item.pointValue && (
                  <button
                    onClick={handleRedeemPoints}
                    className="w-full bg-white text-pink-600 border-2 border-pink-500 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
                  >
                    Redeem for {item.pointValue} Points
                  </button>
                )}
              </div>
            )}

            {!user && (
              <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                <p className="text-pink-800">
                  Please{' '}
                  <button onClick={() => navigate('/login')} className="font-medium underline">
                    sign in
                  </button>{' '}
                  to request swaps or redeem items.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Swap Request Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Request Swap</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select an item to offer:
                  </label>
                  <select
                    value={selectedOfferedItem}
                    onChange={(e) => setSelectedOfferedItem(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">Choose an item...</option>
                    {userItems.map((userItem) => (
                      <option key={userItem._id} value={userItem._id}>
                        {userItem.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional):
                  </label>
                  <textarea
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    placeholder="Add a message for the item owner..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowSwapModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitSwapRequest}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-md font-medium hover:from-purple-700 hover:to-pink-600 transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
