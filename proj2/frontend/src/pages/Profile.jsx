import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  /* Profile page component
    Displays user profile information
  */
  const { user } = useAuth();

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Profile</h2>
      {user ? (
        <div className="bg-white shadow p-3 rounded">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>No user logged in.</p>
      )}
    </div>
  );
}
