import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import Button from "../../components/common/Button"
import Tabs from "../../components/common/Tabs"
import {toast} from "react-hot-toast"
import { Search, UserPlus, Edit, Trash, Eye, Download, Filter, RefreshCw, UserCheck, UserX, Mail } from "lucide-react"
import gsap from "gsap"
import { getAllUsers } from "../../services/UserService"
import axios from "axios"

function StudentManagement() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState({
    level: "all",
    status: "all",
    voted: "all",
  })
  const [showPassword, setShowPassword] = useState(false) // State to toggle password visibility
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(5)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    level: "Upper"
  }) 
  const navigate = useNavigate()
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value
    })
  }
  // Animation effect when component mounts
  useEffect(() => {
    gsap.fromTo(
      ".student-management-container",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    )
  }, [])

  // Filter students based on search term and filters
  useEffect(() => {
    let result = students
    // Fetch data from the backend API
        const fetchData = async () => {
          try {
    
            const [usersData] = await Promise.all([
              getAllUsers(),
            ])
            setStudents(usersData || [])
            
          } catch (error) {
            console.error("Error fetching data:", error);
          }
          finally {
            setIsLoading(false);
          }
        }
        fetchData()
    // Apply search filter
    result = result.filter(
      (student) => {
        return student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())||
          student.level.toLowerCase().includes(searchTerm.toLowerCase())
      },
    )

    // Apply tab filter
    if (activeTab === "active") {
      result = result.filter((student) => student.status === "Active")
    } else if (activeTab === "inactive") {
      result = result.filter((student) => student.status === "Inactive")
    } else if (activeTab === "pending") {
      result = result.filter((student) => student.status === "Pending")
    }

    // Apply additional filters
    if (filters.level !== "all") {
      result = result.filter((student) => student.level === filters.level)
    }
    if (filters.status !== "all") {
      result = result.filter((student) => student.status === filters.status)
    }
    if (filters.voted !== "all") {
      result = result.filter((student) => (filters.voted === "voted" ? student.voted : !student.voted))
    }

    setFilteredStudents(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, students, activeTab, filters])

  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/api/users/signup', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          level: formData.level,
      })

      const newStudent = await response.data.data
      console.log("New student added:", newStudent)
      toast.success("Student added successfully!")
      setIsAddDialogOpen(false)
      
      // Update the students list with the new student
      setStudents([...students, newStudent])
      //Reset form data
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        level: "Upper"
      })
    } catch (error) {
      toast.error(error.message || "Error adding student")
      console.error("Error adding student:", error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleEditStudent = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would update the student in the database
      toast.success("Student updated successfully!")
      setIsEditDialogOpen(false)
      setIsLoading(false)

      // Update the student in the local state
      // In a real app, you would fetch the updated list from the API
      const updatedStudents = students.map((student) =>
        student.id === selectedStudent.id ? { ...student, name: "Updated Name" } : student,
      )
      setStudents(updatedStudents)
    }, 1000)
  }

  const handleDeleteStudent = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would delete the student from the database
      const updatedStudents = students.filter((student) => student.id !== selectedStudent.id)
      setStudents(updatedStudents)
      toast.success("Student deleted successfully!")
      setIsDeleteDialogOpen(false)
      setIsLoading(false)
    }, 1000)
  }

  const handleActivateStudent = (student) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would update the student status in the database
      const updatedStudents = students.map((s) => (s.id === student.id ? { ...s, status: "Active" } : s))
      setStudents(updatedStudents)
      toast.success(`${student.firstName} ${student.lastName} has been activated!`)
      setIsLoading(false)
    }, 1000)
  }

  const handleDeactivateStudent = (student) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would update the student status in the database
      const updatedStudents = students.map((s) => (s.id === student.id ? { ...s, status: "Inactive" } : s))
      setStudents(updatedStudents)
      toast.success(`${student.name} has been deactivated!`)
      setIsLoading(false)
    }, 1000)
  }

  const handleSendEmail = (student) => {
    toast.success(`Email sent to ${student.email}`)
  }

  const handleExportData = () => {
    toast.success("Student data exported successfully!")
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setActiveTab("all")
    setFilters({
      level: "all",
      status: "all",
      voted: "all",
    })
    setIsFilterDialogOpen(false)
  }

  const handleViewDetails = (student) => {
    setSelectedStudent(student)
    setIsViewDialogOpen(true)
  }

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of{" "}
          {filteredStudents.length} students
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-[#46A977]" : ""}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 student-management-container">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Student Management</h1>
        <p className="text-muted-foreground">Manage student accounts and information.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            className="pl-8 w-full sm:w-[300px] h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)} className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" onClick={handleExportData} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#46A977] hover:bg-[#3d9168] flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Students</CardTitle>
          <CardDescription>A list of all students in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            tabs={[
              { id: "all", label: "All Students" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
              { id: "pending", label: "Pending" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Student</th>
                  <th className="text-left p-2 font-medium">Level</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Voted</th>
                  <th className="text-left p-2 font-medium">Last Login</th>
                  <th className="text-right p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr key={student._id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#46A977] text-white flex items-center justify-center font-medium">
                            {student.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{student.level}</td>
                      <td className="p-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            student.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : student.status === "Inactive"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            student.voted
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                          }`}
                        >
                          {student.voted ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-2">{student.startDate}</td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(student)}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(student)
                              setIsEditDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0"
                            title="Edit Student"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          {student.status === "Active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivateStudent(student)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                              title="Deactivate Student"
                            >
                              <UserX className="h-4 w-4" />
                              <span className="sr-only">Deactivate</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivateStudent(student)}
                              className="h-8 w-8 p-0 text-green-500 hover:text-green-500"
                              title="Activate Student"
                            >
                              <UserCheck className="h-4 w-4" />
                              <span className="sr-only">Activate</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendEmail(student)}
                            className="h-8 w-8 p-0"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                            <span className="sr-only">Email</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(student)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                            title="Delete Student"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > 0 && renderPagination()}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-999 bg-black/50 flex items-center justify-center p-4 -left-[2.5rem] w-screen h-screen -top-16">
          <div className="bg-background rounded-[20px] shadow-lg w-full max-w-md mb-16 mt-12">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
              <p className="text-sm text-muted-foreground mb-4">Add a new student to the election system.</p>
              <form onSubmit={handleAddStudent}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      placeholder="John Doe"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData(e.target.value)}
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      placeholder="John Doe"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData(e.target.value)}
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(e.target.value)}
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData(e.target.value)}
                        className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>                  
                  <div className="space-y-2">
                    <label htmlFor="level" className="text-sm font-medium">
                      Level
                    </label>
                    <select
                      id="level"
                      required
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Upper">Upper</option>
                      <option value="Lower">Lower</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#46A977] hover:bg-[#3d9168]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Student"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Dialog */}
      {selectedStudent && isEditDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 -left-[2.5rem] w-screen h-screen -top-16">
          <div className="bg-background rounded-[20px] shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
              <p className="text-sm text-muted-foreground mb-4">Update student information.</p>
              <form onSubmit={handleEditStudent}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      id="edit-name"
                      defaultValue={selectedStudent.firstName}
                      required
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="edit-email"
                      type="email"
                      defaultValue={selectedStudent.email}
                      required
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="edit-level" className="text-sm font-medium">
                      Level
                    </label>
                    <select
                      id="edit-level"
                      defaultValue={selectedStudent.level}
                      required
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Upper">Upper</option>
                      <option value="Lower">Lower</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="edit-status" className="text-sm font-medium">
                      Status
                    </label>
                    <select
                      id="edit-status"
                      defaultValue={selectedStudent.status}
                      required
                      className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#46A977] hover:bg-[#3d9168]" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Student Dialog */}
      {selectedStudent && isViewDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 -left-[2.5rem] w-screen h-screen -top-16">
          <div className="bg-background rounded-[20px] shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Student Details</h2>
              <div className="flex flex-col items-center mb-4">
                <div className="h-20 w-20 rounded-full bg-[#46A977] text-white flex items-center justify-center text-2xl font-medium mb-2">
                  {selectedStudent.firstName.charAt(0)}
                </div>
                <h3 className="text-lg font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent.level}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedStudent.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : selectedStudent.status === "Inactive"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    }`}
                  >
                    {selectedStudent.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Voted</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedStudent.voted
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                    }`}
                  >
                    {selectedStudent.voted ? "Voted" : "Not Voted"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Registered</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent.registeredAt}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created On</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent.startDate}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setIsEditDialogOpen(true)
                  }}
                  className="bg-[#46A977] hover:bg-[#3d9168]"
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedStudent && isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 -left-[2.5rem] w-screen h-screen -top-16">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Delete Student</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete {selectedStudent.firstName} {selectedStudent.lastName}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={handleDeleteStudent} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Dialog */}
      {isFilterDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 -left-[2.5rem] w-screen h-screen -top-16">
          <div className="bg-background rounded-[20px] shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Filter Students</h2>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="filter-level" className="text-sm font-medium">
                    Level
                  </label>
                  <select
                    id="filter-level"
                    value={filters.level}
                    onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                    className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Levels</option>
                    <option value="Upper">upper</option>
                    <option value="Lower">lower</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="filter-status" className="text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="filter-status"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="filter-voted" className="text-sm font-medium">
                    Voting Status
                  </label>
                  <select
                    id="filter-voted"
                    value={filters.voted}
                    onChange={(e) => setFilters({ ...filters, voted: e.target.value })}
                    className="w-full h-10 rounded-[20px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All</option>
                    <option value="voted">Voted</option>
                    <option value="not-voted">Not Voted</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsFilterDialogOpen(false)}
                  className="bg-[#46A977] hover:bg-[#3d9168]"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagement
