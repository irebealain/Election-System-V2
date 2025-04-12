import React from "react";
import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { GoogleLogin } from "@react-oauth/google";
// import {jwtDecode} from "jwt-decode";
// import axios from "axios";

const LoginPage = () => {
  // const [form, setForm] = useState({ email: "", password: "" });
  // const [role, setRole] = useState("user");
  // const navigate = useNavigate();
  // const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  // const handleChange = (e) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };

  // const handleLogin = async () => {
  //   try {
  //     const route = role === "admin" ? "/api/admins/login" : role === "superAdmin" ? "/api/superAdmins/login" : "/api/users/login";
  //     const res = await axios.post(route, form);

  //     localStorage.setItem("token", res.data.token);
  //     localStorage.setItem("user", JSON.stringify(res.data.user));

  //     if (res.data.user.role === "admin") navigate("/admin/dashboard");
  //     else if (res.data.user.role === "superAdmin") navigate("/superAdmin/dashboard");
  //     else navigate("/user/dashboard");
  //   } catch (err) {
  //     alert("Login failed: " + err.response?.data?.message || err.message);
  //   }
  // };

  // const handleGoogleSuccess = async (credentialResponse) => {
  //   const decoded = jwtDecode(credentialResponse.credential);
  //   try {
  //     console.log("Google User:", decoded);
  //     alert("Google login successful");
  //   } catch (error) {
  //     console.error("Google login failed:", error);
  //     alert("Google login failed: " + error.message);
      
  //   }
  // };
  // const toggleLoginPopup = () => {
  //   setShowLoginPopup(!showLoginPopup); // Toggle login popup visibility
  // };
  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Left side */}
      <div className="w-1/2 flex items-center">
        <Input 
        className={"w-1/2 m-4 border-neutral-700 border-1 rounded-md"}
        type="email"
        name="email"
        placeholder="Email"
        />
      </div>
      {/* Right side */}
      <div></div>
    </div>
  );
};

export default LoginPage;