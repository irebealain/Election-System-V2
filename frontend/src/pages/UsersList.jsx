import React, { useEffect, useState } from "react";
import axios from "axios";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/users");
        console.log("Fetched users:", response.data);
        setUsers(response.data.data); // <-- You had `setUser` instead of `setUsers`
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">All Users</h2>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Only display the user list if 'users' is an array and not loading */}
      {!loading && Array.isArray(users) && users.length === 0 && <p>No users found.</p>}

      <ul className="space-y-3">
        {/* Only map over 'users' if it is an array and not loading */}
        {!loading && Array.isArray(users) &&
          users.map((user) => (
            <li
              key={user._id}
              className="border p-4 rounded-lg shadow-sm bg-gray-50"
            >
              <p className="font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default UsersList;
