import instance from '../lib/axios';

export const getAllCandidates = async () => {
  try {
    const response = await instance.get('/api/candidates');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};