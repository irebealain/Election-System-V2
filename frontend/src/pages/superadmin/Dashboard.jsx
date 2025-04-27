import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Navigate } from "react-router-dom"
import { useNavigate } from "react-router-dom"

// Sample data for charts
const electionData = [
  { name: "Spring 2023", candidates: 12, positions: 4 },
  { name: "Fall 2022", candidates: 10, positions: 4 },
  { name: "Spring 2022", candidates: 8, positions: 3 },
  { name: "Fall 2021", candidates: 9, positions: 3 },
]

const studentData = [
  { name: "Jan", students: 50 },
  { name: "Feb", students: 65 },
  { name: "Mar", students: 80 },
  { name: "Apr", students: 95 },
  { name: "May", students: 120 },
]

// Sample data for tables
const students = [
  { id: 1, name: "John Doe", level: "Upper", voted: true, registeredAt: "2023-04-10" },
  { id: 2, name: "Jane Smith", level: "Lower", voted: true, registeredAt: "2023-04-11" },
  { id: 3, name: "Michael Johnson", level: "Upper", voted: false, registeredAt: "2023-04-12" },
]

function SuperAdminDashboard() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    document.title = "Super Admin Dashboard | ElectSys"
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
  }, [])
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your election system dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">+1 from last year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Candidates & Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={electionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="candidates" fill="#46A977" />
                  <Bar dataKey="positions" fill="#F79F21" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Student Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="students" stroke="#46A977" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>Students registered for the current election.</CardDescription>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Student Information</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Level</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Voting Status</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400 font-medium">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{student.level}</td>
                      <td className="p-3">
                        {student.voted ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 mr-1.5"></span>
                            Voted
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-1.5"></span>
                            Not Voted
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{student.registeredAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Admins</CardTitle>
              <CardDescription>Administrators with access to the system.</CardDescription>
            </div>
            <div className="mt-4">
              <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/superadmin/admins")}>
                View All
              </Button>
            </div>
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
                  {admins.map((admin) => (
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
                      <td className="p-3 text-gray-600 dark:text-gray-300">{admin.lastLogin}</td>
                      <td className="p-3">
                        {admin.status === "Pending" ? (
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                              Approve
                            </button>
                            <button className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
