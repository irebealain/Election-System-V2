import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import { Plus, Edit, Trash, Users, UserPlus, Save } from "lucide-react"
import { useDropzone } from "react-dropzone"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

// Sample positions data
const initialPositions = [
  {
    id: 1,
    title: "President",
    description: "Lead the student council and represent the student body in administrative meetings.",
    candidates: [
      {
        id: 1,
        name: "John Smith",
        bio: "Third-year student majoring in Political Science. Has served as class representative for two years.",
        mandate: "Improve student facilities and organize more events",
        image: "/placeholder.svg",
      },
      {
        id: 2,
        name: "Sarah Johnson",
        bio: "Fourth-year student majoring in Economics. Active member of the student council.",
        mandate: "Focus on academic excellence and student welfare",
        image: "/placeholder.svg",
      },
    ],
  },
  {
    id: 2,
    title: "Vice President",
    description: "Assist the president and oversee the implementation of student council initiatives.",
    candidates: [
      {
        id: 3,
        name: "Michael Brown",
        bio: "Second-year student majoring in Communications. Experience in organizing campus events.",
        mandate: "Enhance communication between students and administration",
        image: "/placeholder.svg",
      },
      {
        id: 4,
        name: "Emily Davis",
        bio: "Third-year student majoring in Psychology. Involved in various student clubs.",
        mandate: "Create more opportunities for student involvement",
        image: "/placeholder.svg",
      },
    ],
  },
  {
    id: 3,
    title: "Secretary",
    description: "Maintain records of meetings and handle correspondence for the student council.",
    candidates: [
      {
        id: 5,
        name: "David Wilson",
        bio: "Second-year student majoring in Business Administration. Experience in administrative roles.",
        mandate: "Improve record-keeping and transparency",
        image: "/placeholder.svg",
      },
    ],
  },
]

