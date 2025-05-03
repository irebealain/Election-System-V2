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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
import { useNavigate } from "react-router-dom"
import { getAllElections } from "../../services/electionService"
import { getAllUsers } from "../../services/UserService"
import { getAllAdmins } from "../../services/adminService"
import { getAllVotes } from "../../services/voteService"
import { ArrowUp, ArrowDown, Users, Award, Calendar, Filter, TrendingUp, TrendingDown, AlertCircle, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/common/Select"

function SuperAdminDashboard() {
  const [elections, setElections] = useState([])
  const [students, setStudents] = useState([])
  const [admins, setAdmins] = useState([])
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('all') // 'all', 'year', 'month', 'week'
  const [selectedMetric, setSelectedMetric] = useState('candidates') // 'candidates', 'positions', 'votes'
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Super Admin Dashboard | ElectSys"
    const fetchData = async () => {
      try {
        setError(null)
        const [electionsData, usersData, adminsData, votesData] = await Promise.all([
          getAllElections(),
          getAllUsers(),
          getAllAdmins(),
          getAllVotes()
        ])

        setElections(electionsData || [])
        setStudents(usersData || [])
        setAdmins(adminsData || [])
        setVotes(votesData || [])
          } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to fetch data. Please try again later.")
      } finally {
            setLoading(false)
          }
        }
    fetchData()
  }, [])

  // Enhanced election statistics with trends
  const getElectionStats = () => {
    const totalElections = elections.length
    const activeElections = elections.filter(e => e.status === 'ongoing').length
    const completedElections = elections.filter(e => e.status === 'completed').length
    const upcomingElections = elections.filter(e => e.status === 'upcoming').length

    // Calculate trends
    const lastMonthElections = elections.filter(e => {
      const electionDate = new Date(e.createdAt)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return electionDate > monthAgo
    }).length

    const trend = lastMonthElections > 0 ? 'up' : 'stable'

    return {
      totalElections,
      activeElections,
      completedElections,
      upcomingElections,
      trend,
      lastMonthElections
    }
  }

  // Enhanced student statistics with trends
  const getStudentStats = () => {
    const currentElection = elections.find(e => e.status === 'ongoing')
    if (!currentElection) {
      return {
        totalStudents: 0,
        votedStudents: 0,
        participationRate: 0,
        trend: 'stable'
      }
    }

    const totalStudents = students.length
    const votedStudents = votes.filter(v => v.electionId === currentElection._id).length
    const participationRate = totalStudents > 0 ? Math.round((votedStudents / totalStudents) * 100) : 0

    // Calculate voting trend
    const lastHourVotes = votes.filter(v => {
      const voteDate = new Date(v.createdAt)
      const hourAgo = new Date()
      hourAgo.setHours(hourAgo.getHours() - 1)
      return voteDate > hourAgo
    }).length

    const trend = lastHourVotes > 0 ? 'up' : 'stable'

    return {
      totalStudents,
      votedStudents,
      participationRate,
      currentElection,
      trend,
      lastHourVotes
    }
  }

  // Calculate admin statistics
  const getAdminStats = () => {
    const totalAdmins = admins.length
    const activeAdmins = admins.filter(a => a.isApproved).length
    const pendingAdmins = admins.filter(a => !a.isApproved).length

    return {
      totalAdmins,
      activeAdmins,
      pendingAdmins
    }
  }

  // Enhanced election chart data with more metrics
  const getElectionChartData = () => {
    return elections.map(election => ({
      name: election.title,
      candidates: election.candidates?.length || 0,
      positions: election.positions?.length || 0,
      votes: votes.filter(v => v.electionId === election._id).length,
      status: election.status,
      color: election.status === 'ongoing' ? '#46A977' : 
             election.status === 'completed' ? '#3B82F6' : '#F79F21',
      startDate: new Date(election.startDate).toLocaleDateString(),
      endDate: new Date(election.endDate).toLocaleDateString()
    }))
  }

  // Format student growth data
  const getStudentGrowthData = () => {
    const monthlyData = {}
    students.forEach(student => {
      const month = new Date(student.createdAt).toLocaleString('default', { month: 'short' })
      monthlyData[month] = (monthlyData[month] || 0) + 1
    })

    return Object.entries(monthlyData).map(([month, count]) => ({
      name: month,
      students: count
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-900">{error}</p>
          <p className="text-gray-600 mt-2">Please check your connection and try again.</p>
        </div>
      </div>
    )
  }

  const electionStats = getElectionStats()
  const studentStats = getStudentStats()
  const adminStats = getAdminStats()
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-satoshi">Super Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome to your election system dashboard.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] h-9">
              <Filter className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">Election Overview</CardTitle>
              <div className={`flex items-center space-x-1 ${
                electionStats.trend === 'up' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {electionStats.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span className="text-xs">{electionStats.lastMonthElections} new</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">{electionStats.totalElections}</p>
                  <p className="text-xs text-muted-foreground">Total Elections</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-primary/10 rounded-full">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">{electionStats.activeElections}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{electionStats.completedElections}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{electionStats.upcomingElections}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">Candidates & Positions</CardTitle>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidates">Candidates</SelectItem>
                  <SelectItem value="positions">Positions</SelectItem>
                  <SelectItem value="votes">Votes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {elections.length === 0 ? (
              <div className="flex items-center justify-center h-[150px]">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <AlertCircle className="w-10 h-10 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">No election data available</p>
                </div>
              </div>
            ) : (
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={getElectionChartData()} 
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tick={{ fill: '#6B7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis 
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">{label}</p>
                              <div className="space-y-0.5">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Candidates:</span> {data.candidates}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Positions:</span> {data.positions}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Votes:</span> {data.votes}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Status:</span> 
                                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium
                                    ${data.status === 'ongoing' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                      data.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'}`}>
                                    {data.status}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Period:</span> {data.startDate} - {data.endDate}
                                </p>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={24}
                      wrapperStyle={{ fontSize: '11px', color: '#6B7280' }}
                    />
                    <Bar 
                      dataKey={selectedMetric}
                      name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
                      fill={selectedMetric === 'candidates' ? '#46A977' : 
                            selectedMetric === 'positions' ? '#F79F21' : '#3B82F6'}
                      radius={[3, 3, 0, 0]}
                      barSize={15}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">Student Participation</CardTitle>
              <div className={`flex items-center space-x-1 ${
                studentStats.trend === 'up' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {studentStats.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span className="text-xs">{studentStats.lastHourVotes} new votes</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {!studentStats.currentElection ? (
              <div className="flex items-center justify-center h-[150px]">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <AlertCircle className="w-10 h-10 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">No active election to show participation</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold">{studentStats.participationRate}%</p>
                    <p className="text-xs text-muted-foreground">Participation Rate</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Voted', value: studentStats.votedStudents, color: '#46A977' },
                          { name: 'Not Voted', value: studentStats.totalStudents - studentStats.votedStudents, color: '#F79F21' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#46A977" className="hover:opacity-80 transition-opacity" />
                        <Cell fill="#F79F21" className="hover:opacity-80 transition-opacity" />
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            const percentage = ((data.value / studentStats.totalStudents) * 100).toFixed(1)
                            return (
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">{data.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Count:</span> {data.value}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Percentage:</span> {percentage}%
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={24}
                        wrapperStyle={{ fontSize: '11px', color: '#6B7280' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Current Election</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{studentStats.currentElection.title}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{studentStats.totalStudents}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Voted Students</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{studentStats.votedStudents}</p>
                  </div>
                </div>
              </div>
            )}
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
              <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/students")}>
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
                  {students.slice(0, 5).map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400 font-medium">
                            {student.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{student.level}</td>
                      <td className="p-3">
                        {votes.some(v => v.studentId === student._id) ? (
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
                      <td className="p-3 text-gray-600 dark:text-gray-300">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
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
              <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/admins")}>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {admins.slice(0, 5).map((admin) => (
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
