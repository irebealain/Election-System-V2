import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllElections, getElectionResults } from '../../services/electionService';
import { getAllVotes } from '../../services/voteService';
import { getAllCandidates } from '../../services/candidateService';
import { getAllPositions } from '../../services/positionService';
import { getAllStudents } from '../../services/UserService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, Trophy, Calendar, Users, XCircle, Clock, X, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PDFGenerator from '../../components/PDFGenerator';

// Position icons mapping
const positionIcons = {
  president: <Users className="w-6 h-6" />,
  vicePresident: <Users className="w-6 h-6" />,
  secretary: <Users className="w-6 h-6" />,
  treasurer: <Users className="w-6 h-6" />,
};

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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-64 h-64"
          >
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Trophy Base */}
              <path
                d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z"
                fill="url(#trophy-gradient)"
                stroke="currentColor"
                strokeWidth="4"
              />
              {/* Trophy Cup */}
              <path
                d="M80 60H120C133.255 60 144 70.7452 144 84V100C144 113.255 133.255 124 120 124H80C66.7452 124 56 113.255 56 100V84C56 70.7452 66.7452 60 80 60Z"
                fill="url(#cup-gradient)"
                stroke="currentColor"
                strokeWidth="4"
              />
              {/* Trophy Handle */}
              <path
                d="M80 124C80 140 90 152 100 152C110 152 120 140 120 124"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="trophy-gradient" x1="0" y1="0" x2="200" y2="200">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
                <linearGradient id="cup-gradient" x1="56" y1="60" x2="144" y2="124">
                  <stop offset="0%" stopColor="#FFF8DC" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
            </svg>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl"
            >
              {count}
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-xl font-medium text-gray-600 dark:text-gray-300"
          >
            Displaying results in {count} seconds...
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const canvasRef = useRef(null);
  const pdfGeneratorRef = useRef(null);
  const [isPdfGeneratorReady, setIsPdfGeneratorReady] = useState(false);

  useEffect(() => {
    fetchData();
    console.log("Position data:", positions);
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
        getAllStudents()
      ]);

      if (!electionsData || !positionsData || !candidatesData || !votesData || !studentsData) {
        throw new Error('Failed to fetch required data');
      }

      setElections(electionsData);
      setPositions(positionsData);
      setCandidates(candidatesData);
      setVotes(votesData);
      setStudents(studentsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load election statistics. Please try again later.');
      toast.error('Failed to load election statistics');
    } finally {
      setLoading(false);
    }
  };

  const getPositionResults = (positionId) => {
    // Basic validation
    if (!positionId || !selectedElection) {
      return [];
    }

    // Get candidates for this position in current election
    const positionCandidates = candidates.filter(c => 
      c.positionId === positionId && c.electionId === selectedElection._id
    );

    // If no candidates, return empty array
    if (!positionCandidates.length) {
      return [];
    }

    // Get all votes for this position in current election
    const positionVotes = votes.filter(v => 
      v.electionId === selectedElection._id && 
      v.positionId === positionId
    );

    if (!positionVotes.length) {
      return positionCandidates.map(candidate => ({
        name: `${candidate.firstName} ${candidate.lastName}`,
        value: 0,
        percentage: 0
      }));
    }

    // Count unique voters for this position
    const uniqueVoters = new Set(positionVotes.map(v => v.studentId));
    const totalVoters = uniqueVoters.size;

    // Count votes for each candidate
    return positionCandidates.map(candidate => {
      const candidateVotes = positionVotes.filter(v => v.candidateId === candidate._id);
      const voteCount = candidateVotes.length;
      
      return {
        name: `${candidate.firstName} ${candidate.lastName}`,
        value: voteCount,
        percentage: totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0
      };
    }).sort((a, b) => b.value - a.value);
  };

  const handleElectionSelect = (election) => {
    setSelectedElection(election);
    setIsModalOpen(true);
    setShowCountdown(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedElection(null);
    setCurrentPositionIndex(0);
  };

  const handleDownloadResults = async (election) => {
    try {
      console.log('Starting download process for election:', election);
      
      if (!pdfGeneratorRef.current) {
        console.error('PDF Generator ref is not available');
        toast.error('Please wait while the PDF generator initializes...');
        return;
      }

      // Set the selected election first
      setSelectedElection(election);
      
      // Wait for the PDFGenerator to be ready
      let attempts = 0;
      const maxAttempts = 10;
      
      const waitForGenerator = async () => {
        if (pdfGeneratorRef.current.isReady) {
          console.log('PDF Generator is ready, proceeding with generation');
          const results = await getElectionResults(election._id);
          const success = await pdfGeneratorRef.current.generatePDF();
          
          if (success) {
      toast.success('Results downloaded successfully');
          } else {
            toast.error('Failed to generate PDF');
          }
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log(`Waiting for PDF Generator to be ready (attempt ${attempts}/${maxAttempts})`);
          setTimeout(waitForGenerator, 500);
        } else {
          console.error('PDF Generator failed to initialize after multiple attempts');
          toast.error('Failed to initialize PDF generator. Please try again.');
        }
      };

      waitForGenerator();
    } catch (error) {
      console.error('Error downloading results:', error);
      toast.error('Failed to download results');
    }
  };

  const handleCelebrateWinner = (position, winner) => {
    toast.success(`Congratulations to ${winner.name} for winning the ${position.title} position! 🎉`);
  };

  const triggerConfetti = () => {
    // Multiple confetti bursts
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star']
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle']
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
    setTimeout(shoot, 300);
    setTimeout(shoot, 400);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    triggerConfetti();
  };

  const handleNextPosition = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowCountdown(true);
    setTimeout(() => {
      setCurrentPositionIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= positions.filter(p => p.electionId === selectedElection._id).length) {
          return 0;
        }
        return nextIndex;
      });
      setIsTransitioning(false);
    }, 500);
  };

  const handlePreviousPosition = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowCountdown(true);
    setTimeout(() => {
      setCurrentPositionIndex(prev => {
        const nextIndex = prev - 1;
        if (nextIndex < 0) {
          return positions.filter(p => p.electionId === selectedElection._id).length - 1;
        }
        return nextIndex;
      });
      setIsTransitioning(false);
    }, 500);
  };

  useEffect(() => {
    if (isModalOpen) {
      setShowCountdown(true);
    }
  }, [currentPositionIndex, isModalOpen]);

  const isLastPosition = selectedElection 
    ? currentPositionIndex === positions.filter(p => p.electionId === selectedElection._id).length - 1
    : false;

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
          
          console.log('Processing votes for election:', election.title);
          
          // Filter students who completed all their required positions
          const completedVotes = allElectionVotes.filter(vote => {
            const studentVotedPositions = studentVotesMap.get(vote.studentId);
            const student = (students || []).find(s => s._id === vote.studentId);
            
            if (!student) {
              console.log('Student not found for vote:', vote.studentId);
              return false;
            }
            if (!studentVotedPositions) {
              console.log('No votes found for student:', student.firstName, student.lastName);
              return false;
            }
            
            // Get positions this student is eligible for
            const eligiblePositions = electionPositions.filter(pos => {
              const isJuniorMinister = pos.title.toLowerCase().includes('junior minister');
              return (student.level === 'lower' && isJuniorMinister) || 
                     (student.level === 'upper' && !isJuniorMinister);
            });
            
            // Check if student has voted for all their eligible positions
            return eligiblePositions.every(pos => studentVotesMap.has(pos._id));
          });
          
          const electionVotes = completedVotes;
          
          return (
            <Card key={election._id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
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
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <p className="text-xl font-bold text-primary">{electionPositions.length}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Positions</p>
                  </div>
                  <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{electionCandidates.length}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Candidates</p>
                  </div>
                  <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{electionVotes.length}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Votes</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleElectionSelect(election)}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadResults(election)}
                    className="w-full"
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

      {/* Statistics Modal */}
      {isModalOpen && selectedElection && (
        <div className="modal-backdrop p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">{selectedElection.title} Winners</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {showCountdown && (
                <CountdownAnimation onComplete={handleCountdownComplete} />
              )}
              
              <AnimatePresence mode="wait">
                {!showCountdown && positions
                  .filter(p => p.electionId === selectedElection._id)
                  .map((position, index) => {
                    if (index !== currentPositionIndex) return null;
                    
                    const results = getPositionResults(position._id);
                    const winner = results[0];
                    
                    return (
                      <motion.div
                        key={position._id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-4"
                      >                          
                      <div className="w-full max-w-2xl mx-auto space-y-6">
                            <div className="text-center relative">
                              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent top-1/2 -translate-y-1/2 -z-10" />
                              
                            </div>

                            {winner ? (
                              <div className="space-y-6">
                                {/* Winner Card */}
                                <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl p-6 shadow-lg border border-primary/10">
                                  <div className="absolute -top-3 -left-3">
                                    <div className="relative">
                                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg mt-8">
                                        <Crown className="w-6 h-6" />
                                      </div>
                                      <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        1st
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-center mt-2">
                                    <h3 className="text-2xl font-bold text-primary inline-block px-6 dark:bg-gray-800">
                                    {position?.title || 'Unknown Position'}
                                    </h3>
                                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{winner.name}</h4>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
                                      <Trophy className="w-4 h-4 text-primary" />
                                      <span className="font-semibold text-primary">
                                        {winner.value} votes ({winner.percentage.toFixed(1)}%)
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Results Chart */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 text-center">Vote Distribution</h4>
                                  <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                        <Pie
                                          data={results}
                                          cx="50%"
                                          cy="50%"
                                          outerRadius={80}
                                          innerRadius={60}
                                          fill="#8884d8"
                                          dataKey="value"
                                          paddingAngle={2}
                                          label={({ name, value, percent }) => {
                                            if (percent < 0.05) return null;
                                            return `${name} (${(percent * 100).toFixed(1)}%)`;
                                          }}
                                          labelLine={{ stroke: '#666', strokeWidth: 1 }}
                                        >
                                          {results.map((entry, index) => (
                                            <Cell 
                                              key={`cell-${index}`} 
                                              fill={COLORS[index % COLORS.length]}
                                              className="hover:opacity-80 transition-opacity"
                                              strokeWidth={1}
                                              stroke="white"
                                            />
                                          ))}
                                        </Pie>
                                        <Tooltip 
                                          contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(229, 231, 235, 0.5)'
                                          }}
                                          formatter={(value, name, props) => {
                                            const percentage = (value / results.reduce((a, b) => a + b.value, 0) * 100).toFixed(1);
                                            return [
                                              <span className="font-medium">{value} votes ({percentage}%)</span>,
                                              <span className="text-gray-600">{name}</span>
                                            ];
                                          }}
                                        />
                                        <Legend 
                                          verticalAlign="bottom"
                                          height={36}
                                          roundedCorners={true}
                                          iconType="circle"
                                          iconSize={10}
                                          formatter={(value) => (
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                              {value}
                                            </span>
                                          )}
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                                <Users className="w-12 h-12 mb-3 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No winner data available</p>
                              </div>
                            )}
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPosition}
                className="flex items-center gap-1"
              >
                <ChevronUp className="w-3 h-3" />
                Previous
              </Button>
              <div className="text-xs text-gray-600">
                Position {currentPositionIndex + 1} of {positions.filter(p => p.electionId === selectedElection._id).length}
              </div>
              {!isLastPosition && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPosition}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronDown className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add PDF Generator */}
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