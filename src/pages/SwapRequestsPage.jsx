import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, User } from 'lucide-react';

const SwapRequestsPage = () => {
  const { user } = useAuth();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [isLoading, setIsLoading] = useState(true);
  const [courierOptions, setCourierOptions] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [currentSwapId, setCurrentSwapId] = useState('');
  const [shippingForm, setShippingForm] = useState({
    requesterAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    ownerAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  useEffect(() => {
    if (user) {
      fetchSwapRequests();
    }
  }, [user]);

  const fetchSwapRequests = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        axios.get('http://localhost:5000/api/swaps/received'),
        axios.get('http://localhost:5000/api/swaps/sent')
      ]);
      
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error('Error fetching swap requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToSwap = async (swapId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/swaps/${swapId}/respond`, { status });
      
      if (status === 'accepted') {
        // Fetch courier options
        const response = await axios.get(`http://localhost:5000/api/swaps/${swapId}/courier-options`);
        setCourierOptions(response.data.courierOptions);
        setCurrentSwapId(swapId);
        
        // Pre-fill addresses if available
        setShippingForm({
          requesterAddress: response.data.addresses.requester,
          ownerAddress: response.data.addresses.owner
        });
        
        setShowCourierModal(true);
      }
      
      fetchSwapRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond to swap request');
    }
  };

  const handleSelectCourier = async () => {
    if (!selectedCourier) {
      alert('Please select a courier service');
      return;
    }

    try {
      await axios.patch(`http://localhost:5000/api/swaps/${currentSwapId}/select-courier`, {
        courierService: {
          name: selectedCourier.name,
          cost: selectedCourier.totalCost,
          estimatedDelivery: selectedCourier.estimatedDays
        },
        shippingDetails: shippingForm
      });
      
      setShowCourierModal(false);
      setSelectedCourier(null);
      fetchSwapRequests();
      alert('Courier selected successfully! Both parties will be notified.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to select courier');
    }
  };

  const handleShipItems = async (swapId) => {
    const trackingId = prompt('Enter tracking ID:');
    if (!trackingId) return;

    try {
      await axios.patch(`http://localhost:5000/api/swaps/${swapId}/ship`, { trackingId });
      fetchSwapRequests();
      alert('Tracking information updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update tracking');
    }
  };

  const handleCompleteSwap = async (swapId) => {
    if (!window.confirm('Are you sure you want to mark this swap as completed?')) return;

    try {
      await axios.patch(`http://localhost:5000/api/swaps/${swapId}/complete`);
      fetchSwapRequests();
      alert('Swap completed successfully! You earned 10 points.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete swap');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'courier_selected': return 'bg-purple-100 text-purple-800';
      case 'items_shipped': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Response';
      case 'accepted': return 'Accepted';
      case 'courier_selected': return 'Courier Selected';
      case 'items_shipped': return 'Items Shipped';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Swap Requests</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'received', name: 'Received', count: receivedRequests.length },
                { id: 'sent', name: 'Sent', count: sentRequests.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'received' && (
              <div className="space-y-6">
                {receivedRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No swap requests received</p>
                ) : (
                  receivedRequests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Swap Request from {request.requester.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">They want your:</h4>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={request.requestedItem.images[0] 
                                ? `http://localhost:5000/uploads/${request.requestedItem.images[0]}`
                                : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100'
                              }
                              alt={request.requestedItem.title}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h5 className="font-medium text-gray-900">{request.requestedItem.title}</h5>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">They offer:</h4>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={request.offeredItem.images[0] 
                                ? `http://localhost:5000/uploads/${request.offeredItem.images[0]}`
                                : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100'
                              }
                              alt={request.offeredItem.title}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h5 className="font-medium text-gray-900">{request.offeredItem.title}</h5>
                            </div>
                          </div>
                        </div>
                      </div>

                      {request.message && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Message:</h4>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.message}</p>
                        </div>
                      )}

                      {request.courierService && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Truck className="h-5 w-5 mr-2" />
                            Courier Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Service:</span> {request.courierService.name}
                            </div>
                            <div>
                              <span className="font-medium">Cost:</span> ₹{request.courierService.cost}
                            </div>
                            <div>
                              <span className="font-medium">Delivery:</span> {request.courierService.estimatedDelivery} days
                            </div>
                            {request.courierService.trackingId && (
                              <div className="md:col-span-3">
                                <span className="font-medium">Tracking ID:</span> {request.courierService.trackingId}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRespondToSwap(request._id, 'accepted')}
                              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleRespondToSwap(request._id, 'rejected')}
                              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {request.status === 'courier_selected' && (
                          <button
                            onClick={() => handleShipItems(request._id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Truck className="h-4 w-4" />
                            <span>Mark as Shipped</span>
                          </button>
                        )}

                        {request.status === 'items_shipped' && (
                          <button
                            onClick={() => handleCompleteSwap(request._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark as Completed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'sent' && (
              <div className="space-y-6">
                {sentRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No swap requests sent</p>
                ) : (
                  sentRequests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Swap Request to {request.requestedItem.owner?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">You want:</h4>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={request.requestedItem.images[0] 
                                ? `http://localhost:5000/uploads/${request.requestedItem.images[0]}`
                                : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100'
                              }
                              alt={request.requestedItem.title}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h5 className="font-medium text-gray-900">{request.requestedItem.title}</h5>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">You offered:</h4>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={request.offeredItem.images[0] 
                                ? `http://localhost:5000/uploads/${request.offeredItem.images[0]}`
                                : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100'
                              }
                              alt={request.offeredItem.title}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h5 className="font-medium text-gray-900">{request.offeredItem.title}</h5>
                            </div>
                          </div>
                        </div>
                      </div>

                      {request.courierService && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Truck className="h-5 w-5 mr-2" />
                            Courier Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Service:</span> {request.courierService.name}
                            </div>
                            <div>
                              <span className="font-medium">Cost:</span> ₹{request.courierService.cost}
                            </div>
                            <div>
                              <span className="font-medium">Delivery:</span> {request.courierService.estimatedDelivery} days
                            </div>
                            {request.courierService.trackingId && (
                              <div className="md:col-span-3">
                                <span className="font-medium">Tracking ID:</span> {request.courierService.trackingId}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Courier Selection Modal */}
        {showCourierModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Courier Service</h2>
                
                {/* Shipping Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requester Address</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={shippingForm.requesterAddress.street}
                        onChange={(e) => setShippingForm({
                          ...shippingForm,
                          requesterAddress: { ...shippingForm.requesterAddress, street: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={shippingForm.requesterAddress.city}
                          onChange={(e) => setShippingForm({
                            ...shippingForm,
                            requesterAddress: { ...shippingForm.requesterAddress, city: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={shippingForm.requesterAddress.zipCode}
                          onChange={(e) => setShippingForm({
                            ...shippingForm,
                            requesterAddress: { ...shippingForm.requesterAddress, zipCode: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Address</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={shippingForm.ownerAddress.street}
                        onChange={(e) => setShippingForm({
                          ...shippingForm,
                          ownerAddress: { ...shippingForm.ownerAddress, street: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={shippingForm.ownerAddress.city}
                          onChange={(e) => setShippingForm({
                            ...shippingForm,
                            ownerAddress: { ...shippingForm.ownerAddress, city: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={shippingForm.ownerAddress.zipCode}
                          onChange={(e) => setShippingForm({
                            ...shippingForm,
                            ownerAddress: { ...shippingForm.ownerAddress, zipCode: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courier Options */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Courier Services</h3>
                  <div className="space-y-3">
                    {courierOptions.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedCourier(option)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCourier?.name === option.name
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{option.name}</h4>
                            <p className="text-sm text-gray-600">
                              Estimated delivery: {option.estimatedDays} days
                            </p>
                            <p className="text-sm text-gray-600">
                              Distance: {option.distance} km
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600">₹{option.totalCost}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCourierModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSelectCourier}
                    disabled={!selectedCourier}
                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Selection
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
export default SwapRequestsPage;
