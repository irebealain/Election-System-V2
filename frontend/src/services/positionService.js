import axios from 'axios';
export const getAllPositions = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/positions');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching positions count:', error);
    throw error;
  }
};
