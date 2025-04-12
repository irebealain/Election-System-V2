import axios from "axios";

const BASE_URL = "/api/elections"; // The base URL for the API endpoints.

export const fetchElections = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching elections:", error);
    throw error;
    
  }
}