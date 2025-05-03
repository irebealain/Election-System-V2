import axios from "axios";
import instance from "../lib/axios";

// Login for user (student)
export const loginUser = async (formData) => {
  const response = await instance.post("/users/login", formData);
  return response.data.data;
};

// Signup for user
export const signupUser = async (formData) => {
  const response = await instance.post("/users/signup", formData);
  return response.data.data; 
};
