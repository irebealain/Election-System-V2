import axios from "axios";

export const login = async (role, credentials) => {
  let url = "";

  switch (role) {
    case "user":
      url = "/api/users/login";
      break;
    case "admin":
      url = "/api/admins/login";
      break;
    case "superAdmin":
      url = "/api/superAdmins/login";
      break;
    default:
      throw new Error("Unknown role");
  }

  const response = await axios.post(url, credentials);
  return response.data;
};