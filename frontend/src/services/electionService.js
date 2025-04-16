import axios from 'axios'
const API_URL = 'http://localhost:3000/api/elections'

export const getAllElections = async () => {
  try {
    const response = await axios.get(API_URL)
    return response.data.data
  } catch (error) {
    console.error('Error fetching elections:', error)
    throw error
  }
}