function ManagePositions() {
  const [positions, setPositions] = useState([...initialPositions])
  const [isAddingPosition, setIsAddingPosition] = useState(false)
  const [isAddingCandidate, setIsAddingCandidate] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [editingPosition, setEditingPosition] = useState(null)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [confirmDeleteType, setConfirmDeleteType] = useState(null)
  const [formData, setFormData] = useState({
    positionTitle: "",
    positionDescription: "",
    candidateName: "",
    candidateBio: "",
    candidateMandate: "",
    candidateImage: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    document.title = "Manage Positions | Admin Dashboard"
  }, [])

  useEffect(() => {
    if (editingPosition) {
      setFormData({
        ...formData,
        positionTitle: editingPosition.title,
        positionDescription: editingPosition.description,
      })
    }
  }, [editingPosition])

  useEffect(() => {
    if (editingCandidate) {
      setFormData({
        ...formData,
        candidateName: editingCandidate.name,
        candidateBio: editingCandidate.bio,
        candidateMandate: editingCandidate.mandate,
        candidateImage: editingCandidate.image,
      })
    }
  }, [editingCandidate])

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      // In a real app, you would upload the file to a server
      // For now, create a local URL
      const file = acceptedFiles[0]
      if (file) {
        const imageUrl = URL.createObjectURL(file)
        setFormData({
          ...formData,
          candidateImage: imageUrl,
        })
        toast.success("Image uploaded")
      }
    },
  })

  const filteredPositions = positions.filter((position) =>
    position.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      positionTitle: "",
      positionDescription: "",
      candidateName: "",
      candidateBio: "",
      candidateMandate: "",
      candidateImage: null,
    })
    setEditingPosition(null)
    setEditingCandidate(null)
  }

  const handleAddPosition = () => {
    setIsAddingPosition(true)
    resetForm()
  }

  const handleAddCandidate = (position) => {
    setIsAddingCandidate(true)
    setCurrentPosition(position)
    resetForm()
  }

  const handleEditPosition = (position) => {
    setEditingPosition(position)
    setIsAddingPosition(true)
  }

  const handleEditCandidate = (position, candidate) => {
    setCurrentPosition(position)
    setEditingCandidate(candidate)
    setIsAddingCandidate(true)
  }

  const handleDeletePrompt = (id, type) => {
    setConfirmDeleteId(id)
    setConfirmDeleteType(type)
  }

  const handleCancelDelete = () => {
    setConfirmDeleteId(null)
    setConfirmDeleteType(null)
  }

  const handleDeletePosition = (id) => {
    setPositions((prevPositions) => prevPositions.filter((position) => position.id !== id))
    toast.success("Position deleted successfully")
    setConfirmDeleteId(null)
    setConfirmDeleteType(null)
  }

  const handleDeleteCandidate = (positionId, candidateId) => {
    setPositions((prevPositions) =>
      prevPositions.map((position) => {
        if (position.id === positionId) {
          return {
            ...position,
            candidates: position.candidates.filter((candidate) => candidate.id !== candidateId),
          }
        }
        return position
      }),
    )
    toast.success("Candidate deleted successfully")
    setConfirmDeleteId(null)
    setConfirmDeleteType(null)
  }

  const handleSubmitPosition = (e) => {
    e.preventDefault()
    setSubmitting(true)

    if (!formData.positionTitle) {
      toast.error("Position title is required")
      setSubmitting(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      if (editingPosition) {
        // Update existing position
        setPositions((prevPositions) =>
          prevPositions.map((position) => {
            if (position.id === editingPosition.id) {
              return {
                ...position,
                title: formData.positionTitle,
                description: formData.positionDescription,
              }
            }
            return position
          }),
        )
        toast.success("Position updated successfully")
      } else {
        // Add new position
        const newPosition = {
          id: Date.now(),
          title: formData.positionTitle,
          description: formData.positionDescription,
          candidates: [],
        }
        setPositions((prevPositions) => [...prevPositions, newPosition])
        toast.success("Position added successfully")
      }

      resetForm()
      setIsAddingPosition(false)
      setSubmitting(false)
    }, 1000)
  }

  const handleSubmitCandidate = (e) => {
    e.preventDefault()
    setSubmitting(true)

    if (!formData.candidateName) {
      toast.error("Candidate name is required")
      setSubmitting(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      if (editingCandidate) {
        // Update existing candidate
        setPositions((prevPositions) =>
          prevPositions.map((position) => {
            if (position.id === currentPosition.id) {
              return {
                ...position,
                candidates: position.candidates.map((candidate) => {
                  if (candidate.id === editingCandidate.id) {
                    return {
                      ...candidate,
                      name: formData.candidateName,
                      bio: formData.candidateBio,
                      mandate: formData.candidateMandate,
                      image: formData.candidateImage || candidate.image,
                    }
                  }
                  return candidate
                }),
              }
            }
            return position
          }),
        )
        toast.success("Candidate updated successfully")
      } else {
        // Add new candidate
        const newCandidate = {
          id: Date.now(),
          name: formData.candidateName,
          bio: formData.candidateBio,
          mandate: formData.candidateMandate,
          image: formData.candidateImage || "/placeholder.svg",
        }

        setPositions((prevPositions) =>
          prevPositions.map((position) => {
            if (position.id === currentPosition.id) {
              return {
                ...position,
                candidates: [...position.candidates, newCandidate],
              }
            }
            return position
          }),
        )
        toast.success("Candidate added successfully")
      }

      resetForm()
      setIsAddingCandidate(false)
      setSubmitting(false)
    }, 1000)
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-satoshi">Manage Positions</h1>
          <p className="text-muted-foreground">Create and manage positions and candidates for elections.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleAddPosition}>
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search positions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {filteredPositions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <Users className="h-16 w-16 text-muted-foreground opacity-30" />
          <div>
            <h3 className="text-lg font-medium">No positions found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `No positions match "${searchTerm}"` : "You haven't created any positions yet."}
            </p>
          </div>
          <Button className="mt-4" onClick={handleAddPosition}>
            <Plus className="mr-2 h-4 w-4" />
            Create Position
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filteredPositions.map((position) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{position.title}</CardTitle>
                        <CardDescription>{position.description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPosition(position)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {confirmDeleteId === position.id && confirmDeleteType === "position" ? (
                          <div className="flex space-x-2">
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePosition(position.id)}>
                              Confirm
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleCancelDelete}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePrompt(position.id, "position")}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Candidates ({position.candidates.length})
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCandidate(position)}
                        className="text-xs"
                      >
                        <UserPlus className="mr-2 h-3 w-3" />
                        Add Candidate
                      </Button>
                    </div>
                    {position.candidates.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        No candidates yet. Add your first candidate!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {position.candidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="flex items-center justify-between p-3 rounded-md border bg-background hover:bg-accent/10 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden">
                                <img
                                  src={candidate.image || "/placeholder.svg"}
                                  alt={candidate.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">{candidate.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{candidate.mandate}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCandidate(position, candidate)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              {confirmDeleteId === candidate.id && confirmDeleteType === "candidate" ? (
                                <div className="flex space-x-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteCandidate(position.id, candidate.id)}
                                  >
                                    Confirm
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={handleCancelDelete}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePrompt(candidate.id, "candidate")}
                                >
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Position Modal */}
      {isAddingPosition && (
        <div className="modal-backdrop p-4">
          <motion.div
            className="bg-background rounded-lg shadow-lg max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingPosition ? "Edit Position" : "Add Position"}</h2>
              <form onSubmit={handleSubmitPosition} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="positionTitle" className="block text-sm font-medium">
                    Position Title
                  </label>
                  <input
                    id="positionTitle"
                    name="positionTitle"
                    value={formData.positionTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., President, Treasurer"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="positionDescription" className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="positionDescription"
                    name="positionDescription"
                    value={formData.positionDescription}
                    onChange={handleInputChange}
                    placeholder="Describe the responsibilities of this position..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsAddingPosition(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitting}>
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
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-4 w-4" />
                        {editingPosition ? "Update Position" : "Save Position"}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {isAddingCandidate && (
        <div className="modal-backdrop p-4">
          <motion.div
            className="bg-background rounded-lg shadow-lg max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingCandidate ? "Edit Candidate" : "Add Candidate"}</h2>
              <p className="text-muted-foreground mb-4">
                {currentPosition ? `For position: ${currentPosition.title}` : "Select a position for this candidate"}
              </p>
              <form onSubmit={handleSubmitCandidate} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="candidateName" className="block text-sm font-medium">
                    Candidate Name
                  </label>
                  <input
                    id="candidateName"
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="candidateBio" className="block text-sm font-medium">
                    Bio
                  </label>
                  <textarea
                    id="candidateBio"
                    name="candidateBio"
                    value={formData.candidateBio}
                    onChange={handleInputChange}
                    placeholder="Brief biography of the candidate..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="candidateMandate" className="block text-sm font-medium">
                    Mandate/Platform
                  </label>
                  <textarea
                    id="candidateMandate"
                    name="candidateMandate"
                    value={formData.candidateMandate}
                    onChange={handleInputChange}
                    placeholder="What does the candidate plan to achieve..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Photo</label>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-input rounded-md p-4 text-center cursor-pointer transition-colors hover:bg-accent/10"
                  >
                    <input {...getInputProps()} />
                    {formData.candidateImage ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={formData.candidateImage || "/placeholder.svg"}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-md mb-2"
                        />
                        <p className="text-sm text-muted-foreground">Drag or click to replace</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-muted p-2 mb-2">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Drag and drop an image here, or click to select</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF up to 2MB</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsAddingCandidate(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitting}>
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
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-4 w-4" />
                        {editingCandidate ? "Update Candidate" : "Save Candidate"}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default ManagePositions
