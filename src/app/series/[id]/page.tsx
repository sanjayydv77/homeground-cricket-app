"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp, Series, Match, PlayerRole } from "@/contexts/AppContext";
import { Layout } from "@/components/ui/Layout";
import { ArrowLeft, Trophy, Play, Edit3, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SeriesDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const { getSeriesById, updateSeries, addMatch, matches } = useApp();
  
  const series = getSeriesById(id as string);
  const [showEditTeams, setShowEditTeams] = useState(false);
  const [showNextMatchSetup, setShowNextMatchSetup] = useState(false);

  if (!series) {
    return (
      <Layout>
        <div className="p-8 text-center bg-white m-4 rounded-xl">
          <h2 className="text-xl font-bold text-red-500">Series Not Found</h2>
        </div>
      </Layout>
    );
  }

  const matchesPlayed = series.scoreTeam1 + series.scoreTeam2 + series.draws;
  const isComplete = matchesPlayed >= series.totalMatches;
  
  // Logic to determine winner
  let resultText = "Series Level";
  if (series.scoreTeam1 > series.scoreTeam2) resultText = `${series.team1.name} Leads`;
  if (series.scoreTeam2 > series.scoreTeam1) resultText = `${series.team2.name} Leads`;
  if (isComplete) {
      if (series.scoreTeam1 > series.scoreTeam2) resultText = `${series.team1.name} Won Series`;
      else if (series.scoreTeam2 > series.scoreTeam1) resultText = `${series.team2.name} Won Series`;
      else resultText = "Series Drawn";
  }

  // Find relevant match objects
  const seriesMatches = series.matchIds.map(mid => matches.find(m => m.id === mid)).filter(Boolean) as Match[];

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary text-white p-6 pb-12 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={() => router.back()} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-2xl font-bold">{series.name}</h1>
                <p className="text-white/80 text-sm">Best of {series.totalMatches} Matches • Code: {series.code}</p>
            </div>
        </div>

        {/* Score Board */}
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm flex justify-between items-center">
            <div className="text-center">
                <p className="font-bold text-lg">{series.team1.name}</p>
                <p className="text-3xl font-black">{series.scoreTeam1}</p>
            </div>
            <div className="text-center px-4">
                <p className="text-xs uppercase tracking-widest text-white/70 mb-1">VS</p>
                <span className="bg-white text-primary px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    {resultText}
                </span>
            </div>
            <div className="text-center">
                <p className="font-bold text-lg">{series.team2.name}</p>
                <p className="text-3xl font-black">{series.scoreTeam2}</p>
            </div>
        </div>
      </div>

      <div className="px-4 -mt-8 pb-20 space-y-6">
        
        {/* Next Match Action */}
        {!isComplete && (
            <div className="bg-white p-6 rounded-xl shadow-lg animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-secondary text-lg">Match {matchesPlayed + 1} of {series.totalMatches}</h2>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">Ready</span>
                </div>
                
                {showNextMatchSetup ? (
                    <NextMatchSetup 
                        series={series} 
                        onCancel={() => setShowNextMatchSetup(false)} 
                        addMatch={addMatch}
                        updateSeries={updateSeries}
                        router={router}
                    />
                ) : showEditTeams ? (
                    <EditTeams series={series} updateSeries={updateSeries} onClose={() => setShowEditTeams(false)} />
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-600 text-sm">Teams are ready. You can modify squads before the match starts.</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                             <button 
                                onClick={() => setShowEditTeams(true)}
                                className="border-2 border-primary/20 text-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                             >
                                <Edit3 className="w-4 h-4" /> Edit Squads
                             </button>
                             <button 
                                onClick={() => setShowNextMatchSetup(true)}
                                className="bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 transition-colors"
                             >
                                Start Match <Play className="w-4 h-4 fill-current" />
                             </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {isComplete && (
             <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-amber-200 p-6 rounded-xl shadow-sm text-center space-y-2">
                 <Trophy className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                 <h2 className="text-2xl font-bold text-amber-900">Series Complete</h2>
                 <p className="text-amber-800 font-medium">{resultText}</p>
             </div>
        )}

        {/* Stats & History Tabs would be nice, but simple list for now */}
        <div className="space-y-4">
            <h3 className="font-bold text-secondary text-lg px-1">Stats & Results</h3>
            
            {/* Matches List */}
            {seriesMatches.length > 0 ? (
                <div className="space-y-3">
                    {seriesMatches.map((m, i) => (
                        <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer" onClick={() => router.push(`/match/${m.id}`)}>
                            <div>
                                <p className="text-xs text-gray-400 font-mono mb-1" suppressHydrationWarning>Match #{i + 1} • {new Date(m.date).toLocaleDateString()}</p>
                                <p className="font-bold text-gray-800">
                                    {m.status === "Completed" ? (
                                        <>Match Finished</>
                                    ) : (
                                        <>In Progress</>
                                    )}
                                    <span className="block text-xs font-normal text-primary mt-1">View Scorecard</span>
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed">
                    No matches played yet
                </div>
            )}
            
            {/* Stats (Placeholder or Basic Implementation) */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Top Performers</h4>
                <p className="text-sm text-gray-500 italic">Stats update after matches are completed.</p>
                {/* We would render cumulativeStats here */}
            </div>
        </div>

      </div>
    </Layout>
  );
}

// --- Subcomponents ---

function NextMatchSetup({ series, onCancel, addMatch, updateSeries, router }: { 
    series: Series, 
    onCancel: () => void,
    addMatch: (m: Match) => void, 
    updateSeries: (id: string, u: Partial<Series>) => void,
    router: ReturnType<typeof useRouter>
}) {
    const [battingTeamId, setBattingTeamId] = useState(series.team1.id);

    const handleStart = () => {
        const matchId = Math.random().toString(36).substring(7);
        const matchCode = Math.floor(1000 + Math.random() * 9000).toString();

        // New Match Logic
        // Determine toss winner / choice artificially based on "Who Bats First"
        // Prompt says "Admin selects batting team", implies we skip toss.
        // So we set batFirstId directly. tossWinnerId can be the Batting Team for data consistency.
        
        const newMatch: Match = {
            id: matchId,
            code: matchCode,
            type: "Series",
            seriesId: series.id,
            status: "Live",
            team1: series.team1,
            team2: series.team2,
            oversPerInnings: series.oversPerInnings,
            teamSize: series.teamSize,
            date: new Date(),
            batFirstId: battingTeamId,
            tossWinnerId: battingTeamId, // Artificial
            currentInnings: 1,
            history: []
        };

        addMatch(newMatch);
        updateSeries(series.id, {
            matchIds: [...series.matchIds, matchId],
            status: "Ongoing"
        });

        router.push(`/match/${matchId}`);
    };

    return (
        <div className="space-y-4 animate-in fade-in">
             <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-bold text-gray-700 mb-2">Who will bat first?</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setBattingTeamId(series.team1.id)}
                        className={cn("p-3 rounded-lg border-2 font-medium text-sm transition-all", battingTeamId === series.team1.id ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white")}
                    >
                        {series.team1.name}
                    </button>
                     <button 
                        onClick={() => setBattingTeamId(series.team2.id)}
                        className={cn("p-3 rounded-lg border-2 font-medium text-sm transition-all", battingTeamId === series.team2.id ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white")}
                    >
                        {series.team2.name}
                    </button>
                </div>
            </div>
            
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleStart} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg">Start Match Now</button>
            </div>
        </div>
    )
}

function EditTeams({ series, updateSeries, onClose }: { series: Series, updateSeries: (id: string, u: Partial<Series>) => void, onClose: () => void }) {
    // Simplified Editing: Just showing names for now to prove concept, 
    // ideally would reuse the full TeamSetup component but that needs state lifting.
    // For this task, I'll stick to a placeholder or simple alert as the logic is complex to duplicate inline.
    // Actually, I can allow editing names at least.
    
    // NOTE: In a real app, I'd import TeamSetup, but managing state for both teams here is heavy.
    // I will implement a simpler list view.

    const [t1Players, setT1Players] = useState(series.team1.players);
    const [t2Players, setT2Players] = useState(series.team2.players);

    const handleSave = () => {
        const newTeam1 = { ...series.team1, players: t1Players };
        const newTeam2 = { ...series.team2, players: t2Players };
        
        // Validate Keepers
        if (t1Players.filter(p => p.role === 'Keeper').length !== 1) { alert(`${series.team1.name} needs 1 Keeper`); return; }
        if (t2Players.filter(p => p.role === 'Keeper').length !== 1) { alert(`${series.team2.name} needs 1 Keeper`); return; }

        updateSeries(series.id, {
            team1: newTeam1,
            team2: newTeam2
        });
        onClose();
    };

    return (
        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Edit Squads</h3>
                <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                <div>
                    <h4 className="text-sm font-bold text-primary mb-2">{series.team1.name}</h4>
                    {t1Players.map((p, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                             <input value={p.name} onChange={e => {
                                 const newP = [...t1Players]; newP[i].name = e.target.value; setT1Players(newP);
                             }} className="flex-1 text-xs p-2 rounded border" />
                             <select value={p.role} onChange={e => {
                                 const newP = [...t1Players]; newP[i].role = e.target.value as PlayerRole; setT1Players(newP);
                             }} className="text-xs p-1 rounded border">
                                 <option>Batsman</option><option>Bowler</option><option>All-rounder</option><option>Keeper</option>
                             </select>
                        </div>
                    ))}
                </div>
                 <div>
                    <h4 className="text-sm font-bold text-primary mb-2">{series.team2.name}</h4>
                     {t2Players.map((p, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                             <input value={p.name} onChange={e => {
                                 const newP = [...t2Players]; newP[i].name = e.target.value; setT2Players(newP);
                             }} className="flex-1 text-xs p-2 rounded border" />
                              <select value={p.role} onChange={e => {
                                 const newP = [...t2Players]; newP[i].role = e.target.value as PlayerRole; setT2Players(newP);
                             }} className="text-xs p-1 rounded border">
                                 <option>Batsman</option><option>Bowler</option><option>All-rounder</option><option>Keeper</option>
                             </select>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={handleSave} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Save Changes</button>
        </div>
    )
}
