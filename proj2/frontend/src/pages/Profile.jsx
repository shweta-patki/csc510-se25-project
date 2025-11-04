import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as authServices from '../services/authServices';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const points = await authServices.getPoints();
        setProfileData({ points });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProfileData();
    }
  }, [user]);

  if (!user) return <p className="p-4">No user logged in.</p>;
  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* User Info Section */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
        <div className="space-y-3">
          <p className="text-lg"><strong>Username:</strong> {user.username}</p>
        </div>
      </div>

      {/* Points Section */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <h2 className="text-2xl font-semibold mb-4">Rewards Points</h2>
        <div className="space-y-3">
          <p className="text-lg"><strong>Current Points:</strong> {profileData?.points?.points || 0}</p>
          <p className="text-lg"><strong>Points Value:</strong> ${profileData?.points?.points_value || 0}</p>
          <p className="text-sm text-gray-600 mt-4">
            Earn 1 point for every $10 in orders you deliver. 
            Redeem 10 points for $5 credit!
          </p>
        </div>
      </div>

      {/* Link to Your Runs */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Your Food Runs</h2>
          <Link 
            to="/your-runs" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            View Your Runs
          </Link>
        </div>
        <p className="text-gray-600 mt-4">
          View and manage all your food runs in the Your Runs section.
        </p>
      </div>
    </div>
  );
}
