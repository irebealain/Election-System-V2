"use client"

const StudentFilters = ({ filters, setFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Filters</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Year Level
          </label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[20px] shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
            <option value="5">Year 5</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[20px] shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course
          </label>
          <select
            id="course"
            name="course"
            value={filters.course}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[20px] shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Courses</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business">Business</option>
            <option value="Arts">Arts</option>
            <option value="Medicine">Medicine</option>
            <option value="Law">Law</option>
          </select>
        </div>

        <button
          onClick={() =>
            setFilters({
              year: "all",
              status: "all",
              course: "all",
            })
          }
          className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-[20px] text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default StudentFilters
