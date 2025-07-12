import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, User, Calendar, Tag, Package, Star } from 'lucide-react';

interface Item {
  _id: string;
  title: string;
  description: string;
  size: string;
  category: string;
  condition: string;
  tags: string[];
  images: string[];
  owner: {
    _id: string;
    name: string;
    avatar: string;
  };
  pointValue: number;
  status: string;
  createdAt: string;
}

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

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

  const handleRequestSwap = () => {
    // In a real app, this would open a swap request modal
    alert('Swap request functionality would be implemented here');
  };

  const handleRedeemPoints = () => {
    // In a real app, this would handle point redemption
    alert('Point redemption functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
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
        {/* Back Button */}
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
                src={item.images[currentImageIndex] 
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
                      currentImageIndex === index ? 'border-emerald-600' : 'border-gray-200'
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

            {/* Item Info */}
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
                  <Star className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Condition: {item.condition}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">
                    Listed: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {item.tags.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-600">Tags: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Owner Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Listed by</h2>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.owner.name}</p>
                  <p className="text-sm text-gray-500">Community member</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwner && user && (
              <div className="space-y-3">
                <button
                  onClick={handleRequestSwap}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Request Swap
                </button>
                <button
                  onClick={handleRedeemPoints}
                  className="w-full bg-white text-emerald-600 border-2 border-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Redeem for {item.pointValue} Points
                </button>
              </div>
            )}

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800">
                  Please <a href="/login" className="font-medium underline">sign in</a> to request swaps or redeem items.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Items */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Similar Item {i}</h3>
                  <p className="text-sm text-gray-600">Great condition item</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">Size: M</span>
                    <span className="text-sm font-medium text-emerald-600">10 pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};