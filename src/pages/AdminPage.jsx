import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Shield, Package, Heart, Check, X, Eye } from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');

  useEffect(() => {
    if (user?.isAdmin) {
      fetchPendingItems();
      fetchPendingDonations();
    }
  }, [user]);

  const fetchPendingItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/items');
      setPendingItems(response.data);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingDonations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/donations');
      setPendingDonations(response.data);
    } catch (error) {
      console.error('Error fetching pending donations:', error);
    }
  };

  const handleItemAction = async (itemId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/items/${itemId}`, { status });
      setPendingItems(items => items.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const handleDonationAction = async (donationId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/donations/${donationId}`, { status });
      setPendingDonations(donations => donations.filter(donation => donation._id !== donationId));
    } catch (error) {
      console.error('Error updating donation status:', error);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage items, donations, and platform content</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Items</p>
                <p className="text-2xl font-bold text-blue-600">{pendingItems.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Donations</p>
                <p className="text-2xl font-bold text-red-600">{pendingDonations.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'items', name: 'Pending Items', count: pendingItems.length },
                { id: 'donations', name: 'Pending Donations', count: pendingDonations.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'items' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Pending Items for Review</h3>
                
                {pendingItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending items to review</p>
                ) : (
                  <div className="space-y-6">
                    {pendingItems.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row lg:space-x-6">
                          {/* Images */}
                          <div className="lg:w-1/3 mb-4 lg:mb-0">
                            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={item.images[0] 
                                  ? `http://localhost:5000/uploads/${item.images[0]}`
                                  : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'
                                }
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          {/* Details */}
                          <div className="lg:w-2/3 space-y-4">
                            <div>
                              <h4 className="text-xl font-semibold text-gray-900">{item.title}</h4>
                              <p className="text-gray-600 mt-1">{item.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Category:</span>
                                <span className="ml-2 text-gray-600">{item.category}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Condition:</span>
                                <span className="ml-2 text-gray-600">{item.condition}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Owner:</span>
                                <span className="ml-2 text-gray-600">{item.owner.name}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Submitted:</span>
                                <span className="ml-2 text-gray-600">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-4 pt-4">
                              <button
                                onClick={() => handleItemAction(item._id, 'approved')}
                                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                              >
                                <Check className="h-4 w-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleItemAction(item._id, 'rejected')}
                                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                              >
                                <X className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'donations' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Pending Donations for Review</h3>
                
                {pendingDonations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending donations to review</p>
                ) : (
                  <div className="space-y-6">
                    {pendingDonations.map((donation) => (
                      <div key={donation._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row lg:space-x-6">
                          {/* Image */}
                          <div className="lg:w-1/3 mb-4 lg:mb-0">
                            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={`http://localhost:5000/uploads/${donation.image}`}
                                alt={donation.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          {/* Details */}
                          <div className="lg:w-2/3 space-y-4">
                            <div>
                              <h4 className="text-xl font-semibold text-gray-900">{donation.title}</h4>
                              <p className="text-gray-600 mt-1">Donation to {donation.ngo}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Category:</span>
                                <span className="ml-2 text-gray-600">{donation.category}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Condition:</span>
                                <span className="ml-2 text-gray-600">{donation.condition}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Donor:</span>
                                <span className="ml-2 text-gray-600">{donation.donor.name}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Submitted:</span>
                                <span className="ml-2 text-gray-600">
                                  {new Date(donation.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-4 pt-4">
                              <button
                                onClick={() => handleDonationAction(donation._id, 'approved')}
                                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                              >
                                <Check className="h-4 w-4" />
                                <span>Approve (+15 pts to donor)</span>
                              </button>
                              <button
                                onClick={() => handleDonationAction(donation._id, 'rejected')}
                                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                              >
                                <X className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};