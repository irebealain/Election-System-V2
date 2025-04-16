import { useEffect, useState } from "react"
import { getAllCandidates } from "../../services/candidateService"
import { getAllPositions } from "../../services/positionService"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { getAllUsers } from "../../services/UserService"
import { getAllElections } from "../../services/electionService"

const studentData = [
  { name: "Total", value: 120 },
  { name: "Voted", value: 85 },
]
const admins = [
  { id: 1, name: "Admin User", email: "admin@example.com", status: "Active", lastLogin: "2023-04-15" },
  { id: 2, name: "Jane Admin", email: "jane@example.com", status: "Active", lastLogin: "2023-04-14" },
]

const COLORS = ["#46A977", "#F79F21", "#FC5656", "#3E2DBF"]

function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState([])
  const [candidates, setCandidates] = useState([])
  const [electionData, setElectionData] = useState([])
  useEffect(() => {
    document.title = "Admin Dashboard | Election System"
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const [data, positionsData, candidatesData, elections] = await Promise.all([
          getAllUsers(), 
          getAllPositions(),
          getAllCandidates(),
          getAllElections()])

          setStudents(data)
          setCandidates(candidatesData)
          setPositions(positionsData)

          setElectionData([
            {
              name: elections.title,
              candidates: candidatesData.length,
              positions: positionsData.length,
            },
          ])
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      finally {
        // Handle loading state or any other UI updates
        setLoading(false);
      }
    }
    fetchData()

  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your election system dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {elections.length}
            </div>
            <p className="text-xs text-muted-foreground">+1 from last year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates & Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={electionData} className="fill-none" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#E0E0E0' }}
                  label={{ value: 'Election', position: 'insideBottom', offset: 9, fontSize: 12 }}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#E0E0E0' }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="candidates" 
                    fill="#46A977"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                    animationDuration={1500}
                  />
                  <Bar 
                    dataKey="positions" 
                    fill="#F79F21"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>

        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {studentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>Students registered for the current election.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Profile</th>
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Level</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b">
                      <td className="p-2 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {student.profilePicture}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 font-medium">
                        <div className="flex items-center gap-2">
                          
                            {student.firstName}-{student.lastName}
                          
                        </div>
                      </td>
                      <td className="p-2">{student.level}</td>
                      <td className="p-2">
                        {student.voted ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                            Voted
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                            Not Voted
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Admins</CardTitle>
              <CardDescription>Administrators with access to the system.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Admin</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b">
                      <td className="p-2 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {admin.name.charAt(0)}
                          </div>
                          <div>
                            <div>{admin.name}</div>
                            <div className="text-xs text-muted-foreground">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        {admin.status === "Active" ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-2">{admin.lastLogin}</td>
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

export default AdminDashboard
