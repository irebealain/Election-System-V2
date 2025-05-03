import instance from '../lib/axios';

export const getAllVotes = async () => {
  try {
    const response = await instance.get('/api/votes');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching votes:', error);
    throw error;
  }
}; 