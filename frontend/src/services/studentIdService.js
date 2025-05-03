import axios from 'axios';

const API_URL = 'http://localhost:3000/api/student-ids';

// Add token to all requests
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const uploadStudentIds = async (studentIds) => {
  try {
    const response = await axios.post(
      `${API_URL}/upload`,
      { studentIds },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading student IDs:', error);
    throw error;
  }
};

export const getAllStudentIds = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching student IDs:', error);
    throw error;
  }
}; 