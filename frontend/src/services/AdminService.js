import axios from "axios";

const BASE_URL = "/api/admins"; // The base URL for the API endpoints.

// Get all admins
export const fetchAdmins = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};
