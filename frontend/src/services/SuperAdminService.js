import axios from "axios";

const BASE_URL = "http://localhost:3000/api/superAdmins"; // The base URL for the API endpoints.

// Get all super admins
export const fetchSuperAdmins = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};