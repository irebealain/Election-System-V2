import instance from '../lib/axios';

export const getAllElections = async () => {
  try {
    const response = await instance.get('/api/elections');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw error;
  }
};

export const getElectionResults = async (electionId) => {
  try {
    const response = await instance.get(`/api/elections/${electionId}/results`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching election results:', error);
    throw error;
  }
};