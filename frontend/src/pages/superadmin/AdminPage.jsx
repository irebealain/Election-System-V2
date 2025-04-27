import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import axios from "axios"
import { toast } from "react-hot-toast"

function AdminPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
      const response = await axios.patch(`/api/superadmin/admins/${adminId}/${action}`)
      if (response.status === 200) {
        // Update admins list after successful action
        setAdmins(admins.map(admin => 
          admin._id === adminId 
            ? { ...admin, status: action === 'approve' ? 'Active' : 'Rejected' }
            : admin
        ))
        toast.success(`Administrator ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} administrator`)
      console.error(`Error ${action}ing admin:`, error)
    }
  }

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
                          <p className="font-medium text-gray-900 dark:text-gray-100">{admin.firstName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${admin.isApproved 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5
                          ${admin.isApproved 
                            ? 'bg-green-500 dark:bg-green-400'
                            : 'bg-yellow-500 dark:bg-yellow-400'
                          }`}
                        />
                        {admin.isApproved ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {admin.lastLogin || 'Never'}
                    </td>
                    <td className="p-3">
                      {admin.status === "Pending" ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(admin.id, 'approve')}
                            className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(admin.id, 'reject')}
                            className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
                          Manage
                        </button>
                      )}
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