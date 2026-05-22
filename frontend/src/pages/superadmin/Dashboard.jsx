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
import { getAllPositions } from "../../services/positionService"
import { getAllCandidates } from "../../services/candidateService"
import { ArrowUp, ArrowDown, Users, Award, Calendar, Filter, TrendingUp, TrendingDown, AlertCircle, Clock, ExternalLink } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/common/Select"

function SuperAdminDashboard() {
  const [elections, setElections] = useState([])
  const [students, setStudents] = useState([])
  const [admins, setAdmins] = useState([])
  const [votes, setVotes] = useState([])
  const [positions, setPositions] = useState([])
  const [candidates, setCandidates] = useState([])
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
        const [electionsData, usersData, adminsData, votesData, positionsData, candidatesData] = await Promise.all([
          getAllElections(),
          getAllUsers(),
          getAllAdmins(),
          getAllVotes(),
          getAllPositions(),
          getAllCandidates()
        ])

        setElections(electionsData || [])
        setStudents(usersData || [])
        setAdmins(adminsData || [])
        setVotes(votesData || [])
        setPositions(positionsData || [])
        setCandidates(candidatesData || [])
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
        notVotedStudents: 0,
        votedPercentage: 0,
        notVotedPercentage: 0,
        participationRate: 0,
        trend: 'stable'
      }
    }

    const totalStudents = students.length
    
    // Get all positions for the current election
    const electionPositions = positions.filter(p => p.electionId === currentElection._id)
    const juniorMinisterPositions = electionPositions.filter(p => 
      p.title.toLowerCase().includes('junior minister')
    )
    const regularPositions = electionPositions.filter(p => 
      !p.title.toLowerCase().includes('junior minister')
    )
    
    // Get unique students who have voted in the current election
    const studentVotes = new Map() // Map to track votes per student
    votes.forEach(vote => {
      if (vote.electionId === currentElection._id) {
        const studentId = vote.studentId
        if (!studentVotes.has(studentId)) {
          studentVotes.set(studentId, new Set())
        }
        studentVotes.get(studentId).add(vote.positionId)
      }
    })

    // Count students who have voted for their required positions based on level
    const votedStudents = students.reduce((count, student) => {
      const studentVoteSet = studentVotes.get(student._id)
      if (!studentVoteSet) return count

      if (student.level === 'lower') {
        // Lower level students need to vote for all junior minister positions
        const hasVotedAll = juniorMinisterPositions.every(position => 
          studentVoteSet.has(position._id)
        )
        return hasVotedAll ? count + 1 : count
      } else if (student.level === 'upper') {
        // Upper level students need to vote for all regular positions
        const hasVotedAll = regularPositions.every(position => 
          studentVoteSet.has(position._id)
        )
        return hasVotedAll ? count + 1 : count
      }
      return count
    }, 0)

    const notVotedStudents = totalStudents - votedStudents
    
    // Calculate percentages
    const votedPercentage = totalStudents > 0 ? (votedStudents / totalStudents) * 100 : 0
    const notVotedPercentage = totalStudents > 0 ? (notVotedStudents / totalStudents) * 100 : 0
    const participationRate = Math.round(votedPercentage)

    // Calculate voting trend
    const lastHourVotes = votes.filter(v => {
      const voteDate = new Date(v.createdAt)
      const hourAgo = new Date()
      hourAgo.setHours(hourAgo.getHours() - 1)
      return voteDate > hourAgo && v.electionId === currentElection._id
    }).length

    const trend = lastHourVotes > 0 ? 'up' : 'stable'

    return {
      totalStudents,
      votedStudents,
      notVotedStudents,
      votedPercentage: votedPercentage.toFixed(1),
      notVotedPercentage: notVotedPercentage.toFixed(1),
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
    return elections.map(election => {
      const electionPositions = positions.filter(p => p.electionId === election._id)
      const electionCandidates = candidates.filter(c => c.electionId === election._id)
      const positionsWithCandidates = electionPositions.filter(pos => 
        electionCandidates.some(cand => cand.positionId === pos._id)
      )
      
      // Calculate voter turnout
      const electionVotes = votes.filter(v => v.electionId === election._id)
      const eligibleVoters = students.length // Can be refined based on election criteria
      const voterTurnout = eligibleVoters > 0 ? (electionVotes.length / eligibleVoters) * 100 : 0

      // Calculate candidate distribution
      const totalCandidates = electionCandidates.length
      const avgCandidatesPerPosition = electionPositions.length > 0 
        ? totalCandidates / electionPositions.length 
        : 0

      return {
        name: election.title,
        positions: electionPositions.length,
        candidates: totalCandidates,
        filledPositions: positionsWithCandidates.length,
        positionsFillRate: electionPositions.length > 0 
          ? (positionsWithCandidates.length / electionPositions.length) * 100 
          : 0,
        candidatesPerPosition: avgCandidatesPerPosition,
        voterTurnout,
        status: election.status
      }
    })
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
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-1.5 bg-green-50 dark:bg-green-900/20 rounded-[20px]">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">{electionStats.activeElections}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-[20px]">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{electionStats.completedElections}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-[20px]">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{electionStats.upcomingElections}</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </div>

                {/* Status Distribution Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Status Distribution</span>
                    <span className="text-gray-500">{electionStats.totalElections} total</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden flex">
                    {/* Ongoing Elections */}
                    <div 
                      className="h-full bg-green-500 dark:bg-green-400 transition-all duration-500"
                      style={{ 
                        width: `${(electionStats.activeElections / electionStats.totalElections) * 100}%`,
                        marginRight: electionStats.activeElections > 0 ? '1px' : '0'
                      }}
                    />
                    {/* Completed Elections */}
                    <div 
                      className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                      style={{ 
                        width: `${(electionStats.completedElections / electionStats.totalElections) * 100}%`,
                        marginRight: electionStats.completedElections > 0 ? '1px' : '0'
                      }}
                    />
                    {/* Upcoming Elections */}
                    <div 
                      className="h-full bg-yellow-500 dark:bg-yellow-400 transition-all duration-500"
                      style={{ 
                        width: `${(electionStats.upcomingElections / electionStats.totalElections) * 100}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-green-500 dark:bg-green-400 rounded-full"></span>
                      <span className="text-gray-600 dark:text-gray-400">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                      <span className="text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></span>
                      <span className="text-gray-600 dark:text-gray-400">Upcoming</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">Candidates & Positions</CardTitle>
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
              <div className="space-y-6 pt-4">
                {getElectionChartData()
                  .filter(election => election.status === 'ongoing')
                  .map((election) => (
                    <div key={election.name} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{election.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                            Active
                          </span>
                        </div>
                      </div>
                      
                      {/* Positions progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-purple-600 dark:text-purple-400">Positions Filled</span>
                          <span className="text-gray-500">{election.filledPositions}/{election.positions} positions</span>
                        </div>
                        <div className="h-2 bg-purple-100 dark:bg-purple-900/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 dark:bg-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${election.positionsFillRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Candidates progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-orange-600 dark:text-orange-400">Candidates per Position</span>
                          <span className="text-gray-500">{election.candidates} total</span>
                        </div>
                        <div className="h-2 bg-orange-100 dark:bg-orange-900/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 dark:bg-orange-400 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min((election.candidatesPerPosition / 3) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-[20px]">
                          <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Position Fill Rate</p>
                          <p className="text-sm font-semibold mt-1">{Math.round(election.positionsFillRate)}%</p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-[20px]">
                          <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Avg. Candidates/Position</p>
                          <p className="text-sm font-semibold mt-1">{election.candidatesPerPosition.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="h-[8.3rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: 'Voted', 
                            value: studentStats.votedStudents,
                            percentage: studentStats.votedPercentage 
                          },
                          { 
                            name: 'Not Voted', 
                            value: studentStats.notVotedStudents,
                            percentage: studentStats.notVotedPercentage 
                          }
                        ]}
                        cx="50%"
                        cy="48%"
                        innerRadius={40}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill="#10B981" className="transition-opacity" strokeWidth={2} />
                        <Cell fill="#FFA600" className="transition-opacity" strokeWidth={2} />
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 p-3 rounded-[20px] shadow-xl border border-gray-100 dark:border-gray-700">
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.name}</p>
                                <div className="mt-1 space-y-0.5">
                                  <p className="text-xs font-medium">
                                    <span className="text-gray-500 dark:text-gray-400">Count:</span>{' '}
                                    <span className="text-gray-900 dark:text-gray-100">{data.value}</span>
                                  </p>
                                  <p className="text-xs font-medium">
                                    <span className="text-gray-500 dark:text-gray-400">Percentage:</span>{' '}
                                    <span className="text-gray-900 dark:text-gray-100">{data.percentage}%</span>
                                  </p>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Legend 
                        verticalAlign="top"
                        height={36}
                        iconSize={8}
                        iconType="circle"
                        formatter={(value, entry) => (
                          <span className="mt-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {value} ({entry.payload.percentage}%)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-[20px]">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Current Election</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{studentStats.currentElection.title}</p>
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
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Students</CardTitle>
                <CardDescription className="mt-1">Students registered for the current election</CardDescription>
              </div>
              <div 
                onClick={() => navigate("/superadmin/students")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors"
                title="View all students"
              >
                <ExternalLink className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Student</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Level</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 5).map((student, index) => (
                    <tr 
                      key={student._id} 
                      className={`
                        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                        ${index !== students.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                      `}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400 font-medium">
                            {student.firstName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-[20px] bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                          {student.level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const studentVotes = new Set(
                            votes
                              .filter(v => v.studentId === student._id)
                              .map(v => v.positionId)
                          )

                          const hasVoted = studentVotes.size > 0

                          if (hasVoted) {
                            return (
                              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400 text-[10px]">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 mr-1.5"></span>
                                Voted
                              </span>
                            )
                          } else {
                            return (
                              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-900/30 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300 text-[10px]">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-400 mr-1.5"></span>
                                Not Voted
                              </span>
                            )
                          }
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(student.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Admins</CardTitle>
                <CardDescription className="mt-1">Administrators with access to the system</CardDescription>
              </div>
              <div 
                onClick={() => navigate("/superadmin/admins")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors"
                title="View all admins"
              >
                <ExternalLink className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Admin Information</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.slice(0, 5).map((admin, index) => (
                    <tr 
                      key={admin._id} 
                      className={`
                        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                        ${index !== admins.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                      `}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400 font-medium">
                            {admin.firstName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {admin.firstName} {admin.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                          {admin.lastLogin ? (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(admin.lastLogin).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">Never</span>
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
      </div>
    </div>
  )
}

export default SuperAdminDashboard
