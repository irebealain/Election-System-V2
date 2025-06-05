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

  // Get positions based on student level
  const juniorMinisterPositions = electionPositions.filter(p => 
    p.title.toLowerCase().includes('junior minister')
  )
  const regularPositions = electionPositions.filter(p => 
    !p.title.toLowerCase().includes('junior minister')
  )

  const totalStudents = students.length

  // Track votes per student with their positions
  const studentVotes = new Map()
  if (currentElection) {
    votes.forEach(vote => {
      if (vote.electionId === currentElection._id) {
        if (!studentVotes.has(vote.studentId)) {
          studentVotes.set(vote.studentId, new Set())
        }
        studentVotes.get(vote.studentId).add(vote.positionId)
      }
    })
  }

  // Count students who have voted for all their required positions based on level
  const votedCount = students.reduce((count, student) => {
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

  const notVotedCount = totalStudents - votedCount
  const votedPercentage = totalStudents > 0 ? (votedCount / totalStudents) * 100 : 0
  const notVotedPercentage = totalStudents > 0 ? (notVotedCount / totalStudents) * 100 : 0
  const participationRate = Math.round(votedPercentage)

  // Calculate voting trend and last hour votes
  const lastHourVotes = votes.filter(v => {
    const voteDate = new Date(v.createdAt)
    const hourAgo = new Date()
    hourAgo.setHours(hourAgo.getHours() - 1)
    return voteDate > hourAgo && v.electionId === currentElection._id
  }).length

  const votingTrend = lastHourVotes > 0 ? 'up' : 'stable'

  // Calculate level-based voting statistics
  const levelStats = students.reduce((acc, student) => {
    const level = student.level || 'Unknown'
    if (!acc[level]) {
      acc[level] = { total: 0, voted: 0 }
    }
    acc[level].total++

    const studentVoteSet = studentVotes.get(student._id)
    if (studentVoteSet) {
      if (level === 'lower' && juniorMinisterPositions.every(pos => studentVoteSet.has(pos._id))) {
        acc[level].voted++
      } else if (level === 'upper' && regularPositions.every(pos => studentVoteSet.has(pos._id))) {
        acc[level].voted++
      }
    }
    return acc
  }, {})

  const levelChartData = Object.entries(levelStats).map(([name, stats]) => ({
    name,
    total: stats.total,
    voted: stats.voted,
    notVoted: stats.total - stats.voted,
    percentage: stats.total > 0 ? (stats.voted / stats.total) * 100 : 0
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
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">{participationRate}% participation rate</p>
                <div className={`flex items-center gap-1 ${
                  votingTrend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {votingTrend === 'up' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-xs">{lastHourVotes} new votes</span>
                </div>
              </div>
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
              <CardDescription className="text-xs">Level distribution and voting progress</CardDescription>
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
                        dataKey="voted"
                      >
                        {levelChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={LEVEL_COLORS[index % LEVEL_COLORS.length]}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                  {data.name} Level
                                </p>
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{data.total}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Voted:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">{data.voted}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Not Voted:</span>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">{data.notVoted}</span>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-500 dark:text-gray-400">Completion:</span>
                                      <span className="font-medium text-primary">{data.percentage.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value, entry) => (
                          <span className="text-xs font-medium flex items-center gap-1">
                            <span>{entry.payload.name}</span>
                            <span className="text-primary">({entry.payload.percentage.toFixed(0)}%)</span>
                          </span>
                        )}
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
                      barSize={24}
                      barGap={2}
                    >
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#F97316" />
                        </linearGradient>
                        <filter id="shadow">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
                        </filter>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        opacity={0.1}
                        stroke="#94A3B8"
                      />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ 
                          fontSize: 10,
                          fill: '#64748B',
                          fontWeight: 500
                        }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                  {payload[0].payload.name}
                                </p>
                                <div className="mt-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {payload[0].value} candidates
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                        cursor={{ 
                          fill: 'rgba(148, 163, 184, 0.1)',
                          radius: [4, 4, 0, 0]
                        }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Bar
                        dataKey="candidates"
                        radius={[6, 6, 0, 0]}
                        fill="url(#barGradient)"
                        filter="url(#shadow)"
                        animationBegin={200}
                        animationDuration={1000}
                        onMouseEnter={(data, index) => {
                          const bar = document.querySelector(`path[name=candidates-${index}]`);
                          if (bar) {
                            bar.style.filter = 'brightness(1.1)';
                            bar.style.transform = 'translateY(-2px)';
                            bar.style.transition = 'all 0.3s ease';
                          }
                        }}
                        onMouseLeave={(data, index) => {
                          const bar = document.querySelector(`path[name=candidates-${index}]`);
                          if (bar) {
                            bar.style.filter = 'none';
                            bar.style.transform = 'none';
                          }
                        }}
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
                      {(() => {
                        const studentVoteSet = studentVotes.get(student._id)
                        let hasCompletedVoting = false
                        let totalRequired = 0
                        let completed = 0
                        
                        if (currentElection && studentVoteSet) {
                          if (student.level === 'lower') {
                            totalRequired = juniorMinisterPositions.length
                            completed = juniorMinisterPositions.filter(pos => studentVoteSet.has(pos._id)).length
                            hasCompletedVoting = completed === totalRequired
                          } else if (student.level === 'upper') {
                            totalRequired = regularPositions.length
                            completed = regularPositions.filter(pos => studentVoteSet.has(pos._id)).length
                            hasCompletedVoting = completed === totalRequired
                          }
                        }

                        return (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                              ${hasCompletedVoting
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : completed > 0
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                  : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
                              }`}>
                              <span className={`h-1.5 w-1.5 rounded-full mr-1.5
                                ${hasCompletedVoting
                                  ? 'bg-green-500 dark:bg-green-400'
                                  : completed > 0
                                    ? 'bg-yellow-500 dark:bg-yellow-400'
                                    : 'bg-gray-500 dark:bg-gray-400'
                                }`}
                              />
                              {hasCompletedVoting
                                ? 'Completed'
                                : completed > 0
                                  ? `${completed}/${totalRequired} Positions`
                                  : 'Not Voted'}
                            </span>
                          </div>
                        )
                      })()}
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
