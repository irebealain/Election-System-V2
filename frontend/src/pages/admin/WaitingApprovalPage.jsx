// In src/pages/WaitingApprovalPage.jsx
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, LogOut, CheckCircle } from "lucide-react";
import Button from "../../components/common/Button";
import logo from "../../assets/Logo.svg";
import { Link } from "react-router-dom";

function WaitingApprovalPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not logged in
    if (!currentUser) {
      navigate("/login");
    }
    // Redirect to dashboard if approved
    else if (currentUser.role === "admin" && currentUser.isApproved) {
      navigate("/admin/dashboard");
    }
  }, [currentUser, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Logo" className="h-8" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[20px] shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary dark:text-primary-400" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-4 font-satoshi text-gray-900 dark:text-gray-100"
          >
            Account Pending Approval
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-300 mb-8"
          >
            Your admin account is waiting for approval. You'll be notified once 
            your account has been approved by a super admin.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 text-primary dark:text-primary-400" />
              <span>Waiting for review</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default WaitingApprovalPage;