import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllElections } from '../../services/electionService';
import { getAllVotes } from '../../services/voteService';
import { getAllCandidates } from '../../services/candidateService';
import { getAllPositions } from '../../services/positionService';
import { getAllUsers } from '../../services/UserService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Download, Trophy, Users, X, Crown,
  ChevronDown, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import PDFGenerator from '../../components/PDFGenerator';

// ─── Chart colors ─────────────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─── Custom donut centre label ────────────────────────────────────────────────
function DonutLabel({ viewBox, total }) {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-0.3em" fontSize="22" fontWeight="700" fill="currentColor">
        {total}
      </tspan>
      <tspan x={cx} dy="1.4em" fontSize="11" fill="#9ca3af">
        total votes
      </tspan>
    </text>
  );
}

// ─── CountdownAnimation ───────────────────────────────────────────────────────
function CountdownAnimation({ onComplete }) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-16 select-none">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">
        Revealing results in
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[96px] font-black leading-none tabular-nums"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {count}
        </motion.div>
      </AnimatePresence>
      {/* Progress dots */}
      <div className="flex gap-2 mt-10">
        {[5, 4, 3, 2, 1].map((n) => (
          <div
            key={n}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: count <= n ? '#6366f1' : '#e5e7eb',
              transform: count === n ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Results content (inside modal, after countdown) ─────────────────────────
function ResultsContent({ results, position, election }) {
  const [hovered, setHovered] = useState(null);
  const winner = results[0];
  const total = results.reduce((a, b) => a + b.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* ── Winner banner ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl mb-4 p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.18)',
        }}
      >
        {/* Soft glow blob */}
        <div
          className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.15)' }}
        />

        <div className="relative flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={winner.profile}
              alt={winner.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-md"
              style={{ border: '2px solid rgba(99,102,241,0.3)' }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 18 }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
            >
              <Crown className="w-3 h-3 text-white" />
            </motion.div>
          </div>

          {/* Name + stats */}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500 dark:text-indigo-400">
              Winner
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate leading-tight">
              {winner.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {winner.value} vote{winner.value !== 1 ? 's' : ''}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span
                className="text-xs font-semibold"
                style={{ color: '#6366f1' }}
              >
                {total > 0 ? ((winner.value / total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* Big percentage */}
          <div
            className="text-2xl sm:text-3xl font-black tabular-nums flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {total > 0 ? ((winner.value / total) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </motion.div>

      {/* ── Chart + Leaderboard ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">

        {/* Donut chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="flex-shrink-0 self-center"
          style={{ width: 168, height: 168 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={results}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {results.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={hovered === null || hovered === index ? 1 : 0.35}
                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(17,24,39,0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
                  color: '#f9fafb',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#f9fafb', fontWeight: 600 }}
                formatter={(value, name) => {
                  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                  return [`${value} votes · ${pct}%`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Candidate leaderboard */}
        <div className="flex-1 flex flex-col gap-1.5 justify-center">
          {results.map((candidate, index) => {
            const pct = total > 0 ? (candidate.value / total) * 100 : 0;
            const isWinner = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.07, duration: 0.35 }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                className="group relative rounded-xl px-3 py-2 cursor-default transition-all duration-200"
                style={{
                  background: hovered === index
                    ? `${COLORS[index % COLORS.length]}14`
                    : 'transparent',
                  border: `1px solid ${hovered === index
                    ? `${COLORS[index % COLORS.length]}30`
                    : 'transparent'}`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  {/* Rank dot */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: COLORS[index % COLORS.length] }}
                  >
                    {isWinner ? <Crown className="w-2.5 h-2.5" /> : index + 1}
                  </div>

                  {/* Avatar */}
                  <img
                    src={candidate.profile}
                    alt={candidate.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    style={{ border: `1.5px solid ${COLORS[index % COLORS.length]}40` }}
                  />

                  {/* Name */}
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate flex-1">
                    {candidate.name}
                  </span>

                  {/* Votes + pct */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold tabular-nums" style={{ color: COLORS[index % COLORS.length] }}>
                      {pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1.5">
                      ({candidate.value})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.35 + index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function ElectionStats() {
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const pdfGeneratorRef = useRef(null);

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

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 2200;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 50, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 50, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const getPositionResults = useCallback(
    (positionId) => {
      const positionCandidates = candidates.filter((c) => c.positionId === positionId);
      const positionVotes = votes.filter((v) => v.positionId === positionId);
      const total = positionVotes.length;

      return positionCandidates
        .map((candidate) => {
          const count = positionVotes.filter((v) => v.candidateId === candidate._id).length;
          return {
            name: `${candidate.firstName} ${candidate.lastName}`,
            value: count,
            percentage: total > 0 ? (count / total) * 100 : 0,
            profile: candidate.profilePic || 'https://via.placeholder.com/100',
          };
        })
        .sort((a, b) => b.value - a.value);
    },
    [candidates, votes]
  );

  const getElectionVoterCount = useCallback(
    (election) => {
      const electionPositions = positions.filter((p) => p.electionId === election._id);
      const allElectionVotes = votes.filter((v) => v.electionId === election._id);

      const studentVotesMap = new Map();
      allElectionVotes.forEach((vote) => {
        if (!studentVotesMap.has(vote.studentId))
          studentVotesMap.set(vote.studentId, new Set());
        studentVotesMap.get(vote.studentId).add(vote.positionId);
      });

      const electionVoters = new Set();
      for (const student of students) {
        const voted = studentVotesMap.get(student._id);
        if (!voted) continue;
        const eligible = electionPositions.filter((pos) => {
          const isJunior = pos.title.toLowerCase().includes('junior minister');
          return (student.level === 'lower' && isJunior) || (student.level === 'upper' && !isJunior);
        });
        if (eligible.every((pos) => voted.has(pos._id))) electionVoters.add(student._id);
      }
      return electionVoters.size;
    },
    [positions, votes, students]
  );

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
    if (pdfGeneratorRef.current) pdfGeneratorRef.current.generate(election);
  };

  const statusConfig = {
    ongoing: {
      wrapper: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      dot: 'bg-green-500',
    },
    completed: {
      wrapper: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      dot: 'bg-blue-500',
    },
    upcoming: {
      wrapper: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      dot: 'bg-yellow-500',
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading elections…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedElection ? (
        <>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Election Statistics</h1>
            <p className="text-muted-foreground">View and analyze election results and statistics</p>
          </div>

          {elections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Trophy className="w-14 h-14 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-base font-medium text-gray-400">No elections found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => {
                const electionPositions = positions.filter((p) => p.electionId === election._id);
                const electionCandidates = candidates.filter((c) => c.electionId === election._id);
                const voterCount = getElectionVoterCount(election);
                const status = election.status || 'upcoming';
                const sc = statusConfig[status] || statusConfig.upcoming;

                return (
                  <Card key={election._id} className="hover:shadow-lg transition-shadow overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 bg-gray-50/50 dark:bg-gray-800/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold">{election.title}</CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(election.startDate), 'MMM d')} – {format(new Date(election.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${sc.wrapper}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
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
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{voterCount}</p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">Voters</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button onClick={() => handleElectionSelect(election)} className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm">
                          <Trophy className="w-4 h-4 mr-2" /> View Results
                        </Button>
                        <Button variant="outline" onClick={() => handleDownloadResults(election)} className="w-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Download className="w-4 h-4 mr-2" /> Download Report
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleBackToElections} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group" aria-label="Back">
                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{selectedElection.title}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">Results</span>
                </div>
                <p className="text-muted-foreground mt-1">Select a position to view the winner and vote distribution</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => handleDownloadResults(selectedElection)} className="hidden md:flex">
              <Download className="w-4 h-4 mr-2" /> Export Full Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {positions.filter((p) => p.electionId === selectedElection._id).map((position) => {
              const positionCandidates = candidates.filter(
                (c) => c.positionId === position._id && c.electionId === selectedElection._id
              );
              return (
                <div
                  key={position._id}
                  onClick={() => handlePositionSelect(position)}
                  className="group relative bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500 pointer-events-none">
                    <Trophy className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{position.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            <Users className="w-3 h-3 mr-1" />
                            {positionCandidates.length} Contestant{positionCandidates.length !== 1 ? 's' : ''}
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
                          <img src={c.profilePic || 'https://via.placeholder.com/40'} alt={`${c.firstName} ${c.lastName}`} className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-700 shadow-sm flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{c.firstName} {c.lastName}</span>
                        </div>
                      ))}
                      {positionCandidates.length > 4 && (
                        <div className="text-xs font-medium text-gray-400 pl-11">+{positionCandidates.length - 4} more</div>
                      )}
                      {positionCandidates.length === 0 && (
                        <div className="text-sm text-gray-400 italic">No contestants yet</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stats Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
              onClick={handleCloseModal}
            />

            {/* Sheet on mobile, centered card on sm+ */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="relative w-full sm:max-w-lg sm:rounded-[28px] overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.05)',
                // Mobile: bottom sheet
                borderRadius: '24px 24px 0 0',
                maxHeight: '92vh',
              }}
            >
              {/* Dark mode overlay */}
              <div
                className="absolute inset-0 pointer-events-none dark:block hidden"
                style={{
                  background: 'rgba(10,10,18,0.82)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                }}
              />

              {/* Drag handle (mobile) */}
              <div className="relative z-10 flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3 sm:pt-5"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
                      {selectedPosition.title}
                    </h2>
                    <p className="text-[11px] text-gray-400 truncate">{selectedElection?.title}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ml-2"
                  style={{ background: 'rgba(0,0,0,0.06)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Body */}
              <div className="relative z-10 overflow-y-auto px-5 py-4 pb-6" style={{ maxHeight: 'calc(92vh - 80px)' }}>
                {showCountdown ? (
                  <CountdownAnimation onComplete={handleCountdownComplete} />
                ) : (() => {
                  const results = getPositionResults(selectedPosition._id);
                  const winner = results[0];
                  if (!winner || winner.value === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                          style={{ background: 'rgba(99,102,241,0.08)' }}
                        >
                          <Users className="w-7 h-7 text-indigo-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No votes recorded yet</p>
                        <p className="text-xs text-gray-400 mt-1">Check back once voting begins</p>
                      </div>
                    );
                  }
                  return (
                    <ResultsContent
                      results={results}
                      position={selectedPosition}
                      election={selectedElection}
                    />
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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