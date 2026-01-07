"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp, Tournament, Match, TournamentTeam, Team } from "@/contexts/AppContext";
import { Layout } from "@/components/ui/Layout";
import { ArrowLeft, Trophy, Calendar, Plus, ExternalLink, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TournamentDashboard() {
    const params = useParams();
    const router = useRouter();
    const { getTournamentById, matches, addMatch, updateTournament } = useApp();
    const tournamentId = params.id as string;

    const tournament = getTournamentById(tournamentId);
    
    const [activeTab, setActiveTab] = useState<"table" | "matches">("table");
    const [showCreateMatch, setShowCreateMatch] = useState(false);

    // Derived State: Matches for this tournament
    const tournamentMatches = useMemo(() => {
        return matches.filter(m => m.tournamentId === tournamentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [matches, tournamentId]);

    // Derived State: Standings (Dynamic Calculation for robustness)
    const standings = useMemo(() => {
        if (!tournament) return [];
        
        // Clone teams map
        const teamStatsMap = new Map<string, TournamentTeam>();
        tournament.teams.forEach(t => {
            // Reset stats for dynamic calc (optional, or we can use the persisted ones if we trust them)
            // For MVP, let's calculate from scratch from COMPLETED matches to ensure consistency
            teamStatsMap.set(t.id, { 
                ...t, 
                stats: { played: 0, won: 0, lost: 0, tied: 0, nr: 0, points: 0, nrr: 0, runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0 } 
            });
        });

        const completedMatches = tournamentMatches.filter(m => m.status === "Completed");

        completedMatches.forEach(m => {
            const t1 = teamStatsMap.get(m.team1.id);
            const t2 = teamStatsMap.get(m.team2.id);
            if (!t1 || !t2) return;

            // Update Played
            t1.stats.played++;
            t2.stats.played++;

            // Calculate scores from history
            const innings1Balls = m.history.filter(b => b.inning === 1);
            const innings2Balls = m.history.filter(b => b.inning === 2);
            const scoreTeam1 = innings1Balls.reduce((sum, b) => sum + b.runs + b.extras, 0);
            const scoreTeam2 = innings2Balls.reduce((sum, b) => sum + b.runs + b.extras, 0);

            // Update Scores
            t1.stats.runsScored += scoreTeam1;
            t2.stats.runsScored += scoreTeam2;
            
            t1.stats.runsConceded += scoreTeam2;
            t2.stats.runsConceded += scoreTeam1;

            // TODO: Accurate Overs Faced calculation from history would be better here.
            // For now, assuming full overs if all out or completed? 
            // Complex NRR is hard without detailed ball logs. 
            // We will skip granular NRR updates here effectively until we inspect match internals.
            
            // Result
            if (scoreTeam1 > scoreTeam2) {
                t1.stats.won++;
                t1.stats.points += 2;
                t2.stats.lost++;
            } else if (scoreTeam2 > scoreTeam1) {
                t2.stats.won++;
                t2.stats.points += 2;
                t1.stats.lost++;
            } else {
                t1.stats.tied++;
                t1.stats.points += 1;
                t2.stats.tied++;
                t2.stats.points += 1;
            }
        });

        // Convert Map to Array and Sort
        return Array.from(teamStatsMap.values()).sort((a, b) => {
            if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
            return b.stats.nrr - a.stats.nrr; // Secondary sort by NRR (currently 0)
        });

    }, [tournament, tournamentMatches]);

    if (!tournament) return <Layout><div className="p-8">Tournament not found</div></Layout>;

    return (
        <Layout>
             <header className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-4 sticky top-0 z-10 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-white/10">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">{tournament.name}</h1>
                        <p className="text-xs text-indigo-200">ID: {tournament.code}</p>
                    </div>
                </div>

                <div className="flex bg-indigo-800/50 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab("table")}
                        className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", activeTab === "table" ? "bg-white text-indigo-900 shadow" : "text-indigo-200 hover:text-white")}
                    >
                        Points Table
                    </button>
                    <button 
                        onClick={() => setActiveTab("matches")}
                        className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", activeTab === "matches" ? "bg-white text-indigo-900 shadow" : "text-indigo-200 hover:text-white")}
                    >
                        Matches
                    </button>
                </div>
            </header>

            <main className="p-4 pb-20">
                {activeTab === "table" ? (
                    <div className="space-y-4">
                        <StandingsTable teams={standings} />
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                             🚧 Match Stats and NRR are currently under development and will update as matches complete.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button 
                            onClick={() => setShowCreateMatch(true)}
                            className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-xl flex items-center justify-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
                        >
                            <Plus className="w-5 h-5" /> New Match
                        </button>
                        
                        <div className="space-y-3">
                            {tournamentMatches.length === 0 && (
                                <p className="text-center text-gray-400 py-8">No matches scheduled yet.</p>
                            )}
                            {tournamentMatches.map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {showCreateMatch && (
                <CreateMatchModal 
                    tournament={tournament} 
                    onClose={() => setShowCreateMatch(false)}
                    onCreate={(t1Id, t2Id) => {
                        const t1 = tournament.teams.find(t => t.id === t1Id);
                        const t2 = tournament.teams.find(t => t.id === t2Id);
                        if (!t1 || !t2) return;

                        // Create minimal Team copies for the Match object
                        // We do not want to deep link correctly yet, just value copy
                        const newMatch: Match = {
                            id: Math.random().toString(36).substring(7),
                            code: Math.floor(1000 + Math.random() * 9000).toString(),
                            type: "Tournament",
                            tournamentId: tournament.id,
                            status: "Live", // Goes straight to "Setup" in real life, but here Live -> Toss
                            team1: { ...t1, players: t1.players }, 
                            team2: { ...t2, players: t2.players },
                            oversPerInnings: tournament.oversPerInnings,
                            teamSize: tournament.teamSize,
                            date: new Date(),
                            currentInnings: 1,
                            history: []
                        };
                        
                        addMatch(newMatch);
                        // Also Add Match ID to tournament to keep track
                        updateTournament(tournament.id, { matchIds: [...tournament.matchIds, newMatch.id] });
                        
                        setShowCreateMatch(false);
                        router.push(`/match/${newMatch.id}`);
                    }}
                />
            )}
        </Layout>
    );
}

function StandingsTable({ teams }: { teams: TournamentTeam[] }) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="p-3">Team</th>
                            <th className="p-3 text-center">P</th>
                            <th className="p-3 text-center">W</th>
                            <th className="p-3 text-center">L</th>
                            <th className="p-3 text-center">NRR</th>
                            <th className="p-3 text-center font-bold">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {teams.map((team, idx) => (
                            <tr key={team.id} className="hover:bg-gray-50/50">
                                <td className="p-3 font-medium flex items-center gap-2">
                                    <span className="text-gray-400 text-xs w-4">{idx + 1}</span>
                                    {team.name}
                                </td>
                                <td className="p-3 text-center">{team.stats.played}</td>
                                <td className="p-3 text-center text-green-600">{team.stats.won}</td>
                                <td className="p-3 text-center text-red-500">{team.stats.lost}</td>
                                <td className="p-3 text-center text-gray-500">{team.stats.nrr.toFixed(3)}</td>
                                <td className="p-3 text-center font-bold text-indigo-700 bg-indigo-50/30">{team.stats.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function MatchCard({ match }: { match: Match }) {
    return (
        <Link href={`/match/${match.id}`} className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${match.status === 'Live' ? 'bg-red-100 text-red-600 animate-pulse' : match.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {match.status}
                </span>
                <span className="text-xs text-gray-400" suppressHydrationWarning>{new Date(match.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
                 <div className="flex-1 text-right">
                    <div className="font-bold text-gray-900">{match.team1.name}</div>
                    {match.status !== 'Scheduled' && (() => {
                        const innings1Balls = match.history.filter(b => b.inning === 1);
                        const score1 = innings1Balls.reduce((sum, b) => sum + b.runs + b.extras, 0);
                        const wickets1 = innings1Balls.filter(b => b.isWicket).length;
                        return <div className="text-sm text-gray-600">{score1}/{wickets1}</div>;
                    })()}
                 </div>
                 <div className="text-xs font-bold text-gray-400">VS</div>
                 <div className="flex-1 text-left">
                    <div className="font-bold text-gray-900">{match.team2.name}</div>
                    {match.status !== 'Scheduled' && (() => {
                        const innings2Balls = match.history.filter(b => b.inning === 2);
                        const score2 = innings2Balls.reduce((sum, b) => sum + b.runs + b.extras, 0);
                        const wickets2 = innings2Balls.filter(b => b.isWicket).length;
                        return <div className="text-sm text-gray-600">{score2}/{wickets2}</div>;
                    })()}
                 </div>
            </div>
        </Link>
    )
}

function CreateMatchModal({ tournament, onClose, onCreate }: { tournament: Tournament, onClose: () => void, onCreate: (t1: string, t2: string) => void }) {
    const [t1, setT1] = useState(tournament.teams[0]?.id);
    const [t2, setT2] = useState(tournament.teams[1]?.id);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 animate-in slide-in-from-bottom-10 fade-in">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">New Match</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Home Team</label>
                        <select value={t1} onChange={e => setT1(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50">
                            {tournament.teams.map(t => (
                                <option key={t.id} value={t.id} disabled={t.id === t2}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-white border rounded-full p-1"><RefreshCw className="w-4 h-4 text-gray-400" /></div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Away Team</label>
                        <select value={t2} onChange={e => setT2(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50">
                            {tournament.teams.map(t => (
                                <option key={t.id} value={t.id} disabled={t.id === t1}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={() => onCreate(t1, t2)}
                        disabled={!t1 || !t2 || t1 === t2}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg mt-2 disabled:opacity-50"
                    >
                        Start Match
                    </button>
                </div>
            </div>
        </div>
    )
}
