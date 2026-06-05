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
import PieChartWrapper from "../../components/common/PieChartWrapper"
import { getAllAdmins } from "../../services/adminService"

function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState([])
  const [candidates, setCandidates] = useState([])
  const [admins, setAdmins] = useState([])
  const [electionData, setElectionData] = useState([])

  useEffect(() => {
    document.title = "Admin Dashboard | Election System"
    // Fetch data from the backend API
    const fetchData = async () => {
      try {

        const [usersData, positionsData, candidatesData, electionsData, adminsData] = await Promise.all([
          getAllUsers(),
          getAllPositions(),
          getAllCandidates(),
          getAllElections(),
          getAllAdmins()
        ])
        setStudents(usersData || [])
        setCandidates(candidatesData || [])
        setPositions(positionsData || [])
        setAdmins(adminsData || [])

        const currentElection = Array.isArray(electionsData) ? electionsData[0] : electionsData;

        setElectionData([
          {
            name: currentElection?.title || "Current Election",
            candidates: candidatesData?.length || 0,
            positions: positionsData?.length || 0,
          },
        ])
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      finally {
        setLoading(false);
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

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
              {electionData.length}
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
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#E0E0E0' }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#333333'
                    }}
                    wrapperStyle={{ outline: 'none' }}
                    labelStyle={{ color: '#666666', marginBottom: '4px' }}
                    itemStyle={{ padding: '4px 0' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '12px' }}
                    height={28}
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
              {(() => {
                const votedCount = students.filter(student => student.voted).length;
                const notVotedCount = students.filter(student => !student.voted).length;
                const total = votedCount + notVotedCount;
                return (
                  <PieChartWrapper
                    data={[
                      {
                        name: 'Voted',
                        value: votedCount,
                        percentage: total > 0 ? ((votedCount / total) * 100).toFixed(1) : 0,
                        total: total
                      },
                      {
                        name: 'Not Voted',
                        value: notVotedCount,
                        percentage: total > 0 ? ((notVotedCount / total) * 100).toFixed(1) : 0,
                        total: total
                      }
                    ]}
                    colors={['#10B981', '#FFA600']}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    height="100%"
                    showLegend={true}
                    showTooltip={true}
                  />
                );
              })()}
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
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0">
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left p-3 font-semibold">Profile</th>
                    <th className="text-left p-3 font-semibold">Student</th>
                    <th className="text-left p-3 font-semibold">Level</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 10).map((student) => (
                    <tr key={student._id} className="border-b">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shadow-sm">
                            {student.profilePicture}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td className="p-3">{student.level}</td>
                      <td className="p-3">
                        {student.voted ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                            Voted
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
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
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0">
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left p-3 font-semibold">Admin</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.slice(0, 10).map((admin) => (
                    <tr key={admin._id} className="border-b">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shadow-sm">
                            {admin.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{admin.firstName} {admin.lastName}</div>
                            <div className="text-xs text-muted-foreground">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {admin.isApproved ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3">{admin.lastLoginAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>      </div>
    </div>
  )
}

export default AdminDashboard