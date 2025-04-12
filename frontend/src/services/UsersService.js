import axios from "axios";

const BASE_URL = "/api/users"; // The base URL for the API endpoints.

// Get all users
export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
    
  }
};

// Update a user (admin only)
export const updateUser = async (id, data, token) => {
  const response = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Delete a user (admin only)
export const deleteUser = async (id, token) => {
  const response = await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
