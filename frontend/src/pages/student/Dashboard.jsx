import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { getAllCandidates } from "../../services/candidateService"
import { getAllPositions } from "../../services/positionService"
import { getAllUsers } from "../../services/UserService"
import { getAllElections } from "../../services/electionService"
import { getAllVotes } from "../../services/voteService"
import { motion } from "framer-motion"
import { Users, Vote, Award, Clock, BarChart2, PieChart as PieChartIcon, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import PieChartWrapper from "../../components/common/PieChartWrapper"
import Button from "../../components/common/Button"
import { Input } from "../../components/common/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/common/Select"

function StudentDashboard() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
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

        // Find the current ongoing election first
        const electionsArray = Array.isArray(electionsData) ? electionsData : [electionsData]
        const ongoingElection = electionsArray.find(election => election && election.status === 'ongoing')
        setCurrentElection(ongoingElection)

        // Filter users registered only in the current or ongoing election
        const electionUsers = ongoingElection
          ? (usersData || []).filter(user => user.electionId === ongoingElection._id)
          : []

        setStudents(electionUsers)
        setFilteredStudents(electionUsers)
        setCandidates(candidatesData || [])
        setPositions(positionsData || [])
        setElections(electionsArray)
        setVotes(votesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let result = [...students]

    if (searchQuery) {
      result = result.filter(student =>
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedLevel !== "all") {
      result = result.filter(student => student.level === selectedLevel)
    }

    setFilteredStudents(result)
    setCurrentPage(1)
  }, [students, searchQuery, selectedLevel])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

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
      acc[level] = { total: 0, voted: 0, partiallyVoted: 0 }
    }
    acc[level].total++

    const studentVoteSet = studentVotes.get(student._id)
    if (studentVoteSet) {
      if (level === 'lower') {
        // Check if completed all junior minister positions
        if (juniorMinisterPositions.every(pos => studentVoteSet.has(pos._id))) {
          acc[level].voted++
        } else if (juniorMinisterPositions.some(pos => studentVoteSet.has(pos._id))) {
          acc[level].partiallyVoted++
        }
      } else if (level === 'upper') {
        // Check if completed all regular positions
        if (regularPositions.every(pos => studentVoteSet.has(pos._id))) {
          acc[level].voted++
        } else if (regularPositions.some(pos => studentVoteSet.has(pos._id))) {
          acc[level].partiallyVoted++
        }
      }
    }
    return acc
  }, {})

  // Transform stats into chart data format
  const levelChartData = Object.entries(levelStats)
    .sort((a, b) => b[1].total - a[1].total) // Sort by total count descending
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      voted: stats.voted,
      partiallyVoted: stats.partiallyVoted,
      notVoted: stats.total - stats.voted - stats.partiallyVoted,
      percentage: stats.total > 0 ? ((stats.voted + stats.partiallyVoted) / stats.total) * 100 : 0,
      completePercentage: stats.total > 0 ? (stats.voted / stats.total) * 100 : 0
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
      className="p-6 space-y-6"
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
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
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
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Voter Participation</CardTitle>
              <Vote className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{votedCount}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{participationRate}% participation rate</p>
                <div className={`flex items-center gap-1 ${votingTrend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                  {votingTrend === 'up' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
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
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
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
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{electionCandidates.length}</div>
              <p className="text-xs text-muted-foreground">Running candidates</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="transition-all duration-300 hover:shadow-xl border-primary/20 bg-gradient-to-br from-background to-muted/50">
            <CardHeader>
              <CardTitle className="text-base font-bold">Voter Participation</CardTitle>
              <CardDescription className="text-xs">Students who completed all required votes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {totalStudents > 0 ? (
                  <PieChartWrapper
                    data={[
                      {
                        name: 'All Positions Voted',
                        value: votedCount,
                        percentage: votedPercentage.toFixed(1),
                        total: totalStudents
                      },
                      {
                        name: 'Not Voted',
                        value: students.filter(student => !studentVotes.has(student._id)).length,
                        percentage: ((students.filter(student => !studentVotes.has(student._id)).length / totalStudents) * 100).toFixed(1),
                        total: totalStudents
                      }
                    ]}
                    colors={['#06B6D4', '#F97316']}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    height="100%"
                    showLegend={true}
                    showTooltip={true}
                    startAngle={90}
                    endAngle={-270}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
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
          <Card className="transition-all duration-300 hover:shadow-xl border-primary/20 bg-gradient-to-br from-background to-muted/50">
            <CardHeader>
              <CardTitle className="text-base font-bold">Voters by Level</CardTitle>
              <CardDescription className="text-xs">Student level distribution with voting status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
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
                        dataKey="total"
                      >
                        {levelChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={LEVEL_COLORS[index % LEVEL_COLORS.length]}
                            className="transition-all duration-300 cursor-pointer hover:opacity-90 filter drop-shadow-md"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 p-3 rounded-[20px] shadow-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {data.name} Level
                                </p>
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{data.total}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Completed All:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">{data.voted}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">No Votes:</span>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">{data.notVoted}</span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-500 dark:text-gray-400">Complete Voting:</span>
                                      <span className="font-medium text-primary">{data.completePercentage.toFixed(1)}%</span>
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
                          <span className="flex items-center gap-1 text-xs font-medium">
                            <span>{entry.payload.name}</span>
                            <span className="text-primary">({entry.payload.percentage.toFixed(0)}%)</span>
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
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
          <Card className="transition-all duration-300 hover:shadow-xl border-primary/20 bg-gradient-to-br from-background to-muted/50">
            <CardHeader>
              <CardTitle className="text-base font-bold">Positions & Candidates</CardTitle>
              <CardDescription className="text-xs">Candidate distribution across positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {positionChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={positionChartData}
                      margin={{ top: 20, right: 15, left: 15, bottom: 60 }}
                      barSize={32}
                      barGap={4}
                    >
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#D946EF" />
                        </linearGradient>
                        <filter id="shadow">
                          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.15" />
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
                              <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 p-3 rounded-[20px] shadow-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {payload[0].payload.name}
                                </p>
                                <div className="mt-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
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
                        radius={[10, 10, 0, 0]}
                        fill="url(#barGradient)"
                        filter="url(#shadow)"
                        animationBegin={200}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <div className="p-2 bg-gray-100 rounded-full dark:bg-gray-800">
                      <BarChart2 className="w-8 h-8" />
                    </div>
                    <p className="mt-2 text-xs">No position data available</p>
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
        <Card className="transition-all duration-300 hover:shadow-xl border-primary/20 bg-gradient-to-br from-background to-muted/50">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <CardTitle className="text-lg">Total Voters</CardTitle>
                <CardDescription>Complete student directory for the current election</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8 w-full md:w-[250px] text-xs bg-white/50 dark:bg-gray-900/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[140px] h-8 text-xs bg-white/50 dark:bg-gray-900/50">
                    <Filter className="h-3.5 w-3.5 mr-2" />
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Levels</SelectItem>
                    <SelectItem value="upper" className="text-xs">Upper Level</SelectItem>
                    <SelectItem value="lower" className="text-xs">Lower Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-[20px] border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Student Information</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Level</th>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((student) => {
                    const hasVoted = currentElection ? votes.some(v => v.studentId === student._id && v.electionId === currentElection._id) : false
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400 font-medium">
                              {student.firstName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-300">{student.level}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-300">
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : <span className="text-gray-400 dark:text-gray-500">Not available</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-[10px] text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-[10px] h-7"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-7 h-7 p-0 text-[10px]"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-[10px] h-7"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default StudentDashboard
