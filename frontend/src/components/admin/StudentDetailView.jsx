import { useState } from "react"
import { Edit, Save, X, Mail, Phone, User, Calendar, MapPin, BookOpen, Shield, AlertCircle } from "lucide-react"

const StudentDetailView = ({ student, onSave, onClose, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedStudent, setEditedStudent] = useState({ ...student })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedStudent((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!editedStudent.firstName.trim()) newErrors.firstName = "First name is required"
    if (!editedStudent.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!editedStudent.email.trim()) newErrors.email = "Email is required"
    if (!/^\S+@\S+\.\S+$/.test(editedStudent.email)) newErrors.email = "Invalid email format"
    if (!editedStudent.studentId.trim()) newErrors.studentId = "Student ID is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    onSave(editedStudent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedStudent({ ...student })
    setIsEditing(false)
    setErrors({})
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-lg p-6 max-w-3xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Student Details</h2>
        <div className="flex gap-2">
          {!readOnly &&
            (isEditing ? (
              <>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-[20px] hover:bg-green-700 transition-colors"
                >
                  <Save size={18} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-[20px] hover:bg-gray-600 transition-colors"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-[20px] hover:bg-blue-700 transition-colors"
              >
                <Edit size={18} />
                <span>Edit</span>
              </button>
            ))}
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-[20px] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={18} />
            <span>Close</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User size={16} className="inline mr-1" /> First Name
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="firstName"
                  value={editedStudent.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-[20px] ${
                    errors.firstName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {errors.firstName}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-900 dark:text-white">{student.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User size={16} className="inline mr-1" /> Last Name
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="lastName"
                  value={editedStudent.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-[20px] ${
                    errors.lastName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {errors.lastName}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-900 dark:text-white">{student.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Mail size={16} className="inline mr-1" /> Email
            </label>
            {isEditing ? (
              <div>
                <input
                  type="email"
                  name="email"
                  value={editedStudent.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-[20px] ${
                    errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {errors.email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-900 dark:text-white">{student.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Phone size={16} className="inline mr-1" /> Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={editedStudent.phone || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[20px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{student.phone || "Not provided"}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <BookOpen size={16} className="inline mr-1" /> Student ID
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="studentId"
                  value={editedStudent.studentId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-[20px] ${
                    errors.studentId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                {errors.studentId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {errors.studentId}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-900 dark:text-white">{student.studentId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MapPin size={16} className="inline mr-1" /> Department
            </label>
            {isEditing ? (
              <select
                name="department"
                value={editedStudent.department || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[20px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Arts">Arts</option>
                <option value="Sciences">Sciences</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white">{student.department || "Not assigned"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar size={16} className="inline mr-1" /> Year Level
            </label>
            {isEditing ? (
              <select
                name="yearLevel"
                value={editedStudent.yearLevel || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[20px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5+">Fifth Year or Higher</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white">
                {student.yearLevel ? `Year ${student.yearLevel}` : "Not specified"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Shield size={16} className="inline mr-1" /> Account Status
            </label>
            {isEditing ? (
              <select
                name="status"
                value={editedStudent.status || "active"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[20px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            ) : (
              <p
                className={`capitalize ${
                  student.status === "active"
                    ? "text-green-600"
                    : student.status === "inactive"
                      ? "text-gray-500"
                      : "text-red-600"
                }`}
              >
                {student.status || "Active"}
              </p>
            )}
          </div>
        </div>
      </div>

      {!readOnly && isEditing && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">* All changes will be logged for audit purposes</p>
        </div>
      )}
    </div>
  )
}

export default StudentDetailView
