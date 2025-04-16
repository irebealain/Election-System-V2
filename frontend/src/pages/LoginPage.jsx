import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
// import ModeToggle from "../components/common/ModeToggle"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Check } from "lucide-react"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import logo from "../assets/Logo.svg"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "@/lib/axios";
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
  const [studentLevel, setStudentLevel] = useState("upper"); // Default to "upper" level

  // For animation purposes
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Fade in form animation on mount
    setShowForm(true);
    document.title = isLogin
      ? "Login | Election System"
      : "Sign Up | Election System";
  }, [isLogin]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors({ ...errors, email: "Email is required" });
      setValidations({ ...validations, email: false });
      return false;
    } else if (!regex.test(email)) {
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
      setErrors({ ...errors, password: "Password is required" });
      setValidations({ ...validations, password: false });
      return false;
    } else if (password.length < 6) {
      setErrors({
        ...errors,
        password: "Password must be at least 6 characters",
      });
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
      setErrors({ ...errors, name: "Name is required" });
      setValidations({ ...validations, name: false });
      return false;
    } else if (name && name.length < 2 && !isLogin) {
      setErrors({ ...errors, name: "Name is too short" });
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
        setErrors({
          ...errors,
          confirmPassword: "Please confirm your password",
        });
        setValidations({ ...validations, confirmPassword: false });
        return false;
      } else if (confirmPassword !== password) {
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
  // Handle input changes for the level
  const validateStudentLevel = (level) => {
    if (role === "student" && !level) {
      setErrors({ ...errors, studentLevel: "Student level is required" });
      setValidations({ ...validations, studentLevel: false });
      return false;
    } else {
      setErrors({ ...errors, studentLevel: null });
      setValidations({ ...validations, studentLevel: true });
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
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Determine the endpoint based on the role
        let endpoint;
        switch (role) {
          case "student":
            endpoint = "/users/auth/login";
            break;
          case "admin":
            endpoint = "/admins/auth/login";
            break;
          case "superadmin":
            endpoint = "/superadmins/login";
            break;
          default:
            endpoint = "/auth/student/login";
        }

        // Send the token to your backend
        const response = await axios.post(endpoint, {
          googleToken: tokenResponse.access_token,
          ...(role === "student" && { level: studentLevel }),
        });
        
        login(response.data);
        toast.success("Logged in successfully with Google!");
        redirectBasedOnRole(role);
      } catch (error) {
        toast.error(`Login failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed");
      setLoading(false);
    },
  });

  // Update your Google button click handler
  const handleGoogleAuth = async () => {
    setLoading(true);
    googleLogin();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isNameValid = validateName(name);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isStudentLevelValid =
      role === "student" ? validateStudentLevel(studentLevel) : true;
    if (
      (!isLogin &&
        (!isEmailValid ||
          !isPasswordValid ||
          !isNameValid ||
          !isConfirmPasswordValid)) ||
      (role === "student" && !isStudentLevelValid)
    ) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (isLogin && (!isEmailValid || !isPasswordValid)) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    // Simulate API request
    setTimeout(() => {
      const userData = {
        id: Math.floor(Math.random() * 1000),
        name: isLogin ? email.split("@")[0] : name,
        email,
        role,
        ...(role === "student" && { level: studentLevel }),
      };

      login(userData);

      if (isLogin) {
        toast.success("Logged in successfully!");
      } else {
        toast.success("Account created successfully!");
      }

      // Redirect based on role
      redirectBasedOnRole(role);
      setLoading(false);
    }, 1500);
  };

  const handleToggleForm = () => {
    // Reset errors and form when toggling between login and signup
    setErrors({});
    setValidations({});
    setShowForm(false);

    setTimeout(() => {
      setIsLogin(!isLogin);
      setShowForm(true);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold font-satoshi">
                <img src={logo} alt="" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 my-8"
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
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium"
                        >
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
                            className={`w-full h-10 rounded-md border ${
                              errors.name
                                ? "border-red-500"
                                : validations.name
                                ? "border-green-500"
                                : "border-input"
                            } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                          />
                          {validations.name && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                              <Check size={18} />
                            </div>
                          )}
                        </div>
                        {errors.name && (
                          <p className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle size={12} className="mr-1" />{" "}
                            {errors.name}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium"
                      >
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
                          className={`w-full h-10 rounded-md border ${
                            errors.email
                              ? "border-red-500"
                              : validations.email
                              ? "border-green-500"
                              : "border-input"
                          } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                        />
                        {validations.email && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                            <Check size={18} />
                          </div>
                        )}
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs flex items-center mt-1">
                          <AlertCircle size={12} className="mr-1" />{" "}
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium"
                      >
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
                          className={`w-full h-10 rounded-md border ${
                            errors.password
                              ? "border-red-500"
                              : validations.password
                              ? "border-green-500"
                              : "border-input"
                          } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs flex items-center mt-1">
                          <AlertCircle size={12} className="mr-1" />{" "}
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium"
                        >
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
                            className={`w-full h-10 rounded-md border ${
                              errors.confirmPassword
                                ? "border-red-500"
                                : validations.confirmPassword
                                ? "border-green-500"
                                : "border-input"
                            } bg-background pl-10 pr-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle size={12} className="mr-1" />{" "}
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Select Role
                      </label>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="student"
                            name="role"
                            value="student"
                            checked={role === "student"}
                            onChange={() => setRole("student")}
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="student" className="block text-sm">
                            Student
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="admin"
                            name="role"
                            value="admin"
                            checked={role === "admin"}
                            onChange={() => setRole("admin")}
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="admin" className="block text-sm">
                            Admin
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="superadmin"
                            name="role"
                            value="superadmin"
                            checked={role === "superadmin"}
                            onChange={() => setRole("superadmin")}
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="superadmin" className="block text-sm">
                            Super Admin
                          </label>
                        </div>
                      </div>
                    </div>

                    {role === "student" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Student Level
                        </label>
                        <div className="relative">
                          <select
                            id="studentLevel"
                            value={studentLevel}
                            onChange={(e) => setStudentLevel(e.target.value)}
                            className={`w-full h-10 rounded-md border ${
                              errors.studentLevel
                                ? "border-red-500"
                                : validations.studentLevel
                                ? "border-green-500"
                                : "border-input"
                            } bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary`}
                            required
                          >
                            <option value="upper">Upper</option>
                            <option value="lower">Lower</option>
                          </select>
                        </div>
                        {errors.studentLevel && (
                          <p className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle size={12} className="mr-1" />{" "}
                            {errors.studentLevel}
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
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
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {loading ? "Processing..." : "Google"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-center w-full">
                    {isLogin ? (
                      <p>
                        Don't have an account?{" "}
                        <button
                          className="text-primary hover:underline font-medium"
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
                          className="text-primary hover:underline font-medium"
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

              <div className="hidden md:block relative rounded-lg overflow-hidden">
                <img
                  src="/placeholder.svg"
                  alt="Election System"
                  className="object-cover w-full h-full rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-[#F79F21]/50 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <h2 className="text-3xl font-bold mb-4 font-satoshi">
                      Modern Election System
                    </h2>
                    <p className="text-lg">
                      Secure, transparent, and efficient elections for your
                      institution.
                    </p>
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
