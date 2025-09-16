'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalyticsData {
  period: string;
  userAnalytics: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
  }>;
  recommendationAnalytics: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
    avgScore: number;
  }>;
  algorithmPerformance: Array<{
    _id: string;
    count: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
  }>;
  topCountries: Array<{
    _id: string;
    count: number;
    avgScore: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
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
      loadAnalytics();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    }
  }, [router, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/analytics?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: AnalyticsData = await response.json();
        setAnalytics(data);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const formatDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">System performance and user insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {analytics && (
          <div className="space-y-8">
            {/* Algorithm Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Algorithm Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.algorithmPerformance.map((algo) => (
                  <div key={algo._id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 capitalize">
                      {algo._id.replace('_', ' ')} Algorithm
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Recommendations:</span>
                        <span className="font-medium">{algo.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Average Score:</span>
                        <span className="font-medium">{(algo.avgScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Max Score:</span>
                        <span className="font-medium">{(algo.maxScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Min Score:</span>
                        <span className="font-medium">{(algo.minScore * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Recommended Countries</h2>
              <div className="space-y-3">
                {analytics.topCountries.slice(0, 10).map((country, index) => (
                  <div key={country._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-blue-600 mr-3">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{country._id}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{country.count} recommendations</div>
                      <div className="text-xs text-gray-500">Avg score: {(country.avgScore * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Analytics Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Registration Trends</h2>
              <div className="space-y-2">
                {analytics.userAnalytics.length > 0 ? (
                  analytics.userAnalytics.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        {formatDate(data._id.year, data._id.month, data._id.day)}
                      </span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(data.count / Math.max(...analytics.userAnalytics.map(d => d.count))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{data.count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No user registration data for this period</p>
                )}
              </div>
            </div>

            {/* Recommendation Analytics Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendation Generation Trends</h2>
              <div className="space-y-2">
                {analytics.recommendationAnalytics.length > 0 ? (
                  analytics.recommendationAnalytics.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        {formatDate(data._id.year, data._id.month, data._id.day)}
                      </span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(data.count / Math.max(...analytics.recommendationAnalytics.map(d => d.count))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{data.count}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(data.avgScore * 100).toFixed(1)}% avg)
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recommendation data for this period</p>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.userAnalytics.reduce((sum, data) => sum + data.count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.recommendationAnalytics.reduce((sum, data) => sum + data.count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.recommendationAnalytics.length > 0 
                        ? `${(analytics.recommendationAnalytics.reduce((sum, data) => sum + data.avgScore, 0) / analytics.recommendationAnalytics.length * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
