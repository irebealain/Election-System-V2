import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import axios from "axios"
import { toast } from "react-hot-toast"
import { MoreVertical, Check, X, User, Trash2, Clock } from "lucide-react"

function AdminPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)
  const itemsPerPage = 10

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admins/`);
        setAdmins(response.data.data)
        setLoading(false)
      } catch (error) {
        toast.error("Failed to fetch administrators")
        console.error("Error fetching admins:", error)
        setLoading(false)
      }
    }

    fetchAdmins()
  }, [])

  // Handle admin approval
  const handleApproval = async (adminId, action) => {
    try {
      if (action === 'approve') {
        // Handle approval
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/superadmins/approve/${adminId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.success) {
          setAdmins(admins.map(admin => 
            admin._id === adminId 
              ? { 
                  ...admin, 
                  isApproved: true,
                  status: 'approved'
                }
              : admin
          ));
          setActiveDropdown(null);
          toast.success('Administrator approved successfully');
        }
      } else if (action === 'reject') {
        // Handle rejection
        if (!window.confirm('Are you sure you want to reject this administrator?')) {
          return;
        }

        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/superadmins/reject/${adminId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.success) {
          setAdmins(admins.map(admin => 
            admin._id === adminId 
              ? { 
                  ...admin, 
                  isApproved: false,
                  status: 'rejected'
                }
              : admin
          ));
          setActiveDropdown(null);
          toast.success('Administrator rejected successfully');
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} administrator`);
    }
  };

  // Handle admin deletion
  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this administrator?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admins/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setAdmins(admins.filter(admin => admin._id !== adminId));
        setActiveDropdown(null);
        toast.success('Administrator deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Failed to delete administrator');
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(admins.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAdmins = admins.slice(startIndex, endIndex)

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Administrators Management</h1>
        <p className="text-muted-foreground">Manage and approve administrator access requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrators</CardTitle>
          <CardDescription>All system administrators and pending requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Admin Information</th>
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Last Login</th>
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400 font-medium">
                          {admin.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{admin.firstName} {admin.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${admin.status === 'approved' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : admin.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5
                          ${admin.status === 'approved'
                            ? 'bg-green-500 dark:bg-green-400'
                            : admin.status === 'rejected'
                            ? 'bg-red-500 dark:bg-red-400'
                            : 'bg-yellow-500 dark:bg-yellow-400'
                          }`}
                        />
                        {admin.status === 'approved' ? 'Active' : 
                         admin.status === 'rejected' ? 'Rejected' : 
                         'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {admin.lastLogin ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(admin.lastLogin).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Never</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === admin._id ? null : admin._id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        
                        {activeDropdown === admin._id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              {admin.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApproval(admin._id, 'approve')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApproval(admin._id, 'reject')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                  </button>
                                </>
                              ) : admin.status === 'rejected' ? (
                                <>
                                  <button
                                    onClick={() => handleApproval(admin._id, 'approve')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleDelete(admin._id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApproval(admin._id, 'reject')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleDelete(admin._id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPage