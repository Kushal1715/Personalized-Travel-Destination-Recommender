'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
}

interface TravelPreferences {
  budget: string;
  travelStyle: string[];
  interests: string[];
  preferredClimate: string;
  preferredDuration: string;
  preferredSeason: string;
  accommodationType: string;
  transportationPreference: string;
  groupSize: string;
  accessibility: string[];
}

export default function PreferencesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewRecommendations, setPreviewRecommendations] = useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const router = useRouter();

  const [preferences, setPreferences] = useState<TravelPreferences>({
    budget: '',
    travelStyle: [],
    interests: [],
    preferredClimate: '',
    preferredDuration: '',
    preferredSeason: '',
    accommodationType: '',
    transportationPreference: '',
    groupSize: '',
    accessibility: []
  });

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
      // TODO: Load existing preferences from API
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handlePreferenceChange = (field: keyof TravelPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayPreferenceChange = (field: keyof TravelPreferences, value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setSaveMessage('Preferences saved successfully!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      setSaveMessage('Error saving preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewRecommendations = async () => {
    setIsLoadingPreview(true);
    try {
      const token = localStorage.getItem('token');
      
      // First save preferences temporarily
      await fetch('http://localhost:5000/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      // Then get recommendations
      const response = await fetch('http://localhost:5000/api/recommendations/personalized?algorithm=hybrid&limit=3', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewRecommendations(data.recommendations || []);
        setShowPreview(true);
      } else {
        setSaveMessage('Error generating preview recommendations');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setSaveMessage('Error generating preview recommendations');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">TravelAI</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Your Travel Preferences</h1>
            <p className="text-gray-600">
              Help us understand your travel style to provide personalized destination recommendations
            </p>
          </div>

          {saveMessage && (
            <div className={`mb-6 p-4 rounded-md ${
              saveMessage.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {saveMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's your travel budget?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Budget', 'Moderate', 'Luxury', 'Ultra-Luxury'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="budget"
                      value={option}
                      checked={preferences.budget === option}
                      onChange={(e) => handlePreferenceChange('budget', e.target.value)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's your travel style? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Adventure', 'Relaxation', 'Cultural', 'Food & Wine', 'Nature', 'Urban', 'Historical', 'Romantic', 'Family-Friendly'].map((style) => (
                  <label key={style} className="flex items-center">
                    <input
                      type="checkbox"
                      value={style}
                      checked={preferences.travelStyle.includes(style)}
                      onChange={(e) => handleArrayPreferenceChange('travelStyle', style, e.target.checked)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{style}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What interests you most? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Museums', 'Beaches', 'Mountains', 'Shopping', 'Nightlife', 'Hiking', 'Photography', 'Local Markets', 'Architecture', 'Wildlife', 'Spa & Wellness', 'Sports'].map((interest) => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      value={interest}
                      checked={preferences.interests.includes(interest)}
                      onChange={(e) => handleArrayPreferenceChange('interests', interest, e.target.checked)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Climate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred climate
              </label>
              <select
                value={preferences.preferredClimate}
                onChange={(e) => handlePreferenceChange('preferredClimate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select climate preference</option>
                <option value="Tropical">Tropical</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Temperate">Temperate</option>
                <option value="Cold">Cold</option>
                <option value="Desert">Desert</option>
                <option value="Any">Any climate</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred trip duration
              </label>
              <select
                value={preferences.preferredDuration}
                onChange={(e) => handlePreferenceChange('preferredDuration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select duration</option>
                <option value="Weekend">Weekend (2-3 days)</option>
                <option value="Week">Week (5-7 days)</option>
                <option value="Two Weeks">Two weeks (10-14 days)</option>
                <option value="Month">Month (3-4 weeks)</option>
                <option value="Long Term">Long term (1+ months)</option>
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred season
              </label>
              <select
                value={preferences.preferredSeason}
                onChange={(e) => handlePreferenceChange('preferredSeason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select season</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
                <option value="Any">Any season</option>
              </select>
            </div>

            {/* Accommodation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred accommodation type
              </label>
              <select
                value={preferences.accommodationType}
                onChange={(e) => handlePreferenceChange('accommodationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select accommodation</option>
                <option value="Hotel">Hotel</option>
                <option value="Resort">Resort</option>
                <option value="Hostel">Hostel</option>
                <option value="Vacation Rental">Vacation Rental</option>
                <option value="Camping">Camping</option>
                <option value="Any">Any type</option>
              </select>
            </div>

            {/* Transportation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Transportation preference
              </label>
              <select
                value={preferences.transportationPreference}
                onChange={(e) => handlePreferenceChange('transportationPreference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select transportation</option>
                <option value="Public Transport">Public Transport</option>
                <option value="Rental Car">Rental Car</option>
                <option value="Walking">Walking</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Guided Tours">Guided Tours</option>
                <option value="Any">Any option</option>
              </select>
            </div>

            {/* Group Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Group size
              </label>
              <select
                value={preferences.groupSize}
                onChange={(e) => handlePreferenceChange('groupSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select group size</option>
                <option value="Solo">Solo Traveler</option>
                <option value="Couple">Couple</option>
                <option value="Family">Family (3-5 people)</option>
                <option value="Small Group">Small Group (6-10 people)</option>
                <option value="Large Group">Large Group (10+ people)</option>
              </select>
            </div>

            {/* Accessibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Accessibility requirements (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Wheelchair Accessible', 'Elevator Access', 'Ground Floor Rooms', 'Accessible Bathrooms', 'Sign Language', 'Audio Guides', 'None'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={preferences.accessibility.includes(option)}
                      onChange={(e) => handleArrayPreferenceChange('accessibility', option, e.target.checked)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handlePreviewRecommendations}
                  disabled={isLoadingPreview || isSaving}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingPreview ? 'Generating Preview...' : '🤖 Preview AI Recommendations'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </form>

          {/* AI Preview Section */}
          {showPreview && previewRecommendations.length > 0 && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-900">🤖 AI Preview - Based on Your Current Preferences</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Hide Preview
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {previewRecommendations.map((rec, index) => (
                  <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rec.destinationName}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {(rec.finalScore * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.destinationCountry}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{rec.explanation}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  href="/dashboard/recommendations"
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  View Full Recommendations →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
