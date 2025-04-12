import React, {useEffect, useState} from "react";
import axios from "axios";
const Dashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/admins");
        console.log("Fetched admins:", response.data);
        setAdmins(response.data.data); // <-- You had `setUser` instead of `setUsers`
      } catch (err) {
        console.error("Error fetching admins:", err);
        setError("Failed to load admins");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Admins</h2>

{loading && <p>Loading users...</p>}
{error && <p className="text-red-500">{error}</p>}

{/* Only display the user list if 'users' is an array and not loading */}
{!loading && Array.isArray(admins) && admins.length === 0 && <p>No users found.</p>}

<ul className="space-y-3">
  {/* Only map over 'users' if it is an array and not loading */}
  {!loading && Array.isArray(admins) &&
    admins.map((admin) => (
      <li
        key={admin._id}
        className="border p-4 rounded-lg shadow-sm bg-gray-50"
      >
        <p className="font-semibold">
          {admin.firstName} {admin.lastName}
        </p>
        <p className="text-sm text-gray-600">{admin.email}</p>
      </li>
    ))}
</ul>
    </div>
  )
}

export default Dashboard
