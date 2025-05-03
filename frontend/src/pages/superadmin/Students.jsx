import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import { Input } from "../../components/common/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/common/Select"
import { Search, Filter, Download, Plus, MoreVertical, Edit, Trash2, Eye, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { getAllUsers, deleteUser, updateUser, uploadIdCard, exportUsers, getUserById } from "../../services/UserService"
import { getAllVotes } from "../../services/voteService"
import { getAllElections } from "../../services/electionService"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/common/Avatar"
import { Badge } from "../../components/common/Badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/common/DropdownMenu"
import { MoreHorizontal, Upload } from "lucide-react"
import { saveAs } from "file-saver"

function Students() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSort, setSelectedSort] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [votes, setVotes] = useState([])
  const [elections, setElections] = useState([])
  const [currentElection, setCurrentElection] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Student Management | ElectSys"
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentsData, votesData, electionsData] = await Promise.all([
        getAllUsers(),
        getAllVotes(),
        getAllElections()
      ])

      setStudents(studentsData || [])
      setVotes(votesData || [])
      setElections(electionsData || [])
      
      // Find current election
      const ongoingElection = electionsData?.find(e => e.status === 'ongoing')
      setCurrentElection(ongoingElection)
      
      setFilteredStudents(studentsData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to fetch data. Please try again later.")
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = [...students]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(student => 
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.level.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply level filter
    if (selectedLevel !== "all") {
      result = result.filter(student => student.level === selectedLevel)
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      result = result.filter(student => {
        if (selectedStatus === "active") {
          if (currentElection) {
            return votes.some(v => v.studentId === student._id && v.electionId === currentElection._id)
          }
          return student.isActive
        }
        if (selectedStatus === "inactive") {
          if (currentElection) {
            return !votes.some(v => v.studentId === student._id && v.electionId === currentElection._id)
          }
          return !student.isActive
        }
        return true
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      if (selectedSort === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      if (selectedSort === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
      if (selectedSort === "name") {
        return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
      }
      return 0
    })

    setFilteredStudents(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [students, searchQuery, selectedLevel, selectedStatus, selectedSort, votes, currentElection])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleExport = async () => {
    try {
      const blob = await exportUsers()
      saveAs(blob, 'students.xlsx')
      toast.success('Students exported successfully')
    } catch (error) {
      toast.error('Failed to export students')
    }
  }

  const handleAddStudent = () => {
    // Implement add student functionality
    toast.success("Adding new student...")
  }

  const handleEditStudent = (student) => {
    // Implement edit student functionality
    toast.success(`Editing student: ${student.firstName} ${student.lastName}`)
  }

  const handleDeleteStudent = async (student) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteUser(student._id)
        setStudents(students.filter(s => s._id !== student._id))
        toast.success('Student deleted successfully')
      } catch (error) {
        toast.error('Failed to delete student')
      }
    }
  }

  const handleViewDetails = (student) => {
    // Implement view details functionality
    toast.success(`Viewing details for: ${student.firstName} ${student.lastName}`)
  }

  const handleSendEmail = (student) => {
    // Implement send email functionality
    toast.success(`Sending email to: ${student.email}`)
  }

  const handleIdCardUpload = async (userId, file) => {
    try {
      const user = await getUserById(userId)
      if (!user) {
        toast.error('Student not found')
        return
      }

      await uploadIdCard(userId, file)
      toast.success('ID card uploaded successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload ID card')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-satoshi">Student Management</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor student accounts</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => document.getElementById('idCardUpload').click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload ID Card
            <input
              id="idCardUpload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  const userId = prompt('Enter student ID:')
                  if (userId) handleIdCardUpload(userId, file)
                }
              }}
            />
          </Button>
          <Button size="sm" onClick={handleAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="100">Level 100</SelectItem>
                  <SelectItem value="200">Level 200</SelectItem>
                  <SelectItem value="300">Level 300</SelectItem>
                  <SelectItem value="400">Level 400</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Student Information</th>
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Level</th>
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Registration Date</th>
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
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
                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{student.level}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${hasVoted 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                          }`}>
                          <span className={`h-1.5 w-1.5 rounded-full mr-1.5
                            ${hasVoted 
                              ? 'bg-green-500 dark:bg-green-400'
                              : 'bg-yellow-500 dark:bg-yellow-400'
                            }`}
                          />
                          {hasVoted ? 'Voted' : 'Not Voted'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">
                        {format(new Date(student.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleSendEmail(student)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Students 