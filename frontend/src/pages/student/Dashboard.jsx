import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { getAllCandidates } from "../../services/candidateService"
import { getAllPositions } from "../../services/positionService"
import { getAllUsers } from "../../services/UserService"
import { getAllElections } from "../../services/electionService"
import { getAllVotes } from "../../services/voteService"
import { motion } from "framer-motion"
import { Users, Vote, Award, Clock, BarChart2, PieChart as PieChartIcon } from "lucide-react"

function StudentDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState([])
  const [candidates, setCandidates] = useState([])
  const [elections, setElections] = useState([])
  const [currentElection, setCurrentElection] = useState(null)
  const [votes, setVotes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    document.title = "Student Dashboard | Election System"
    const fetchData = async () => {
          try {
        const [usersData, positionsData, candidatesData, electionsData, votesData] = await Promise.all([
              getAllUsers(), 
              getAllPositions(),
              getAllCandidates(),
          getAllElections(),
          getAllVotes()
            ])
            setStudents(usersData || [])
            setCandidates(candidatesData || [])
            setPositions(positionsData || [])
        setElections(Array.isArray(electionsData) ? electionsData : [electionsData])
        setVotes(votesData || [])
        
        // Find the current ongoing election
        const ongoingElection = electionsData.find(election => election.status === 'ongoing')
        setCurrentElection(ongoingElection)
          } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
          }
        }
        fetchData()
  }, [])

  // Calculate pagination
  const totalPages = Math.ceil(students.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentStudents = students.slice(startIndex, endIndex)

  // Filter positions and candidates for current election
  const electionPositions = currentElection 
    ? positions.filter(position => position.electionId === currentElection._id)
    : []
  const electionCandidates = currentElection
    ? candidates.filter(candidate => candidate.electionId === currentElection._id)
    : []

  // Calculate statistics for current election
  const totalVoters = currentElection 
    ? students.filter(student => student.electionId === currentElection._id).length
    : 0
  const totalStudents = students.length
  
  // Calculate how many positions each student needs to vote for
  const requiredPositionsCount = electionPositions.length

  // Count students who have voted for all their required positions
  const votedCount = currentElection
    ? students.filter(student => {
        const studentVotes = votes.filter(
          vote => vote.studentId === student._id && vote.electionId === currentElection._id
        )
        return studentVotes.length === requiredPositionsCount
      }).length
    : 0

  const notVotedCount = totalStudents - votedCount
  const votedPercentage = totalStudents > 0 ? (votedCount / totalStudents) * 100 : 0
  const notVotedPercentage = totalStudents > 0 ? (notVotedCount / totalStudents) * 100 : 0

  // Group students by level for current election
  const levelData = students.reduce((acc, student) => {
    if (currentElection && student.electionId === currentElection._id) {
      const level = student.level || 'Unknown'
      acc[level] = (acc[level] || 0) + 1
    }
    return acc
  }, {})

  const levelChartData = Object.entries(levelData).map(([name, value]) => ({
    name,
    value,
    percentage: (value / totalVoters) * 100
  }))

  // Prepare position data for current election
  const positionChartData = electionPositions.map(position => ({
    name: position.name,
    candidates: electionCandidates.filter(candidate => candidate.positionId === position._id).length
  }))

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899']
  const LEVEL_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6']

  return (
    <motion.div 
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Student Dashboard</h1>
        <p className="text-muted-foreground">
          {currentElection 
            ? `Current Election: ${currentElection.title}`
            : "No active election at the moment"}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">All registered students</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voter Participation</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{votedCount}</div>
              <p className="text-xs text-muted-foreground">{participationRate.toFixed(1)}% participation rate</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{electionPositions.length}</div>
              <p className="text-xs text-muted-foreground">Available positions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{electionCandidates.length}</div>
              <p className="text-xs text-muted-foreground">Running candidates</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm">Voter Participation</CardTitle>
              <CardDescription className="text-xs">Percentage of students who voted in the current election</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              {totalVoters > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: 'Voted', 
                            value: votedCount,
                            percentage: votedPercentage.toFixed(1)
                          },
                          { 
                            name: 'Not Voted', 
                            value: notVotedCount,
                            percentage: notVotedPercentage.toFixed(1)
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
                              <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
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
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <PieChartIcon className="w-8 h-8 mb-2" />
                  <p className="text-xs">No voting data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm">Voters by Level</CardTitle>
              <CardDescription className="text-xs">Level distribution</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="h-[150px]">
                {levelChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelChartData}
                    cx="50%"
                    cy="55%"
                    innerRadius={50}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                        // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {levelChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                            fill={LEVEL_COLORS[index % LEVEL_COLORS.length]}
                        />
                        ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                      padding: '12px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(8px)'
                        }}
                        formatter={(value) => [`${value} students`, '']}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <PieChartIcon className="w-8 h-8 mb-2" />
                    <p className="text-xs">No level data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm">Positions and Candidates</CardTitle>
              <CardDescription className="text-xs">Candidates per position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                {positionChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={positionChartData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                      barSize={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                        interval={0}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(12px)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                          color: 'white'
                        }}
                        formatter={(value) => [
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-white">{value} candidates</span>
                          </div>,
                          ''
                        ]}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                      />
                      <Bar
                        dataKey="candidates"
                        fill="#F97316"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                      <BarChart2 className="w-8 h-8" />
                    </div>
                    <p className="text-xs mt-2">No position data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Student Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle>Student Voting Status</CardTitle>
            <CardDescription>Overview of student participation in the current election</CardDescription>
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
                {currentStudents.map((student) => (
                    <tr 
                      key={student._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
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
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                        ${currentElection && votes.some(v => v.studentId === student._id && v.electionId === currentElection._id)
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5
                          ${currentElection && votes.some(v => v.studentId === student._id && v.electionId === currentElection._id)
                            ? 'bg-green-500 dark:bg-green-400'
                            : 'bg-yellow-500 dark:bg-yellow-400'
                          }`}
                        />
                        {currentElection && votes.some(v => v.studentId === student._id && v.electionId === currentElection._id)
                          ? 'Voted'
                          : 'Not Voted'}
                        </span>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {student.createdAt ? (
                        new Date(student.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Not available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, students.length)} of {students.length} students
            </div>
            <div className="flex items-center gap-2">
              <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-sm rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white dark:bg-primary-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}

export default StudentDashboard
