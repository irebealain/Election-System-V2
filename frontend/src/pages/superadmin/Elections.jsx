import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/common/Card"
import Button from "../../components/common/Button"
import { Award, Users, Plus, Edit, Trash, Calendar, X, Clock } from "lucide-react"
import toast from "react-hot-toast"
import axios from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"

function Elections() {
  const { currentUser } = useAuth()
  const [elections, setElections] = useState([])
  const [isManageElectionOpen, setIsManageElectionOpen] = useState(false)
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false)
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false)
  const [selectedElection, setSelectedElection] = useState(null)
  const [positions, setPositions] = useState([])
  const [candidates, setCandidates] = useState([])
  const [newElection, setNewElection] = useState({
    title: "",
    startDate: "",
    endDate: "",
  })
  const [newPosition, setNewPosition] = useState({
    title: "",
    electionId: ""
  })
  const [newCandidate, setNewCandidate] = useState({
    firstName: "",
    lastName: "",
    profilePic: "",
    mandate: "",
    positionId: "",
    electionId: ""
  })
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  useEffect(() => {
    document.title = "Elections | Super Admin Dashboard"
    fetchElections()
    fetchPositions()
    fetchCandidates()
  }, [])

  const fetchElections = async () => {
    try {
      const response = await axios.get('/api/elections')
      setElections(response.data.data)
    } catch (error) {
      console.error("Error fetching elections:", error)
      toast.error("Failed to fetch elections")
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await axios.get('/api/positions')
      // Get all positions for all elections
      setPositions(response.data.data)
    } catch (error) {
      console.error("Error fetching positions:", error)
      toast.error("Failed to fetch positions")
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/candidates')
      // Get all candidates for all elections
      setCandidates(response.data.data)
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast.error("Failed to fetch candidates")
    }
  }

  // Calculate positions and candidates count for a specific election
  const getElectionStats = (electionId) => {
    const electionPositions = positions.filter(p => p.electionId === electionId)
    const electionCandidates = candidates.filter(c => c.electionId === electionId)
    return {
      positionsCount: electionPositions.length,
      candidatesCount: electionCandidates.length
    }
  }

  const handleCreateElection = async () => {
    try {
      // Check if user is authenticated and has required role
      if (!currentUser) {
        toast.error("Please log in to create an election")
        return
      }

      if (currentUser.role !== "superAdmin" && currentUser.role !== "admin") {
        toast.error("Only admins and super admins can create elections")
        return
      }

      // Get the user ID from either _id or id field
      const userId = currentUser._id || currentUser.id
      if (!userId) {
        toast.error("Invalid user ID")
        return
      }

      const response = await axios.post('/api/elections', {
        title: newElection.title,
        startDate: newElection.startDate,
        endDate: newElection.endDate,
        createdBy: userId
      })

      if (response.data.success) {
        toast.success("Election created successfully")
        setNewElection({
          title: "",
          startDate: "",
          endDate: "",
        })
        setIsManageElectionOpen(false)
        fetchElections()
      } else {
        toast.error(response.data.message || "Failed to create election")
      }
    } catch (error) {
      console.error("Error creating election:", error)
      toast.error(error.response?.data?.message || "Failed to create election")
    }
  }

  const handleAddPosition = async () => {
    try {
      // Check if user is authenticated and has required role
      if (!currentUser) {
        toast.error("Please log in to add a position")
        return
      }

      if (currentUser.role !== "superAdmin" && currentUser.role !== "admin") {
        toast.error("Only admins and super admins can add positions")
        return
      }

      const response = await axios.post('/api/positions', {
        ...newPosition,
        electionId: selectedElection._id
      })
      toast.success("Position added successfully")
      setNewPosition({
        title: "",
        electionId: ""
      })
      setIsAddPositionOpen(false)
      fetchPositions()
    } catch (error) {
      console.error("Error adding position:", error)
      toast.error(error.response?.data?.message || "Failed to add position")
    }
  }

  const handleAddCandidate = async () => {
    try {
      // Check if user is authenticated and has required role
      if (!currentUser) {
        toast.error("Please log in to add a candidate")
        return
      }

      if (currentUser.role !== "superAdmin" && currentUser.role !== "admin") {
        toast.error("Only admins and super admins can add candidates")
        return
      }

      const response = await axios.post('/api/candidates', {
        ...newCandidate,
        electionId: selectedElection._id
      })

      if (response.data.success) {
        toast.success("Candidate added successfully")
        setNewCandidate({
          firstName: "",
          lastName: "",
          profilePic: "",
          mandate: "",
          positionId: "",
          electionId: ""
        })
        setIsAddCandidateOpen(false)
        fetchCandidates()
      } else {
        console.error('Server response error:', response.data);
        toast.error(response.data.message || "Failed to add candidate")
      }
    } catch (error) {
      console.error("Error adding candidate:", error)
      toast.error(error.response?.data?.message || "Failed to add candidate")
    }
  }

  const handleDeleteElection = async (electionId) => {
    // Check if user is authenticated and has required role
    if (!currentUser) {
      toast.error("Please log in to delete an election")
      return
    }

    if (currentUser.role !== "superAdmin" && currentUser.role !== "admin") {
      toast.error("Only admins and super admins can delete elections")
      return
    }

    if (!window.confirm("Are you sure you want to delete this election? This action cannot be undone.")) {
      return
    }

    try {
      await axios.delete(`/api/elections/${electionId}`)
      toast.success("Election deleted successfully")
      fetchElections()
    } catch (error) {
      console.error("Error deleting election:", error)
      toast.error("Failed to delete election")
    }
  }

  const handleDeleteAllElections = async () => {
    if (!currentUser || currentUser.role !== "superAdmin") {
      toast.error("Only super admins can delete all elections")
      return
    }

    try {
      setIsDeletingAll(true)
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/elections/delete-all`, {
        data: { role: currentUser.role }
      })
      
      if (response.data.success) {
        toast.success("All elections have been deleted successfully")
        fetchElections() // Refresh the elections list
      } else {
        toast.error(response.data.message || "Failed to delete all elections")
      }
    } catch (error) {
      console.error("Error deleting all elections:", error)
      toast.error(error.response?.data?.message || "Failed to delete all elections")
    } finally {
      setIsDeletingAll(false)
      setIsDeleteAllConfirmOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-satoshi">Election Management</h1>
          <p className="text-muted-foreground">Create and manage elections, positions, and candidates</p>
        </div>
        <div className="flex gap-4">
          {currentUser?.role === "superAdmin" && (
            <Button 
              variant="destructive" 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => setIsDeleteAllConfirmOpen(true)}
              disabled={elections.length === 0 || isDeletingAll}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete All Elections
            </Button>
          )}
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsManageElectionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Election
          </Button>
        </div>
      </div>

      {/* Election Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Award className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Elections Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Start by creating your first election. You can add positions and candidates once the election is created.
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsManageElectionOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Election
            </Button>
          </div>
        ) : (
          elections.map((election) => (
            <Card key={election._id} className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] duration-200 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold tracking-tight">{election.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(election.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Ends: {new Date(election.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    election.status === "ongoing" ? "bg-green-100 text-green-800" :
                    election.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                    election.status === "completed" ? "bg-purple-100 text-purple-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Positions</p>
                        <p className="text-2xl font-bold">
                          {getElectionStats(election._id).positionsCount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Candidates</p>
                        <p className="text-2xl font-bold">
                          {getElectionStats(election._id).candidatesCount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Created {new Date(election.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors duration-200 text-xs"
                    onClick={() => {
                      setSelectedElection(election)
                      setIsAddPositionOpen(true)
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-primary/10 rounded-full">
                        <Plus className="h-3 w-3" />
                      </div>
                      <span>Add Position</span>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors duration-200 text-xs"
                    onClick={() => {
                      setSelectedElection(election)
                      setIsAddCandidateOpen(true)
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-primary/10 rounded-full">
                        <Plus className="h-3 w-3" />
                      </div>
                      <span>Add Candidate</span>
                    </div>
                  </Button>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="bg-destructive/90 hover:bg-destructive text-destructive-foreground transition-colors duration-200 text-xs"
                  onClick={() => handleDeleteElection(election._id)}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-destructive-foreground/10 rounded-full">
                      <Trash className="h-3 w-3" />
                    </div>
                    <span>Delete</span>
                  </div>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create Election Dialog */}
      {isManageElectionOpen && (
        <div className="modal-backdrop p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create New Election</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsManageElectionOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="election-title" className="block text-sm font-medium">
                    Election Title
                  </label>
                  <input
                    id="election-title"
                    type="text"
                    placeholder="e.g., Spring 2024 Student Council Election"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newElection.title}
                    onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="election-start" className="block text-sm font-medium">
                      Start Date
                    </label>
                    <input
                      id="election-start"
                      type="date"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newElection.startDate}
                      onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="election-end" className="block text-sm font-medium">
                      End Date
                    </label>
                    <input
                      id="election-end"
                      type="date"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newElection.endDate}
                      onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                      min={newElection.startDate}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setIsManageElectionOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleCreateElection}
                  disabled={!newElection.title || !newElection.startDate || !newElection.endDate}
                >
                  Create Election
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Position Dialog */}
      {isAddPositionOpen && selectedElection && (
        <div className="modal-backdrop p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add Position</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsAddPositionOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="position-title" className="block text-sm font-medium">
                    Position Title
                  </label>
                  <input
                    id="position-title"
                    type="text"
                    placeholder="e.g., President"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newPosition.title}
                    onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setIsAddPositionOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAddPosition}
                  disabled={!newPosition.title}
                >
                  Add Position
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Candidate Dialog */}
      {isAddCandidateOpen && selectedElection && (
        <div className="modal-backdrop p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add Candidate</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsAddCandidateOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="candidate-firstname" className="block text-sm font-medium">
                      First Name
                    </label>
                    <input
                      id="candidate-firstname"
                      type="text"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newCandidate.firstName}
                      onChange={(e) => setNewCandidate({ ...newCandidate, firstName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="candidate-lastname" className="block text-sm font-medium">
                      Last Name
                    </label>
                    <input
                      id="candidate-lastname"
                      type="text"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newCandidate.lastName}
                      onChange={(e) => setNewCandidate({ ...newCandidate, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="candidate-position" className="block text-sm font-medium">
                    Position
                  </label>
                  <select
                    id="candidate-position"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCandidate.positionId}
                    onChange={(e) => setNewCandidate({ ...newCandidate, positionId: e.target.value })}
                  >
                    <option value="">Select Position</option>
                    {positions
                      .filter(p => p.electionId === selectedElection._id)
                      .map(position => (
                        <option key={position._id} value={position._id}>
                          {position.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="candidate-mandate" className="block text-sm font-medium">
                    Mandate
                  </label>
                  <textarea
                    id="candidate-mandate"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCandidate.mandate}
                    onChange={(e) => setNewCandidate({ ...newCandidate, mandate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="candidate-profile" className="block text-sm font-medium">
                    Profile Picture URL
                  </label>
                  <input
                    id="candidate-profile"
                    type="text"
                    placeholder="https://example.com/profile.jpg"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCandidate.profilePic}
                    onChange={(e) => setNewCandidate({ ...newCandidate, profilePic: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setIsAddCandidateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAddCandidate}
                  disabled={!newCandidate.firstName || !newCandidate.lastName || !newCandidate.positionId || !newCandidate.mandate || !newCandidate.profilePic}
                >
                  Add Candidate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Elections Confirmation Dialog */}
      {isDeleteAllConfirmOpen && (
        <div className="modal-backdrop p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-destructive">Delete All Elections</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsDeleteAllConfirmOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <p className="text-destructive font-medium">Warning: This action cannot be undone!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will permanently delete all elections, including their associated positions and candidates.
                    Please make sure you have backed up any important data before proceeding.
                  </p>
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteAllConfirmOpen(false)}
                    disabled={isDeletingAll}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleDeleteAllElections}
                    disabled={isDeletingAll}
                  >
                    {isDeletingAll ? (
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
                        Deleting...
                      </span>
                    ) : (
                      "Yes, Delete All Elections"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Elections
