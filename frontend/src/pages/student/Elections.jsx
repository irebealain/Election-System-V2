import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import { Info, ThumbsUp, ChevronRight, AlertTriangle, CalendarX, Clock, Award, CheckCircle2, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import axios from "../../lib/axios"
import { cn } from "../../lib/utils"

function Elections() {
  const { currentUser } = useAuth()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [positions, setPositions] = useState([])
  const [votes, setVotes] = useState({})
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validationError, setValidationError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [votingProgress, setVotingProgress] = useState(0)

  useEffect(() => {
    document.title = "Elections | Student Dashboard"
    fetchElectionData()
    console.log(positions, "Positions fetched")
  }, [])

  useEffect(() => {
    if (election) {
      const checkVotingStatus = async () => {
        try {
          const votesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/votes`)
          const userVotes = votesResponse.data.data.filter(
            v => v.studentId === (currentUser._id || currentUser.id) && v.electionId === election._id
          )
          setHasVoted(userVotes.length > 0)
        } catch (error) {
          console.error("Error checking voting status:", error)
        }
      }
      checkVotingStatus()
    }
  }, [election, currentUser])

  const fetchElectionData = async () => {
    try {
      setLoading(true)
      // Fetch current election
      const electionResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/elections`)
      const currentElection = electionResponse.data.data.find(e => e.status === 'ongoing')
      
      if (!currentElection) {
        toast.error("No active election found")
        setElection(null)
        setPositions([])
        setCandidates([])
        return
      }
      setElection(currentElection)

      // Fetch positions for the current election
      const positionsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/positions`)
      const electionPositions = positionsResponse.data.data.filter(p => p.electionId === currentElection._id)

      // Fetch candidates for the current election
      const candidatesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/candidates`)
      const electionCandidates = candidatesResponse.data.data.filter(
        c => c.electionId === currentElection._id
      )

      // Filter positions based on student level
      const filteredPositions = electionPositions.filter(position => {
        // If student is upper level, show all positions except Junior Minister positions
        if (currentUser.level === 'upper') {
          return !position.title.toLowerCase().includes('junior minister')
        }
        // If student is lower level, show only Junior Minister positions
        else if (currentUser.level === 'lower') {
          return position.title.toLowerCase().includes('junior minister')
        }
        return true // Show all positions for any other case
      })

      // Filter positions to only include those with candidates
      const positionsWithCandidates = filteredPositions.filter(position => {
        const hasCandidates = electionCandidates.some(candidate => candidate.positionId === position._id)
        if (!hasCandidates) {
          console.log(`Position "${position.title}" has no candidates and will be hidden`)
        }
        return hasCandidates
      })

      if (positionsWithCandidates.length === 0) {
        toast.error("No positions with candidates found in the current election")
        setElection(null)
        setPositions([])
        setCandidates([])
        return
      }

      setPositions(positionsWithCandidates)
      setCandidates(electionCandidates)

      // Check if user has already voted in this election
      try {
        const votesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/votes`)
        const userVotes = votesResponse.data.data.filter(
          v => v.studentId === (currentUser._id || currentUser.id) && v.electionId === currentElection._id
        )
        
        if (userVotes.length > 0) {
          setHasVoted(true)
          // Initialize votes state with user's previous votes
          const initialVotes = {}
          userVotes.forEach(vote => {
            const candidate = electionCandidates.find(c => c._id === vote.candidateId)
            if (candidate) {
              const position = positionsWithCandidates.find(p => p._id === candidate.positionId)
              if (position) {
                initialVotes[position.title] = candidate._id
              }
            }
          })
          setVotes(initialVotes)
        }
      } catch (error) {
        console.error("Error checking user votes:", error)
        toast.error("Failed to check voting status")
      }
    } catch (error) {
      console.error("Error fetching election data:", error)
      toast.error("Failed to load election data")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (candidateId, positionId) => {
    if (hasVoted) {
      toast.error("You have already voted in this election")
      return
    }

    // Reset validation error when user votes
    setValidationError(false)

    const position = positions.find(p => p._id === positionId)
    if (!position) return

    // Check if user has already voted for this position
    if (votes[position.title] && votes[position.title] !== candidateId) {
      // If changing vote, update it
      setVotes({
        ...votes,
        [position.title]: candidateId,
      })
      toast.success(`Vote updated for ${position.title}`)
    } else if (!votes[position.title]) {
      // If not voted for this position yet, add the vote
      setVotes({
        ...votes,
        [position.title]: candidateId,
      })
      toast.success(`Vote recorded for ${position.title}`)
    } else {
      // If clicking on the same candidate, remove the vote
      const newVotes = { ...votes }
      delete newVotes[position.title]
      setVotes(newVotes)
      toast.success(`Vote removed for ${position.title}`)
    }

    // Update voting progress
    const votedPositions = Object.keys(votes).length
    const totalPositions = positions.length
    setVotingProgress((votedPositions / totalPositions) * 100)
  }

  const handleSubmitVotes = async () => {
    if (hasVoted) {
      toast.error("You have already voted in this election")
      return
    }

    const positionCount = positions.length
    const votedCount = Object.keys(votes).length

    // Check if all positions have votes
    if (votedCount < positionCount) {
      setValidationError(true)
      toast.error("Please vote for all positions before submitting")
      return
    }

    // Validate that all votes are for candidates in the current election
    const invalidVotes = Object.entries(votes).some(([positionName, candidateId]) => {
      const candidate = candidates.find(c => c._id === candidateId)
      return !candidate || candidate.electionId !== election._id
    })

    if (invalidVotes) {
      toast.error("Invalid votes detected. Please vote only for candidates in the current election.")
      return
    }

    setSubmitting(true)

    try {
      // Submit votes for each position
      const votePromises = Object.entries(votes).map(async ([positionName, candidateId]) => {
        const position = positions.find(p => p.title === positionName)
        const candidate = candidates.find(c => c._id === candidateId)
        
        if (!position || !candidate) {
          throw new Error("Invalid position or candidate")
        }

        // Double check that the candidate belongs to the current election
        if (candidate.electionId !== election._id) {
          throw new Error("Candidate does not belong to the current election")
        }

        // Prepare vote data with all required fields
        const voteData = {
          studentId: currentUser._id || currentUser.id,
          candidateId: candidate._id,
          positionId: position._id,
          electionId: election._id
        }

        // Submit the vote
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/votes`, voteData)
        
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to submit vote")
        }

        return response.data
      })

      // Wait for all votes to be submitted
      await Promise.all(votePromises)
      
      // Update UI state immediately after successful submission
      setHasVoted(true)
      setSubmitted(true)
      
      // Show success message
      toast.success("Your votes have been submitted successfully!")
    } catch (error) {
      console.error("Error submitting votes:", error)
      toast.error(error.response?.data?.message || "Failed to submit votes. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const openCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate)
    setDialogOpen(true)
  }

  const getUnvotedPositions = () => {
    return positions
      .filter(position => !votes[position.title])
      .map(position => position.title)
  }

  // Group candidates by position
  const groupedCandidates = candidates.reduce((acc, candidate) => {
    const position = positions.find(p => p._id === candidate.positionId)
    if (!position) return acc

    if (!acc[position.title]) {
      acc[position.title] = []
    }
    acc[position.title].push(candidate)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading election data...</p>
        </div>
      </div>
    )
  }

  if (!election) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-8">
          <motion.div
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <CalendarX className="w-12 h-12 text-primary" />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          >
            <Clock className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 font-satoshi">No Active Election</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          {positions.length === 0 
            ? "There are no positions with candidates in the current election."
            : "There is currently no ongoing election. Please check back later or wait for the next election period to begin."}
        </p>
        
        <motion.div
          className="flex items-center space-x-2 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Clock className="w-4" />
          <span>Next election coming soon</span>
        </motion.div>
      </motion.div>
    )
  }

  if (hasVoted) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-8">
          <motion.div
            className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          >
            <Award className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 font-satoshi">Thank You for Voting!</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You have already cast your votes in this election. The results will be announced after the election period ends.
        </p>
        
        <motion.div
          className="flex items-center space-x-2 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Clock className="w-4" />
          <span>Election ends: {new Date(election.endDate).toLocaleDateString()}</span>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outline"
            onClick={() => window.location.href = "/student/dashboard"}
            className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors duration-200"
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Elections</h1>
        <p className="text-muted-foreground">Current election: {election.title}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-2" />
          <span>Ends: {new Date(election.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Voting Progress</CardTitle>
          <CardDescription>
            {hasVoted ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>You have already voted in this election</span>
              </div>
            ) : (
              `You have voted for ${Object.keys(votes).length} out of ${positions.length} positions`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  hasVoted ? "bg-green-500" : 
                  Object.keys(votes).length === positions.length ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${(Object.keys(votes).length / positions.length) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {positions.map((position) => (
                <motion.div
                  key={position._id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors duration-200",
                    hasVoted || votes[position.title]
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                      : "border-muted hover:border-primary/50"
                  )}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="font-medium mb-1">{position.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {votes[position.title]
                      ? candidates.find((c) => c._id === votes[position.title])?.firstName + " " +
                        candidates.find((c) => c._id === votes[position.title])?.lastName
                      : "Not voted yet"}
                  </p>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {validationError && !hasVoted && (
                <motion.div
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-start"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Please vote for all positions before submitting</p>
                    <p className="text-sm mt-1">You still need to vote for: {getUnvotedPositions().join(", ")}</p>
                  </div>
                </motion.div>
              )}

              {Object.keys(votes).length === positions.length && !hasVoted && (
                <motion.div
                  className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 flex items-start"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">All positions voted!</p>
                    <p className="text-sm mt-1">You can now submit your votes</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {Object.entries(groupedCandidates).map(([positionName, positionCandidates]) => (
          <div key={positionName} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-satoshi">{positionName}</h2>
              <div className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                {positionCandidates.length} Candidates
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {positionCandidates.map((candidate) => (
                <motion.div 
                  key={candidate._id} 
                  whileHover={{ y: -5 }} 
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Card className={cn(
                    "overflow-hidden h-full transition-all duration-200",
                    hasVoted ? 'opacity-75' : '',
                    votes[positionName] === candidate._id ? 'border-primary shadow-lg shadow-primary/10' : ''
                  )}>
                    <CardHeader className="p-0">
                      <div className="relative aspect-[21/9] w-full">
                        <div className="absolute inset-0 z-10 h-[10rem]" />
                            <img
                              src={candidate.profilePic || "/placeholder.svg"}
                              alt={`${candidate.firstName} ${candidate.lastName}`}
                              className="w-full h-full object-contain p-3 transition-transform duration-300 hover:scale-105"
                              loading="lazy"
                            />
                        {hasVoted && (
                          <div className="absolute top-2 right-2 z-20">
                            <div className="inline-flex items-center rounded-full bg-green-500/90 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white shadow-lg">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Voted
                            </div>
                          </div>
                        )}
                        {!hasVoted && votes[positionName] === candidate._id && (
                          <div className="absolute top-2 right-2 z-20">
                            <div className="inline-flex items-center rounded-full bg-primary/90 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white shadow-lg">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Selected
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 flex-grow relative">
                      <CardTitle className="text-lg mb-1.5 font-satoshi">
                        {candidate.firstName} {candidate.lastName}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {candidate.mandate}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-between p-3 pt-0 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openCandidateDetails(candidate)}
                        className="hover:bg-primary/10 flex-1 h-8"
                      >
                        <Info className="h-3.5 w-3.5 mr-1.5" />
                        Details
                      </Button>

                      <Button
                        onClick={() => handleVote(candidate._id, candidate.positionId)}
                        variant={votes[positionName] === candidate._id ? "destructive" : "default"}
                        className={cn(
                          "transition-colors duration-200 flex-1 h-8",
                          votes[positionName] === candidate._id 
                            ? "hover:bg-destructive/90" 
                            : "bg-primary hover:bg-primary/90"
                        )}
                        disabled={hasVoted}
                      >
                        {hasVoted ? (
                          <span className="flex items-center">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Voted
                          </span>
                        ) : votes[positionName] === candidate._id ? (
                          <span className="flex items-center">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Remove
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                            Vote
                          </span>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          className={cn(
            "bg-primary hover:bg-primary/90 transition-colors duration-200",
            "!rounded-[20px] shadow-lg hover:shadow-primary/20"
          )}
          onClick={handleSubmitVotes}
          disabled={Object.keys(votes).length === 0 || submitting || hasVoted}
        >
          {hasVoted ? (
            <span className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Already Voted
            </span>
          ) : submitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            <>
              Submit All Votes
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Candidate Details Dialog */}
      <AnimatePresence>
        {dialogOpen && selectedCandidate && (
          <div className="modal-backdrop p-4">
            <motion.div
              className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">
                  {selectedCandidate.firstName} {selectedCandidate.lastName}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Candidate for {positions.find(p => p._id === selectedCandidate.positionId)?.title}
                </p>

                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                      {selectedCandidate.firstName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {selectedCandidate.firstName} {selectedCandidate.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {positions.find(p => p._id === selectedCandidate.positionId)?.title}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Mandate:</h4>
                    <p className="text-sm">{selectedCandidate.mandate}</p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="hover:bg-primary/10"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleVote(selectedCandidate._id, selectedCandidate.positionId)
                      setDialogOpen(false)
                    }}
                    variant={
                      votes[positions.find(p => p._id === selectedCandidate.positionId)?.title] === selectedCandidate._id
                        ? "destructive"
                        : "default"
                    }
                    className={cn(
                      "transition-colors duration-200",
                      votes[positions.find(p => p._id === selectedCandidate.positionId)?.title] === selectedCandidate._id
                        ? ""
                        : "bg-primary hover:bg-primary/90"
                    )}
                    disabled={hasVoted}
                  >
                    {votes[positions.find(p => p._id === selectedCandidate.positionId)?.title] === selectedCandidate._id
                      ? "Remove Vote"
                      : "Vote"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Elections

