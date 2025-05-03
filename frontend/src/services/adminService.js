import instance from '../lib/axios';

export const getAllAdmins = async () => {
  try {
    const response = await instance.get('/api/admins');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};
