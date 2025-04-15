import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import { Info, ThumbsUp, ChevronRight, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

// Sample data for candidates
const candidates = [
  {
    id: 1,
    name: "John Smith",
    position: "President",
    image: "/placeholder.svg",
    mandate: "Improve student facilities and organize more events",
    bio: "John is a third-year student majoring in Political Science. He has served as class representative for two years.",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "President",
    image: "/placeholder.svg",
    mandate: "Focus on academic excellence and student welfare",
    bio: "Sarah is a fourth-year student majoring in Economics. She has been an active member of the student council.",
  },
  {
    id: 3,
    name: "Michael Brown",
    position: "Vice President",
    image: "/placeholder.svg",
    mandate: "Enhance communication between students and administration",
    bio: "Michael is a second-year student majoring in Communications. He has experience in organizing campus events.",
  },
  {
    id: 4,
    name: "Emily Davis",
    position: "Vice President",
    image: "/placeholder.svg",
    mandate: "Create more opportunities for student involvement",
    bio: "Emily is a third-year student majoring in Psychology. She has been involved in various student clubs.",
  },
  {
    id: 5,
    name: "David Wilson",
    position: "Secretary",
    image: "/placeholder.svg",
    mandate: "Improve record-keeping and transparency",
    bio: "David is a second-year student majoring in Business Administration. He has experience in administrative roles.",
  },
  {
    id: 6,
    name: "Jessica Lee",
    position: "Treasurer",
    image: "/placeholder.svg",
    mandate: "Ensure responsible budget allocation and financial transparency",
    bio: "Jessica is a third-year student majoring in Finance. She has experience in managing club budgets.",
  },
  {
    id: 7,
    name: "Robert Taylor",
    position: "Treasurer",
    image: "/placeholder.svg",
    mandate: "Implement innovative fundraising strategies and transparent financial reporting",
    bio: "Robert is a fourth-year student majoring in Accounting. He has served as treasurer for multiple student organizations.",
  },
]

// Group candidates by position
const groupedCandidates = candidates.reduce((acc, candidate) => {
  if (!acc[candidate.position]) {
    acc[candidate.position] = []
  }
  acc[candidate.position].push(candidate)
  return acc
}, {})

function Elections() {
  const [votes, setVotes] = useState({})
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validationError, setValidationError] = useState(false)

  useEffect(() => {
    document.title = "Elections | Student Dashboard"
  }, [])

  const handleVote = (candidateId, position) => {
    // Reset validation error when user votes
    setValidationError(false)

    // Check if user has already voted for this position
    if (votes[position] && votes[position] !== candidateId) {
      // If changing vote, update it
      setVotes({
        ...votes,
        [position]: candidateId,
      })
      toast.success(`Vote updated for ${position}`)
    } else if (!votes[position]) {
      // If not voted for this position yet, add the vote
      setVotes({
        ...votes,
        [position]: candidateId,
      })
      toast.success(`Vote recorded for ${position}`)
    } else {
      // If clicking on the same candidate, remove the vote
      const newVotes = { ...votes }
      delete newVotes[position]
      setVotes(newVotes)
      toast.success(`Vote removed for ${position}`)
    }
  }

  const handleSubmitVotes = () => {
    const positionCount = Object.keys(groupedCandidates).length
    const votedCount = Object.keys(votes).length

    // Check if all positions have votes
    if (votedCount < positionCount) {
      setValidationError(true)
      toast.error("Please vote for all positions before submitting")
      return
    }

    setSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      toast.success("Your votes have been submitted successfully!")
    }, 1500)
  }

  const openCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate)
    setDialogOpen(true)
  }

  const positionCount = Object.keys(groupedCandidates).length
  const votedCount = Object.keys(votes).length

  const getUnvotedPositions = () => {
    return Object.keys(groupedCandidates).filter((position) => !votes[position])
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Elections</h1>
        <p className="text-muted-foreground">Current election: Spring 2023</p>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Thank You for Voting!</CardTitle>
              <CardDescription>Your votes have been recorded successfully.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center">
                <motion.div
                  className="text-6xl mb-4"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  🎉
                </motion.div>
                <p className="text-lg mb-4">Your participation helps shape the future of our student's well being.</p>
                <p className="text-muted-foreground">The results will be announced after the election period ends.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => (window.location.href = "/student/dashboard")}>
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Voting Progress</CardTitle>
              <CardDescription>
                You have voted for {votedCount} out of {positionCount} positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(votedCount / positionCount) * 100}%` }}
                ></div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(groupedCandidates).map((position) => (
                  <div
                    key={position}
                    className={`p-3 rounded-lg border ${
                      votes[position] ? "border-primary bg-primary/10" : "border-muted"
                    }`}
                  >
                    <p className="font-medium">{position}</p>
                    <p className="text-sm text-muted-foreground">
                      {votes[position] ? candidates.find((c) => c.id === votes[position])?.name : "Not voted yet"}
                    </p>
                  </div>
                ))}
              </div>

              {validationError && (
                <motion.div
                  className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 flex items-start"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Please vote for all positions before submitting</p>
                    <p className="text-sm mt-1">You still need to vote for: {getUnvotedPositions().join(", ")}</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
              <div key={position} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-satoshi">{position}</h2>
                  <div className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                    {positionCandidates.length} Candidates
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {positionCandidates.map((candidate) => (
                    <motion.div key={candidate.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                      <Card className="overflow-hidden h-full">
                        <CardHeader className="p-0">
                          <div className="relative h-48 w-full">
                            <img
                              src={candidate.image || "/placeholder.svg"}
                              alt={candidate.name}
                              className="object-cover w-full h-full"
                            />
                            {votes[position] === candidate.id && (
                              <div className="absolute top-2 right-2">
                                <div className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Voted
                                </div>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                          <CardTitle className="text-xl mb-2">{candidate.name}</CardTitle>
                          <CardDescription className="line-clamp-3">{candidate.mandate}</CardDescription>
                        </CardContent>
                        <CardFooter className="flex justify-between p-4 pt-0">
                          <Button variant="outline" size="sm" onClick={() => openCandidateDetails(candidate)}>
                            <Info className="h-4 w-4 mr-1" />
                            Details
                          </Button>

                          <Button
                            onClick={() => handleVote(candidate.id, candidate.position)}
                            variant={votes[position] === candidate.id ? "destructive" : "default"}
                            className={votes[position] === candidate.id ? "" : "bg-primary hover:bg-primary/90"}
                          >
                            {votes[position] === candidate.id ? "Remove Vote" : "Vote"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={handleSubmitVotes}
              disabled={votedCount === 0 || submitting}
            >
              {submitting ? (
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
          {dialogOpen && selectedCandidate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{selectedCandidate.name}</h3>
                  <p className="text-muted-foreground mb-4">Candidate for {selectedCandidate.position}</p>

                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                        {selectedCandidate.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{selectedCandidate.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedCandidate.position}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Mandate:</h4>
                      <p className="text-sm">{selectedCandidate.mandate}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Bio:</h4>
                      <p className="text-sm">{selectedCandidate.bio}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        handleVote(selectedCandidate.id, selectedCandidate.position)
                        setDialogOpen(false)
                      }}
                      variant={votes[selectedCandidate.position] === selectedCandidate.id ? "destructive" : "default"}
                      className={
                        votes[selectedCandidate.position] === selectedCandidate.id
                          ? ""
                          : "bg-primary hover:bg-primary/90"
                      }
                    >
                      {votes[selectedCandidate.position] === selectedCandidate.id ? "Remove Vote" : "Vote"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

export default Elections
