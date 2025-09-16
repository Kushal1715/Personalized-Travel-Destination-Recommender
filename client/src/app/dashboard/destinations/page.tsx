'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  matchScore?: number;
  explanation?: string;
}

export default function DestinationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [personalizedDestinations, setPersonalizedDestinations] = useState<Destination[]>([]);
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false);
  const router = useRouter();

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
      loadDestinations();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    }
  }, [router]);

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/destinations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDestinations(data.destinations || []);
      } else {
        setError('Failed to load destinations');
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
      setError('Failed to load destinations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPersonalizedDestinations = async () => {
    try {
      setIsLoadingPersonalized(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/recommendations/personalized?algorithm=hybrid&limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert recommendations to destinations format
        const personalizedDests = data.recommendations.map((rec: any) => ({
          ...rec.destinationId,
          matchScore: rec.finalScore || rec.similarity,
          explanation: rec.explanation
        }));
        setPersonalizedDestinations(personalizedDests);
        setShowPersonalized(true);
      } else {
        setError('Failed to load personalized destinations');
      }
    } catch (error) {
      console.error('Error loading personalized destinations:', error);
      setError('Failed to load personalized destinations');
    } finally {
      setIsLoadingPersonalized(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-100';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return 'High';
    if (score >= 3) return 'Medium';
    if (score >= 2) return 'Low';
    return 'Very Low';
  };

  // Filter and sort destinations
  const destinationsToShow = showPersonalized ? personalizedDestinations : destinations;
  
  const filteredDestinations = destinationsToShow
    .filter(dest => {
      const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dest.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = !filterCountry || dest.country === filterCountry;
      return matchesSearch && matchesCountry;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rating':
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case 'budget':
          aValue = a.budget;
          bValue = b.budget;
          break;
        case 'adventure':
          aValue = a.adventure;
          bValue = b.adventure;
          break;
        case 'culture':
          aValue = a.culture;
          bValue = b.culture;
          break;
        case 'nature':
          aValue = a.nature;
          bValue = b.nature;
          break;
        case 'nightlife':
          aValue = a.nightlife;
          bValue = b.nightlife;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique countries for filter
  const countries = [...new Set(destinations.map(dest => dest.country))].sort();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading destinations...</p>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Explore Destinations 🌍
              </h1>
              <p className="text-gray-600">
                Discover amazing travel destinations from around the world. Filter, sort, and explore to find your perfect getaway.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={loadPersonalizedDestinations}
                disabled={isLoadingPersonalized}
                className={`px-4 py-2 rounded-md transition-colors ${
                  showPersonalized 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoadingPersonalized ? 'Loading...' : showPersonalized ? '🤖 AI Personalized View' : 'Get AI Personalized View'}
              </button>
              <Link
                href="/dashboard/recommendations"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Full Recommendations
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="budget">Budget</option>
                <option value="adventure">Adventure</option>
                <option value="culture">Culture</option>
                <option value="nature">Nature</option>
                <option value="nightlife">Nightlife</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Destinations Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Destinations Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more destinations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <div key={destination._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Destination Image */}
                <div className="h-48 bg-gray-200 relative">
                  {destination.imageUrl ? (
                    <img
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3">
                    {showPersonalized && destination.matchScore ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🤖 {(destination.matchScore * 100).toFixed(0)}% match
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(destination.averageRating)}`}>
                        ⭐ {destination.averageRating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Destination Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {destination.name}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {destination.totalReviews} reviews
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {destination.city}, {destination.country}
                  </p>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {destination.description}
                  </p>

                  {/* AI Explanation for personalized view */}
                  {showPersonalized && destination.explanation && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs text-green-800">
                        <span className="font-medium">AI Insight:</span> {destination.explanation}
                      </p>
                    </div>
                  )}

                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-xs">
                      <span className="text-gray-500">Budget:</span>
                      <span className={`ml-1 font-medium ${getScoreColor(destination.budget)}`}>
                        {getScoreLabel(destination.budget)}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Adventure:</span>
                      <span className={`ml-1 font-medium ${getScoreColor(destination.adventure)}`}>
                        {getScoreLabel(destination.adventure)}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Culture:</span>
                      <span className={`ml-1 font-medium ${getScoreColor(destination.culture)}`}>
                        {getScoreLabel(destination.culture)}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Nature:</span>
                      <span className={`ml-1 font-medium ${getScoreColor(destination.nature)}`}>
                        {getScoreLabel(destination.nature)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/destinations/${destination._id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <Link
                      href="/dashboard/recommendations"
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Get Recommendation
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredDestinations.length} of {destinations.length} destinations
        </div>
      </div>
    </div>
  );
}
