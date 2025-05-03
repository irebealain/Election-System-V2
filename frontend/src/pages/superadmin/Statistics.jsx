import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllElections, getElectionResults } from '../../services/electionService';
import { getAllVotes } from '../../services/voteService';
import { getAllCandidates } from '../../services/candidateService';
import { getAllPositions } from '../../services/positionService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, Trophy, Calendar, Users, CheckCircle2, XCircle, Clock, X, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

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
            Revealing results in {count}...
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [electionsData, positionsData, candidatesData, votesData] = await Promise.all([
        getAllElections(),
        getAllPositions(),
        getAllCandidates(),
        getAllVotes()
      ]);

      if (!electionsData || !positionsData || !candidatesData || !votesData) {
        throw new Error('Failed to fetch required data');
      }

      setElections(electionsData);
      setPositions(positionsData);
      setCandidates(candidatesData);
      setVotes(votesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load election statistics. Please try again later.');
      toast.error('Failed to load election statistics');
    } finally {
      setLoading(false);
    }
  };

  const getPositionResults = (positionId) => {
    if (!positionId || !candidates.length || !votes.length) {
      return [];
    }

    const positionCandidates = candidates.filter(c => c.positionId === positionId);
    if (!positionCandidates.length) {
      return [];
    }

    const positionVotes = votes.filter(v => v.positionId === positionId);
    const totalVotes = positionVotes.length;

    return positionCandidates.map(candidate => {
      const voteCount = positionVotes.filter(v => v.candidateId === candidate._id).length;
      return {
        name: `${candidate.firstName} ${candidate.lastName}`,
        value: voteCount,
        percentage: totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
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
      const results = await getElectionResults(election._id);
      
      // Format data for Excel
      const excelData = positions.map(position => {
        const positionCandidates = candidates.filter(c => c.positionId === position._id);
        const positionVotes = votes.filter(v => v.positionId === position._id);
        
        return {
          Position: position.title,
          Candidates: positionCandidates.map(candidate => {
            const voteCount = positionVotes.filter(v => v.candidateId === candidate._id).length;
            return {
              Name: `${candidate.firstName} ${candidate.lastName}`,
              Votes: voteCount,
              Percentage: `${((voteCount / positionVotes.length) * 100).toFixed(2)}%`
            };
          })
        };
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Results');

      // Save file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `election_results_${election.name}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast.success('Results downloaded successfully');
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
        {elections.map((election) => (
          <Card key={election._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{election.title}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  election.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                  election.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {election.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(election.startDate), 'MMM d, yyyy')} - {format(new Date(election.endDate), 'MMM d, yyyy')}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleElectionSelect(election)}
                  >
                    View Statistics
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDownloadResults(election)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Modal */}
      {isModalOpen && selectedElection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                        <div className="w-full space-y-4">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold mb-2 text-primary">
                              {position?.title || 'Unknown Position'}
                            </h3>
                            <div className="w-16 h-0.5 bg-primary mx-auto rounded-full"></div>
                          </div>

                          {winner ? (
                            <div className="space-y-4">
                              <div className="relative">
                                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                  <Crown className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-primary/10 p-4 rounded-lg text-center">
                                  <p className="text-2xl font-bold mb-1">{winner.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {winner.value} votes ({winner.percentage.toFixed(1)}%)
                                  </p>
                                </div>
                              </div>

                              <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={results}
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={60}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label={({ name, percentage }) => {
                                        if (percentage < 5) return null;
                                        return `${name}: ${percentage.toFixed(1)}%`;
                                      }}
                                      labelLine={({ viewBox, x, y, cx, cy }) => {
                                        const midAngle = Math.atan2(y - cy, x - cx);
                                        const radius = 60;
                                        const labelRadius = radius * 1.2;
                                        const labelX = cx + (labelRadius * Math.cos(midAngle));
                                        const labelY = cy + (labelRadius * Math.sin(midAngle));
                                        
                                        return (
                                          <path
                                            d={`M${x},${y} L${labelX},${labelY}`}
                                            stroke="#666"
                                            fill="none"
                                          />
                                        );
                                      }}
                                    >
                                      {results.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                        backdropFilter: 'blur(8px)'
                                      }}
                                      formatter={(value, name, props) => {
                                        const percentage = (value / results.reduce((a, b) => a + b.value, 0) * 100).toFixed(1);
                                        return [`${value} votes (${percentage}%)`, name];
                                      }}
                                    />
                                    <Legend 
                                      verticalAlign="bottom" 
                                      height={36}
                                      formatter={(value) => <span className="text-xs">{value}</span>}
                                      layout="horizontal"
                                      align="center"
                                      wrapperStyle={{
                                        paddingTop: '10px'
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                              <Users className="w-8 h-8 mb-2" />
                              <p className="text-sm">No winner data available</p>
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
    </div>
  );
}

export default ElectionStats; 