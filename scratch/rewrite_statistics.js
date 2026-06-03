const fs = require('fs');

const path = './frontend/src/pages/superadmin/Statistics.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update Imports
content = content.replace(
  "import { Download, Trophy, Calendar, Users, XCircle, Clock, X, Crown, ChevronDown, ChevronUp } from 'lucide-react';",
  "import { Download, Trophy, Calendar, Users, XCircle, Clock, X, Crown, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';"
);

// 2. Update States
content = content.replace(
  /const \[selectedElection, setSelectedElection\] = useState\(null\);[\s\S]*?const \[showCountdown, setShowCountdown\] = useState\(false\);/,
  `const [selectedElection, setSelectedElection] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);`
);

// 3. Update Handlers
content = content.replace(
  /const handleElectionSelect = \(election\) => \{[\s\S]*?setCurrentPositionIndex\(0\);\n  \};/,
  `const handleElectionSelect = (election) => {
    setSelectedElection(election);
  };

  const handleBackToElections = () => {
    setSelectedElection(null);
    setSelectedPosition(null);
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setShowCountdown(true);
  };

  const handleCloseModal = () => {
    setSelectedPosition(null);
    setShowCountdown(false);
  };`
);

// 4. Remove Next/Previous handlers and useEffect
content = content.replace(
  /const handleNextPosition = \(\) => \{[\s\S]*?const isLastPosition = selectedElection [\s\S]*?: false;/m,
  `// Position modal and navigation logic refactored`
);

// 5. Replace render block
const renderIndex = content.indexOf('  return (');
const pdfGeneratorIndex = content.indexOf('      {/* Add PDF Generator */}');

const newRender = `  return (
    <div className="space-y-6">
      {!selectedElection ? (
        <>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Election Statistics</h1>
            <p className="text-muted-foreground">
              View and analyze election results and statistics
            </p>
          </div>

          {/* Elections List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => {
              const electionPositions = positions.filter(p => p.electionId === election._id);
              const electionCandidates = candidates.filter(c => c.electionId === election._id);
              
              // Get all votes for this election
              const allElectionVotes = votes.filter(v => v.electionId === election._id);
              
              // Group votes by student
              const studentVotesMap = new Map();
              allElectionVotes.forEach(vote => {
                if (!studentVotesMap.has(vote.studentId)) {
                  studentVotesMap.set(vote.studentId, new Set());
                }
                studentVotesMap.get(vote.studentId).add(vote.positionId);
              });
              
              // Get all unique students who voted in this election
              const electionVoters = new Set();
              
              // First pass to get students who have voted
              for (const student of students) {
                const studentVotedPositions = studentVotesMap.get(student._id);
                if (!studentVotedPositions) {
                  continue;
                }
                
                // Get positions this student is eligible for
                const eligiblePositions = electionPositions.filter(pos => {
                  const isJuniorMinister = pos.title.toLowerCase().includes('junior minister');
                  return (student.level === 'lower' && isJuniorMinister) || 
                        (student.level === 'upper' && !isJuniorMinister);
                });
                
                // Check if student has voted for all their eligible positions
                const hasVotedAll = eligiblePositions.every(pos => studentVotedPositions.has(pos._id));
                if (hasVotedAll) {
                  electionVoters.add(student._id);
                }
              }
              
              return (
                <Card key={election._id} className="hover:shadow-lg transition-shadow overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">{election.title}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(election.startDate), 'MMM d')} - {format(new Date(election.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className={\`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 \${
                        election.status === 'ongoing' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : election.status === 'completed' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }\`}>
                        <span className={\`w-1.5 h-1.5 rounded-full \${
                          election.status === 'ongoing' 
                            ? 'bg-green-500 dark:bg-green-400' 
                            : election.status === 'completed' 
                            ? 'bg-blue-500 dark:bg-blue-400'
                            : 'bg-yellow-500 dark:bg-yellow-400'
                        }\`} />
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-primary/5 rounded-[16px]">
                        <p className="text-xl font-bold text-primary">{electionPositions.length}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">Positions</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-[16px]">
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{electionCandidates.length}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">Candidates</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-[16px]">
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{electionVoters.size}</p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">Voters</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => handleElectionSelect(election)}
                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadResults(election)}
                        className="w-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        // --- ELECTION DETAILS VIEW ---
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBackToElections}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{selectedElection.title}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Results
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">
                  Select a position to view the winner and vote distribution
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => handleDownloadResults(selectedElection)}
              className="hidden md:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Full Report
            </Button>
          </div>

          {/* Position Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {positions.filter(p => p.electionId === selectedElection._id).map((position) => {
              const positionCandidates = candidates.filter(c => c.positionId === position._id && c.electionId === selectedElection._id);
              
              return (
                <div 
                  key={position._id}
                  onClick={() => handlePositionSelect(position)}
                  className="group relative bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                    <Trophy className="w-24 h-24" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {position.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            <Users className="w-3 h-3 mr-1" />
                            {positionCandidates.length} Contestants
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <ChevronDown className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 -rotate-90 transition-all" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      {positionCandidates.slice(0, 4).map((c, idx) => (
                        <div key={c._id} className="flex items-center gap-3">
                          <img 
                            src={c.profilePic || 'https://via.placeholder.com/40'} 
                            alt={c.firstName} 
                            className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-700 shadow-sm"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {c.firstName} {c.lastName}
                          </span>
                        </div>
                      ))}
                      {positionCandidates.length > 4 && (
                        <div className="text-xs font-medium text-gray-400 pl-11">
                          +{positionCandidates.length - 4} more
                        </div>
                      )}
                      {positionCandidates.length === 0 && (
                        <div className="text-sm text-gray-400 italic">No contestants</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modern Stats Modal */}
      <AnimatePresence>
        {selectedPosition && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Glassmorphism Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedPosition.title} Results</h2>
                    <p className="text-xs text-muted-foreground">{selectedElection.title}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 relative min-h-[500px] flex items-center justify-center overflow-y-auto" style={{ maxHeight: 'calc(90vh - 88px)' }}>
                {showCountdown ? (
                  <CountdownAnimation onComplete={handleCountdownComplete} />
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full"
                  >
                    {(() => {
                      const results = getPositionResults(selectedPosition._id);
                      const winner = results[0];
                      
                      if (!winner || winner.value === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center text-muted-foreground py-20">
                            <Users className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">No votes recorded yet</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                          {/* Winner Spotlight */}
                          <div className="flex flex-col items-center">
                            <div className="relative group">
                              {/* Animated glowing background */}
                              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-primary to-yellow-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
                              
                              <img 
                                src={winner.profile} 
                                alt={winner.name} 
                                className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl z-10"
                              />
                              
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 z-20"
                              >
                                <Crown className="w-8 h-8 text-white drop-shadow-md" />
                              </motion.div>
                            </div>
                            
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="text-center mt-8 space-y-2"
                            >
                              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold tracking-widest text-sm uppercase mb-2">
                                WINNER
                              </div>
                              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                                {winner.name}
                              </h3>
                              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                                With <span className="text-primary font-bold">{winner.value}</span> votes
                              </p>
                            </motion.div>
                          </div>

                          {/* Vote Distribution */}
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gray-50/50 dark:bg-gray-800/30 rounded-[32px] p-6 sm:p-8"
                          >
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Vote Distribution</h4>
                            
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={results}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                  >
                                    {results.map((entry, index) => (
                                      <Cell 
                                        key={\`cell-\${index}\`} 
                                        fill={COLORS[index % COLORS.length]}
                                        className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                                        style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.1))' }}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                      backdropFilter: 'blur(12px)',
                                      borderRadius: '16px',
                                      padding: '12px 20px',
                                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                                      border: 'none',
                                      color: '#111827'
                                    }}
                                    itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                                    formatter={(value, name) => {
                                      const total = results.reduce((a, b) => a + b.value, 0);
                                      const percentage = ((value / total) * 100).toFixed(1);
                                      return [
                                        <div className="flex flex-col ml-2">
                                          <span className="text-lg font-bold">{value} votes</span>
                                          <span className="text-sm text-gray-500">{percentage}%</span>
                                        </div>,
                                        <span className="font-medium text-gray-600">{name}</span>
                                      ];
                                    }}
                                  />
                                  <Legend 
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    iconType="circle"
                                    iconSize={10}
                                    formatter={(value, entry, index) => {
                                      const data = results[index];
                                      return (
                                        <div className="flex flex-col ml-2">
                                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value.length > 15 ? \`\${value.substring(0, 15)}...\` : value}</span>
                                          <span className="text-xs text-gray-500">{data.percentage.toFixed(1)}%</span>
                                        </div>
                                      );
                                    }}
                                    wrapperStyle={{ paddingLeft: '20px' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

const pdfGeneratorCode = content.substring(pdfGeneratorIndex);

content = content.substring(0, renderIndex) + newRender + "\n" + pdfGeneratorCode;

fs.writeFileSync(path, content);
console.log("Successfully rewritten Statistics.jsx");
