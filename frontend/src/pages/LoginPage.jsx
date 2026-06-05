import { useState, useEffect } from "react";
import { useNavigate, Link, redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/common/Card";
import Button from "../components/common/Button";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Check } from "lucide-react"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import logo from "../assets/Logo.svg"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "@/lib/axios";
import loginIllustration from "../assets/login.svg"

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validations, setValidations] = useState({});
  const [currentElectionId, setCurrentElectionId] = useState(null);
  const [superAdminId, setSuperAdminId] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setShowForm(true);
    document.title = isLogin
      ? "Login | Election System"
      : "Sign Up | Election System";

    const fetchData = async () => {
      try {
        const electionsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/elections`);
        if (electionsResponse.data.success && electionsResponse.data.data.length > 0) {
          const currentElection = electionsResponse.data.data.find(election => 
            election.status === 'ongoing' || election.status === 'upcoming'
          );
          if (currentElection) {
            setCurrentElectionId(currentElection._id);
          }
        }

        const superadminResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/superadmins`);
        if (superadminResponse.data.success && superadminResponse.data.data.length > 0) {
          setSuperAdminId(superadminResponse.data.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isLogin]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Email is required</span>
        </motion.div>
      ), { duration: 3000 });
      setErrors({ ...errors, email: "Email is required" });
      setValidations({ ...validations, email: false });
      return false;
    } else if (!regex.test(email)) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Please enter a valid email</span>
        </motion.div>
      ), { duration: 3000 });
      setErrors({ ...errors, email: "Please enter a valid email" });
      setValidations({ ...validations, email: false });
      return false;
    } else {
      setErrors({ ...errors, email: null });
      setValidations({ ...validations, email: true });
      return true;
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Password is required</span>
        </motion.div>
      ), { duration: 3000 });
      setErrors({ ...errors, password: "Password is required" });
      setValidations({ ...validations, password: false });
      return false;
    } else if (password.length < 6) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Password must be at least 6 characters</span>
        </motion.div>
      ), { duration: 3000 });
      setErrors({ ...errors, password: "Password must be at least 6 characters" });
      setValidations({ ...validations, password: false });
      return false;
    } else {
      setErrors({ ...errors, password: null });
      setValidations({ ...validations, password: true });
      return true;
    }
  };

  const validateName = (name) => {
    if (!name && !isLogin) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Name is required</span>
        </motion.div>
      ), { duration: 3000 });
      setErrors({ ...errors, name: "Name is required" });
      setValidations({ ...validations, name: false });
      return false;
    } else if (name && name.trim().split(' ').length < 2 && !isLogin) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Please enter both first and last name</span>
        </motion.div>
      ), { duration: 3000 });
      setErrors({ ...errors, name: "Please enter both first and last name" });
      setValidations({ ...validations, name: false });
      return false;
    } else {
      setErrors({ ...errors, name: null });
      setValidations({ ...validations, name: true });
      return true;
    }
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!isLogin) {
      if (!confirmPassword) {
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Please confirm your password</span>
          </motion.div>
        ), { duration: 3000 });
        setErrors({ ...errors, confirmPassword: "Please confirm your password" });
        setValidations({ ...validations, confirmPassword: false });
        return false;
      } else if (confirmPassword !== password) {
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Passwords do not match</span>
          </motion.div>
        ), { duration: 3000 });
        setErrors({ ...errors, confirmPassword: "Passwords do not match" });
        setValidations({ ...validations, confirmPassword: false });
        return false;
      } else {
        setErrors({ ...errors, confirmPassword: null });
        setValidations({ ...validations, confirmPassword: true });
        return true;
      }
    }
    return true;
  };

  const validateStudentId = (id) => {
    if (!id) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Student ID is required</span>
        </motion.div>
      ), { duration: 3000 });
      setErrors({ ...errors, studentId: "Student ID is required" });
      setValidations({ ...validations, studentId: false });
      return false;
    } else if (id.length < 3) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Student ID is too short</span>
        </motion.div>
      ), { duration: 3000 });
      setErrors({ ...errors, studentId: "Student ID is too short" });
      setValidations({ ...validations, studentId: false });
      return false;
    } else {
      setErrors({ ...errors, studentId: null });
      setValidations({ ...validations, studentId: true });
      return true;
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === "email") {
      setEmail(value);
      validateEmail(value);
    } else if (id === "password") {
      setPassword(value);
      validatePassword(value);
      if (confirmPassword) validateConfirmPassword(confirmPassword);
    } else if (id === "name") {
      setName(value);
      validateName(value);
    } else if (id === "confirmPassword") {
      setConfirmPassword(value);
      validateConfirmPassword(value);
    } else if (id === "studentId") {
      setStudentId(value);
      validateStudentId(value);
    }
  };

  const handleSuccessfulLogin = (user) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="bg-green-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
      >
        <Check className="w-5 h-5" />
        <span>Welcome back, {user.firstName}! 🎉</span>
      </motion.div>
    ), { duration: 3000 });

    if (user.role === "admin") {
      if (user.isApproved === true) {
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="bg-green-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>Admin access granted!</span>
          </motion.div>
        ), { duration: 3000 });
        navigate("/admin/dashboard");
      } else if (user.isApproved === false) {
        navigate("/waiting-approval");
      }
    } else if (user.role === "student") {
      navigate("/student/dashboard");
    } else if (user.role === "superAdmin") {
      navigate("/superadmin/dashboard");
    } else {
      navigate("/");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        if (role === "student" && !studentId) {
          toast.error("Please enter your student ID");
          setLoading(false);
          return;
        }

        if (!tokenResponse.id_token) {
          const tokenResult = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
              code: tokenResponse.code,
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
              redirect_uri: window.location.origin,
              grant_type: 'authorization_code',
            }
          );

          const idToken = tokenResult.data.id_token;

          let endpoint;
          switch (role) {
            case "student":
              endpoint = `${import.meta.env.VITE_API_URL}/api/users/auth/login`;
              break;
            case "admin":
              endpoint = `${import.meta.env.VITE_API_URL}/api/admins/auth/login`;
              break;
            case "superAdmin":
              endpoint = `${import.meta.env.VITE_API_URL}/api/superadmins/login`;
              break;
            default:
              endpoint = `${import.meta.env.VITE_API_URL}/api/users/auth/login`;
          }

          const response = await axios.post(endpoint, {
            token: idToken,
            ...(role === "student" && { studentId }),
          });

          const { user, token } = response.data;
          login({ token, user });
          handleSuccessfulLogin(user);
        }
      } catch (error) {
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error.response?.data?.message || "Google login failed"}</span>
          </motion.div>
        ), { duration: 3000 });
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Google login failed. Please try again.</span>
        </motion.div>
      ), { duration: 3000 });
      setLoading(false);
    },
    flow: "auth-code",
    scope: "openid email profile",
  });

  const handleGoogleAuth = async () => {
    if (role === "student" && !studentId) {
      toast.error("Please enter your student ID");
      return;
    }
    setLoading(true);
    googleLogin();
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isNameValid = validateName(name);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isStudentIdValid = role === "student" ? validateStudentId(studentId) : true;

    if (!isLogin && (!isEmailValid || !isPasswordValid || !isNameValid || !isConfirmPasswordValid || (role === "student" && !isStudentIdValid))) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Please fix the errors in the form</span>
        </motion.div>
      ), { duration: 3000 });
      setLoading(false);
      return;
    }

    if (isLogin && (!isEmailValid || !isPasswordValid || (role === "student" && !isStudentIdValid))) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Please fix the errors in the form</span>
        </motion.div>
      ), { duration: 3000 });
      setLoading(false);
      return;
    }

    if (!isLogin && !currentElectionId) {
      toast.error("No active election found. Please try again later.");
      setLoading(false);
      return;
    }

    if (!isLogin && role === "admin" && !superAdminId) {
      toast.error("System error: No superadmin found. Please try again later.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        let endpoint;
        let payload = {
          email,
          password,
          electionId: currentElectionId,
          ...(role === "student" && { studentId })
        };

        switch (role) {
          case "student":
            endpoint = `${import.meta.env.VITE_API_URL}/api/users/login`;
            break;
          case "admin":
            endpoint = `${import.meta.env.VITE_API_URL}/api/admins/login`;
            break;
          case "superAdmin":
            endpoint = `${import.meta.env.VITE_API_URL}/api/superadmins/login`;
            break;
          default:
            endpoint = `${import.meta.env.VITE_API_URL}/api/users/login`;
        }

        const response = await axios.post(endpoint, payload);

        if (response.data.success) {
          const { token, user } = response.data.data;
          await login({ token, currentUser: user });

          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="bg-green-500 text-white px-6 py-6 rounded-[20px] shadow-lg flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Welcome back, {user.firstName}! 🎉</span>
            </motion.div>
          ), { duration: 3000 });

          handleSuccessfulLogin(user);
        } else {
          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{response.data.message || "Login failed"}</span>
            </motion.div>
          ), { duration: 3000 });
        }
      } else {
        const nameParts = name.trim().split(' ');
        let firstName, lastName;

        if (nameParts.length === 1) {
          firstName = nameParts[0];
          lastName = "";
        } else {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        }

        let endpoint;
        let payload;

        switch (role) {
          case "student":
            endpoint = `${import.meta.env.VITE_API_URL}/api/users/signup`;
            payload = {
              firstName,
              lastName,
              email,
              password,
              electionId: currentElectionId,
              studentId
            };
            break;
          case "admin":
            endpoint = `${import.meta.env.VITE_API_URL}/api/admins/signup`;
            payload = {
              firstName,
              lastName,
              email,
              password,
              electionId: currentElectionId,
              createdBy: superAdminId
            };
            break;
          default:
            endpoint = `${import.meta.env.VITE_API_URL}/api/users/signup`;
            payload = {
              firstName,
              lastName,
              email,
              password,
              electionId: currentElectionId,
              studentId
            };
        }

        const response = await axios.post(endpoint, payload);

        if (response.data.success) {
          const { token, user } = response.data.data;
          await login({ token, currentUser: user });

          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="bg-green-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>{isLogin ? "Welcome back, " : "Account created successfully! Welcome, "}{user.firstName}! 🎉</span>
            </motion.div>
          ), { duration: 3000 });

          handleSuccessfulLogin(user);
        } else {
          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{response.data.message || "Signup failed"}</span>
            </motion.div>
          ), { duration: 3000 });
        }
      }
    } catch (error) {
      console.error('Auth error:', error.response?.data || error);
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="bg-red-500 text-white px-6 py-3 rounded-[20px] shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error.response?.data?.message || "An error occurred. Please try again."}</span>
        </motion.div>
      ), { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleForm = () => {
    setErrors({});
    setValidations({});
    setShowForm(false);

    setTimeout(() => {
      setIsLogin(!isLogin);
      setShowForm(true);
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold font-satoshi">
                <img src={logo} alt="" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center flex-1 p-4">
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              className="grid w-full max-w-6xl grid-cols-1 gap-8 my-8 md:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-satoshi">
                    {isLogin ? "Welcome Back" : "Create an Account"}
                  </CardTitle>
                  <CardDescription>
                    {isLogin
                      ? "Enter your credentials to access your account"
                      : "Fill in the details to create your account"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <User size={18} />
                          </div>
                          <input
                            id="name"
                            value={name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={`w-full h-10 rounded-[20px] border ${
                              errors.name ? "border-red-500" : validations.name ? "border-green-500" : "border-input"
                            } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                          />
                          {validations.name && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                              <Check size={18} />
                            </div>
                          )}
                        </div>
                        {errors.name && (
                          <p className="flex items-center mt-1 text-xs text-red-500">
                            <AlertCircle size={12} className="mr-1" /> {errors.name}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <Mail size={18} />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          className={`w-full h-10 rounded-[20px] border ${
                            errors.email ? "border-red-500" : validations.email ? "border-green-500" : "border-input"
                          } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                        />
                        {validations.email && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                            <Check size={18} />
                          </div>
                        )}
                      </div>
                      {errors.email && (
                        <p className="flex items-center mt-1 text-xs text-red-500">
                          <AlertCircle size={12} className="mr-1" /> {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <Lock size={18} />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={handleInputChange}
                          className={`w-full h-10 rounded-[20px] border ${
                            errors.password ? "border-red-500" : validations.password ? "border-green-500" : "border-input"
                          } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="flex items-center mt-1 text-xs text-red-500">
                          <AlertCircle size={12} className="mr-1" /> {errors.password}
                        </p>
                      )}
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <Lock size={18} />
                          </div>
                          <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full h-10 rounded-[20px] border ${
                              errors.confirmPassword ? "border-red-500" : validations.confirmPassword ? "border-green-500" : "border-input"
                            } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="flex items-center mt-1 text-xs text-red-500">
                            <AlertCircle size={12} className="mr-1" /> {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Select Role</label>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="student"
                            name="role"
                            value="student"
                            checked={role === "student"}
                            onChange={() => setRole("student")}
                            className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="student" className="block text-sm">Student</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="admin"
                            name="role"
                            value="admin"
                            checked={role === "admin"}
                            onChange={() => setRole("admin")}
                            className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="admin" className="block text-sm">Admin</label>
                        </div>
                        {isLogin && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="superAdmin"
                              name="role"
                              value="superAdmin"
                              checked={role === "superAdmin"}
                              onChange={() => setRole("superAdmin")}
                              className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="superAdmin" className="block text-sm">Super Admin</label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Student ID field — only shown for student role */}
                    {role === "student" && (
                      <div className="space-y-2">
                        <label htmlFor="studentId" className="block text-sm font-medium">
                          Student ID
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                            <User size={18} />
                          </div>
                          <input
                            id="studentId"
                            value={studentId}
                            onChange={handleInputChange}
                            placeholder="Enter your student ID"
                            className={`w-full h-10 rounded-[20px] border ${
                              errors.studentId ? "border-red-500" : validations.studentId ? "border-green-500" : "border-input"
                            } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                          />
                          {validations.studentId && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                              <Check size={18} />
                            </div>
                          )}
                        </div>
                        {errors.studentId && (
                          <p className="flex items-center mt-1 text-xs text-red-500">
                            <AlertCircle size={12} className="mr-1" /> {errors.studentId}
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full transition-colors bg-primary hover:bg-primary/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isLogin ? "Logging in..." : "Creating account..."}
                        </span>
                      ) : (
                        <span>{isLogin ? "Log In" : "Sign Up"}</span>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      onError={handleError}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      {loading ? "Processing..." : "Google"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter>
                  <div className="w-full text-sm text-center">
                    {isLogin ? (
                      <p>
                        Don't have an account?{" "}
                        <button
                          className="font-medium text-primary hover:underline"
                          onClick={handleToggleForm}
                          type="button"
                        >
                          Sign up
                        </button>
                      </p>
                    ) : (
                      <p>
                        Already have an account?{" "}
                        <button
                          className="font-medium text-primary hover:underline"
                          onClick={handleToggleForm}
                          type="button"
                        >
                          Log in
                        </button>
                      </p>
                    )}
                  </div>
                </CardFooter>
              </Card>

              <div className="hidden md:block relative rounded-[20px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-[#F79F21]/90">
                  <img
                    src={loginIllustration}
                    alt="Election System"
                    className="object-cover w-full h-full mix-blend-overlay"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-center text-white"
                    >
                      <h2 className="mb-4 text-3xl font-bold font-satoshi">
                        Agahozo-Shalom Youth Village Election System
                      </h2>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default LoginPage;