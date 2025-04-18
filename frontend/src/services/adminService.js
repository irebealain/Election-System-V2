import axios from 'axios';

export const getAllAdmins = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/admins')
    return response.data.data
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error
  }
}
