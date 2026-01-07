"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Match, useApp, Ball, Team } from "@/contexts/AppContext";
import { Undo2, ArrowLeftRight, Trophy, ArrowLeft, ClipboardList, X } from "lucide-react";

interface LiveMatchScorerProps {
  match: Match;
}

export default function LiveMatchScorer({ match }: LiveMatchScorerProps) {
  const { updateMatch } = useApp();

  // Derived State
  const isTossDone = !!match.tossWinnerId;
  const isOpenersSelected = !!match.strikerId && !!match.nonStrikerId && !!match.currentBowlerId;

  // --- Toss Handler ---
  const handleToss = (winnerId: string, choice: "Bat" | "Bowl") => {
    let batFirstId = winnerId;
    if (choice === "Bowl") {
        batFirstId = match.team1.id === winnerId ? match.team2.id : match.team1.id;
    }
    updateMatch(match.id, {
        tossWinnerId: winnerId,
        batFirstId: batFirstId,
        currentInnings: 1,
        history: []
    });
  };

  if (!isTossDone) {
    return <TossSection match={match} onTossDecided={handleToss} />;
  }

  if (!isOpenersSelected) {
      return (
          <OpeningSelection 
            match={match} 
            onSelection={(striker, nonStriker, bowler) => {
                updateMatch(match.id, {
                    strikerId: striker,
                    nonStrikerId: nonStriker,
                    currentBowlerId: bowler
                });
            }}
          />
      );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <MatchHeader match={match} />
      <ScoringBoard match={match} />
    </div>
  );
}

// --- Components ---

function MatchHeader({ match }: { match: Match }) {
    const router = useRouter();
    return (
        <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-20 flex justify-between items-center">
           <div className="flex items-center gap-3">
               <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-white/10">
                   <ArrowLeft className="w-6 h-6" />
               </button>
               <div>
                   <h2 className="font-bold text-lg">{match.team1.name} vs {match.team2.name}</h2>
                   <div className="text-xs opacity-80 flex gap-2">
                       <span>{match.type}</span>
                       <span>•</span>
                       <span>{match.currentInnings === 1 ? "1st Innings" : "2nd Innings"}</span>
                   </div>
               </div>
           </div>
           <div className="flex gap-3">
               <div className="px-2 py-1 bg-white/20 rounded text-xs font-mono">
                   {match.code}
               </div>
           </div>
        </header>
    )
}

