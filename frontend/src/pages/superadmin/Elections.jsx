import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/common/Card"
import Button from "../../components/common/Button"
import Modal from "../../components/common/Modal"
import { Award, Users, Plus, Edit, Trash, Calendar, X, Clock, Upload, User } from "lucide-react"
import toast from "react-hot-toast"
import axios from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"
import { uploadStudentIdsExcel } from '../../services/studentIdService'
import { uploadImage } from "../../services/uploadService"

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
  const [isEditingElection, setIsEditingElection] = useState(false)
  const [editingElectionData, setEditingElectionData] = useState(null)
  const [isEditingPosition, setIsEditingPosition] = useState(false)
  const [editingPositionData, setEditingPositionData] = useState(null)
  const [isEditingCandidate, setIsEditingCandidate] = useState(false)
  const [editingCandidateData, setEditingCandidateData] = useState(null)
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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)

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
        // Store the newly created election ID
        const newElectionId = response.data.data._id;
        
        // If there's a file selected, upload it
        const fileInput = document.getElementById('studentIdsUpload');
        if (fileInput && fileInput.files.length > 0) {
          await handleExcelUpload(fileInput.files[0], newElectionId);
        }

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

  const handleUpdateElection = async () => {
    try {
      if (!editingElectionData || !editingElectionData._id) {
        toast.error("No election selected for editing")
        return
      }

      // Check if user is authenticated and has required role
      if (!currentUser) {
        toast.error("Please log in to update an election")
        return
      }

      if (currentUser.role !== "superAdmin" && currentUser.role !== "admin") {
        toast.error("Only admins and super admins can update elections")
        return
      }

      const response = await axios.put(`/api/elections/${editingElectionData._id}`, {
        title: editingElectionData.title,
        startDate: editingElectionData.startDate,
        endDate: editingElectionData.endDate
      })

      if (response.data.success) {
        toast.success("Election updated successfully")
        setIsEditingElection(false)
        setEditingElectionData(null)
        setIsManageElectionOpen(false)
        fetchElections()
      } else {
        toast.error(response.data.message || "Failed to update election")
      }
    } catch (error) {
      console.error("Error updating election:", error)
      toast.error(error.response?.data?.message || "Failed to update election")
    }
  }

  const handleOpenEditElection = (election) => {
    setEditingElectionData({
      _id: election._id,
      title: election.title,
      startDate: election.startDate.split('T')[0], // Format date for input
      endDate: election.endDate.split('T')[0] // Format date for input
    })
    setIsEditingElection(true)
    setIsManageElectionOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsManageElectionOpen(false)
    setIsEditingElection(false)
    setEditingElectionData(null)
    setNewElection({
      title: "",
      startDate: "",
      endDate: "",
    })
  }

  const handleExcelUpload = async (file, electionId) => {
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setIsUploading(true);
      
      // Create FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('electionId', electionId);

      // Make API call to upload student IDs
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/superadmins/upload-student-ids`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success(
          `Successfully uploaded ${response.data.count} student IDs to the election!`,
          {
            duration: 5000,
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              padding: '16px',
              borderRadius: '8px',
            },
            icon: '✅',
          }
        );
      } else {
        throw new Error(response.data.message || 'Failed to upload student IDs');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to upload student IDs',
        {
          duration: 5000,
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            padding: '16px',
            borderRadius: '8px',
          },
          icon: '❌',
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Just store the file, we'll upload it after election creation
      setNewElection(prev => ({
        ...prev,
        studentIdFile: file
      }));
    }
  };

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

  const handleUpdatePosition = async () => {
    try {
      if (!editingPositionData || !editingPositionData._id) {
        toast.error("No position selected for editing")
        return
      }

      if (!currentUser) {
        toast.error("Please log in to update a position")
        return
      }

      if (currentUser.role !== "superAdmin" && currentUser.role !== "admin") {
        toast.error("Only admins and super admins can update positions")
        return
      }

      const response = await axios.put(`/api/positions/${editingPositionData._id}`, {
        title: editingPositionData.title
      })

      if (response.data.success) {
        toast.success("Position updated successfully")
        setIsEditingPosition(false)
        setEditingPositionData(null)
        setIsAddPositionOpen(false)
        fetchPositions()
      } else {
        toast.error(response.data.message || "Failed to update position")
      }
    } catch (error) {
      console.error("Error updating position:", error)
      toast.error(error.response?.data?.message || "Failed to update position")
    }
  }

  const handleDeletePosition = async (positionId) => {
    if (!window.confirm("Are you sure you want to delete this position? Associated candidates will also be removed.")) {
      return
    }

    try {
      if (!currentUser) {
        toast.error("Please log in to delete a position")
        return
      }

      await axios.delete(`/api/positions/${positionId}`)
      toast.success("Position deleted successfully")
      fetchPositions()
      fetchCandidates()
    } catch (error) {
      console.error("Error deleting position:", error)
      toast.error(error.response?.data?.message || "Failed to delete position")
    }
  }

  const handleOpenEditPosition = (position) => {
    setEditingPositionData({
      _id: position._id,
      title: position.title
    })
    setIsEditingPosition(true)
    setIsAddPositionOpen(true)
  }

  const handleClosePositionModal = () => {
    setIsAddPositionOpen(false)
    setIsEditingPosition(false)
    setEditingPositionData(null)
    setNewPosition({
      title: "",
      electionId: ""
    })
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
        setUploadedImage(null)
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

  const handleUpdateCandidate = async () => {
    try {
      if (!editingCandidateData || !editingCandidateData._id) {
        toast.error("No candidate selected for editing")
        return
      }

      if (!currentUser) {
        toast.error("Please log in to update a candidate")
        return
      }

      if (currentUser.role !== "superAdmin" && currentUser.role !== "admin") {
        toast.error("Only admins and super admins can update candidates")
        return
      }

      const response = await axios.put(`/api/candidates/${editingCandidateData._id}`, {
        firstName: editingCandidateData.firstName,
        lastName: editingCandidateData.lastName,
        mandate: editingCandidateData.mandate,
        profilePic: editingCandidateData.profilePic,
        positionId: editingCandidateData.positionId
      })

      if (response.data.success) {
        toast.success("Candidate updated successfully")
        setIsEditingCandidate(false)
        setEditingCandidateData(null)
        setIsAddCandidateOpen(false)
        setUploadedImage(null)
        fetchCandidates()
      } else {
        toast.error(response.data.message || "Failed to update candidate")
      }
    } catch (error) {
      console.error("Error updating candidate:", error)
      toast.error(error.response?.data?.message || "Failed to update candidate")
    }
  }

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) {
      return
    }

    try {
      if (!currentUser) {
        toast.error("Please log in to delete a candidate")
        return
      }

      await axios.delete(`/api/candidates/${candidateId}`)
      toast.success("Candidate deleted successfully")
      fetchCandidates()
    } catch (error) {
      console.error("Error deleting candidate:", error)
      toast.error(error.response?.data?.message || "Failed to delete candidate")
    }
  }

  const handleOpenEditCandidate = (candidate) => {
    setEditingCandidateData({
      _id: candidate._id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      profilePic: candidate.profilePic,
      mandate: candidate.mandate,
      positionId: candidate.positionId
    })
    setUploadedImage(candidate.profilePic)
    setIsEditingCandidate(true)
    setIsAddCandidateOpen(true)
  }

  const handleCloseCandidateModal = () => {
    setIsAddCandidateOpen(false)
    setIsEditingCandidate(false)
    setEditingCandidateData(null)
    setUploadedImage(null)
    setNewCandidate({
      firstName: "",
      lastName: "",
      profilePic: "",
      mandate: "",
      positionId: "",
      electionId: ""
    })
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('Please upload a valid image file (JPEG, JPG, or PNG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadImage(file);
      
      if (response.success) {
        setUploadedImage(response.data.url);
        setNewCandidate(prev => ({
          ...prev,
          profilePic: response.data.url
        }));
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

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
          {selectedElection && (
            <Button 
              variant="outline"
              onClick={() => setSelectedElection(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </Button>
          )}
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
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[20px]">
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
                    onClick={() => handleOpenEditElection(election)}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-primary/10 rounded-full">
                        <Edit className="h-3 w-3" />
                      </div>
                      <span>Edit</span>
                    </div>
                  </Button>
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

      {/* Create/Edit Election Dialog */}
      <Modal isOpen={isManageElectionOpen} onClose={handleCloseEditModal}>
        <div className="bg-background rounded-[20px] shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {isEditingElection ? 'Edit Election' : 'Create New Election'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCloseEditModal}>
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
                    className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm"
                    value={isEditingElection ? editingElectionData?.title || '' : newElection.title}
                    onChange={(e) => {
                      if (isEditingElection) {
                        setEditingElectionData({ ...editingElectionData, title: e.target.value })
                      } else {
                        setNewElection({ ...newElection, title: e.target.value })
                      }
                    }}
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
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm"
                      value={isEditingElection ? editingElectionData?.startDate || '' : newElection.startDate}
                      onChange={(e) => {
                        if (isEditingElection) {
                          setEditingElectionData({ ...editingElectionData, startDate: e.target.value })
                        } else {
                          setNewElection({ ...newElection, startDate: e.target.value })
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="election-end" className="block text-sm font-medium">
                      End Date
                    </label>
                    <input
                      id="election-end"
                      type="date"
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm"
                      value={isEditingElection ? editingElectionData?.endDate || '' : newElection.endDate}
                      onChange={(e) => {
                        if (isEditingElection) {
                          setEditingElectionData({ ...editingElectionData, endDate: e.target.value })
                        } else {
                          setNewElection({ ...newElection, endDate: e.target.value })
                        }
                      }}
                      min={isEditingElection ? editingElectionData?.startDate || '' : newElection.startDate}
                    />
                  </div>
                </div>

                {!isEditingElection && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Upload Student IDs (Excel)
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('studentIdsUpload').click()}
                        disabled={isUploading}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Select Student IDs File'}
                      </Button>
                      <input
                        id="studentIdsUpload"
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload an Excel file containing student IDs. The file should have student IDs in the first column.
                      {newElection.studentIdFile && (
                        <span className="block mt-1 text-green-600">
                          File selected: {newElection.studentIdFile.name}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleCloseEditModal}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={isEditingElection ? handleUpdateElection : handleCreateElection}
                  disabled={isEditingElection ? 
                    !editingElectionData?.title || !editingElectionData?.startDate || !editingElectionData?.endDate
                    : !newElection.title || !newElection.startDate || !newElection.endDate
                  }
                >
                  {isEditingElection ? 'Update Election' : 'Create Election'}
                </Button>
              </div>
            </div>
          </div>
      </Modal>

      {/* Add/Edit Position Dialog */}
      {isAddPositionOpen && selectedElection && (
        <div className="modal-backdrop p-4">
          <div className="bg-background rounded-[20px] shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {isEditingPosition ? 'Edit Position' : 'Add Position'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleClosePositionModal}>
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
                    className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm"
                    value={isEditingPosition ? editingPositionData?.title || '' : newPosition.title}
                    onChange={(e) => {
                      if (isEditingPosition) {
                        setEditingPositionData({ ...editingPositionData, title: e.target.value })
                      } else {
                        setNewPosition({ ...newPosition, title: e.target.value })
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleClosePositionModal}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={isEditingPosition ? handleUpdatePosition : handleAddPosition}
                  disabled={isEditingPosition ? !editingPositionData?.title : !newPosition.title}
                >
                  {isEditingPosition ? 'Update Position' : 'Add Position'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Candidate Dialog */}
      {isAddCandidateOpen && selectedElection && (
        <div className="modal-backdrop p-4">
          <div className="bg-background rounded-[20px] shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {isEditingCandidate ? 'Edit Candidate' : 'Add Candidate'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCloseCandidateModal}>
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
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm"
                      value={isEditingCandidate ? editingCandidateData?.firstName || '' : newCandidate.firstName}
                      onChange={(e) => {
                        if (isEditingCandidate) {
                          setEditingCandidateData({ ...editingCandidateData, firstName: e.target.value })
                        } else {
                          setNewCandidate({ ...newCandidate, firstName: e.target.value })
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="candidate-lastname" className="block text-sm font-medium">
                      Last Name
                    </label>
                    <input
                      id="candidate-lastname"
                      type="text"
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm"
                      value={isEditingCandidate ? editingCandidateData?.lastName || '' : newCandidate.lastName}
                      onChange={(e) => {
                        if (isEditingCandidate) {
                          setEditingCandidateData({ ...editingCandidateData, lastName: e.target.value })
                        } else {
                          setNewCandidate({ ...newCandidate, lastName: e.target.value })
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="candidate-position" className="block text-sm font-medium">
                    Position
                  </label>
                  <select
                    id="candidate-position"
                    className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm"
                    value={isEditingCandidate ? editingCandidateData?.positionId || '' : newCandidate.positionId}
                    onChange={(e) => {
                      if (isEditingCandidate) {
                        setEditingCandidateData({ ...editingCandidateData, positionId: e.target.value })
                      } else {
                        setNewCandidate({ ...newCandidate, positionId: e.target.value })
                      }
                    }}
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
                    className="w-full min-h-[100px] rounded-[20px] border border-input bg-background px-3 py-2 text-sm"
                    value={isEditingCandidate ? editingCandidateData?.mandate || '' : newCandidate.mandate}
                    onChange={(e) => {
                      if (isEditingCandidate) {
                        setEditingCandidateData({ ...editingCandidateData, mandate: e.target.value })
                      } else {
                        setNewCandidate({ ...newCandidate, mandate: e.target.value })
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {uploadedImage ? (
                          <img
                            src={uploadedImage}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('profile-upload').click()}
                        disabled={isUploading}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Change Image'}
                      </Button>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a profile picture (max 5MB, JPEG/PNG)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleCloseCandidateModal}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={isEditingCandidate ? handleUpdateCandidate : handleAddCandidate}
                  disabled={isEditingCandidate ? 
                    !editingCandidateData?.firstName || !editingCandidateData?.lastName || !editingCandidateData?.positionId || !editingCandidateData?.mandate || !editingCandidateData?.profilePic
                    : !newCandidate.firstName || !newCandidate.lastName || !newCandidate.positionId || !newCandidate.mandate || !newCandidate.profilePic
                  }
                >
                  {isEditingCandidate ? 'Update Candidate' : 'Add Candidate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Positions and Candidates Management Section */}
      {selectedElection && (
        <div className="space-y-6 mt-8 p-6 bg-muted/30 rounded-[20px]">
          <h2 className="text-2xl font-bold">Manage: {selectedElection.title}</h2>

          {/* Positions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Positions</h3>
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setIsAddPositionOpen(true)
                  setIsEditingPosition(false)
                  setNewPosition({ title: "", electionId: selectedElection._id })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Position
              </Button>
            </div>
            <div className="grid gap-3">
              {positions.filter(p => p.electionId === selectedElection._id).length === 0 ? (
                <p className="text-sm text-muted-foreground">No positions added yet</p>
              ) : (
                positions.filter(p => p.electionId === selectedElection._id).map(position => (
                  <div key={position._id} className="flex items-center justify-between p-3 bg-background rounded-[12px] border border-border">
                    <div>
                      <p className="font-medium">{position.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {candidates.filter(c => c.positionId === position._id).length} candidate(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenEditPosition(position)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeletePosition(position._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Candidates Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Candidates</h3>
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setIsAddCandidateOpen(true)
                  setIsEditingCandidate(false)
                  setUploadedImage(null)
                  setNewCandidate({ firstName: "", lastName: "", profilePic: "", mandate: "", positionId: "", electionId: selectedElection._id })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>
            <div className="grid gap-3">
              {candidates.filter(c => c.electionId === selectedElection._id).length === 0 ? (
                <p className="text-sm text-muted-foreground">No candidates added yet</p>
              ) : (
                candidates.filter(c => c.electionId === selectedElection._id).map(candidate => {
                  const position = positions.find(p => p._id === candidate.positionId)
                  return (
                    <div key={candidate._id} className="flex items-center justify-between p-3 bg-background rounded-[12px] border border-border">
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={candidate.profilePic}
                          alt={`${candidate.firstName} ${candidate.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
                          <p className="text-xs text-muted-foreground">{position?.title || 'Unknown Position'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEditCandidate(candidate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteCandidate(candidate._id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete All Elections Confirmation Dialog */}
      <Modal isOpen={isDeleteAllConfirmOpen} onClose={() => setIsDeleteAllConfirmOpen(false)}>
        <div className="bg-background rounded-[20px] shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-destructive">Delete All Elections</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsDeleteAllConfirmOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-destructive/10 p-4 rounded-[20px]">
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
      </Modal>
    </div>
  )
}

export default Elections
