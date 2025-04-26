// In src/pages/WaitingApprovalPage.jsx
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
        <p className="mb-6">
          Your admin account is waiting for approval. You'll be notified once 
          your account has been approved by a super admin.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default WaitingApprovalPage;