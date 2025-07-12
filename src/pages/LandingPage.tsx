import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, Heart, Users, ArrowRight, Shirt, Award, Globe } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Sustainable Fashion
              <span className="text-emerald-600 block">Starts Here</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join ReWear's community-driven platform where unused clothes find new life through 
              swaps, points, and donations. Together, we're reducing textile waste and promoting 
              sustainable fashion for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    to="/browse"
                    className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Shirt className="h-5 w-5" />
                    <span>Browse Items</span>
                  </Link>
                  <Link
                    to="/add-item"
                    className="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Add Your Items</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Start Swapping</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/browse"
                    className="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Browse Items
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">2,547</div>
              <p className="text-gray-600">Items Swapped</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">1,234</div>
              <p className="text-gray-600">Happy Members</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">892</div>
              <p className="text-gray-600">Items Donated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How ReWear Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, sustainable, and rewarding ways to give your clothes a second life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Recycle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Swap & Exchange</h3>
              <p className="text-gray-600">
                Trade your unused clothes directly with other community members. Find exactly what you're looking for while giving your items new homes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Earn Points</h3>
              <p className="text-gray-600">
                Get rewarded for your sustainable actions. Earn points by uploading items, completing swaps, and donating to NGOs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Donate to NGOs</h3>
              <p className="text-gray-600">
                Make a difference by donating clothes to partner NGOs. Help those in need while earning extra points for your generosity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion-conscious individuals creating a more sustainable future, one swap at a time.
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center space-x-2"
            >
              <span>Join ReWear Today</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};