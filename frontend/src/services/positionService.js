import instance from '../lib/axios';

export const getAllPositions = async () => {
  try {
    const response = await instance.get('/api/positions');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching positions count:', error);
    throw error;
  }
};
