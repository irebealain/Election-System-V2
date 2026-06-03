import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowLeft, Users, Trophy, Crown, X } from 'lucide-react';
import { getAllVotes } from '../../services/voteService';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

function CountdownAnimation({ onComplete }) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 500);
    }
  }, [count, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      className="flex flex-col items-center justify-center h-full"
    >
      <motion.div
        key={count}
        initial={{ opacity: 0, y: -20, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 1.5 }}
        transition={{ duration: 0.4 }}
        className="text-8xl font-black text-primary drop-shadow-xl"
      >
        {count}
      </motion.div>
      <p className="mt-8 text-xl text-gray-500 font-medium tracking-widest uppercase">Calculating Winner</p>
    </motion.div>
  );
}

function ElectionStatsView({ election, positions, candidates, onBack }) {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        const votesData = await getAllVotes();
        // Filter votes for the current election
        setVotes(votesData.filter(v => v.electionId === election._id));
      } catch (error) {
        console.error("Failed to fetch votes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVotes();
  }, [election._id]);

  const electionPositions = positions.filter(p => p.electionId === election._id);

  const getPositionStats = (positionId) => {
    const positionCandidates = candidates.filter(c => c.positionId === positionId && c.electionId === election._id);
    const positionVotes = votes.filter(v => v.positionId === positionId);
    const totalVotes = positionVotes.length;

    const results = positionCandidates.map(candidate => {
      const candidateVotes = positionVotes.filter(v => v.candidateId === candidate._id).length;
      return {
        id: candidate._id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        profilePic: candidate.profilePic,
        votes: candidateVotes,
        percentage: totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0
      };
    }).sort((a, b) => b.votes - a.votes);

    return { totalVotes, results };
  };

  const handlePositionClick = (position) => {
    setSelectedPosition(position);
    setShowCountdown(true);
    setIsModalOpen(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    triggerConfetti();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPosition(null);
      setShowCountdown(false);
    }, 300);
  };

  const triggerConfetti = () => {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
    
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const particleCount = 50;
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    setTimeout(() => clearInterval(interval), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{election.title}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Live Statistics
            </p>
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          {votes.length} Total Votes Cast
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {electionPositions.map((position) => {
            const { results, totalVotes } = getPositionStats(position._id);
            return (
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card 
                  className="cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50"
                  onClick={() => handlePositionClick(position)}
                >
                  <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">{position.title}</CardTitle>
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                        {results.length} Candidates
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {results.slice(0, 3).map((candidate, idx) => (
                        <div key={candidate.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-50 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {candidate.profilePic ? (
                                <img src={candidate.profilePic} alt={candidate.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold">
                                  {candidate.name.charAt(0)}
                                </div>
                              )}
                              {idx === 0 && totalVotes > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                                  <Crown className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{candidate.name}</span>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-bold text-gray-900 dark:text-white">{candidate.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                      {results.length > 3 && (
                        <div className="text-center text-sm text-muted-foreground pt-2">
                          + {results.length - 3} more candidates
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stats Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 h-[500px]">
                {showCountdown ? (
                  <CountdownAnimation onComplete={handleCountdownComplete} />
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedPosition.title} Results</h2>
                      <p className="text-muted-foreground">{getPositionStats(selectedPosition._id).totalVotes} Total Votes</p>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row gap-8 items-center">
                      {/* Winner Showcase */}
                      <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                         {(() => {
                           const stats = getPositionStats(selectedPosition._id);
                           const winner = stats.results[0];
                           if (!winner || stats.totalVotes === 0) return <div className="text-gray-400">No votes yet</div>;
                           
                           return (
                             <motion.div 
                               initial={{ scale: 0.5, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                               className="flex flex-col items-center"
                             >
                               <div className="relative mb-4">
                                 <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-yellow-200 to-yellow-500 shadow-xl">
                                   {winner.profilePic ? (
                                      <img src={winner.profilePic} alt={winner.name} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900" />
                                   ) : (
                                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-yellow-500">
                                        {winner.name.charAt(0)}
                                      </div>
                                   )}
                                 </div>
                                 <motion.div 
                                   initial={{ y: -20, opacity: 0 }}
                                   animate={{ y: 0, opacity: 1 }}
                                   transition={{ delay: 0.5, type: "spring" }}
                                   className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-sm shadow-md flex items-center gap-1"
                                 >
                                   <Trophy className="w-4 h-4" /> WINNER
                                 </motion.div>
                               </div>
                               <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mt-2">{winner.name}</h3>
                               <p className="text-primary font-black text-3xl mt-1">{winner.percentage.toFixed(1)}%</p>
                               <p className="text-sm text-muted-foreground font-medium">{winner.votes} votes</p>
                             </motion.div>
                           );
                         })()}
                      </div>

                      {/* Pie Chart */}
                      <div className="w-full md:w-2/3 h-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPositionStats(selectedPosition._id).results}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="votes"
                              stroke="none"
                            >
                              {getPositionStats(selectedPosition._id).results.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                              formatter={(value, name, props) => [`${value} Votes (${props.payload.percentage.toFixed(1)}%)`, name]}
                            />
                            <Legend 
                               verticalAlign="middle" 
                               align="right"
                               layout="vertical"
                               iconType="circle"
                               formatter={(value, entry) => <span className="text-gray-700 dark:text-gray-300 font-medium">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ElectionStatsView;