function TossSection({ match, onTossDecided }: { match: Match, onTossDecided: (winnerId: string, choice: "Bat" | "Bowl") => void }) {
    const [winner, setWinner] = useState<string>("");
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in">
                <h2 className="text-2xl font-bold text-center mb-6 text-secondary">Who won the toss?</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button 
                        onClick={() => setWinner(match.team1.id)}
                        className={`p-4 rounded-xl border-2 font-bold transition-all ${winner === match.team1.id ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 hover:border-gray-300 text-gray-900'}`}
                    >
                        {match.team1.name || "Team 1"}
                    </button>
                    <button 
                        onClick={() => setWinner(match.team2.id)}
                        className={`p-4 rounded-xl border-2 font-bold transition-all ${winner === match.team2.id ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 hover:border-gray-300 text-gray-900'}`}
                    >
                        {match.team2.name || "Team 2"}
                    </button>
                </div>

                {winner && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                        <p className="text-center text-gray-600">What did they choose?</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => onTossDecided(winner, "Bat")}
                                className="bg-secondary text-white py-3 rounded-lg font-bold hover:bg-secondary/90"
                            >
                                Bat
                            </button>
                            <button 
                                onClick={() => onTossDecided(winner, "Bowl")}
                                className="bg-secondary text-white py-3 rounded-lg font-bold hover:bg-secondary/90"
                            >
                                Bowl
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function OpeningSelection({ match, onSelection }: { match: Match, onSelection: (s: string, ns: string, b: string) => void }) {
    // Current Innings Logic
    const batFirstTeam = match.batFirstId === match.team1.id ? match.team1 : match.team2;
    const bowlFirstTeam = match.batFirstId === match.team1.id ? match.team2 : match.team1;

    const batTeam = match.currentInnings === 2 ? bowlFirstTeam : batFirstTeam;
    const bowlTeam = match.currentInnings === 2 ? batFirstTeam : bowlFirstTeam;

    const [striker, setStriker] = useState("");
    const [nonStriker, setNonStriker] = useState("");
    const [bowler, setBowler] = useState("");
    
    // Filter out striker from non-striker list and vice versa
    // Also ensuring for 2nd innings we reset status conceptually (though here we just list all players)
    // Ideally we should filter out players who might have batted in previous innings? No, players can bat in both (if it's a test match).
    // For limited overs, different teams bat. So filtering by team handles it.
    
    const availableStrikers = batTeam.players.filter(p => p.id !== nonStriker);
    const availableNonStrikers = batTeam.players.filter(p => p.id !== striker);

    const canStart = striker && nonStriker && bowler && striker !== nonStriker;
    
    // Target calculation for 2nd innings
    let target = null;
    if (match.currentInnings === 2) {
         const innings1Balls = match.history.filter(b => b.inning === 1);
         const runs1 = innings1Balls.reduce((s, b) => s + b.runs + b.extras, 0);
         target = runs1 + 1;
    }

    return (
         <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="p-6 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-secondary">
                    {match.currentInnings === 2 ? "Start Second Innings" : "Start First Innings"}
                </h2>
                
                {target && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 text-center">
                        <p className="text-sm text-gray-600">Target to win</p>
                        <p className="text-3xl font-black text-orange-600">{target}</p>
                        <p className="text-sm text-gray-500 mt-1">{batTeam.name} needs {target} runs to win</p>
                    </div>
                )}
                
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-primary">Select Opening Batsmen ({batTeam.name})</h3>
                        <label className="block text-sm text-gray-500">Striker</label>
                        <select 
                            className="w-full p-3 border rounded-xl bg-gray-50 text-black mb-2" 
                            value={striker}
                            onChange={(e) => setStriker(e.target.value)}
                        >
                            <option value="">Select Striker</option>
                            {availableStrikers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        
                        <label className="block text-sm text-gray-500">Non-Striker</label>
                        <select 
                            className="w-full p-3 border rounded-xl bg-gray-50 text-black"
                            value={nonStriker}
                            onChange={(e) => setNonStriker(e.target.value)}
                        >
                            <option value="">Select Non-Striker</option>
                            {availableNonStrikers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-accent">Select Opening Bowler ({bowlTeam.name})</h3>
                        <select 
                            className="w-full p-3 border rounded-xl bg-gray-50 text-black"
                            value={bowler}
                            onChange={(e) => setBowler(e.target.value)}
                        >
                            <option value="">Select Bowler</option>
                            {bowlTeam.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <button 
                        disabled={!canStart}
                        onClick={() => canStart && onSelection(striker, nonStriker, bowler)}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-lg"
                    >
                        Start {match.currentInnings === 2 ? "2nd" : "1st"} Innings
                    </button>
                </div>
            </div>
        </div>
    )
}

function ScoringBoard({ match }: { match: Match }) {
    const { updateMatch, getSeriesById, updateSeries } = useApp();
    const router = useRouter();
    const [showWicketModal, setShowWicketModal] = useState(false); // This is actually "New Batsman Modal"
    const [showDismissalModal, setShowDismissalModal] = useState(false);
    const [showNextBowlerModal, setShowNextBowlerModal] = useState(false);
    const [showNoBallModal, setShowNoBallModal] = useState(false);
    const [showWideModal, setShowWideModal] = useState(false);
    const [showScorecardModal, setShowScorecardModal] = useState(false);
    
    // --- Derived State from History ---
    const history = match.history || [];
    const lastBall = history[0];

    // Free Hit Logic
    // If previous ball was No Ball, current is Free Hit.
    // If previous ball was Wide AND Free Hit, current is still Free Hit.
    const isFreeHit = React.useMemo(() => {
        if (!lastBall) return false;
        if (lastBall.isNoBall) return true;
        if (lastBall.isFreeHit && lastBall.isWide) return true;
        return false;
    }, [lastBall]);
    
    // Innings Partition
    const innings1Balls = history.filter(b => b.inning === 1);
    const innings2Balls = history.filter(b => b.inning === 2);
    
    // Current Innings Data
    const currentInningsBalls = match.currentInnings === 1 ? innings1Balls : innings2Balls;
    const currentValidBalls = currentInningsBalls.filter(b => !b.isWide && !b.isNoBall);
    
    const currentOver = Math.floor(currentValidBalls.length / 6);
    const ballsInOver = currentValidBalls.length % 6;
    
    const currentRuns = currentInningsBalls.reduce((sum, b) => sum + b.runs + b.extras, 0);
    const currentWickets = currentInningsBalls.filter(b => b.isWicket).length;

    const totalWides = currentInningsBalls.filter(b => b.isWide).length;
    const totalNoBalls = currentInningsBalls.filter(b => b.isNoBall).length;
    const totalExtras = currentInningsBalls.reduce((sum, b) => sum + b.extras, 0);
    
    // Target Logic
    const target = match.currentInnings === 2 
        ? innings1Balls.reduce((sum, b) => sum + b.runs + b.extras, 0) + 1 
        : null;

    // Teams
    const batTeamId = match.currentInnings === 1 ? match.batFirstId : (match.team1.id === match.batFirstId ? match.team2.id : match.team1.id);
    const batTeam = batTeamId === match.team1.id ? match.team1 : match.team2;
    const bowlTeam = batTeamId === match.team1.id ? match.team2 : match.team1;

    // --- End of Match / Innings Logic ---
    const maxOvers = match.oversPerInnings;
    const effectiveTeamSize = match.teamSize || batTeam.players.length || 11;
    const maxPossWickets = effectiveTeamSize - 1;
    
    const isAllOut = currentWickets >= maxPossWickets; 
    const isOversDone = currentOver >= maxOvers;
    const isTargetChased = target !== null && currentRuns >= target;

    const isInningsOver = isAllOut || isOversDone || isTargetChased;

    const handleInningsEnd = () => {
        if (match.currentInnings === 1) {
            updateMatch(match.id, {
                currentInnings: 2,
                strikerId: undefined, // Reset for next innings setup
                nonStrikerId: undefined,
                currentBowlerId: undefined
            });
        }
    };

    const handleMatchFinish = () => {
        // Determine Winner
        const score1 = innings1Balls.reduce((s, b) => s + b.runs + b.extras, 0);
        const score2 = innings2Balls.reduce((s, b) => s + b.runs + b.extras, 0);
        
        const batFirstTeam = match.batFirstId === match.team1.id ? match.team1 : match.team2;
        const batSecondTeam = match.batFirstId === match.team1.id ? match.team2 : match.team1;
        
        let winnerId: string | undefined = undefined;
        let resultText = "Match Drawn";
        
        if (score1 > score2) {
            winnerId = batFirstTeam.id;
            const runsDiff = score1 - score2;
            resultText = `${batFirstTeam.name} Won by ${runsDiff} ${runsDiff === 1 ? 'run' : 'runs'}`;
        } else if (score2 > score1) {
            winnerId = batSecondTeam.id;
            const effectiveTeamSize = match.teamSize || batSecondTeam.players.length || 11;
            const maxWickets = effectiveTeamSize - 1;
            const wicketsRemaining = Math.max(0, maxWickets - currentWickets);
            resultText = `${batSecondTeam.name} Won by ${wicketsRemaining} ${wicketsRemaining === 1 ? 'wicket' : 'wickets'}`;
        }
        
        updateMatch(match.id, { status: "Completed", winner: winnerId, result: resultText });

        // Series Update Logic
        if (match.seriesId && match.type === "Series") {
            const series = getSeriesById(match.seriesId);
            if (series) {
                const isTeam1Winner = winnerId === series.team1.id;
                const isTeam2Winner = winnerId === series.team2.id;
                
                // Cumulative Stats Calculation
                // const newStats = calculateStats(series.cumulativeStats, match); // Placeholder for complexity

                updateSeries(series.id, {
                    scoreTeam1: series.scoreTeam1 + (isTeam1Winner ? 1 : 0),
                    scoreTeam2: series.scoreTeam2 + (isTeam2Winner ? 1 : 0),
                    draws: series.draws + (!winnerId ? 1 : 0),
                    // cumulativeStats: newStats
                });
                router.push(`/series/${match.seriesId}`);
                return;
            }
        }
        
        // Tournament Update Logic
        if (match.tournamentId && match.type === "Tournament") {
            // Stats are calculated dynamically in Dashboard for MVP, 
            // but we should route back to tournament dashboard
            router.push(`/tournament/${match.tournamentId}`);
            return;
        }

        router.push('/');
    };

    if (isInningsOver) {
        if (match.currentInnings === 1) {
             return (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 p-8 space-y-6">
                    <h2 className="text-3xl font-bold text-secondary">Innings Break</h2>
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center w-full max-w-sm">
                        <p className="text-gray-500 mb-2">{batTeam.name} scored</p>
                        <p className="text-4xl font-black text-primary mb-2">{currentRuns}/{currentWickets}</p>
                        <p className="text-sm text-gray-400">Overs: {currentOver}.{ballsInOver}</p>
                        <div className="h-px bg-gray-100 my-4" />
                        <p className="font-bold text-secondary">{bowlTeam.name} needs {currentRuns + 1} runs to win</p>
                    </div>
                    <button onClick={handleInningsEnd} className="bg-green-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                        Start 2nd Innings
                    </button>
                </div>
            )
        } else {
             const score1 = innings1Balls.reduce((s, b) => s + b.runs + b.extras, 0);
             let resultMsg = "Match Drawn";
             
             // Check who won
             if (currentRuns > score1) {
                 // Innings 2 Team Won (Chasing)
                 const effectiveTeamSize = match.teamSize || batTeam.players.length || 11;
                 const maxWickets = effectiveTeamSize - 1;
                 let wicketsRemaining = maxWickets - currentWickets;
                 if (wicketsRemaining < 0) wicketsRemaining = 0;

                 resultMsg = `${batTeam.name} Won by ${wicketsRemaining} ${wicketsRemaining === 1 ? 'wicket' : 'wickets'}`;
             } else if (score1 > currentRuns) {
                 // Innings 1 Team Won (Defending)
                 const runsDiff = score1 - currentRuns;
                 resultMsg = `${bowlTeam.name} Won by ${runsDiff} ${runsDiff === 1 ? 'run' : 'runs'}`;
             }

             return (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 p-8 space-y-6">
                    <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
                    <h2 className="text-3xl font-bold text-secondary">Match Finished</h2>
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center w-full max-w-sm">
                        <p className="text-2xl font-black text-primary mb-4">{resultMsg}</p>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{batTeam.name}: {currentRuns}/{currentWickets}</span>
                            <span>{bowlTeam.name}: {score1}/{innings1Balls.filter(b => b.isWicket).length}</span>
                        </div>
                    </div>
                    <button onClick={handleMatchFinish} className="bg-green-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                        {match.seriesId ? "Continue Series" : match.tournamentId ? "Tournament Standings" : "Finish Match"}
                    </button>
                </div>
            )
        }
    }

    // --- Actions ---
    const handleScore = (runs: number, isWide = false, isNoBall = false, isWicket = false, dismissalInfo?: { type: string, fielderId?: string, text: string }) => {
        // Calculate Extras and Batsman Runs
        let extras = 0;
        let ballRuns = runs;

        if (isWide) {
            extras = 1 + runs; // 1 Wide + Extra runs (byes/overthrows)
            ballRuns = 0; // Batsman gets 0 runs on a Wide
        } else if (isNoBall) {
            extras = 1; // 1 No Ball penalty
            ballRuns = runs; // Batsman gets credit for runs scored
        } else {
            extras = 0;
            ballRuns = runs;
        }

        const newBall: Ball = {
            id: Math.random().toString(),
            inning: match.currentInnings,
            over: currentOver,
            ballInOver: ballsInOver + 1,
            bowlerId: match.currentBowlerId!,
            batsmanId: match.strikerId!,
            runs: ballRuns,
            isWide,
            isNoBall,
            isWicket,
            dismissalType: dismissalInfo?.type as Ball['dismissalType'],
            fielderId: dismissalInfo?.fielderId,
            dismissalText: dismissalInfo?.text,
            dismissedPlayerId: isWicket ? match.strikerId : undefined,
            isFreeHit: isFreeHit, // Record if this ball was a Free Hit
            extras: extras,
            timestamp: Date.now()
        };
        
        let nextStriker = match.strikerId;
        let nextNonStriker = match.nonStrikerId;

        // Auto Rotation Logic
        let shouldRotate = false;
        
        if (!isWicket) {
             if (isWide) {
                 // Rotate if extra runs are odd (e.g. 1 bye run, 3 bye runs)
                 // runs argument here represents 'extraRuns' passed from modal
                 if (runs % 2 !== 0) shouldRotate = true;
             } else {
                 // Check total runs scored (NoBall runs or Normal runs)
                 // runs argument here represents runs scored by batter
                 if (runs % 2 !== 0) shouldRotate = true;
             }
        }

        if (shouldRotate) {
             [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
        }
        
        const isLegalDelivery = !isWide && !isNoBall;
        const isOverComplete = isLegalDelivery && ballsInOver === 5;

        if (isOverComplete) {
             [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
             // Trigger Over completion modal unless innings ended
             // We can't check isInningsOver here accurately because state isn't updated, 
             // but we will gate the modal rendering.
             if(!isWicket && !isAllOut && currentOver < maxOvers - 1) { // Basic checks
                 setShowNextBowlerModal(true);
             }
        }

        updateMatch(match.id, {
            history: [newBall, ...history],
            strikerId: nextStriker,
            nonStrikerId: nextNonStriker,
        });

        if (isWicket) {
             setShowWicketModal(true);
        }
        
        // Always show next bowler modal if over is complete, 
        // regardless of wicket (wicket modal takes priority in UI)
        if (isOverComplete && !isAllOut && !isInningsOver) {
             setShowNextBowlerModal(true);
        }
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const [, ...rest] = history;
        
        // Reset modals when undoing to prevent stuck state
        setShowWicketModal(false);
        setShowDismissalModal(false);
        setShowNextBowlerModal(false);
        setShowNoBallModal(false);
        setShowWideModal(false);

        updateMatch(match.id, { history: rest });
    };

    const handleSwapEnds = () => {
        updateMatch(match.id, {
            strikerId: match.nonStrikerId,
            nonStrikerId: match.strikerId
        });
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-100 pb-20 overflow-y-auto">
            {/* Score Summary Card */}
            <div className="p-4 bg-white m-4 rounded-2xl shadow-sm border border-slate-200">
                 <div className="flex justify-between items-end mb-2">
                     <div>
                         <h1 className="text-4xl font-bold text-secondary tracking-tight">
                             {currentRuns}/{currentWickets}
                         </h1>
                         <p className="text-sm text-gray-500 font-medium">Over {currentOver}.{ballsInOver} ({match.oversPerInnings})</p>
                         
                         {/* Chase Stats */}
                         {target && (
                             <div className="mt-2 text-sm bg-orange-50 text-orange-800 p-2 rounded-lg border border-orange-100 inline-block">
                                 <span className="font-bold block">Target: {target}</span>
                                 <span>Need <span className="font-bold">{target - currentRuns}</span> off <span className="font-bold">{(maxOvers * 6) - (currentOver * 6 + ballsInOver)}</span> balls</span>
                                 <div className="text-xs opacity-70 mt-1">RRR: {((target - currentRuns) / Math.max(0.1, ((maxOvers * 6) - (currentOver * 6 + ballsInOver)) / 6)).toFixed(2)}</div>
                             </div>
                         )}
                     </div>
                     <div className="text-right flex flex-col items-end">
                         <button onClick={() => setShowScorecardModal(true)} className="p-2 mb-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="View Scorecard">
                             <ClipboardList className="w-5 h-5 text-secondary" />
                         </button>
                         <div className="text-sm text-gray-400 mb-1">CRR: {(currentRuns / Math.max(0.1, (currentOver + ballsInOver/6))).toFixed(2)}</div>
                         <div className="text-xs font-medium text-gray-500 mb-1">
                            Extras: {totalExtras} (w: {totalWides}, nb: {totalNoBalls})
                         </div>
                         <div className="font-bold text-primary">{batTeam.name} Batting</div>
                     </div>
                 </div>
                 
                 {isFreeHit && (
                     <div className="bg-yellow-400 text-black font-black text-center text-sm py-1 rounded shadow-sm animate-pulse mb-3">
                         FREE HIT DELIVERY
                     </div>
                 )}

                 {/* Current Batsmen */}
                 <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                     <div className="flex items-center gap-2">
                         <span className="font-bold text-secondary flex items-center gap-1">
                             {batTeam.players.find(p => p.id === match.strikerId)?.name}
                             <span className="text-primary">*</span>
                         </span>
                         <span className="text-gray-400">vs</span>
                         <span className="text-gray-600">{bowlTeam.players.find(p => p.id === match.currentBowlerId)?.name}</span>
                     </div>
                     <div className="text-gray-500">
                         {batTeam.players.find(p => p.id === match.nonStrikerId)?.name}
                     </div>
                 </div>
            </div>

            {/* Recent Balls Timeline */}
             <div className="px-4 mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {history.slice(0, 8).map((ball) => {
                        let text = `${ball.runs}`;
                        let color = "bg-gray-200 text-gray-700";

                        if (ball.isWicket) {
                            text = "W";
                            color = "bg-red-500 text-white";
                        } else if (ball.isWide) {
                            const extraRuns = ball.extras - 1;
                            text = extraRuns > 0 ? `Wd+${extraRuns}` : "Wd";
                            color = "bg-orange-200 text-orange-800";
                        } else if (ball.isNoBall) {
                            text = ball.runs > 0 ? `Nb+${ball.runs}` : "Nb";
                            color = "bg-orange-200 text-orange-800 border-orange-400 border";
                        } else if (ball.runs === 4) {
                            color = "bg-green-500 text-white";
                        } else if (ball.runs === 6) {
                            color = "bg-purple-600 text-white";
                        }

                        return (
                            <div key={ball.id} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${color}`}>
                                {text}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-4 gap-3 px-4 mt-auto mb-6">
                <ScoreButton label="0" onClick={() => handleScore(0)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal} />
                <ScoreButton label="1" onClick={() => handleScore(1)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal} />
                <ScoreButton label="2" onClick={() => handleScore(2)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal} />
                <ScoreButton label="3" onClick={() => handleScore(3)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal} />
                <ScoreButton label="4" className="bg-green-100 text-green-700 border-green-200" onClick={() => handleScore(4)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal || showWideModal} />
                <ScoreButton label="6" className="bg-green-600 text-white border-green-600" onClick={() => handleScore(6)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal || showWideModal} />
                <ScoreButton label="Wd" className="bg-orange-100 text-orange-700 border-orange-200" onClick={() => setShowWideModal(true)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal || showWideModal || showDismissalModal} />
                <ScoreButton label="Nb" className="bg-orange-100 text-orange-700 border-orange-200" onClick={() => setShowNoBallModal(true)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal || showWideModal || showDismissalModal} />
                <ScoreButton label="W" className="col-span-2 bg-red-600 text-white border-red-600" onClick={() => setShowDismissalModal(true)} disabled={showWicketModal || showNextBowlerModal || showNoBallModal || showWideModal || showDismissalModal} />
                <ScoreButton label="Undo" className="bg-gray-200 text-gray-700 border-gray-300" icon={<Undo2 className="w-4 h-4" />} onClick={handleUndo} />
                <ScoreButton label="Swap" className="bg-blue-100 text-blue-700 border-blue-200" icon={<ArrowLeftRight className="w-4 h-4" />} onClick={handleSwapEnds} disabled={showWicketModal || showNextBowlerModal || showNoBallModal || showWideModal || showDismissalModal} />
            </div>
            
            <ScorecardButton onClick={() => setShowScorecardModal(true)} />

            {showDismissalModal && (
                <DismissalModal
                    bowlerName={bowlTeam.players.find(p => p.id === match.currentBowlerId)?.name || "Bowler"}
                    fieldingTeam={bowlTeam}
                    onConfirmed={(dInfo) => {
                        handleScore(0, false, false, true, dInfo);
                        setShowDismissalModal(false);
                    }}
                    onCancel={() => setShowDismissalModal(false)}
                />
            )}

            {showWicketModal && (
                <NewBatsmanModal 
                    match={match}
                    team={batTeam} 
                    currentStrikerId={match.strikerId!}
                    currentNonStrikerId={match.nonStrikerId!}
                    onDismissed={(newStrikerId) => {
                        updateMatch(match.id, {
                            strikerId: newStrikerId,
                        });
                        setShowWicketModal(false);
                    }} 
                />
            )}
            
            {showNoBallModal && (
                <NoBallModal
                    onConfirmed={(runs) => {
                        handleScore(runs, false, true);
                        setShowNoBallModal(false);
                    }}
                    onCancel={() => setShowNoBallModal(false)}
                />
            )}

            {showWideModal && (
                <WideBallModal
                    onConfirmed={(extraRuns) => {
                        handleScore(extraRuns, true, false);
                        setShowWideModal(false);
                    }}
                    onCancel={() => setShowWideModal(false)}
                />
            )}
            
            {showScorecardModal && (
                <ProfessionalScorecardModal 
                    match={match}
                    onClose={() => setShowScorecardModal(false)}
                />
            )}

            {!showWicketModal && showNextBowlerModal && !isInningsOver && (
                <NextBowlerModal 
                    team={bowlTeam}
                    lastBowlerId={match.currentBowlerId!}
                    onSelected={(newBowlerId) => {
                         updateMatch(match.id, { currentBowlerId: newBowlerId });
                         setShowNextBowlerModal(false);
                    }}
                />
            )}
        </div>
    )
}

function NextBowlerModal({ team, lastBowlerId, onSelected }: { team: Team, lastBowlerId: string, onSelected: (id: string) => void }) {
    const [selected, setSelected] = useState("");
    // Filter last bowler (can allow if only 1 bowler exists? No standard rule blocks unless specified)
    const available = team.players.filter(p => p.id !== lastBowlerId); 

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-secondary mb-4">Over Complete</h3>
                <p className="text-sm text-gray-600 mb-4">Select bowler for next over:</p>
                <select 
                    className="w-full p-3 border rounded-xl bg-gray-50 mb-4 text-black font-medium"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                >
                    <option value="">Select Bowler</option>
                    {available.map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
                </select>
                <button 
                    disabled={!selected}
                    onClick={() => onSelected(selected)}
                    className="w-full bg-secondary text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-secondary/90 shadow-lg"
                >
                    Start Next Over
                </button>
            </div>
        </div>
    )
}

function ScoreButton({ label, onClick, className, icon, disabled }: { label: string, onClick: () => void, className?: string, icon?: React.ReactNode, disabled?: boolean }) {
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`h-16 rounded-xl font-bold text-xl shadow-sm border active:scale-95 transition-all flex items-center justify-center gap-2 ${className || 'bg-white text-gray-800 border-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}`}
        >
            {icon}
            {label}
        </button>
    )
}

function NewBatsmanModal({ match, team, currentStrikerId, currentNonStrikerId, onDismissed }: { match: Match, team: Team, currentStrikerId: string, currentNonStrikerId: string, onDismissed: (id: string) => void }) {
    const [selectedPlayer, setSelectedPlayer] = useState("");
    
    // Derive status logic
    const history = match.history || [];
    
    // 1. Identify OUT players (permanent out)
    const outPlayerIds = new Set<string>();
    history.forEach(b => {
        if (b.isWicket && b.dismissalType !== "Retired Hurt") {
             const dismissed = b.dismissedPlayerId || b.batsmanId;
             if (dismissed) outPlayerIds.add(dismissed);
        }
    });

    // 2. Identify Retired Hurt players (can return)
    const retiredHurtIds = new Set<string>();
    history.forEach(b => {
         if (b.isWicket && b.dismissalType === "Retired Hurt") {
             const dismissed = b.dismissedPlayerId || b.batsmanId;
             // Only add if not subsequently OUT (which shouldn't happen by logic but safe to check)
             if (dismissed && !outPlayerIds.has(dismissed)) {
                 retiredHurtIds.add(dismissed);
             }
         }
    });

    // 3. Current batters
    const currentBatters = new Set([currentStrikerId, currentNonStrikerId]);

    // Filter available
    const available = team.players.filter(p => {
        // Exclude if permanently out
        if (outPlayerIds.has(p.id)) return false;
        
        // Exclude if currently batting (striker - who is leaving, or non-striker - who is staying)
        if (currentBatters.has(p.id)) {
             // Exception: The Striker is the one leaving. But they can't re-select themselves immediately.
             // If they retired hurt, they go to retiredHurt list, but can't be immediate replacement.
             return false;
        }

        // Include if Not Batted OR Retired Hurt
        return true; 
    });

    // Sort to put Retired Hurt at top or bottom? Maybe just separate them visually
    // Logic: Not Batted + Retired Hurt (filtered from those who are out or batting)

    const remainingCount = available.length;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-red-600 mb-4">New Batsman</h3>
                <p className="text-sm text-gray-600 mb-4">Who is the new batsman?</p>
                <p className="text-xs text-slate-500 mb-2">Remaining Batsmen: {remainingCount}</p>
                
                {remainingCount === 0 ? (
                    <div className="text-center py-4 bg-red-50 text-red-600 rounded-lg">
                        <strong>All Out!</strong>
                        <p className="text-xs mt-1">No available batsmen remaining.</p>
                        <button 
                             onClick={() => onDismissed("")} // Pass empty to signal end? Or handle upstream?
                             // actually onDismissed takes string. Maybe we shouldn't close it but let scorer handle all out.
                             // But LiveMatchScorer checks isAllOut based on wickets count generally.
                             // Better to allow closing? 
                             className="mt-2 text-sm underline"
                        >
                            End Innings
                        </button>
                    </div>
                ) : (
                    <>
                        <select 
                            className="w-full p-3 border rounded-xl bg-gray-50 mb-4 text-black"
                            value={selectedPlayer}
                            onChange={(e) => setSelectedPlayer(e.target.value)}
                        >
                            <option value="">Select New Batsman</option>
                            {available.map(p => {
                                const isRetiredHurt = retiredHurtIds.has(p.id);
                                return (
                                    <option key={p.id} value={p.id}>
                                        {p.name} {isRetiredHurt ? "(Retired Hurt - Can Return)" : ""}
                                    </option>
                                )
                            })}
                        </select>
                        <button 
                            disabled={!selectedPlayer}
                            onClick={() => onDismissed(selectedPlayer)}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold disabled:opacity-50"
                        >
                            Confirm
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

function NoBallModal({ onConfirmed, onCancel }: { onConfirmed: (runs: number) => void, onCancel: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-orange-600 mb-4">No Ball!</h3>
                <p className="text-sm text-gray-600 mb-4">Runs scored by batsman on this No Ball?</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[0, 1, 2, 3, 4, 6].map(runs => (
                         <button
                            key={runs}
                            onClick={() => onConfirmed(runs)}
                            className="p-4 rounded-xl border-2 border-gray-200 font-bold text-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-black"
                         >
                            {runs}
                         </button>
                    ))}
                </div>
                <button
                    onClick={onCancel}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 underline"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

function WideBallModal({ onConfirmed, onCancel }: { onConfirmed: (runs: number) => void, onCancel: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-orange-600 mb-4">Wide Ball</h3>
                <p className="text-sm text-gray-600 mb-4">Additional runs scored on this Wide?</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[0, 1, 2, 3, 4].map(runs => (
                         <button
                            key={runs}
                            onClick={() => onConfirmed(runs)}
                            className="p-4 rounded-xl border-2 border-gray-200 font-bold text-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-black"
                         >
                            {runs}
                         </button>
                    ))}
                </div>
                <button
                    onClick={onCancel}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 underline"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}


// --- Helper to formatted overs ---
const formatOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;

// --- Scorecard Component ---
function ProfessionalScorecardModal({ match, onClose }: { match: Match, onClose: () => void }) {
    const [activeTab, setActiveTab] = React.useState(match.currentInnings === 2 ? "inn2" : "inn1");
    
    // Helper to get innings data
    const getInningsData = (inningNumber: 1 | 2) => {
        const balls = match.history.filter(b => b.inning === inningNumber);
        const teamId = inningNumber === 1 ? match.batFirstId : (match.batFirstId === match.team1.id ? match.team2.id : match.team1.id);
        const batTeam = match.team1.id === teamId ? match.team1 : match.team2;
        const bowlTeam = match.team1.id === teamId ? match.team2 : match.team1;
        
        return { balls, batTeam, bowlTeam };
    };

    const renderInningsTab = (inningNumber: 1 | 2) => {
        const { balls, batTeam, bowlTeam } = getInningsData(inningNumber);
        
        if (balls.length === 0 && inningNumber === 2) {
             return <div className="p-8 text-center text-gray-500">Second innings has not started yet.</div>;
        }

        // --- Batting Stats Calculation ---
        const battingStats = batTeam.players.map(p => {
            const playerBalls = balls.filter(b => b.batsmanId === p.id && !b.isWide);
            const runs = playerBalls.reduce((s, b) => s + b.runs, 0); // Note: b.runs allows for runs on NoBall
            const ballsFaced = playerBalls.length;
            const fours = playerBalls.filter(b => b.runs === 4).length;
            const sixes = playerBalls.filter(b => b.runs === 6).length;
            const sr = ballsFaced > 0 ? ((runs / ballsFaced) * 100).toFixed(2) : "0.00";
            
            // Dismissal
            // Find if out
            const wicketBall = balls.find(b => b.isWicket && (b.dismissedPlayerId === p.id || (!b.dismissedPlayerId && b.batsmanId === p.id)));
            let status = "dnb"; // did not bat
            
            // Logically: If they faced balls, they batted. If they are current striker/non-striker and match is live/this inning is live, they are not out.
            // Simplified check:
            if (ballsFaced > 0 || wicketBall) status = "batting";
            
            // Should also check if they are currently on crease (even if faced 0 balls)
            // But we need to know who was selected as opener or came in
            // For now, if they are current striker/non-striker, force status to notout (active)
             if (match.currentInnings === inningNumber && (match.strikerId === p.id || match.nonStrikerId === p.id)) {
                status = "notout";
            }

            let dismissalText = "";
            if (wicketBall) {
                status = "out";
                dismissalText = wicketBall.dismissalText || wicketBall.dismissalType || "out";
            } else if (status === "notout") {
                 dismissalText = "not out";
            } else if (status === "batting") {
                 dismissalText = "not out"; // Fallback for historical innings where we don't track not-out perfectly without dedicated state, or retired?
                 // If inning is over, they are 'not out'
                 // If match is live but they are not current striker/non-striker, and faced balls... 
                 // This requires history of partnerships or explicitly tracking "batted" flag. 
                 // For MVP, assume "not out" if not wicket.
            }

            return { ...p, runs, ballsFaced, fours, sixes, sr, status, dismissalText };
        }).sort((a, b) => {
            // Sort order: Batted -> DNB. Within Batted: Original Order
            if (a.status !== "dnb" && b.status === "dnb") return -1;
            if (a.status === "dnb" && b.status !== "dnb") return 1;
            return 0; 
        });

        // --- Bowling Stats Calculation ---
        // Get all bowlers who bowled OR are current bowler
        const bowlerIds = Array.from(new Set(balls.map(b => b.bowlerId)));
        
        // Add current bowler if not in history yet
        if (match.currentInnings === inningNumber && match.currentBowlerId && !bowlerIds.includes(match.currentBowlerId)) {
            bowlerIds.push(match.currentBowlerId);
        }

        const bowlingStats = bowlerIds.map(bid => {
            const player = bowlTeam.players.find(p => p.id === bid);
            const playerBalls = balls.filter(b => b.bowlerId === bid);
            // Legal balls for overs: Not Wide and Not NoBall
            const legalBalls = playerBalls.filter(b => !b.isWide && !b.isNoBall).length;
            const overs = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
            
            // Runs Conceded: All runs + extras (except byes/legbyes if we tracked them, assuming all extras count to bowler here for simplicity/MVP)
            const runs = playerBalls.reduce((s, b) => s + b.runs + b.extras, 0);
            const wickets = playerBalls.filter(b => b.isWicket && b.dismissalType !== "Run Out").length;
            const dots = playerBalls.filter(b => (b.runs + b.extras) === 0).length;
            const econ = legalBalls > 0 ? ((runs / legalBalls) * 6).toFixed(2) : "0.00";

            // Maidens (Approx: Over blocks with 0 runs)
            // Complex to calc perfectly without ball timestamps/order grouping, but let's try strict over index grouping
            const overIndices = Array.from(new Set(playerBalls.map(b => b.over)));
            const maidens = overIndices.filter(oIdx => {
                const overBalls = playerBalls.filter(b => b.over === oIdx);
                const overRuns = overBalls.reduce((s, b) => s + b.runs + b.extras, 0);
                return overRuns === 0 && overBalls.some(b => !b.isWide && !b.isNoBall); // Has legal deliveries
            }).length;

            return { name: player?.name || "Unknown", overs, runs, wickets, econ, dots, maidens };
        });

        // --- Extras ---
        const wides = balls.filter(b => b.isWide).length;
        const noBalls = balls.filter(b => b.isNoBall).length;
        const totalExtras = balls.reduce((s, b) => s + b.extras, 0);
        
        // --- Fall of Wickets ---
        const wickets = balls.filter(b => b.isWicket);
        
        // --- Partnerships (Segmented by Wickets) ---
        // We'll calculate cumulative runs at each wicket
        const partnerships = wickets.map((w, i) => {
             // Find balls up to this wicket and after previous wicket
             // This is expensive/complex in un-ordered array, assuming match.history is ordered? Yes, usually push.
             // If not ordered, we rely on filtering index.
             const wIndex = balls.indexOf(w);
             const prevWicketIndex = i === 0 ? -1 : balls.indexOf(wickets[i-1]);
             
             const ballsInPartnership = balls.slice(prevWicketIndex + 1, wIndex + 1);
             const runs = ballsInPartnership.reduce((s, b) => s + b.runs + b.extras, 0);
             const ballsCount = ballsInPartnership.length;
             
             // Who got out?
             const dismissed = batTeam.players.find(p => p.id === (w.dismissedPlayerId || w.batsmanId))?.name;
             
             return { wicketNum: i + 1, runs, balls: ballsCount, dismissed, scoreAtWicket: balls.slice(0, wIndex + 1).reduce((s,b)=>s+b.runs+b.extras,0) };
        });

        // Current Partnership (Unfinished)
        const lastWicketIndex = wickets.length > 0 ? balls.indexOf(wickets[wickets.length - 1]) : -1;
        const currentPartnershipBalls = balls.slice(lastWicketIndex + 1);
        const currentPartnershipRuns = currentPartnershipBalls.reduce((s, b) => s + b.runs + b.extras, 0);
        
        const totalScore = balls.reduce((s, b) => s + b.runs + b.extras, 0);

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                     <div className="flex justify-between items-end mb-2">
                        <div>
                             <h3 className="font-bold text-xl text-secondary">{batTeam.name}</h3>
                             <p className="text-gray-500 text-sm">
                                Run Rate: {balls.length > 0 ? ((totalScore / balls.length) * 6).toFixed(2) : "0.00"}
                             </p>
                        </div>
                        <div className="text-right">
                             <p className="text-3xl font-black text-primary">{totalScore}/{wickets.length}</p>
                             <p className="text-gray-500 text-sm">{formatOvers(balls.filter(b=>!b.isWide&&!b.isNoBall).length)} Overs</p>
                        </div>
                     </div>
                     <div className="text-xs text-gray-500 border-t pt-2">
                        Extras: {totalExtras} (wd {wides}, nb {noBalls}, lb 0, b 0)
                     </div>
                </div>

                {/* Batting Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700">Batting</div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left">Batter</th>
                                <th className="px-2 py-2 text-right">R</th>
                                <th className="px-2 py-2 text-right">B</th>
                                <th className="px-2 py-2 text-right hidden sm:table-cell">4s</th>
                                <th className="px-2 py-2 text-right hidden sm:table-cell">6s</th>
                                <th className="px-2 py-2 text-right hidden sm:table-cell">SR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {battingStats.filter(p => p.status !== 'dnb').map(p => (
                                <tr key={p.id} className={p.status === 'notout' ? 'bg-green-50/50 border-l-4 border-green-500' : 'border-l-4 border-transparent hover:bg-gray-50'}>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-black flex items-center gap-1">
                                            {p.name}
                                            {p.status === 'notout' && <span className="text-green-600">*</span>}
                                            {p.role === 'Keeper' && <span className="text-xs text-gray-600">†</span>}
                                            {p.id === batTeam.captainId && <span className="text-xs text-gray-600">(c)</span>}
                                        </div>
                                        <div className="text-xs text-gray-500 italic">{p.dismissalText}</div>
                                    </td>
                                    <td className="px-2 py-3 text-right font-medium text-black">{p.runs}</td>
                                    <td className="px-2 py-3 text-right font-medium text-black">{p.ballsFaced}</td>
                                    <td className="px-2 py-3 text-right hidden sm:table-cell font-medium text-black">{p.fours}</td>
                                    <td className="px-2 py-3 text-right hidden sm:table-cell font-medium text-black">{p.sixes}</td>
                                    <td className="px-2 py-3 text-right hidden sm:table-cell font-medium text-black">{p.sr}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                     {battingStats.some(p => p.status === 'dnb') && (
                        <div className="px-4 py-2 text-xs text-gray-500 border-t">
                            Yet to Bat: {battingStats.filter(p => p.status === 'dnb').map(p => p.name).join(", ")}
                        </div>
                     )}
                </div>

                {/* Bowling Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700">Bowling</div>
                     <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left">Bowler</th>
                                <th className="px-2 py-2 text-right">O</th>
                                <th className="px-2 py-2 text-right">M</th>
                                <th className="px-2 py-2 text-right">R</th>
                                <th className="px-2 py-2 text-right">W</th>
                                <th className="px-2 py-2 text-right hidden sm:table-cell">Eco</th>
                                <th className="px-2 py-2 text-right hidden sm:table-cell">Dots</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bowlingStats.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-black">{p.name}</td>
                                    <td className="px-2 py-3 text-right font-medium text-black">{p.overs}</td>
                                    <td className="px-2 py-3 text-right font-medium text-black">{p.maidens}</td>
                                    <td className="px-2 py-3 text-right font-medium text-black">{p.runs}</td>
                                    <td className="px-2 py-3 text-right font-bold text-black">{p.wickets}</td>
                                    <td className="px-2 py-3 text-right hidden sm:table-cell font-medium text-black">{p.econ}</td>
                                    <td className="px-2 py-3 text-right hidden sm:table-cell font-medium text-black">{p.dots}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* FOW & Partnerships */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase">Fall of Wickets</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                            {partnerships.map(p => (
                                <div key={p.wicketNum} className="flex justify-between">
                                    <span><span className="font-bold text-red-600">{p.wicketNum}-{p.scoreAtWicket}</span> ({p.dismissed})</span>
                                    <span>{p.runs} runs</span>
                                </div>
                            ))}
                             {partnerships.length === 0 && <p className="text-gray-400 italic">No wickets yet.</p>}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase">Partnerships</h4>
                        {/* Just current for now as full list is in FOW somewhat */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Current Partnership</p>
                            <p className="text-2xl font-black text-blue-900">{currentPartnershipRuns}</p>
                            <p className="text-xs text-blue-500">{currentPartnershipBalls.length} balls</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
         <div className="fixed inset-0 bg-gray-100 z-[90] overflow-y-auto animate-in slide-in-from-bottom-5 flex flex-col">
            <div className="sticky top-0 bg-white border-b shadow-sm z-20">
                <div className="p-4 flex items-center justify-between max-w-3xl mx-auto w-full">
                     <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Scorecard</h2>
                            <p className="text-xs text-gray-500">{match.team1.name} vs {match.team2.name}</p>
                        </div>
                     </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b overflow-x-auto max-w-3xl mx-auto w-full px-4 gap-6 scrollbar-hide">
                    <button 
                        onClick={() => setActiveTab("inn1")}
                        className={`pb-3 pt-1 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === "inn1" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        1st Innings
                    </button>
                     <button 
                        onClick={() => setActiveTab("inn2")}
                        className={`pb-3 pt-1 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === "inn2" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        2nd Innings
                    </button>
                    {/* Could add Info tab later */}
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto pb-10">
                    {activeTab === "inn1" && renderInningsTab(1)}
                    {activeTab === "inn2" && renderInningsTab(2)}
                </div>
            </div>
         </div>
    );
}

// --- Floating Button ---
function ScorecardButton({ onClick }: { onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="fixed bottom-24 right-6 shadow-xl bg-secondary text-white p-4 rounded-full z-40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 group"
        >
            <div className="absolute -top-10 right-0 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                View Scorecard
            </div>
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
        </button>
    )
}



function DismissalModal({ bowlerName, fieldingTeam, onConfirmed, onCancel }: { bowlerName: string, fieldingTeam: Team, onConfirmed: (info: { type: string, fielderId?: string, text: string }) => void, onCancel: () => void }) {
    const [step, setStep] = useState<"type" | "fielder">("type");
    const [type, setType] = useState("");
    const [fielderId, setFielderId] = useState("");

    const types = [
        "Bowled", "Caught", "LBW", "Run Out", "Stumped", "Hit Wicket", 
        "Retired Hurt", "Obstructing the Field", "Hit the Ball Twice", "Timed Out"
    ];

    const needsFielder = type === "Caught" || type === "Run Out" || type === "Stumped";

    const handleTypeSelect = (t: string) => {
        setType(t);
        if (t === "Caught" || t === "Run Out" || t === "Stumped") {
            setStep("fielder");
        } else {
             // Confirm immediately
             const text = getDismissalText(t, bowlerName);
             onConfirmed({ type: t, text });
        }
    };

    const handleFielderSelect = (fid: string) => {
        const fielder = fieldingTeam.players.find(p => p.id === fid);
        const text = getDismissalText(type, bowlerName, fielder?.name);
        onConfirmed({ type: type, fielderId: fid, text });
    };

    const getDismissalText = (type: string, bName: string, fName?: string) => {
        switch(type) {
            case "Bowled": return `b ${bName}`;
            case "Caught": return `c ${fName} b ${bName}`;
            case "LBW": return `lbw b ${bName}`;
            case "Run Out": return `run out (${fName})`;
            case "Stumped": return `st ${fName} b ${bName}`;
            case "Hit Wicket": return `hit wicket b ${bName}`;
            case "Retired Hurt": return "retired hurt";
            default: return type.toLowerCase();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-red-600 mb-4">
                    {step === "type" ? "How was the batsman dismissed?" : 
                     type === "Caught" ? "Who took the catch?" :
                     type === "Run Out" ? "Who executed the run out?" :
                     "Who executed the stumping?"}
                </h3>
                
                <div className="space-y-2">
                    {step === "type" ? (
                        types.map(t => (
                            <button
                                key={t}
                                onClick={() => handleTypeSelect(t)}
                                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-red-100 hover:bg-red-50 font-medium transition-colors flex justify-between items-center text-black"
                            >
                                {t}
                                <span className="text-gray-400">›</span>
                            </button>
                        ))
                    ) : (
                        <div>
                             <button onClick={() => setStep("type")} className="mb-4 text-sm text-gray-500 font-medium flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" /> Back to types
                             </button>
                             {fieldingTeam.players.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleFielderSelect(p.id)}
                                    className="w-full text-left p-3 rounded-xl border-2 border-gray-100 hover:border-red-100 hover:bg-red-50 font-medium transition-colors mb-2 text-black"
                                >
                                    {p.name}
                                </button>
                             ))}
                        </div>
                    )}
                </div>
                
                {step === "type" && (
                    <button
                        onClick={onCancel}
                        className="w-full mt-4 py-3 text-gray-500 font-medium hover:text-gray-700 underline"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    )
}

