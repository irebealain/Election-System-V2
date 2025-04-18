import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api", // change if needed
});

// Login for user (student)
export const loginUser = async (formData) => {
  const response = await API.post("/users/login", formData);
  return response.data.data;
};

// Signup for user (you’ll connect this later)
export const signupUser = async (formData) => {
  const response = await API.post("/users/signup", formData);
  return response.data.data; 
};
