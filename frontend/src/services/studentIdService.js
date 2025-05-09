import axios from 'axios';


// Add token to all requests
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const uploadStudentIds = async (studentIds) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/student-ids/upload`,
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
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/student-ids`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching student IDs:', error);
    throw error;
  }
};

export const uploadStudentIdsExcel = async (file, electionId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('electionId', electionId);

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/superadmins/upload-student-ids`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading student IDs Excel:', error);
    throw error;
  }
}; 