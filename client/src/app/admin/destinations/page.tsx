'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  createdAt: string;
}

interface DestinationsResponse {
  destinations: Destination[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDestinations: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminDestinationsPage() {
  const [user, setUser] = useState<any>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDestinations: 0,
    hasNext: false,
    hasPrev: false
  });
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [newDestination, setNewDestination] = useState({
    name: '',
    country: '',
    city: '',
    description: '',
    climate: 3,
    budget: 3,
    adventure: 3,
    culture: 3,
    nature: 3,
    nightlife: 3,
    latitude: 0,
    longitude: 0,
    imageUrl: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadDestinations();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    }
  }, [router, currentPage, searchTerm, countryFilter]);

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        country: countryFilter
      });

      const response = await fetch(`http://localhost:5000/api/admin/destinations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: DestinationsResponse = await response.json();
        setDestinations(data.destinations);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
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

  const createDestination = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/admin/destinations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDestination)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewDestination({
          name: '',
          country: '',
          city: '',
          description: '',
          climate: 3,
          budget: 3,
          adventure: 3,
          culture: 3,
          nature: 3,
          nightlife: 3,
          latitude: 0,
          longitude: 0,
          imageUrl: ''
        });
        await loadDestinations();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create destination');
      }
    } catch (error) {
      console.error('Error creating destination:', error);
      setError('Failed to create destination');
    }
  };

  const updateDestination = async (destinationId: string, updates: Partial<Destination>) => {
    try {
      setIsUpdating(destinationId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/destinations/${destinationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingDestination(null);
        await loadDestinations();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update destination');
      }
    } catch (error) {
      console.error('Error updating destination:', error);
      setError('Failed to update destination');
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteDestination = async (destinationId: string) => {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      return;
    }

    try {
      setIsUpdating(destinationId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/destinations/${destinationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadDestinations();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete destination');
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
      setError('Failed to delete destination');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Go to Login
            </button>
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
              <Link href="/admin" className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Link
                href="/admin"
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Destination Management</h1>
              <p className="text-gray-600">Manage travel destinations and their attributes</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Destination
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCountryFilter('');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div key={destination._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ⭐ {destination.averageRating}
                  </span>
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
                  <button
                    onClick={() => {
                      setEditingDestination(destination);
                      setShowEditModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDestination(destination._id)}
                    disabled={isUpdating === destination._id}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating === destination._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.currentPage - 1) * 10) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * 10, pagination.totalDestinations)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalDestinations}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Create Destination Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Destination</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newDestination.name}
                    onChange={(e) => setNewDestination({...newDestination, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={newDestination.country}
                    onChange={(e) => setNewDestination({...newDestination, country: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={newDestination.city}
                    onChange={(e) => setNewDestination({...newDestination, city: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newDestination.description}
                    onChange={(e) => setNewDestination({...newDestination, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={createDestination}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Destination Modal */}
      {showEditModal && editingDestination && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Destination</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingDestination.name}
                    onChange={(e) => setEditingDestination({...editingDestination, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={editingDestination.country}
                    onChange={(e) => setEditingDestination({...editingDestination, country: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={editingDestination.city}
                    onChange={(e) => setEditingDestination({...editingDestination, city: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editingDestination.description}
                    onChange={(e) => setEditingDestination({...editingDestination, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateDestination(editingDestination._id, editingDestination)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingDestination(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
