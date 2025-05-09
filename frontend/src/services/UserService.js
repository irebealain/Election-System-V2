import axios from 'axios';
import instance from '../lib/axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/users`
// Add token to all requests
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/${userId}`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export const uploadIdCard = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('idCard', file);
    const response = await axios.post(`${API_URL}/${userId}/id-card`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading ID card:', error);
    throw error;
  }
}

export const exportUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/export`, {
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting users:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await instance.put(`/api/users/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const updateUserPassword = async (userId, passwordData) => {
  try {
    const response = await instance.put(`/api/users/${userId}/password`, passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const updateUserPrivacy = async (userId, privacySettings) => {
  try {
    const response = await instance.put(`/api/users/${userId}/privacy`, privacySettings);
    return response.data;
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    throw error;
  }
};

export const uploadProfileImage = async (userId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    const response = await instance.post(`/api/users/${userId}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const deleteAllStudents = async () => {
  try {
    const response = await axios.delete(`${API_URL}/all-students`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting all students:', error);
    throw error;
  }
};