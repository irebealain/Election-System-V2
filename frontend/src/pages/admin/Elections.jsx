import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/common/Card"
import Button from "../../components/common/Button"
import { Award, ArrowRight, Users, CheckCircle, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import confetti from "canvas-confetti"
import { getAllElections } from "../../services/electionService"
// Sample data for positions and candidates
const electionData = {
  President: [
    { name: "John Smith", votes: 120, color: "#46A977" },
    { name: "Sarah Johnson", votes: 85, color: "#F79F21" },
  ],
  "Vice President": [
    { name: "Michael Brown", votes: 95, color: "#46A977" },
    { name: "Emily Davis", votes: 110, color: "#F79F21" },
  ],
  Secretary: [
    { name: "David Wilson", votes: 75, color: "#46A977" },
    { name: "Lisa Thompson", votes: 65, color: "#F79F21" },
  ],
  Treasurer: [
    { name: "Jessica Lee", votes: 100, color: "#46A977" },
    { name: "Robert Taylor", votes: 80, color: "#F79F21" },
  ],
}

// Calculate total votes for each position
const positionTotals = Object.entries(electionData).reduce((acc, [position, candidates]) => {
  acc[position] = candidates.reduce((sum, candidate) => sum + candidate.votes, 0)
  return acc
}, {})

// Create position cards data
const positionCards = Object.entries(electionData).map(([position, candidates]) => {
  const totalVotes = positionTotals[position]
  const totalEligibleVoters =
    position === "President" ? 250 : position === "Vice President" ? 240 : position === "Secretary" ? 230 : 220
  const participationRate = Math.round((totalVotes / totalEligibleVoters) * 100)
  const winner = [...candidates].sort((a, b) => b.votes - a.votes)[0]
  const winnerPercentage = Math.round((winner.votes / totalVotes) * 100)

  return {
    position,
    totalVotes,
    totalEligibleVoters,
    participationRate,
    candidates: candidates.length,
    winner: winner.name,
    winnerPercentage,
    color: winner.color,
  }
})

// Overall participation data
const overallParticipationData = [
  { name: "Upper Level", total: 150, voted: 120, percentage: 80 },
  { name: "Lower Level", total: 120, voted: 90, percentage: 75 },
]

const totalStudents = overallParticipationData.reduce((sum, level) => sum + level.total, 0)
const totalVoted = overallParticipationData.reduce((sum, level) => sum + level.voted, 0)
const overallPercentage = Math.round((totalVoted / totalStudents) * 100)

function Elections() {
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [chartData, setChartData] = useState([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const confettiRef = useRef(null)
  const canvasRef = useRef(null)
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    document.title = "Elections | Admin Dashboard"
    // Fetch elections data from the backend API
    const fetchData = async () => {
      try {
        const [electionsData] = await Promise.all([
          getAllElections(),
        ])
        setElections(electionsData || [])
        const currentElection = Array.isArray(electionsData) ? electionsData[0] : electionsData;
      } catch (error) {
        console.error("Error fetching data:", error)
        
      }
      finally {
        setLoading(false)
      }
    }
    fetchData()
    // Create canvas for confetti
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas")
      canvas.id = "confetti-canvas"
      canvas.style.position = "fixed"
      canvas.style.top = "0"
      canvas.style.left = "0"
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.pointerEvents = "none"
      canvas.style.zIndex = "100"
      document.body.appendChild(canvas)
      canvasRef.current = canvas
      confettiRef.current = confetti.create(canvas, { resize: true })
    }

    return () => {
      // Clean up canvas on unmount
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current)
        canvasRef.current = null
      }
    }
  }, [])
  
  useEffect(() => {
    if (selectedPosition) {
      const data = electionData[selectedPosition].map((candidate) => {
        const percentage = Math.round((candidate.votes / positionTotals[selectedPosition]) * 100)
        return {
          ...candidate,
          percentage,
        }
      })
      setChartData(data)
    }
  }, [selectedPosition])

  const triggerConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
      })
    }
  }

  const handleViewDetails = (position) => {
    setSelectedPosition(position)
    setIsDetailsOpen(true)

    // Trigger confetti after a short delay
    setTimeout(() => {
      triggerConfetti()
    }, 500)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">
            Votes: <span className="font-medium">{payload[0].payload.votes}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-medium">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Elections</h1>
              <p className="text-muted-foreground">
                Current election: {elections && elections.length > 0 ? (
    elections.find(election => {
      // Check if election has a date property
      if (!election.date) return false;
      
      // Parse the date safely
      try {
        const electionDate = new Date(election.date);
        const today = new Date();
        
        // Check for ongoing election (same day)
        if (election.status?.toLowerCase() === 'ongoing' && 
            electionDate.toDateString() === today.toDateString()) {
          return true;
        }
        
        // Check for incoming election (future date)
        if (election.status?.toLowerCase() === 'incoming' && 
            electionDate > today) {
          return true;
        }
        
        return false;
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }
    })?.title || "No current election"
  ) : "No elections available"}
              </p>
      </div>

      {/* Overall Participation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>Overall Participation</CardTitle>
          </div>
          <CardDescription>Student participation in the current election.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
              <div className="text-3xl font-bold">{totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
              <div className="text-3xl font-bold">{totalVoted}</div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold">{overallPercentage}%</div>
              <div className="text-sm text-muted-foreground">Participation Rate</div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallParticipationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background p-3 border rounded-md shadow-md">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm">
                            Total Students: <span className="font-medium">{data.total}</span>
                          </p>
                          <p className="text-sm">
                            Voted: <span className="font-medium">{data.voted}</span>
                          </p>
                          <p className="text-sm">
                            Participation: <span className="font-medium">{data.percentage}%</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar
                  dataKey="total"
                  name="Total Students"
                  fill="#F79F21"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
                <Bar
                  dataKey="voted"
                  name="Voted"
                  fill="#46A977"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Position Cards */}
      <h2 className="text-2xl font-bold tracking-tight font-satoshi mt-8">Position Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {positionCards.map((card) => (
          <Card key={card.position} className="cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>{card.position}</CardTitle>
              <CardDescription>{card.candidates} Candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Winner */}
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Winner</p>
                    <p className="font-medium">{card.winner}</p>
                  </div>
                  <div className="ml-auto text-xl font-bold">{card.winnerPercentage}%</div>
                </div>

                {/* Participation Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Participation</span>
                    <span className="font-medium">{card.participationRate}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${card.participationRate}%`,
                        backgroundColor: "#46A977",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{card.totalVotes} votes</span>
                    <span>{card.totalEligibleVoters} eligible</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => handleViewDetails(card.position)}>
                View Details <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Position Details Dialog */}
      {isDetailsOpen && selectedPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 !mt-0">
          <div className="bg-background rounded-[20px] shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-2xl font-bold">{selectedPosition} Election Results</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Vote distribution and winner for {selectedPosition} position.
              </p>

              {/* Winner Card */}
              <div className="bg-primary/10 p-4 rounded-[20px] mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Winner</p>
                    <p className="text-xl font-bold">
                      {positionCards.find((card) => card.position === selectedPosition)?.winner}
                    </p>
                  </div>
                </div>
                <div className="text-right p-4">
                  <p className="text-sm text-muted-foreground">Winning Percentage</p>
                  <p className="text-xl font-bold">
                    {positionCards.find((card) => card.position === selectedPosition)?.winnerPercentage}%
                  </p>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="votes" name="Votes" radius={[4, 4, 0, 0]} className="cursor-pointer">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Candidate Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {chartData.map((candidate, index) => (
                  <Card key={index} className={`bg-muted/30 ${index === 0 ? "ring-2 ring-primary" : ""} pt-4`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div
                            className="h-8 w-8 rounded-full mr-3 flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: candidate.color }}
                          >
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium flex items-center">
                              {candidate.name}
                              {index === 0 && <CheckCircle className="h-4 w-4 ml-1 text-primary" />}
                            </p>
                            <p className="text-sm text-muted-foreground">{candidate.votes} votes</p>
                          </div>
                        </div>
                        <div className="text-4xl font-bold">{candidate.percentage}%</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={triggerConfetti}>
                  <Award className="mr-2 h-4 w-4" />
                  Celebrate Winner
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Elections
