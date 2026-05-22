import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import { Input } from "../../components/common/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/common/Select"
import { Search, Filter, Download, Plus, MoreVertical, Edit, Trash2, Eye, ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react"
import { getAllUsers, deleteUser, updateUser, exportUsers, getUserById, deleteAllStudents } from "../../services/UserService"
import { getAllVotes } from "../../services/voteService"
import { getAllElections } from "../../services/electionService"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/common/Avatar"
import { Badge } from "../../components/common/Badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/common/DropdownMenu"
import { MoreHorizontal } from "lucide-react"
import { saveAs } from "file-saver"

function Students() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [votes, setVotes] = useState([])
  const [elections, setElections] = useState([])
  const [currentElection, setCurrentElection] = useState(null)
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStudent, setEditedStudent] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Student Management | Election System"
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
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply level filter
    if (selectedLevel !== "all") {
      result = result.filter(student => student.level === selectedLevel)
    }

    setFilteredStudents(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [students, searchQuery, selectedLevel])

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
    setSelectedStudent(student);
    setEditedStudent({ ...student });
    setIsEditing(true);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    try {
      await updateUser(editedStudent._id, editedStudent);
      setStudents(students.map(s => 
        s._id === editedStudent._id ? editedStudent : s
      ));
      setIsEditing(false);
      toast.success('Student information updated successfully');
    } catch (error) {
      toast.error('Failed to update student information');
    }
  };

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
    setSelectedStudent(student);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteAllStudents = async () => {
    try {
      const result = await deleteAllStudents();
      toast.success(result.message);
      setIsDeleteAllDialogOpen(false);
      fetchData(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete all students');
    }
  };

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
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleAddStudent} className="text-xs">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteAllDialogOpen(true)}
            className="text-xs"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
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
                  className="pl-8 w-full md:w-[300px] text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
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
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
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
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{student.level}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
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
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-[10px]"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-[10px]"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-[10px]"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
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

      {/* Delete All Confirmation Dialog */}
      {isDeleteAllDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-semibold">Delete All Students</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete all students? This action cannot be undone and will permanently remove all student accounts from the system.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteAllDialogOpen(false)}
                className="text-[10px] h-7"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAllStudents}
                className="text-[10px] h-7"
              >
                Delete All Students
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Dialog */}
      {isDetailsDialogOpen && selectedStudent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 max-w-lg w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400 text-lg font-medium">
                  {selectedStudent.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {isEditing ? 'Edit Student' : 'Student Details'}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {selectedStudent.studentId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  setIsEditing(false);
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editedStudent.firstName}
                        onChange={(e) => setEditedStudent({ ...editedStudent, firstName: e.target.value })}
                        placeholder="First Name"
                        className="text-xs h-7 bg-white dark:bg-gray-700"
                      />
                      <Input
                        value={editedStudent.lastName}
                        onChange={(e) => setEditedStudent({ ...editedStudent, lastName: e.target.value })}
                        placeholder="Last Name"
                        className="text-xs h-7 bg-white dark:bg-gray-700"
                      />
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{selectedStudent.email}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Level</p>
                  {isEditing ? (
                    <Select
                      value={editedStudent.level}
                      onValueChange={(value) => setEditedStudent({ ...editedStudent, level: value })}
                    >
                      <SelectTrigger className="h-7 text-xs bg-white dark:bg-gray-700">
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upper" className="text-xs">Upper Level</SelectItem>
                        <SelectItem value="lower" className="text-xs">Lower Level</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{selectedStudent.level}</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Registration Date</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {format(new Date(selectedStudent.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Voting Status */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Voting Status</p>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    currentElection && votes.some(v => v.studentId === selectedStudent._id && v.electionId === currentElection._id)
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  }`} />
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {currentElection && votes.some(v => v.studentId === selectedStudent._id && v.electionId === currentElection._id)
                      ? 'Has Voted'
                      : 'Not Voted'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedStudent(null);
                    }}
                    className="text-[10px] h-7 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateStudent}
                    className="text-[10px] h-7 px-3"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students 