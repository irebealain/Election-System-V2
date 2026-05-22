import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import axios from "axios"
import { toast } from "react-hot-toast"
import { MoreVertical, Check, X, User, Trash2, Clock } from "lucide-react"
import Modal from "../../components/common/Modal"

function AdminPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false)

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
  const handleApprove = async (adminId) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error('Please login again')
        return
      }

        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/superadmins/approve/${adminId}`,
          {},
          {
            headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        
        if (response.data.success) {
          setAdmins(admins.map(admin => 
            admin._id === adminId 
            ? { ...admin, status: 'approved' }
              : admin
        ))
        toast.success('Admin approved successfully')
        setSelectedAdmin(null)
        }
    } catch (error) {
      console.error('Error approving admin:', error)
      toast.error(error.response?.data?.message || 'Failed to approve admin')
    }
  }

  // Handle admin rejection
  const handleReject = async (adminId) => {
    try {
      const token = localStorage.getItem('authToken')
      console.log("token", token)
      if (!token) {
        toast.error('Please login again')
        return
        }

        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/superadmins/reject/${adminId}`,
          {},
          {
            headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
        
        if (response.data.success) {
          setAdmins(admins.map(admin => 
            admin._id === adminId 
            ? { ...admin, status: 'rejected' }
              : admin
        ))
        toast.success('Admin rejected successfully')
        setSelectedAdmin(null)
      }
    } catch (error) {
      console.error('Error rejecting admin:', error)
      toast.error(error.response?.data?.message || 'Failed to reject admin')
    }
  }

  // Handle admin deletion
  const handleDelete = async (adminId) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error('Please login again')
        return
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admins/${adminId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.data.success) {
        setAdmins(admins.filter(admin => admin._id !== adminId))
        toast.success('Admin deleted successfully')
        setSelectedAdmin(null)
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error(error.response?.data?.message || 'Failed to delete admin')
    }
  }

  // Handle delete all admins
  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error('Please login again')
        return
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admins/delete-all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        setAdmins([])
        toast.success('All admins deleted successfully')
        setIsDeleteAllConfirmOpen(false)
      }
    } catch (error) {
      console.error('Error deleting all admins:', error)
      toast.error(error.response?.data?.message || 'Failed to delete all admins')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Administrators Management</h1>
        <p className="text-muted-foreground">Manage and approve administrator access requests.</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={() => setIsDeleteAllConfirmOpen(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete All
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrators</CardTitle>
          <CardDescription>All system administrators and pending requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-[20px] border border-gray-200 dark:border-gray-700">
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
                {admins.map((admin) => (
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
                      <div className="relative">
                        <button
                          onClick={() => setSelectedAdmin(selectedAdmin === admin._id ? null : admin._id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        
                        {selectedAdmin === admin._id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-[20px] shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              {admin.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(admin._id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(admin._id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                  </button>
                                </>
                              )}
                                  <button
                                    onClick={() => handleDelete(admin._id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </button>
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
        </CardContent>
      </Card>

      {/* Delete All Confirmation Modal */}
      <Modal isOpen={isDeleteAllConfirmOpen} onClose={() => setIsDeleteAllConfirmOpen(false)}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[20px] shadow-xl w-full">
          <h3 className="text-lg font-semibold mb-4">Delete All Admins</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete all administrators? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteAllConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
            >
              Delete All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminPage