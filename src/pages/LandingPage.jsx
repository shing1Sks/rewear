import React from 'react';
import { Recycle, Heart, Users, ArrowRight, Shirt, Award, Globe, Sparkles } from 'lucide-react';

export const LandingPage = () => {
  // Mock user state for demo
  const user = null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg mb-8">
              <Sparkles className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-purple-600 font-semibold">Sustainable Fashion Revolution</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Sustainable Fashion
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 block">
                Starts Here
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join ReWear's community-driven platform where unused clothes find new 
              life through swaps, points, and donations. Together, we're reducing textile 
              waste and promoting sustainable fashion for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {user ? (
                <>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Shirt className="h-6 w-6" />
                    <span>Browse Items</span>
                  </button>
                  <button className="bg-white text-purple-600 border-2 border-purple-200 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl">
                    <span>Add Your Items</span>
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <span>Start Swapping</span>
                    <ArrowRight className="h-6 w-6" />
                  </button>
                  <button className="bg-white/80 backdrop-blur-sm text-purple-600 border-2 border-purple-200 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
                    Browse Items
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">2,547</div>
              <p className="text-gray-600 text-lg">Items Swapped</p>
            </div>
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">1,234</div>
              <p className="text-gray-600 text-lg">Happy Members</p>
            </div>
            <div className="p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">892</div>
              <p className="text-gray-600 text-lg">Items Donated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-transparent to-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How ReWear Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, sustainable, and rewarding ways to give your clothes a second life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Recycle className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Swap & Exchange</h3>
              <p className="text-gray-600 leading-relaxed">
                Trade your unused clothes directly with other community members. Find exactly what you're looking for while giving your items new homes.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Award className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Earn Points</h3>
              <p className="text-gray-600 leading-relaxed">
                Get rewarded for your sustainable actions. Earn points by uploading items, completing swaps, and donating to NGOs.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Donate to NGOs</h3>
              <p className="text-gray-600 leading-relaxed">
                Make a difference by donating clothes to partner NGOs. Help those in need while earning extra points for your generosity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
            Join thousands of fashion-conscious individuals creating a more sustainable future, one swap at a time.
          </p>
          {!user && (
            <button className="bg-white text-purple-600 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 inline-flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105">
              <span>Join ReWear Today</span>
              <ArrowRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;