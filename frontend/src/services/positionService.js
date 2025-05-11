import instance from '../lib/axios';

export const getAllPositions = async () => {
  try {
    const response = await instance.get('/api/positions');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch positions');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};
