import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Award, Package, Heart, Plus, Eye, MessageCircle, Check, X, Clock, ArrowRight } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [swapRequests, setSwapRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchSwapRequests();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSwapRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/swaps/received', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSwapRequests(response.data);
    } catch (error) {
      console.error('Error fetching swap requests:', error);
    }
  };

  const handleSwapResponse = async (swapId, action) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/swaps/${swapId}/respond`,
        { status: action },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      // Refresh swap requests after action
      fetchSwapRequests();
      
      // Show success message
      alert(`Swap request ${action === 'accepted' ? 'accepted' : 'declined'} successfully!`);
    } catch (error) {
      console.error('Error responding to swap request:', error);
      alert('Failed to respond to swap request');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Error loading dashboard</p>
      </div>
    );
  }

  const pendingItems = userData.items.filter(item => item.status === 'pending');
  const approvedItems = userData.items.filter(item => item.status === 'approved');
  const swappedItems = userData.items.filter(item => item.status === 'swapped');
  const pendingRequests = swapRequests.filter(request => request.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{userData.user.name}</h1>
              <p className="text-gray-600">{userData.user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-600">{userData.user.points} points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-600">{userData.items.length} items listed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-gray-600">{userData.donations.length} donations</span>
                </div>
                {pendingRequests.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-orange-600" />
                    <span className="text-orange-600 font-semibold">{pendingRequests.length} new requests</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Link
                to="/add-item"
                className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </Link>
              <Link
                to="/donate"
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Heart className="h-4 w-4" />
                <span>Donate</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-emerald-600">{userData.user.points}</p>
              </div>
              <Award className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Items</p>
                <p className="text-2xl font-bold text-blue-600">{approvedItems.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Swapped</p>
                <p className="text-2xl font-bold text-purple-600">{swappedItems.length}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donations</p>
                <p className="text-2xl font-bold text-red-600">{userData.donations.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Swap Requests</p>
                <p className="text-2xl font-bold text-orange-600">{pendingRequests.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'items', name: 'My Items' },
                { id: 'swap-requests', name: `Swap Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}` },
                { id: 'donations', name: 'My Donations' },
                { id: 'badges', name: 'Badges' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                  {tab.id === 'swap-requests' && pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Pending Requests</h4>
                    <p className="text-2xl font-bold text-orange-600">{pendingRequests.length}</p>
                    <p className="text-sm text-orange-700">Awaiting your response</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Active Listings</h4>
                    <p className="text-2xl font-bold text-blue-600">{approvedItems.length}</p>
                    <p className="text-sm text-blue-700">Items available for swap</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Successful Swaps</h4>
                    <p className="text-2xl font-bold text-green-600">{swappedItems.length}</p>
                    <p className="text-sm text-green-700">Completed exchanges</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {userData.items.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                        <Package className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">Status: {item.status}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Items</h3>
                  <Link
                    to="/add-item"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Add New Item
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {pendingItems.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Pending Review ({pendingItems.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingItems.map((item) => (
                          <div key={item._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.title}</h5>
                                <p className="text-sm text-gray-600">{item.category} • Size {item.size}</p>
                                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                                  Pending Review
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {approvedItems.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Active Items ({approvedItems.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {approvedItems.map((item) => (
                          <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.title}</h5>
                                <p className="text-sm text-gray-600">{item.category} • Size {item.size}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Active
                                  </span>
                                  <Link
                                    to={`/items/${item._id}`}
                                    className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'swap-requests' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Swap Requests</h3>
                  <div className="text-sm text-gray-600">
                    {pendingRequests.length} pending • {swapRequests.filter(r => r.status !== 'pending').length} processed
                  </div>
                </div>
                
                {swapRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No swap requests yet</p>
                    <p className="text-gray-400">When someone wants to swap with your items, their requests will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Pending Requests */}
                    {pendingRequests.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                          <Clock className="h-5 w-5 text-orange-500 mr-2" />
                          Pending Requests ({pendingRequests.length})
                        </h4>
                        <div className="space-y-4">
                          {pendingRequests.map((request) => (
                            <div key={request._id} className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-gray-900">{request.requester.name}</h5>
                                    <span className="text-sm text-gray-500">
                                      {new Date(request.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-medium text-gray-700 mb-1">Wants your item:</p>
                                      <p className="font-semibold text-gray-900">{request.requestedItem.title}</p>
                                      <p className="text-sm text-gray-600">{request.requestedItem.category} • Size {request.requestedItem.size}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-medium text-gray-700 mb-1">Offers in return:</p>
                                      <p className="font-semibold text-gray-900">{request.offeredItem.title}</p>
                                      <p className="text-sm text-gray-600">{request.offeredItem.category} • Size {request.offeredItem.size}</p>
                                    </div>
                                  </div>
                                  
                                  {request.message && (
                                    <div className="bg-white p-3 rounded-lg mb-4">
                                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                                      <p className="text-gray-900">{request.message}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => handleSwapResponse(request._id, 'accepted')}
                                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Accept Swap
                                    </button>
                                    <button
                                      onClick={() => handleSwapResponse(request._id, 'declined')}
                                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Decline
                                    </button>
                                    <Link
                                      to={`/items/${request.offeredItem._id}`}
                                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Offered Item
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Processed Requests */}
                    {swapRequests.filter(r => r.status !== 'pending').length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Request History</h4>
                        <div className="space-y-4">
                          {swapRequests
                            .filter(r => r.status !== 'pending')
                            .map((request) => (
                              <div key={request._id} className={`border rounded-lg p-4 ${
                                request.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      request.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                      {request.status === 'accepted' ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <X className="h-4 w-4 text-red-600" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {request.requester.name} • {request.requestedItem.title}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {request.status === 'accepted' ? 'Swap accepted' : 'Swap declined'} • {new Date(request.updatedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-5 w-5 text-gray-400" />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'donations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Donations</h3>
                  <Link
                    to="/donate"
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Make Donation
                  </Link>
                </div>
                
                {userData.donations.length === 0 ? (
                  <p className="text-gray-500">No donations yet. Make your first donation to help those in need!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userData.donations.map((donation) => (
                      <div key={donation._id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Heart className="h-8 w-8 text-red-600" />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{donation.title}</h5>
                            <p className="text-sm text-gray-600">{donation.ngo}</p>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                              donation.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'badges' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">My Badges</h3>
                {userData.user.badges.length === 0 ? (
                  <p className="text-gray-500">No badges earned yet. Start swapping and donating to earn badges!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userData.user.badges.map((badge, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <Award className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                        <h5 className="font-medium text-gray-900">{badge}</h5>
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