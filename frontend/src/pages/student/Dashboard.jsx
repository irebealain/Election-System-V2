import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { getAllCandidates } from "../../services/candidateService"
import { getAllPositions } from "../../services/positionService"
import { getAllUsers } from "../../services/UserService"
import { getAllElections } from "../../services/electionService"
import { CartesianGrid } from 'recharts';

function StudentDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState([])
  const [candidates, setCandidates] = useState([])
  const [electionData, setElectionData] = useState([])
  useEffect(() => {
    document.title = "Student Dashboard | Election System"
    const fetchData = async () => {
          try {
    
            const [usersData, positionsData, candidatesData, electionsData] = await Promise.all([
              getAllUsers(), 
              getAllPositions(),
              getAllCandidates(),
              getAllElections()
            ])
            setStudents(usersData || [])
            setCandidates(candidatesData || [])
            setPositions(positionsData || [])
    
            const currentElection = Array.isArray(electionsData) ? electionsData[0] : electionsData;
            
            setElectionData([currentElection])
          } catch (error) {
            console.error("Error fetching data:", error);
          }
          finally {
            setLoading(false);
          }
        }
        fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your election system dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voter Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Voted",
                        value: students.filter(student => student.voted).length,
                      },
                      {
                        name: "Not Voted",
                        value: students.filter(student => !student.voted).length,
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    <Cell fill="#46A977" />
                    <Cell fill="#FF6B6B" />
                  </Pie>
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333333'
                    }}
                    wrapperStyle={{ outline: 'none' }}
                    labelStyle={{ color: '#666666', marginBottom: '4px' }}
                    itemStyle={{ padding: '4px 0'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions & Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart width={500} height={300} data={positions.filter(positions => positions.electionId === electionData._id)}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#333333'
                    }}
                    wrapperStyle={{ outline: 'none' }}
                    labelStyle={{ color: '#666666', marginBottom: '4px' }}
                    itemStyle={{ padding: '4px 0'}}
                  />
                  <Bar dataKey="candidates" fill="#46A977" radius={[4, 4, 0, 0]} barSize={30} />
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voters by Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={students.reduce((acc, student) => {
                      const level = student.level;
                      const existingLevel = acc.find((item) => item.name === level);
                      if (existingLevel) {
                        existingLevel.value += 1;
                      } else {
                        acc.push({ name: level, value: 1 });
                      }
                      return acc;
                    }, [])}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}

                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fill="#46A977"
                  >



                    {students.reduce((acc, student) => {
                      const colors = ['#10B981', '#F59E0B'];
                      return colors.map((color, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={color}
                          stroke="none"
                          style={{
                            filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.2))',
                          }}
                        />
                      ));
                    }, [])}
                  </Pie>
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '12px',

                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                      fontSize: '12px',
                      fontWeight: '500',

                      color: '#333333',
                      backdropFilter: 'blur(8px)',
                    }}
                    wrapperStyle={{ outline: 'none' }}

                    labelStyle={{ color: '#666666', marginBottom: '2px', fontWeight: '600' }}
                    itemStyle={{ padding: '4px 0', marginLeft: '10px'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Students</CardTitle>
          <CardDescription>List of students registered for the current election.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">Level</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Registered</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b">
                    <td className="p-2 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {student.firstName.charAt(0)}
                        </div>
                        {student.firstName} {student.lastName}
                      </div>
                    </td>
                    <td className="p-2">{student.level}</td>
                    <td className="p-2">
                      {student.voted ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                          Voted
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                          Not Voted
                        </span>
                      )}
                    </td>
                    <td className="p-2">{student.startDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudentDashboard
