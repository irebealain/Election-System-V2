import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllElections } from '../../services/electionService';
import { getAllVotes } from '../../services/voteService';
import { getAllCandidates } from '../../services/candidateService';
import { getAllPositions } from '../../services/positionService';
import { getAllUsers } from '../../services/UserService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  Download, Trophy, Users, X, Crown,
  ChevronDown, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import PDFGenerator from '../../components/PDFGenerator';

// ─── Color palette for charts ────────────────────────────────────────────────
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// ─── CountdownAnimation ───────────────────────────────────────────────────────
function CountdownAnimation({ onComplete }) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(timer); // ✅ return cleanup, not JSX
    } else {
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-20 select-none">
      <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">
        Revealing results in…
      </p>
      <motion.div
        key={count}
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-[120px] font-extrabold leading-none text-primary drop-shadow-md"
      >
        {count}
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function ElectionStats() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const pdfGeneratorRef = useRef(null);

  // ── Fetch all data on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const [electionData, positionData, candidateData, voteData, userData] =
          await Promise.all([
            getAllElections(),
            getAllPositions(),
            getAllCandidates(),
            getAllVotes(),
            getAllUsers(),
          ]);
        setElections(electionData || []);
        setPositions(positionData || []);
        setCandidates(candidateData || []);
        setVotes(voteData || []);
        setStudents(userData || []);
      } catch (err) {
        console.error('Failed to load election data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Fire confetti ────────────────────────────────────────────────────────────
  const fireConfetti = useCallback(() => {
    const end = Date.now() + 2000;
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  // ── Compute vote results for a position ──────────────────────────────────────
  const getPositionResults = useCallback(
    (positionId) => {
      const positionCandidates = candidates.filter(
        (c) => c.positionId === positionId
      );
      const positionVotes = votes.filter((v) => v.positionId === positionId);
      const total = positionVotes.length;

      const results = positionCandidates.map((candidate) => {
        const candidateVotes = positionVotes.filter(
          (v) => v.candidateId === candidate._id
        ).length;
        return {
          name: `${candidate.firstName} ${candidate.lastName}`,
          value: candidateVotes,
          percentage: total > 0 ? (candidateVotes / total) * 100 : 0,
          profile: candidate.profilePic || 'https://via.placeholder.com/100',
        };
      });

      return results.sort((a, b) => b.value - a.value);
    },
    [candidates, votes]
  );

  // ── Compute unique voters for an election ────────────────────────────────────
  const getElectionVoterCount = useCallback(
    (election) => {
      const electionPositions = positions.filter(
        (p) => p.electionId === election._id
      );
      const allElectionVotes = votes.filter(
        (v) => v.electionId === election._id
      );

      const studentVotesMap = new Map();
      allElectionVotes.forEach((vote) => {
        if (!studentVotesMap.has(vote.studentId)) {
          studentVotesMap.set(vote.studentId, new Set());
        }
        studentVotesMap.get(vote.studentId).add(vote.positionId);
      });

      const electionVoters = new Set();
      for (const student of students) {
        const studentVotedPositions = studentVotesMap.get(student._id);
        if (!studentVotedPositions) continue;

        const eligiblePositions = electionPositions.filter((pos) => {
          const isJuniorMinister = pos.title
            .toLowerCase()
            .includes('junior minister');
          return (
            (student.level === 'lower' && isJuniorMinister) ||
            (student.level === 'upper' && !isJuniorMinister)
          );
        });

        const hasVotedAll = eligiblePositions.every((pos) =>
          studentVotedPositions.has(pos._id)
        );
        if (hasVotedAll) electionVoters.add(student._id);
      }

      return electionVoters.size;
    },
    [positions, votes, students]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleElectionSelect = (election) => setSelectedElection(election);

  const handleBackToElections = () => {
    setSelectedElection(null);
    setSelectedPosition(null);
    setShowCountdown(false);
  };

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setShowCountdown(true);
  };

  const handleCloseModal = () => {
    setSelectedPosition(null);
    setShowCountdown(false);
  };

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    fireConfetti();
  }, [fireConfetti]);

  const handleDownloadResults = (election) => {
    if (pdfGeneratorRef.current) {
      pdfGeneratorRef.current.generate(election);
    }
  };

  // ── Status badge helper ───────────────────────────────────────────────────────
  const statusConfig = {
    ongoing: {
      wrapper: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      dot: 'bg-green-500 dark:bg-green-400',
    },
    completed: {
      wrapper: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      dot: 'bg-blue-500 dark:bg-blue-400',
    },
    upcoming: {
      wrapper: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      dot: 'bg-yellow-500 dark:bg-yellow-400',
    },
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading elections…</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {!selectedElection ? (
        /* ── Elections List ─────────────────────────────────────────────────── */
        <>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Election Statistics</h1>
            <p className="text-muted-foreground">
              View and analyze election results and statistics
            </p>
          </div>

          {elections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Trophy className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">No elections found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => {
                const electionPositions = positions.filter(
                  (p) => p.electionId === election._id
                );
                const electionCandidates = candidates.filter(
                  (c) => c.electionId === election._id
                );
                const voterCount = getElectionVoterCount(election);
                const status = election.status || 'upcoming';
                const sc = statusConfig[status] || statusConfig.upcoming;

                return (
                  <Card
                    key={election._id}
                    className="hover:shadow-lg transition-shadow overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800"
                  >
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 bg-gray-50/50 dark:bg-gray-800/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold">
                            {election.title}
                          </CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(election.startDate), 'MMM d')} –{' '}
                            {format(new Date(election.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${sc.wrapper}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-primary/5 rounded-[16px]">
                          <p className="text-xl font-bold text-primary">
                            {electionPositions.length}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">
                            Positions
                          </p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-[16px]">
                          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                            {electionCandidates.length}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">
                            Candidates
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-[16px]">
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {voterCount}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">
                            Voters
                          </p>
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
          )}
        </>
      ) : (
        /* ── Election Details View ───────────────────────────────────────────── */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToElections}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
                aria-label="Back to elections"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {selectedElection.title}
                  </h1>
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
            {positions
              .filter((p) => p.electionId === selectedElection._id)
              .map((position) => {
                const positionCandidates = candidates.filter(
                  (c) =>
                    c.positionId === position._id &&
                    c.electionId === selectedElection._id
                );

                return (
                  <div
                    key={position._id}
                    onClick={() => handlePositionSelect(position)}
                    className="group relative bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Decorative background icon */}
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500 pointer-events-none">
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
                              {positionCandidates.length} Contestant
                              {positionCandidates.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors flex-shrink-0">
                          <ChevronDown className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 -rotate-90 transition-all" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        {positionCandidates.slice(0, 4).map((c) => (
                          <div key={c._id} className="flex items-center gap-3">
                            <img
                              src={c.profilePic || 'https://via.placeholder.com/40'}
                              alt={`${c.firstName} ${c.lastName}`}
                              className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-700 shadow-sm flex-shrink-0"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
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
                          <div className="text-sm text-gray-400 italic">
                            No contestants yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Stats Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              {/* Modal header */}
              <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedPosition.title} Results
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedElection.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div
                className="p-6 overflow-y-auto min-h-[500px] flex items-center justify-center"
                style={{ maxHeight: 'calc(90vh - 88px)' }}
              >
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
                            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                              No votes recorded yet
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                          {/* Winner Spotlight */}
                          <div className="flex flex-col items-center">
                            <div className="relative group">
                              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-primary to-yellow-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 animate-pulse" />
                              <img
                                src={winner.profile}
                                alt={winner.name}
                                className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl z-10"
                              />
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
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
                                With{' '}
                                <span className="text-primary font-bold">
                                  {winner.value}
                                </span>{' '}
                                vote{winner.value !== 1 ? 's' : ''}
                              </p>
                            </motion.div>
                          </div>

                          {/* Vote Distribution Chart */}
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gray-50/50 dark:bg-gray-800/30 rounded-[32px] p-6 sm:p-8"
                          >
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
                              Vote Distribution
                            </h4>

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
                                    {results.map((_, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        style={{
                                          filter:
                                            'drop-shadow(0px 4px 10px rgba(0,0,0,0.1))',
                                          cursor: 'pointer',
                                        }}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: 'rgba(255,255,255,0.95)',
                                      backdropFilter: 'blur(12px)',
                                      borderRadius: '16px',
                                      padding: '12px 20px',
                                      boxShadow:
                                        '0 20px 40px -10px rgba(0,0,0,0.1)',
                                      border: 'none',
                                      color: '#111827',
                                    }}
                                    formatter={(value) => {
                                      const total = results.reduce(
                                        (a, b) => a + b.value,
                                        0
                                      );
                                      const pct = total > 0
                                        ? ((value / total) * 100).toFixed(1)
                                        : '0.0';
                                      return [`${value} votes (${pct}%)`];
                                    }}
                                  />
                                  <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    iconType="circle"
                                    iconSize={10}
                                    formatter={(value, _entry, index) => {
                                      const data = results[index];
                                      const label =
                                        value.length > 15
                                          ? `${value.substring(0, 15)}…`
                                          : value;
                                      return (
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-2">
                                          {label}{' '}
                                          <span className="text-xs text-gray-500 font-normal">
                                            {data?.percentage.toFixed(1)}%
                                          </span>
                                        </span>
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

      {/* PDF Generator (hidden) */}
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