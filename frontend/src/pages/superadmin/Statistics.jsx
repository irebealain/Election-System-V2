import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllElections, getElectionResults } from '../../services/electionService';
import { getAllVotes } from '../../services/voteService';
import { getAllCandidates } from '../../services/candidateService';
import { getAllPositions } from '../../services/positionService';
import { getAllUsers } from '../../services/UserService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, Trophy, Calendar, Users, XCircle, Clock, X, Crown, ArrowLeft, BarChart2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import PDFGenerator from '../../components/PDFGenerator';
import Modal from '../../components/common/Modal';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function CountdownAnimation({ onComplete }) {
  const [count, setCount] = useState(5);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
      setTimeout(onComplete, 500);
    }
  }, [count, onComplete]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 rounded-[20px]"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-48 h-48 flex items-center justify-center"
          >
            <svg className="absolute w-full h-full drop-shadow-lg" viewBox="0 0 100 100">
               <motion.circle 
                 cx="50" cy="50" r="45" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="2" 
                 className="text-primary/10 dark:text-primary/20"
               />
               <motion.circle 
                 cx="50" cy="50" r="45" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="3" 
                 strokeDasharray="283"
                 initial={{ strokeDashoffset: 283 }}
                 animate={{ strokeDashoffset: 0 }}
                 transition={{ duration: 5, ease: "linear" }}
                 className="text-primary"
                 strokeLinecap="round"
                 transform="rotate(-90 50 50)"
               />
            </svg>
            <motion.div
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-7xl font-bold text-gray-900 dark:text-white drop-shadow-md"
            >
              {count}
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-lg font-medium text-gray-600 dark:text-gray-300 tracking-wide uppercase"
          >
            Revealing Winner
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ElectionStats() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state management
  const [viewState, setViewState] = useState('elections'); // 'elections' | 'positions'
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  const pdfGeneratorRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [electionsData, positionsData, candidatesData, votesData, studentsData] = await Promise.all([
        getAllElections(),
        getAllPositions(),
        getAllCandidates(),
        getAllVotes(),
        getAllUsers()
      ]);

      if (!electionsData || !positionsData || !candidatesData || !votesData || !studentsData) {
        throw new Error('Failed to fetch required data');
      }

      setElections(electionsData);
      setPositions(positionsData);
      setCandidates(candidatesData);
      setVotes(votesData);
      setStudents(Array.isArray(studentsData) ? studentsData : (studentsData?.data || []));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load election statistics. Please try again later.');
      toast.error('Failed to load election statistics');
    } finally {
      setLoading(false);
    }
  };

  const getPositionResults = (positionId) => {
    if (!positionId || !selectedElection) return [];

    const positionCandidates = candidates.filter(c => 
      c.positionId === positionId && c.electionId === selectedElection._id
    );

    if (!positionCandidates.length) return [];

    const positionVotes = votes.filter(v => 
      v.electionId === selectedElection._id && 
      v.positionId === positionId
    );

    if (!positionVotes.length) {
      return positionCandidates.map(candidate => ({
        name: `${candidate.firstName} ${candidate.lastName}`,
        value: 0,
        profile: candidate.profilePic,
        percentage: 0
      }));
    }

    const uniqueVoters = new Set(positionVotes.map(v => v.studentId));
    const totalVoters = uniqueVoters.size;

    return positionCandidates.map(candidate => {
      const candidateVotes = positionVotes.filter(v => v.candidateId === candidate._id);
      const voteCount = candidateVotes.length;
      
      return {
        name: `${candidate.firstName} ${candidate.lastName}`,
        value: voteCount,
        profile: candidate.profilePic,
        percentage: totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0
      };
    }).sort((a, b) => b.value - a.value);
  };

  const handleElectionSelect = (election) => {
    setSelectedElection(election);
    setViewState('positions');
  };

  const handleBackToElections = () => {
    setViewState('elections');
    setSelectedElection(null);
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
    setShowCountdown(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPosition(null);
      setShowCountdown(false);
    }, 300); // Wait for transition out
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#ffffff', '#fbbf24'] // Accents
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#ffffff', '#fbbf24'] // Accents
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    triggerConfetti();
  };

  const handleDownloadResults = async (election) => {
    try {
      if (!pdfGeneratorRef.current) {
        toast.error('Please wait while the PDF generator initializes...');
        return;
      }
      setSelectedElection(election);
      let attempts = 0;
      const maxAttempts = 10;
      
      const waitForGenerator = async () => {
        if (pdfGeneratorRef.current.isReady) {
          const success = await pdfGeneratorRef.current.generatePDF();
          if (success) {
            toast.success('Results downloaded successfully');
          } else {
            toast.error('Failed to generate PDF');
          }
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(waitForGenerator, 500);
        } else {
          toast.error('Failed to initialize PDF generator. Please try again.');
        }
      };
      waitForGenerator();
    } catch (error) {
      toast.error('Failed to download results');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading election statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-xl font-semibold text-gray-900">{error}</p>
          <p className="text-gray-600 mt-2">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Election Statistics</h1>
        <p className="text-muted-foreground">
          {viewState === 'elections' ? 'Select an election to view detailed results' : `Viewing positions for ${selectedElection?.title}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW: ELECTION LIST */}
        {viewState === 'elections' && (
          <motion.div 
            key="elections-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {elections.map((election) => {
              const electionPositions = positions.filter(p => p.electionId === election._id);
              const electionCandidates = candidates.filter(c => c.electionId === election._id);
              
              return (
                <Card key={election._id} className="hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800">
                  <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 pb-4 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">{election.title}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(election.startDate), 'MMM d')} - {format(new Date(election.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                        election.status === 'ongoing' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : election.status === 'completed' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          election.status === 'ongoing' 
                            ? 'bg-green-500 dark:bg-green-400' 
                            : election.status === 'completed' 
                            ? 'bg-blue-500 dark:bg-blue-400'
                            : 'bg-yellow-500 dark:bg-yellow-400'
                        }`} />
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-primary/5 rounded-[16px]">
                        <p className="text-2xl font-bold text-primary">{electionPositions.length}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">Positions</p>
                      </div>
                      <div className="text-center p-4 bg-accent/5 dark:bg-accent/10 rounded-[16px]">
                        <p className="text-2xl font-bold text-accent dark:text-accent-foreground">{electionCandidates.length}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">Candidates</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => handleElectionSelect(election)}
                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        View All Positions
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadResults(election)}
                        className="w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* VIEW: POSITION LIST */}
        {viewState === 'positions' && selectedElection && (
          <motion.div 
            key="positions-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBackToElections} className="rounded-full shadow-sm hover:shadow">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {positions
                .filter(p => p.electionId === selectedElection._id)
                .map((position) => {
                  const posCandidates = candidates.filter(c => c.positionId === position._id && c.electionId === selectedElection._id);
                  
                  return (
                    <motion.div
                      key={position._id}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group cursor-pointer"
                      onClick={() => handlePositionSelect(position)}
                    >
                      <Card className="h-full border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 pb-4 pt-5 px-6">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                              {position.title}
                            </CardTitle>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                              {posCandidates.length} Contestants
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <ul className="space-y-3 mb-6">
                            {posCandidates.slice(0, 4).map(candidate => (
                              <li key={candidate._id} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                  {candidate.profilePic ? (
                                    <img src={candidate.profilePic} alt={candidate.firstName} className="w-full h-full object-cover" />
                                  ) : (
                                    <Users className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <span className="font-medium">{candidate.firstName} {candidate.lastName}</span>
                              </li>
                            ))}
                            {posCandidates.length > 4 && (
                              <li className="text-sm text-gray-500 font-medium pl-11">
                                +{posCandidates.length - 4} more
                              </li>
                            )}
                            {posCandidates.length === 0 && (
                              <li className="text-sm text-gray-400 italic">No contestants</li>
                            )}
                          </ul>
                          
                          <div className="mt-4 flex items-center justify-center w-full py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-white border border-gray-100 dark:border-gray-700 transition-all duration-300 shadow-sm">
                            View Results <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Stats Modal */}
      <Modal isOpen={isModalOpen && !!selectedPosition} onClose={handleCloseModal} className="max-w-4xl p-0">
        {selectedPosition && (
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl w-full relative overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-primary" />
                    {selectedPosition.title} Results
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedElection.title}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 relative min-h-[400px]">
                {showCountdown ? (
                  <CountdownAnimation onComplete={handleCountdownComplete} />
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                  >
                    {(() => {
                      const results = getPositionResults(selectedPosition._id);
                      const winner = results[0];
                      const totalVotes = results.reduce((sum, item) => sum + item.value, 0);

                      if (!winner || totalVotes === 0) {
                         return (
                           <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                             <Users className="w-16 h-16 mb-4 opacity-50" />
                             <p className="text-lg">No votes recorded yet.</p>
                           </div>
                         );
                      }

                      return (
                        <>
                          {/* Winner Reveal Side */}
                          <div className="flex flex-col items-center justify-center space-y-6">
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
                              className="relative"
                            >
                              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent/30 blur-2xl rounded-full opacity-50 animate-pulse"></div>
                              <div className="relative w-48 h-48 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                {winner.profile ? (
                                  <img src={winner.profile} alt={winner.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Users className="w-20 h-20" />
                                  </div>
                                )}
                              </div>
                              <motion.div 
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900"
                              >
                                <Crown className="w-8 h-8 text-white" />
                              </motion.div>
                            </motion.div>

                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              className="text-center"
                            >
                              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-3 tracking-wide uppercase">
                                Winner
                              </div>
                              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{winner.name}</h3>
                              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                {winner.value} Votes <span className="mx-2">•</span> <span className="text-primary font-bold">{winner.percentage.toFixed(1)}%</span>
                              </p>
                            </motion.div>
                          </div>

                          {/* Pie Chart Side */}
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-gray-50 dark:bg-gray-800/50 rounded-[24px] p-6 h-full flex flex-col justify-center border border-gray-100 dark:border-gray-700/50"
                          >
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">Vote Distribution</h4>
                            <div className="h-[280px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={results}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={8}
                                  >
                                    {results.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[index % COLORS.length]} 
                                        className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                      backdropFilter: 'blur(8px)',
                                      borderRadius: '16px',
                                      padding: '12px 20px',
                                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                      border: 'none',
                                      color: '#1f2937'
                                    }}
                                    itemStyle={{ fontWeight: 600 }}
                                    formatter={(value, name) => {
                                      const percentage = ((value / totalVotes) * 100).toFixed(1);
                                      return [`${value} votes (${percentage}%)`, name];
                                    }}
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => (
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                        {value}
                                      </span>
                                    )}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </motion.div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            </div>
        )}
      </Modal>

      <PDFGenerator
        ref={pdfGeneratorRef}
        election={selectedElection}
        positions={positions}
        getPositionResults={getPositionResults}
      />
    </div>
  );
}

export default ElectionStats;