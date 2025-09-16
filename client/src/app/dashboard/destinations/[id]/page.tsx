'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Destination {
  _id: string;
  name: string;
  country: string;
  city: string;
  description: string;
  climate: number;
  budget: number;
  adventure: number;
  culture: number;
  nature: number;
  nightlife: number;
  latitude: number;
  longitude: number;
  imageUrl: string;
  averageRating: number;
  totalReviews: number;
}

interface Recommendation {
  _id: string;
  destinationId: Destination;
  algorithm: string;
  score: number;
  factors: {
    climate: number;
    budget: number;
    adventure: number;
    culture: number;
    nature: number;
    nightlife: number;
  };
  explanation: string;
  isViewed: boolean;
  isBookmarked: boolean;
  generatedAt: string;
}

export default function DestinationDetailsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const router = useRouter();
  const params = useParams();
  const destinationId = params.id as string;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
      loadDestination();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    }
  }, [router, destinationId]);

  const loadDestination = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/destinations/${destinationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDestination(data.destination);
        loadRecommendation();
      } else {
        setError('Destination not found');
      }
    } catch (error) {
      console.error('Error loading destination:', error);
      setError('Failed to load destination');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendation = async () => {
    try {
      setIsLoadingRecommendation(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/recommendations/analysis/${destinationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendation(data.analysis);
      }
    } catch (error) {
      console.error('Error loading recommendation:', error);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const toggleBookmark = async () => {
    if (!recommendation) return;

    try {
      setIsBookmarking(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/recommendations/${recommendation._id}/bookmark`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendation({...recommendation, isBookmarked: data.recommendation.isBookmarked});
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-100';
    if (score >= 3) return 'text-yellow-600 bg-yellow-100';
    if (score >= 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return 'High';
    if (score >= 3) return 'Medium';
    if (score >= 2) return 'Low';
    return 'Very Low';
  };

  const getClimateLabel = (climate: number) => {
    if (climate >= 4) return 'Tropical';
    if (climate >= 3) return 'Temperate';
    if (climate >= 2) return 'Cool';
    return 'Cold';
  };

  const getBudgetLabel = (budget: number) => {
    if (budget >= 4) return 'Luxury';
    if (budget >= 3) return 'Moderate';
    if (budget >= 2) return 'Budget';
    return 'Very Budget';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading destination...</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error || 'Destination not found'}</p>
            <Link
              href="/dashboard/destinations"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Back to Destinations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">TravelAI</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/dashboard/destinations" className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2">
                  Destinations
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">{destination.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Destination Header */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Image */}
              <div className="h-96 bg-gray-200 relative">
                {destination.imageUrl ? (
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-90 text-gray-900">
                    ⭐ {destination.averageRating} ({destination.totalReviews} reviews)
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{destination.name}</h1>
                    <p className="text-xl text-gray-600">{destination.city}, {destination.country}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleBookmark}
                      disabled={isBookmarking || !recommendation}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className={`h-5 w-5 ${recommendation?.isBookmarked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {destination.description}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Link
                    href="/dashboard/recommendations"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get AI Recommendations
                  </Link>
                  <Link
                    href="/dashboard/travel-history"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Add to Travel History
                  </Link>
                </div>
              </div>
            </div>

            {/* Destination Attributes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Destination Attributes</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">🌡️</div>
                  <h3 className="font-medium text-gray-900">Climate</h3>
                  <p className="text-sm text-gray-600">{getClimateLabel(destination.climate)}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(destination.climate)}`}>
                      {getScoreLabel(destination.climate)}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <h3 className="font-medium text-gray-900">Budget</h3>
                  <p className="text-sm text-gray-600">{getBudgetLabel(destination.budget)}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(destination.budget)}`}>
                      {getScoreLabel(destination.budget)}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl mb-2">🏔️</div>
                  <h3 className="font-medium text-gray-900">Adventure</h3>
                  <p className="text-sm text-gray-600">Adventure Level</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(destination.adventure)}`}>
                      {getScoreLabel(destination.adventure)}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl mb-2">🏛️</div>
                  <h3 className="font-medium text-gray-900">Culture</h3>
                  <p className="text-sm text-gray-600">Cultural Richness</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(destination.culture)}`}>
                      {getScoreLabel(destination.culture)}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl mb-2">🌿</div>
                  <h3 className="font-medium text-gray-900">Nature</h3>
                  <p className="text-sm text-gray-600">Natural Beauty</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(destination.nature)}`}>
                      {getScoreLabel(destination.nature)}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl mb-2">🌃</div>
                  <h3 className="font-medium text-gray-900">Nightlife</h3>
                  <p className="text-sm text-gray-600">Nightlife Scene</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(destination.nightlife)}`}>
                      {getScoreLabel(destination.nightlife)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendation Analysis */}
            {recommendation && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Match Score</span>
                      <span className="text-sm font-bold text-blue-600">
                        {(recommendation.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${recommendation.score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Why this destination matches you:</p>
                    <p>{recommendation.explanation}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Factor Breakdown:</h4>
                    <div className="space-y-2">
                      {Object.entries(recommendation.factors).map(([factor, score]) => (
                        <div key={factor} className="flex items-center justify-between text-xs">
                          <span className="capitalize text-gray-600">{factor}:</span>
                          <span className={`px-2 py-1 rounded ${getScoreColor(score)}`}>
                            {getScoreLabel(score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Location</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">City:</span> {destination.city}</p>
                <p><span className="font-medium">Country:</span> {destination.country}</p>
                <p><span className="font-medium">Coordinates:</span> {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/recommendations"
                  className="w-full block px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get More Recommendations
                </Link>
                <Link
                  href="/dashboard/travel-history"
                  className="w-full block px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Add to Travel History
                </Link>
                <Link
                  href="/dashboard/destinations"
                  className="w-full block px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse More Destinations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
